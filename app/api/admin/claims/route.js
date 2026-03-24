export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ClaimRequest from '@/models/ClaimRequest'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import User from '@/models/User'
import AuditLog from '@/models/AuditLog'
import Notification from '@/models/Notification'
import { verifyToken } from '@/lib/auth'

// ── GET /api/admin/claims ─────────────────────────────────────────────────────
// Returns claims grouped by foundItem, each group sorted by aiMatchScore DESC
export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        await connectDB()

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || ''
        const dateFrom = searchParams.get('dateFrom') || ''
        const dateTo = searchParams.get('dateTo') || ''
        const filter = {}
        if (status) {
            filter.status = status
        } else {
            // Always exclude withdrawn claims from admin view
            filter.status = { $ne: 'withdrawn' }
        }
        if (dateFrom || dateTo) {
            filter.createdAt = {}
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom + 'T00:00:00.000Z')
            if (dateTo) filter.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z')
        }

        const allClaims = await ClaimRequest.find(filter)
            .populate('lostItemId', 'title category possibleLocation dateLost imageUrl')
            .populate('foundItemId', 'title category locationFound dateFound photoUrl keywords color brand description submittedBy')
            .populate('claimantId', 'name email campusId warningCount status restrictionLevel trustedFinderBadge trustedFinderCount createdAt')
            .sort({ aiMatchScore: -1, createdAt: -1 })
            .lean()

        // Count active claims per foundItem for conflict detection
        const foundItemClaimCounts = {}
        allClaims.forEach(c => {
            const fid = c.foundItemId?._id?.toString()
            if (fid && !['rejected', 'withdrawn', 'completed'].includes(c.status)) {
                foundItemClaimCounts[fid] = (foundItemClaimCounts[fid] || 0) + 1
            }
        })

        // Enrich each claim with conflict info + clamant history
        const enrichedClaims = await Promise.all(allClaims.map(async (c) => {
            const fid = c.foundItemId?._id?.toString()
            const hasConflict = fid && foundItemClaimCounts[fid] > 1

            let claimantHistory = null
            if (c.claimantId?._id) {
                const [totalClaims, approvedClaims, rejectedClaims] = await Promise.all([
                    ClaimRequest.countDocuments({ claimantId: c.claimantId._id }),
                    ClaimRequest.countDocuments({ claimantId: c.claimantId._id, status: 'approved' }),
                    ClaimRequest.countDocuments({ claimantId: c.claimantId._id, status: 'rejected' }),
                ])
                claimantHistory = {
                    totalClaims, approvedClaims, rejectedClaims,
                    warningCount: c.claimantId.warningCount || 0,
                    accountStatus: c.claimantId.status || 'active',
                    restrictionLevel: c.claimantId.restrictionLevel || 'NONE',
                    trustedFinder: c.claimantId.trustedFinderBadge || false,
                    memberSince: c.claimantId.createdAt,
                }
            }

            return { ...c, hasConflict, conflictCount: foundItemClaimCounts[fid] || 1, claimantHistory }
        }))

        // Group by foundItemId
        const groupMap = new Map()
        enrichedClaims.forEach(claim => {
            const fid = claim.foundItemId?._id?.toString() || 'unknown'
            if (!groupMap.has(fid)) {
                groupMap.set(fid, { foundItem: claim.foundItemId, claims: [] })
            }
            groupMap.get(fid).claims.push(claim)
        })

        // Sort claims within each group by aiMatchScore DESC
        const grouped = Array.from(groupMap.values()).map(group => ({
            ...group,
            claims: group.claims.sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0))
        }))

        // Also return flat list for stats
        const stats = {
            total: allClaims.length,
            pending: allClaims.filter(c => ['under_review', 'ai_matched', 'admin_review'].includes(c.status)).length,
            approved: allClaims.filter(c => c.status === 'approved').length,
            rejected: allClaims.filter(c => c.status === 'rejected').length,
        }

        return NextResponse.json({ grouped, stats })
    } catch (err) {
        console.error('[Admin Claims GET]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// ── PATCH /api/admin/claims ───────────────────────────────────────────────────
export async function PATCH(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await connectDB()
        const body = await request.json()
        const { claimId, action, adminNote } = body

        // Validate adminNote for certain actions
        if (action === 'request_info' && (!adminNote || !adminNote.trim())) {
            return NextResponse.json({ error: 'A message is required when requesting more information.' }, { status: 400 })
        }
        if (action === 'reject' && (!adminNote || !adminNote.trim())) {
            return NextResponse.json({ error: 'A rejection reason note is required.' }, { status: 400 })
        }

        const claim = await ClaimRequest.findById(claimId)
            .populate('foundItemId', 'title submittedBy')
            .populate('claimantId', 'name warningCount status')
        if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

        const foundItemTitle = claim.foundItemId?.title || 'the item'
        const noteText = adminNote?.trim() || ''
        let logAction = ''

        if (action === 'approve') {
            claim.status = 'approved'
            claim.adminNote = noteText
            claim.adminId = decoded.id
            claim.reviewedAt = new Date()
            claim.trackingHistory.push({ status: 'Approved', note: noteText || 'Claim approved by admin', updatedBy: decoded.name })

            // Update item statuses
            if (claim.lostItemId) await LostItem.findByIdAndUpdate(claim.lostItemId, { status: 'resolved' })
            await FoundItem.findByIdAndUpdate(claim.foundItemId?._id || claim.foundItemId, { status: 'claimed' })

            // Trusted finder badge
            const foundDoc = await FoundItem.findById(claim.foundItemId?._id || claim.foundItemId)
            if (foundDoc) {
                await User.findByIdAndUpdate(foundDoc.submittedBy, { $inc: { trustedFinderCount: 1 } })
                const finder = await User.findById(foundDoc.submittedBy)
                if (finder && finder.trustedFinderCount >= 3 && !finder.trustedFinderBadge) {
                    await User.findByIdAndUpdate(foundDoc.submittedBy, { trustedFinderBadge: true })
                }
            }

            // Notify approved user
            await Notification.create({
                userId: claim.claimantId?._id || claim.claimantId,
                type: 'claim_approved',
                title: '🎉 Claim Approved!',
                message: noteText
                    ? `Your claim for "${foundItemTitle}" was approved. Admin note: ${noteText}`
                    : `Your claim for "${foundItemTitle}" has been approved. You can now arrange for pickup.`,
                foundItemId: claim.foundItemId?._id || claim.foundItemId,
                lostItemId: claim.lostItemId || undefined,
                claimId: claim._id,
            })

            // Auto-reject all other pending claims for the same found item
            const otherClaims = await ClaimRequest.find({
                foundItemId: claim.foundItemId?._id || claim.foundItemId,
                _id: { $ne: claim._id },
                status: { $nin: ['rejected', 'withdrawn', 'completed', 'approved'] },
            }).populate('claimantId', '_id')

            for (const other of otherClaims) {
                other.status = 'rejected'
                other.adminNote = 'Another claim for this item has been approved.'
                other.reviewedAt = new Date()
                other.trackingHistory.push({
                    status: 'Rejected',
                    note: 'Another claim for this item has been approved.',
                    updatedBy: 'System',
                })
                await other.save()

                // Notify each auto-rejected user
                if (other.claimantId) {
                    await Notification.create({
                        userId: other.claimantId._id || other.claimantId,
                        type: 'claim_rejected',
                        title: 'Claim Closed',
                        message: `Your claim for "${foundItemTitle}" has been closed because another verified claim for this item was approved.`,
                        foundItemId: claim.foundItemId?._id || claim.foundItemId,
                        claimId: other._id,
                    })
                }
            }

            logAction = 'APPROVE_CLAIM'
        } else if (action === 'reject') {
            claim.status = 'rejected'
            claim.adminNote = noteText
            claim.adminId = decoded.id
            claim.reviewedAt = new Date()
            claim.trackingHistory.push({ status: 'Rejected', note: noteText, updatedBy: decoded.name })

            // Warning for very low AI score rejections
            if ((claim.aiMatchScore || 0) < 40) {
                const claimUser = await User.findById(claim.claimantId?._id || claim.claimantId)
                if (claimUser && claimUser.warningCount < 3) {
                    claimUser.warningCount += 1
                    if (claimUser.warningCount >= 3) claimUser.status = 'restricted'
                    await claimUser.save()
                }
            }

            // Notify rejected user
            await Notification.create({
                userId: claim.claimantId?._id || claim.claimantId,
                type: 'claim_rejected',
                title: 'Claim Rejected',
                message: `Your claim for "${foundItemTitle}" was rejected. Admin note: ${noteText}`,
                foundItemId: claim.foundItemId?._id || claim.foundItemId,
                lostItemId: claim.lostItemId || undefined,
                claimId: claim._id,
            })

            logAction = 'REJECT_CLAIM'
        } else if (action === 'request_info') {
            claim.status = 'admin_review'
            claim.adminNote = noteText
            claim.trackingHistory.push({ status: 'Admin Review', note: noteText, updatedBy: decoded.name })

            await Notification.create({
                userId: claim.claimantId?._id || claim.claimantId,
                type: 'claim_info_requested',
                title: '📋 More Information Requested',
                message: `Admin has requested more details about your claim for "${foundItemTitle}": ${noteText}`,
                foundItemId: claim.foundItemId?._id || claim.foundItemId,
                claimId: claim._id,
            })

            logAction = 'REQUEST_INFO'
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        await claim.save()
        await AuditLog.create({
            adminId: decoded.id, adminName: decoded.name,
            action: logAction, targetType: 'ClaimRequest',
            targetId: claim._id, details: noteText,
        })

        return NextResponse.json({ claim: { _id: claim._id, status: claim.status } })
    } catch (err) {
        console.error('[Admin Claims PATCH]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
