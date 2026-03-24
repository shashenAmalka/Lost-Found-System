export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ClaimRequest from '@/models/ClaimRequest'
import { verifyToken } from '@/lib/auth'

export async function GET(request, { params }) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const claim = await ClaimRequest.findById(params.id)
            .populate('lostItemId')
            .populate('foundItemId')
            .populate('claimantId', '-password')
            .lean()
        if (!claim) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        if (claim.claimantId._id.toString() !== decoded.id && decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Strip AI-internal fields for non-admin users
        if (decoded.role !== 'admin') {
            delete claim.aiMatchScore
            delete claim.aiRiskScore
            delete claim.aiBreakdown
            delete claim.aiSuggestedDecision
        }

        return NextResponse.json({ claim })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function PATCH(request, { params }) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const claim = await ClaimRequest.findById(params.id)
            .populate('lostItemId')
            .populate('foundItemId')
            .populate('claimantId', '-password')
        if (!claim) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        const body = await request.json()

        // --- Non-admin users ---
        if (decoded.role !== 'admin') {
            if (claim.claimantId._id.toString() !== decoded.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }

            // WITHDRAW action
            if (body.action === 'withdraw') {
                const editableStatuses = ['under_review', 'ai_matched']
                if (!editableStatuses.includes(claim.status)) {
                    return NextResponse.json({ error: 'Claim cannot be withdrawn at this stage' }, { status: 400 })
                }
                claim.status = 'withdrawn'
                const note = body.withdrawReason
                    ? `Claim withdrawn by user. Reason: ${body.withdrawReason}`
                    : 'Claim withdrawn by user'
                claim.trackingHistory.push({ status: 'Withdrawn', note, updatedBy: decoded.name })
                await claim.save()
                const updated = await ClaimRequest.findById(claim._id)
                    .populate('lostItemId').populate('foundItemId').populate('claimantId', '-password').lean()
                return NextResponse.json({ claim: updated })
            }

            // UPDATE (edit) action — only allowed when under_review or ai_matched
            if (body.action === 'update') {
                const editableStatuses = ['under_review', 'ai_matched']
                if (!editableStatuses.includes(claim.status)) {
                    return NextResponse.json({ error: 'Claim cannot be edited at this stage' }, { status: 400 })
                }
                const allowed = ['ownershipExplanation', 'hiddenDetails', 'exactColorBrand', 'dateLost', 'timeLost', 'locationLost', 'proofUrl', 'pickupPreference']
                allowed.forEach(field => {
                    if (body[field] !== undefined) claim[field] = body[field]
                })
                claim.trackingHistory.push({ status: 'Updated', note: 'Claim details updated by claimant', updatedBy: decoded.name })
                await claim.save()
                const updated = await ClaimRequest.findById(claim._id)
                    .populate('lostItemId').populate('foundItemId').populate('claimantId', '-password').lean()
                return NextResponse.json({ claim: updated })
            }

            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        return NextResponse.json({ error: 'Use admin endpoint' }, { status: 400 })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
