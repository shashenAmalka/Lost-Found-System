export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import User from '@/models/User'
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
        if (location) filter.possibleLocation = { $regex: location, $options: 'i' }
        // Hide archived from non-admin
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') {
            filter.status = { $nin: ['archived'] }
        }

        const total = await LostItem.countDocuments(filter)
        const items = await LostItem.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()

        return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) })
    } catch (err) {
        console.error(err)
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
        const { title, category, description, keywords, color, brand, uniqueIdentifier,
            dateLost, timeRange, possibleLocation, imageUrl, contactPreference, categoryFields } = body

        if (!title || !category || !description || !dateLost || !possibleLocation) {
            return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
        }

        const item = await LostItem.create({
            title, category, description,
            keywords: Array.isArray(keywords) ? keywords : (keywords || '').split(',').map(k => k.trim()).filter(Boolean),
            color: color || '', brand: brand || '', uniqueIdentifier: uniqueIdentifier || '',
            dateLost: new Date(dateLost), timeRange: timeRange || '',
            possibleLocation, imageUrl: imageUrl || '',
            contactPreference: contactPreference || 'platform',
            postedBy: decoded.id,
            postedByName: decoded.name || '',
            postedByEmail: decoded.email || '',
            categoryFields: categoryFields || {},
        })

        // Log to Audit Feed
        await AuditLog.create({
            adminName: 'System',
            action: 'NEW_SUBMISSION',
            targetType: 'LostItem',
            targetId: item._id,
            details: `User ${decoded.name || decoded.email} reported a lost ${item.title} near ${item.possibleLocation}.`,
        })

        // === AI Auto-Scan: Find matching found items ===
        let matches = []
        try {
            const unclaimedFound = await FoundItem.find({ status: 'unclaimed' }).lean()
            const MATCH_THRESHOLD = 75

            for (const foundItem of unclaimedFound) {
                const result = await computeMatchScore(item.toObject(), foundItem, {})
                if (result.matchScore >= MATCH_THRESHOLD) {
                    matches.push({
                        foundItem,
                        matchScore: result.matchScore,
                        breakdown: result.breakdown,
                    })

                    // Create notification for the user (deduplicate)
                    const existingNotif = await Notification.findOne({
                        userId: decoded.id,
                        type: 'ai_match',
                        lostItemId: item._id,
                        foundItemId: foundItem._id,
                    })
                    if (!existingNotif) {
                        await Notification.create({
                            userId: decoded.id,
                            type: 'ai_match',
                            title: 'AI Match Found!',
                            message: `Your "${item.title}" has a ${result.matchScore}% match with "${foundItem.title}" found at ${foundItem.locationFound}`,
                            lostItemId: item._id,
                            foundItemId: foundItem._id,
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
                            details: `AI confirmed a ${result.matchScore}% match between '${item.title}' and '${foundItem.title}'.`,
                        })
                    }
                }
            }

            // Update lost item status if strong match found
            if (matches.some(m => m.matchScore >= 60)) {
                await LostItem.findByIdAndUpdate(item._id, { status: 'matched' })
            }
        } catch (scanErr) {
            console.error('[AI Scan Error]', scanErr)
            // Don't fail the request if scanning fails
        }

        return NextResponse.json({ item, matches }, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
