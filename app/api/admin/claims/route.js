export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ClaimRequest from '@/models/ClaimRequest'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import User from '@/models/User'
import AuditLog from '@/models/AuditLog'
import { verifyToken } from '@/lib/auth'

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
        const filter = status ? { status } : {}
        const claims = await ClaimRequest.find(filter)
            .populate('lostItemId', 'title category possibleLocation dateLost')
            .populate('foundItemId', 'title category locationFound dateFound')
            .populate('claimantId', 'name email campusId warningCount status')
            .sort({ createdAt: -1 })
            .lean()
        return NextResponse.json({ claims })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

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

        const claim = await ClaimRequest.findById(claimId)
        if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

        let logAction = ''

        if (action === 'approve') {
            claim.status = 'approved'
            claim.adminNote = adminNote || ''
            claim.adminId = decoded.id
            claim.reviewedAt = new Date()
            claim.trackingHistory.push({ status: 'Approved', note: adminNote || 'Claim approved by admin', updatedBy: decoded.name })
            await LostItem.findByIdAndUpdate(claim.lostItemId, { status: 'resolved' })
            await FoundItem.findByIdAndUpdate(claim.foundItemId, { status: 'claimed' })
            // Badge for finder
            const foundDoc = await FoundItem.findById(claim.foundItemId)
            if (foundDoc) {
                await User.findByIdAndUpdate(foundDoc.submittedBy, { $inc: { trustedFinderCount: 1 } })
                const finder = await User.findById(foundDoc.submittedBy)
                if (finder && finder.trustedFinderCount >= 3 && !finder.trustedFinderBadge) {
                    await User.findByIdAndUpdate(foundDoc.submittedBy, { trustedFinderBadge: true })
                }
            }
            logAction = 'APPROVE_CLAIM'
        } else if (action === 'reject') {
            claim.status = 'rejected'
            claim.adminNote = adminNote || ''
            claim.adminId = decoded.id
            claim.reviewedAt = new Date()
            claim.trackingHistory.push({ status: 'Rejected', note: adminNote || 'Claim rejected', updatedBy: decoded.name })

            // Warning system
            if (claim.aiMatchScore < 40) {
                const user = await User.findById(claim.claimantId)
                if (user && user.warningCount < 3) {
                    user.warningCount += 1
                    if (user.warningCount >= 3) user.status = 'restricted'
                    await user.save()
                }
            }
            logAction = 'REJECT_CLAIM'
        } else if (action === 'request_info') {
            claim.status = 'admin_review'
            claim.adminNote = adminNote || 'Additional information requested'
            claim.trackingHistory.push({ status: 'Admin Review', note: adminNote || 'More information requested', updatedBy: decoded.name })
            logAction = 'REQUEST_INFO'
        }

        await claim.save()
        await AuditLog.create({ adminId: decoded.id, adminName: decoded.name, action: logAction, targetType: 'ClaimRequest', targetId: claim._id, details: adminNote || '' })

        return NextResponse.json({ claim })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
