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
import { analyzeImageFromUrl, mergeKeywordLists } from '@/lib/imageAI'

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

        let aiData = null
        try {
            // Always run server-side scan so full AI description is generated and stored privately.
            aiData = await analyzeImageFromUrl(photoUrl)
        } catch (aiErr) {
            console.warn('[Found Item AI Fallback]', aiErr.message)
            aiData = ai || null
        }

        const resolvedCategory = ALLOWED_CATEGORIES.has(category)
            ? category
            : (ALLOWED_CATEGORIES.has(aiData?.category) ? aiData.category : 'Other')

        const resolvedTitle = String(title || aiData?.title || 'Unidentified Item').trim()
        const resolvedDescription = String(description || aiData?.description || 'Auto-generated item report from uploaded image.').trim()
        const resolvedLocation = String(locationFound || 'Not specified').trim()
        const resolvedColor = String(color || aiData?.color || '').trim()
        const resolvedDateFound = dateFound ? new Date(dateFound) : new Date()
        const resolvedKeywords = mergeKeywordLists(keywords, aiData?.keywords, aiData?.labels)

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
            aiLabels: aiData?.labels || [],
            aiCategory: aiData?.category || '',
            aiColor: aiData?.color || '',
            aiConfidence: Number(aiData?.confidence || 0),
            aiProfile: aiData?.aiProfile || {},
            aiSource: aiData ? 'huggingface' : '',
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
                    matches.push({
                        lostItem: sanitizePrivateAiFields(lostItem),
                        matchScore: result.matchScore,
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
                            message: `A found item "${item.title}" has a ${result.matchScore}% match with your lost "${lostItem.title}"`,
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
