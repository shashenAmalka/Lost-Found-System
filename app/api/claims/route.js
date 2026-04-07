export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ClaimRequest from '@/models/ClaimRequest'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import User from '@/models/User'
import AuditLog from '@/models/AuditLog'
import { verifyToken } from '@/lib/auth'
import { computeMatchScore, computeClaimMatchScore } from '@/lib/aiEngine'
import { validateOwnershipExplanation, validateClaimEvidence } from '@/lib/validations'

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
            exactColorBrand, dateLost, timeLost, locationLost, proofUrl, pickupPreference } = body

        if (!foundItemId || !ownershipExplanation) {
            return NextResponse.json({ error: 'Found item and ownership explanation are required' }, { status: 400 })
        }

        // Validate ownership explanation length
        const ownershipResult = validateOwnershipExplanation(ownershipExplanation)
        if (!ownershipResult.valid) {
            return NextResponse.json({ error: ownershipResult.error }, { status: 400 })
        }

        // Validate at least one strong evidence
        const evidenceResult = validateClaimEvidence({ lostItemId, hiddenDetails, proofUrl })
        if (!evidenceResult.valid) {
            return NextResponse.json({ error: evidenceResult.error }, { status: 400 })
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
            timeLost: timeLost || '',
            locationLost: locationLost || '',
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
                claimData.aiMatchLevel = aiResult.matchScore >= 70 ? 'HIGH' : aiResult.matchScore >= 40 ? 'MEDIUM' : aiResult.matchScore >= 20 ? 'LOW' : 'UNLIKELY'
                claimData.aiMatchReasons = []
                if (aiResult.breakdown.descriptionScore >= 50) claimData.aiMatchReasons.push('Description aligns with found item')
                if (aiResult.breakdown.categoryScore >= 100) claimData.aiMatchReasons.push('Category matches exactly')
                if (aiResult.breakdown.locationScore >= 50) claimData.aiMatchReasons.push('Location is close to where item was found')
                if (aiResult.breakdown.dateScore >= 70) claimData.aiMatchReasons.push('Date lost aligns with date found')
                claimData.aiRedFlags = []
                if ((ownershipExplanation || '').trim().length < 50) claimData.aiRedFlags.push('Ownership explanation is very brief')
                if (!(hiddenDetails || '').trim()) claimData.aiRedFlags.push('No hidden/identifying details provided')
                claimData.claimType = 'matched'
                claimData.status = 'ai_matched'
                claimData.trackingHistory.push({
                    status: 'AI Matched', note: `AI Match Score: ${aiResult.matchScore}%`, updatedBy: 'AI Engine'
                })
            } else {
                claimData.status = 'under_review'
            }
        } else {
            // Direct claim without Lost Item — run AI using claim text as proxy
            const aiResult = await computeClaimMatchScore({
                ownershipExplanation, hiddenDetails, exactColorBrand,
                dateLost, locationLost: body.locationLost || '',
                category: body.category || '',
            }, foundItem)
            claimData.aiMatchScore = aiResult.matchScore
            claimData.aiRiskScore = aiResult.riskScore
            claimData.aiMatchLevel = aiResult.matchLevel
            claimData.aiSuggestedDecision = aiResult.suggestedDecision
            claimData.aiMatchReasons = aiResult.matchReasons
            claimData.aiRedFlags = aiResult.redFlags
            claimData.aiBreakdown = aiResult.breakdown
            claimData.claimType = 'direct'
            claimData.status = 'under_review'
            claimData.trackingHistory.push({
                status: 'Pending Review',
                note: `Direct claim — AI Score: ${aiResult.matchScore}% (${aiResult.matchLevel}). Awaiting admin review.`,
                updatedBy: 'System'
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
