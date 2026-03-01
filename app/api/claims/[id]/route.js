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
        if (!claim) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        const body = await request.json()

        // User can only withdraw their own claim
        if (decoded.role !== 'admin') {
            if (claim.claimantId.toString() !== decoded.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
            if (body.action !== 'withdraw') {
                return NextResponse.json({ error: 'Only admins can change claim status' }, { status: 403 })
            }
            claim.status = 'withdrawn'
            claim.trackingHistory.push({ status: 'Withdrawn', note: 'Claim withdrawn by user', updatedBy: decoded.name })
            await claim.save()
            return NextResponse.json({ claim })
        }

        return NextResponse.json({ error: 'Use admin endpoint' }, { status: 400 })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
