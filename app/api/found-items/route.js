export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import FoundItem from '@/models/FoundItem'
import LostItem from '@/models/LostItem'
import Notification from '@/models/Notification'
import AuditLog from '@/models/AuditLog'
import { verifyToken } from '@/lib/auth'
import { computeMatchScore } from '@/lib/aiEngine'

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
            const { description, locationFound, keywords, color, brand, condition, submittedByEmail, submittedBy, ...publicItem } = item
            return {
                ...publicItem,
                description: null,
                locationFound: null,
                isPrivate: true,
            }
        })

        return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) })
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
        const body = await request.json()
        const { title, category, description, keywords, color, brand, condition,
            dateFound, locationFound, photoUrl } = body

        if (!title || !category || !description || !dateFound || !locationFound) {
            return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
        }

        const item = await FoundItem.create({
            title, category, description,
            keywords: Array.isArray(keywords) ? keywords : (keywords || '').split(',').map(k => k.trim()).filter(Boolean),
            color: color || '', brand: brand || '',
            condition: condition || 'Good',
            dateFound: new Date(dateFound), locationFound,
            photoUrl: photoUrl || '',
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
        try {
            const pendingLost = await LostItem.find({ status: 'pending' }).lean()
            const MATCH_THRESHOLD = 40

            for (const lostItem of pendingLost) {
                const result = await computeMatchScore(lostItem, item.toObject(), {})
                if (result.matchScore >= MATCH_THRESHOLD) {
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
        } catch (scanErr) {
            console.error('[AI Reverse-Scan Error]', scanErr)
        }

        return NextResponse.json({ item }, { status: 201 })
    } catch (err) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
