export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ClaimRequest from '@/models/ClaimRequest'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import AuditLog from '@/models/AuditLog'
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

        // Block the person who posted the found item from claiming it
        if (foundItem.submittedBy?.toString() === decoded.id) {
            return NextResponse.json({
                error: 'You cannot claim an item that you reported as found.',
            }, { status: 403 })
        }

        // Run AI matching (MiniLM-L6-v2 semantic engine)
        const aiResult = await computeMatchScore(lostItem, foundItem, {
            ownershipExplanation, hiddenDetails, exactColorBrand
        })

        // Server-side gate: only allow claims with AI score >= 75%
        const CLAIM_THRESHOLD = 75
        if (aiResult.matchScore < CLAIM_THRESHOLD) {
            return NextResponse.json({
                error: 'This item does not meet the minimum AI match requirements to submit a claim.',
            }, { status: 403 })
        }

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

        // Log to Audit Feed
        await AuditLog.create({
            adminName: 'System',
            action: 'NEW_CLAIM',
            targetType: 'ClaimRequest',
            targetId: claim._id,
            details: `User ${decoded.name || decoded.email} submitted a claim for ${foundItem.title}. AI Match: ${aiResult.matchScore}%.`,
        })

        if (aiResult.matchScore >= 90) {
            await AuditLog.create({
                adminName: 'AI Engine',
                action: 'HIGH_MATCH_VERIFIED',
                targetType: 'ClaimRequest',
                targetId: claim._id,
                details: `AI confirmed a near-perfect ${aiResult.matchScore}% match for Claim #${claim._id.toString().slice(-5).toUpperCase()}.`,
            })
        }

        // Update found item status
        await FoundItem.findByIdAndUpdate(foundItemId, { status: 'under_review' })

        return NextResponse.json({ claim }, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
