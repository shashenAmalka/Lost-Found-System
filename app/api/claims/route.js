export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ClaimRequest from '@/models/ClaimRequest'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import User from '@/models/User'
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

        // Block restricted users from claiming
        const claimant = await User.findById(decoded.id).select('restrictionLevel status').lean()
        if (claimant && (claimant.restrictionLevel === 'LIMITED' || claimant.restrictionLevel === 'FULL' || claimant.status === 'restricted' || claimant.status === 'limited')) {
            return NextResponse.json({ error: 'Your account is restricted. You cannot submit claims.' }, { status: 403 })
        }

        const body = await request.json()
        const { lostItemId, foundItemId, ownershipExplanation, hiddenDetails,
            exactColorBrand, dateLost, proofUrl, pickupPreference } = body

        if (!foundItemId || !ownershipExplanation) {
            return NextResponse.json({ error: 'Found item and ownership explanation are required' }, { status: 400 })
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

        // Fetch the found item (always required)
        const foundItem = await FoundItem.findById(foundItemId).lean()
        if (!foundItem) {
            return NextResponse.json({ error: 'Found item not found' }, { status: 404 })
        }

        // Block the person who posted the found item from claiming it
        if (foundItem.submittedBy?.toString() === decoded.id) {
            return NextResponse.json({
                error: 'You cannot claim an item that you reported as found.',
            }, { status: 403 })
        }

        // Build claim data
        const claimData = {
            foundItemId,
            lostItemId: lostItemId || null,
            claimantId: decoded.id,
            claimantName: decoded.name || '',
            claimantEmail: decoded.email || '',
            ownershipExplanation,
            hiddenDetails: hiddenDetails || '',
            exactColorBrand: exactColorBrand || '',
            dateLost: dateLost ? new Date(dateLost) : undefined,
            proofUrl: proofUrl || '',
            pickupPreference: pickupPreference || 'Campus Lost & Found Office',
            trackingHistory: [
                { status: 'Submitted', note: 'Claim submitted successfully', updatedBy: decoded.name },
            ],
        }

        // If a lost item is linked, run AI matching for admin intelligence (NOT gating)
        if (lostItemId) {
            const lostItem = await LostItem.findById(lostItemId).lean()
            if (lostItem) {
                const aiResult = await computeMatchScore(lostItem, foundItem, {
                    ownershipExplanation, hiddenDetails, exactColorBrand
                })
                claimData.aiMatchScore = aiResult.matchScore
                claimData.aiRiskScore = aiResult.riskScore
                claimData.aiSuggestedDecision = aiResult.suggestedDecision
                claimData.aiBreakdown = aiResult.breakdown
                claimData.status = 'ai_matched'
                claimData.trackingHistory.push({
                    status: 'AI Matched', note: `AI Match Score: ${aiResult.matchScore}%`, updatedBy: 'AI Engine'
                })
            } else {
                claimData.status = 'under_review'
            }
        } else {
            // Direct claim without Lost Item — goes to admin review
            claimData.status = 'under_review'
            claimData.trackingHistory.push({
                status: 'Pending Review', note: 'Direct claim — no linked lost item report. Awaiting admin review.', updatedBy: 'System'
            })
        }

        const claim = await ClaimRequest.create(claimData)

        // Log to Audit Feed
        const aiInfo = claimData.aiMatchScore ? ` AI Match: ${claimData.aiMatchScore}%.` : ' Direct claim (no AI match).'
        await AuditLog.create({
            adminName: 'System',
            action: 'NEW_CLAIM',
            targetType: 'ClaimRequest',
            targetId: claim._id,
            details: `User ${decoded.name || decoded.email} submitted a claim for ${foundItem.title}.${aiInfo}`,
        })

        if (claimData.aiMatchScore >= 90) {
            await AuditLog.create({
                adminName: 'AI Engine',
                action: 'HIGH_MATCH_VERIFIED',
                targetType: 'ClaimRequest',
                targetId: claim._id,
                details: `AI confirmed a near-perfect ${claimData.aiMatchScore}% match for Claim #${claim._id.toString().slice(-5).toUpperCase()}.`,
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
