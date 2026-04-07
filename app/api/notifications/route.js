export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Notification from '@/models/Notification'
import { verifyToken } from '@/lib/auth'

// GET /api/notifications — Fetch user's notifications
export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()

        const { searchParams } = new URL(request.url)
        const typeFilter = searchParams.get('type')

        const baseFilter = { userId: decoded.id, dismissed: false }

        // Map UI filter tabs to notification types
        const typeMap = {
            claims: ['claim_update', 'claim_approved', 'claim_rejected', 'claim_info_requested'],
            ai_matches: ['ai_match'],
            messages: ['chat_message'],
            warnings: ['warning', 'restriction', 'unrestricted'],
            system: ['system', 'system_update', 'important_alert', 'action_required', 'appeal_approved', 'appeal_rejected'],
        }

        const query = { ...baseFilter }
        if (typeFilter && typeMap[typeFilter]) {
            query.type = { $in: typeMap[typeFilter] }
        }

        const notifications = await Notification.find(query)
            .populate('lostItemId', 'title category possibleLocation imageUrl')
            .populate('foundItemId', 'title category locationFound photoUrl submittedBy')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()

        const unreadCount = await Notification.countDocuments({
            userId: decoded.id, read: false, dismissed: false,
        })

        // Category counts for filter tabs
        const [claimsCount, aiCount, messagesCount, warningsCount, systemCount] = await Promise.all([
            Notification.countDocuments({ ...baseFilter, type: { $in: typeMap.claims } }),
            Notification.countDocuments({ ...baseFilter, type: { $in: typeMap.ai_matches } }),
            Notification.countDocuments({ ...baseFilter, type: { $in: typeMap.messages } }),
            Notification.countDocuments({ ...baseFilter, type: { $in: typeMap.warnings } }),
            Notification.countDocuments({ ...baseFilter, type: { $in: typeMap.system } }),
        ])

        return NextResponse.json({
            notifications, unreadCount,
            counts: { claims: claimsCount, ai_matches: aiCount, messages: messagesCount, warnings: warningsCount, system: systemCount, all: notifications.length },
        })
    } catch (err) {
        console.error('[Notifications GET]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}


// PATCH /api/notifications — Mark notifications as read or dismissed
export async function PATCH(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const body = await request.json()
        const { action, notificationId } = body

        if (action === 'mark_all_read') {
            await Notification.updateMany(
                { userId: decoded.id, read: false },
                { read: true }
            )
            return NextResponse.json({ message: 'All marked as read' })
        }

        if (action === 'mark_read' && notificationId) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, userId: decoded.id },
                { read: true }
            )
            return NextResponse.json({ message: 'Marked as read' })
        }

        if (action === 'dismiss' && notificationId) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, userId: decoded.id },
                { dismissed: true }
            )
            return NextResponse.json({ message: 'Dismissed' })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (err) {
        console.error('[Notifications PATCH]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
