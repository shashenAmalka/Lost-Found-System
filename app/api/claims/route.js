export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ClaimRequest from '@/models/ClaimRequest'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import { verifyToken } from '@/lib/auth'
import { computeMatchScore } from '@/lib/aiEngine'

export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const filter = decoded.role === 'admin' ? {} : { claimantId: decoded.id }
        const claims = await ClaimRequest.find(filter)
            .populate('lostItemId', 'title category status imageUrl')
            .populate('foundItemId', 'title category status locationFound photoUrl dateFound')
            .sort({ createdAt: -1 })
            .lean()

        // Strip AI-internal fields for non-admin users
        const safeClaims = decoded.role === 'admin' ? claims : claims.map(c => {
            const { aiMatchScore, aiRiskScore, aiBreakdown, aiSuggestedDecision, ...safe } = c
            return safe
        })

        return NextResponse.json({ claims: safeClaims })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const body = await request.json()
        const { lostItemId, foundItemId, ownershipExplanation, hiddenDetails,
            exactColorBrand, dateLost, proofUrl, pickupPreference } = body

        if (!lostItemId || !foundItemId || !ownershipExplanation) {
            return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
        }

        // Check for duplicate claim
        const existing = await ClaimRequest.findOne({
            claimantId: decoded.id,
            foundItemId,
            status: { $nin: ['withdrawn', 'rejected'] },
        })
        if (existing) {
            return NextResponse.json({ error: 'You already have an active claim for this item' }, { status: 409 })
        }

        const [lostItem, foundItem] = await Promise.all([
            LostItem.findById(lostItemId).lean(),
            FoundItem.findById(foundItemId).lean(),
        ])
        if (!lostItem || !foundItem) {
            return NextResponse.json({ error: 'Items not found' }, { status: 404 })
        }

        // Run AI matching (MiniLM-L6-v2 semantic engine)
        const aiResult = await computeMatchScore(lostItem, foundItem, {
            ownershipExplanation, hiddenDetails, exactColorBrand
        })

        const claim = await ClaimRequest.create({
            lostItemId, foundItemId,
            claimantId: decoded.id,
            claimantName: decoded.name || '',
            claimantEmail: decoded.email || '',
            ownershipExplanation,
            hiddenDetails: hiddenDetails || '',
            exactColorBrand: exactColorBrand || '',
            dateLost: dateLost ? new Date(dateLost) : undefined,
            proofUrl: proofUrl || '',
            pickupPreference: pickupPreference || 'Campus Lost & Found Office',
            status: 'ai_matched',
            aiMatchScore: aiResult.matchScore,
            aiRiskScore: aiResult.riskScore,
            aiSuggestedDecision: aiResult.suggestedDecision,
            aiBreakdown: aiResult.breakdown,
            trackingHistory: [
                { status: 'Submitted', note: 'Claim submitted successfully', updatedBy: decoded.name },
                { status: 'AI Matched', note: `AI Match Score: ${aiResult.matchScore}%`, updatedBy: 'AI Engine' },
            ],
        })

        // Update found item status
        await FoundItem.findByIdAndUpdate(foundItemId, { status: 'under_review' })

        return NextResponse.json({ claim, aiResult }, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
