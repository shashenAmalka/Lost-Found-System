export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import FoundItem from '@/models/FoundItem'
import LostItem from '@/models/LostItem'
import User from '@/models/User'
import Notification from '@/models/Notification'
import AuditLog from '@/models/AuditLog'
import { verifyToken } from '@/lib/auth'
import { computeMatchScore } from '@/lib/aiEngine'
import { mergeKeywordLists } from '@/lib/imageAI'
import { analyzeItemImageWithGroq } from '@/lib/groqItemAI'

const ALLOWED_CATEGORIES = new Set(['Electronics', 'Books', 'Clothing', 'Keys', 'ID Card', 'Bag', 'Jewelry', 'Sports', 'Other'])

function sanitizePrivateAiFields(doc) {
    const raw = doc && typeof doc.toObject === 'function' ? doc.toObject() : { ...(doc || {}) }
    delete raw.aiGeneratedDescription
    delete raw.aiProfile
    return raw
}

function getMatchThresholdByCategory(category) {
    switch (category) {
        case 'Electronics':
            return 82
        case 'ID Card':
        case 'Keys':
            return 74
        case 'Bag':
        case 'Jewelry':
            return 76
        default:
            return 78
    }
}

function normalizeText(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function toKeywordList(...values) {
    const out = new Set()
    for (const value of values) {
        if (!value) continue
        const parts = Array.isArray(value) ? value : String(value).split(',')
        for (const part of parts) {
            const normalized = normalizeText(part)
            if (!normalized) continue
            for (const token of normalized.split(' ')) {
                if (token.length > 2) out.add(token)
            }
        }
    }
    return [...out]
}

function overlapScore(leftValues, rightValues) {
    const left = new Set(toKeywordList(leftValues))
    const right = new Set(toKeywordList(rightValues))
    if (!left.size && !right.size) return 1
    if (!left.size || !right.size) return 0

    let intersection = 0
    for (const token of left) {
        if (right.has(token)) intersection += 1
    }
    const union = left.size + right.size - intersection
    return union ? (intersection / union) : 0
}

function compareUserAndAiDetails(userInput, aiInput) {
    const userCategory = String(userInput.category || '').trim().toLowerCase()
    const aiCategory = String(aiInput.category || '').trim().toLowerCase()
    const userColor = String(userInput.color || '').trim().toLowerCase()
    const aiColor = String(aiInput.color || '').trim().toLowerCase()

    const categoryScore = !userCategory && !aiCategory ? 1 : (userCategory && aiCategory && userCategory === aiCategory ? 1 : 0)
    const colorScore = !userColor && !aiColor ? 1 : (userColor && aiColor && userColor === aiColor ? 1 : 0)
    const titleScore = overlapScore(userInput.title, aiInput.title)
    const descriptionScore = overlapScore(userInput.description, aiInput.description)
    const keywordScore = overlapScore(userInput.keywords || [], aiInput.keywords || [])

    const overallScore = Math.round((
        titleScore * 0.2 +
        descriptionScore * 0.35 +
        keywordScore * 0.25 +
        categoryScore * 0.1 +
        colorScore * 0.1
    ) * 100)

    return {
        overallScore,
        titleScore: Math.round(titleScore * 100),
        descriptionScore: Math.round(descriptionScore * 100),
        keywordScore: Math.round(keywordScore * 100),
        categoryScore: Math.round(categoryScore * 100),
        colorScore: Math.round(colorScore * 100),
    }
}

function buildFallbackAiData(userInput) {
    const fallbackTitle = String(userInput.title || '').trim() || 'Unidentified Item'
    const fallbackDescription = String(userInput.description || '').trim() || 'User-provided item details (AI unavailable).'
    const fallbackCategory = ALLOWED_CATEGORIES.has(userInput.category) ? userInput.category : 'Other'
    const fallbackColor = String(userInput.color || '').trim()
    const fallbackLabels = mergeKeywordLists(
        userInput.keywords,
        toKeywordList(userInput.title, userInput.description, userInput.brand, userInput.color)
    ).slice(0, 16)

    return {
        title: fallbackTitle,
        description: fallbackDescription,
        fullScanDescription: fallbackDescription,
        category: fallbackCategory,
        color: fallbackColor,
        labels: fallbackLabels,
        keywords: fallbackLabels,
        confidence: fallbackLabels.length ? 35 : 20,
        aiProfile: {
            userInputFallback: true,
            objectType: fallbackLabels[0] || 'item',
            subType: fallbackLabels[0] || 'item',
            visualFingerprint: fallbackLabels.slice(0, 8).join(' | '),
        },
    }
}

function hydrateAiData(aiData, userInput) {
    const fallback = buildFallbackAiData(userInput)
    const base = aiData && typeof aiData === 'object' ? aiData : {}
    const baseTitle = String(base.title || base.itemTitle || '').trim()
    const baseDescription = String(base.description || base.fullScanDescription || '').trim()
    const baseCategory = String(base.category || '').trim()
    const baseColor = String(base.color || '').trim()
    const baseConfidenceRaw = Number(base.confidencePercent ?? base.confidence ?? fallback.confidence)
    const baseConfidence = Number.isFinite(baseConfidenceRaw)
        ? (baseConfidenceRaw <= 1 ? Math.round(baseConfidenceRaw * 100) : baseConfidenceRaw)
        : fallback.confidence
    const labels = mergeKeywordLists(
        base.labels,
        base.aiLabels,
        base.keywords,
        userInput.keywords,
        toKeywordList(userInput.title, userInput.description)
    ).slice(0, 16)

    const category = ALLOWED_CATEGORIES.has(baseCategory) ? baseCategory : fallback.category

    return {
        ...fallback,
        ...base,
        title: String(baseTitle || fallback.title).trim(),
        itemTitle: String(baseTitle || fallback.title).trim(),
        description: String(baseDescription || fallback.description).trim(),
        fullScanDescription: String(base.fullScanDescription || baseDescription || fallback.fullScanDescription).trim(),
        category,
        color: String(baseColor || fallback.color).trim(),
        labels,
        aiLabels: mergeKeywordLists(base.aiLabels, labels).slice(0, 3),
        keywords: mergeKeywordLists(base.keywords, labels),
        confidence: Number(baseConfidence || fallback.confidence || 0),
        aiProfile: {
            ...(fallback.aiProfile || {}),
            ...(base.aiProfile || {}),
        },
    }
}

export async function GET(request) {
    try {
        await connectDB()
        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q') || ''
        const category = searchParams.get('category') || ''
        const status = searchParams.get('status') || ''
        const location = searchParams.get('location') || ''
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const limit = 12

        const filter = {}
        if (q) filter.$or = [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { keywords: { $in: [new RegExp(q, 'i')] } },
        ]
        if (category) filter.category = category
        if (status) filter.status = status
        if (location) filter.locationFound = { $regex: location, $options: 'i' }
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') {
            filter.status = { $nin: ['archived'] }
        }

        const total = await FoundItem.countDocuments(filter)
        const rawItems = await FoundItem.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()

        // Privacy: strip sensitive fields for non-owner, non-admin users
        const items = rawItems.map(item => {
            const isOwner = decoded && item.submittedBy?.toString() === decoded.id
            const isAdminUser = decoded && decoded.role === 'admin'
            if (isOwner || isAdminUser) return item
            // Public view: hide description + location to prevent fake claims
            const { description, locationFound, keywords, color, brand, condition, submittedByEmail, submittedBy, aiGeneratedDescription, ...publicItem } = item
            return {
                ...publicItem,
                description: null,
                locationFound: null,
                isPrivate: true,
            }
        })

        const safeItems = items.map(sanitizePrivateAiFields)

        return NextResponse.json({ items: safeItems, total, page, pages: Math.ceil(total / limit) })
    } catch (err) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const decoded = verifyToken(token)
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        await connectDB()

        // Block restricted users from posting
        const poster = await User.findById(decoded.id).select('restrictionLevel status').lean()
        if (poster && (poster.restrictionLevel === 'LIMITED' || poster.restrictionLevel === 'FULL' || poster.status === 'restricted' || poster.status === 'limited')) {
            return NextResponse.json({ error: 'Your account is restricted. You cannot post items.' }, { status: 403 })
        }

        const body = await request.json()
        const {
            title,
            category,
            description,
            keywords,
            color,
            brand,
            condition,
            dateFound,
            locationFound,
            photoUrl,
            ai,
            smartMode,
        } = body

        if (!photoUrl) {
            return NextResponse.json({ error: 'Image upload is required' }, { status: 400 })
        }

        const userInputSnapshot = {
            title: String(title || '').trim(),
            category: String(category || '').trim(),
            description: String(description || '').trim(),
            keywords: mergeKeywordLists(keywords),
            color: String(color || '').trim(),
            brand: String(brand || '').trim(),
            locationFound: String(locationFound || '').trim(),
        }

        let aiData = null
        let aiSourceLabel = ''
        try {
            // Always run server-side scan so full AI description is generated and stored privately.
            aiData = await analyzeItemImageWithGroq(photoUrl, { itemType: 'found' })
                aiSourceLabel = String(aiData?.source || aiData?.aiSource || 'groq')
        } catch (aiErr) {
            console.warn('[Found Item AI Fallback]', aiErr.message)
            aiData = ai || null
        }

        aiData = hydrateAiData(aiData, userInputSnapshot)
        if (!aiSourceLabel) {
            aiSourceLabel = aiData?.aiProfile?.userInputFallback ? 'user_fallback' : (ai ? 'client_ai' : '')
        }

        const aiInputSnapshot = {
            title: aiData?.title || aiData?.itemTitle || '',
            category: aiData?.category || '',
            description: aiData?.description || aiData?.fullScanDescription || '',
            keywords: mergeKeywordLists(aiData?.keywords, aiData?.labels, aiData?.aiLabels),
            color: aiData?.color || '',
        }
        const userVsAiComparison = compareUserAndAiDetails(userInputSnapshot, aiInputSnapshot)

        const resolvedCategory = ALLOWED_CATEGORIES.has(category)
            ? category
            : (ALLOWED_CATEGORIES.has(aiData?.category) ? aiData.category : 'Other')

        const resolvedTitle = String(title || aiData?.title || aiData?.itemTitle || 'Unidentified Item').trim()
        const resolvedDescription = String(description || aiData?.description || 'Auto-generated item report from uploaded image.').trim()
        const resolvedLocation = String(locationFound || 'Not specified').trim()
        const resolvedColor = String(color || aiData?.color || '').trim()
        const resolvedDateFound = dateFound ? new Date(dateFound) : new Date()
        const resolvedKeywords = mergeKeywordLists(keywords, aiData?.keywords, aiData?.labels, aiData?.aiLabels)
        const aiConfidenceRaw = Number(aiData?.confidencePercent ?? aiData?.confidence ?? 0)
        const aiConfidenceResolved = Number.isFinite(aiConfidenceRaw)
            ? (aiConfidenceRaw <= 1 ? Math.round(aiConfidenceRaw * 100) : aiConfidenceRaw)
            : 0

        if (!resolvedTitle || !resolvedDescription || !resolvedLocation) {
            return NextResponse.json({ error: 'Unable to generate enough item details from the image. Please add title or description.' }, { status: 400 })
        }

        const item = await FoundItem.create({
            title: resolvedTitle,
            category: resolvedCategory,
            description: resolvedDescription,
            keywords: resolvedKeywords,
            color: resolvedColor,
            brand: brand || '',
            condition: condition || 'Good',
            dateFound: resolvedDateFound,
            locationFound: resolvedLocation,
            photoUrl: photoUrl || '',
            aiGeneratedDescription: aiData?.fullScanDescription || aiData?.description || '',
            aiLabels: mergeKeywordLists(aiData?.aiLabels, aiData?.labels).slice(0, 16),
            aiCategory: aiData?.category || '',
            aiColor: aiData?.color || '',
            aiConfidence: aiConfidenceResolved,
            aiProfile: {
                ...(aiData?.aiProfile || {}),
                userInputComparison: userVsAiComparison,
                userInputSnapshot,
                imageAnalysisSnapshot: aiInputSnapshot,
            },
            aiSource: aiSourceLabel,
            smartMode: Boolean(smartMode),
            submittedBy: decoded.id,
            submittedByName: decoded.name || '',
            submittedByEmail: decoded.email || '',
        })

        // Log to Audit Feed
        await AuditLog.create({
            adminName: 'System',
            action: 'NEW_SUBMISSION',
            targetType: 'FoundItem',
            targetId: item._id,
            details: `User ${decoded.name || decoded.email} reported finding a ${item.title} at ${item.locationFound}.`,
        })

        // === AI Reverse-Scan: Notify owners of matching lost items ===
        let matches = []
        try {
            const lostFilter = { status: 'pending' }
            if (resolvedCategory && resolvedCategory !== 'Other') {
                lostFilter.category = resolvedCategory
            }

            const pendingLost = await LostItem.find(lostFilter).lean()
            const MATCH_THRESHOLD = getMatchThresholdByCategory(resolvedCategory)

            for (const lostItem of pendingLost) {
                // Do not match against items the user submitted themselves
                if (lostItem.postedBy?.toString() === decoded.id) continue;

                const result = await computeMatchScore(lostItem, item.toObject(), {})
                const meetsQualityGate =
                    result.breakdown.descriptionScore >= 45 ||
                    result.breakdown.keywordScore >= 40 ||
                    result.breakdown.objectTypeScore >= 65

                if (result.matchScore >= MATCH_THRESHOLD && meetsQualityGate) {
                    const suggestionScore = Math.round((result.matchScore * 0.75) + (userVsAiComparison.overallScore * 0.25))
                    matches.push({
                        lostItem: sanitizePrivateAiFields(lostItem),
                        matchScore: result.matchScore,
                        suggestionScore,
                        breakdown: result.breakdown,
                    })

                    // Create notification for the lost item owner (deduplicate)
                    const existingNotif = await Notification.findOne({
                        userId: lostItem.postedBy,
                        type: 'ai_match',
                        lostItemId: lostItem._id,
                        foundItemId: item._id,
                    })
                    if (!existingNotif) {
                        await Notification.create({
                            userId: lostItem.postedBy,
                            type: 'ai_match',
                            title: 'AI Match Found!',
                            message: `A found item "${item.title}" has a ${result.matchScore}% match with your lost "${lostItem.title}" (suggestion score ${suggestionScore}%, detail consistency ${userVsAiComparison.overallScore}%).`,
                            lostItemId: lostItem._id,
                            foundItemId: item._id,
                            matchScore: result.matchScore,
                        })
                    }

                    // Log high matches to Audit Feed
                    if (result.matchScore >= 70) {
                        await AuditLog.create({
                            adminName: 'AI Engine',
                            action: 'HIGH_MATCH_VERIFIED',
                            targetType: 'ClaimRequest',
                            targetId: item._id,
                            details: `AI confirmed a ${result.matchScore}% match between '${lostItem.title}' and '${item.title}'.`,
                        })
                    }

                    // Update lost item status if strong match
                    if (result.matchScore >= 60) {
                        await LostItem.findByIdAndUpdate(lostItem._id, { status: 'matched' })
                    }
                }
            }

            matches = matches
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 5)
        } catch (scanErr) {
            console.error('[AI Reverse-Scan Error]', scanErr)
        }

        return NextResponse.json({ item: sanitizePrivateAiFields(item), matches }, { status: 201 })
    } catch (err) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
