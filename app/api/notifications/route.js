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
        const notifications = await Notification.find({
            userId: decoded.id,
            dismissed: false,
        })
            .populate('lostItemId', 'title category possibleLocation imageUrl')
            .populate('foundItemId', 'title category locationFound photoUrl')
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()

        const unreadCount = await Notification.countDocuments({
            userId: decoded.id,
            read: false,
            dismissed: false,
        })

        return NextResponse.json({ notifications, unreadCount })
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
