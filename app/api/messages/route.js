export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import Notification from '@/models/Notification'
import AdminContact from '@/models/AdminContact'
import ClaimRequest from '@/models/ClaimRequest'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

const EDIT_WINDOW_MS = 60 * 1000

function toClientMessage(msg) {
    const senderObj = msg?.senderId && typeof msg.senderId === 'object' ? msg.senderId : null
    return {
        _id: msg?._id,
        claimId: msg?.claimId || null,
        contactId: msg?.contactId || null,
        senderId: senderObj?._id || msg?.senderId || null,
        senderRole: msg?.senderRole || 'user',
        senderName: msg?.senderName || senderObj?.name || 'Unknown',
        recipientId: msg?.recipientId || null,
        message: msg?.message || '',
        edited: Boolean(msg?.edited),
        editedAt: msg?.editedAt || null,
        read: Boolean(msg?.read),
        readAt: msg?.readAt || null,
        createdAt: msg?.createdAt,
    }
}

// GET /api/messages — Fetch messages for a claim or contact
export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const { searchParams } = new URL(request.url)
        const claimId = searchParams.get('claimId')
        const contactId = searchParams.get('contactId')

        if (!claimId && !contactId) {
            return NextResponse.json({ error: 'claimId or contactId is required' }, { status: 400 })
        }

        let query = {}
        if (claimId) {
            query.claimId = claimId
            // Verify user has access to this claim (is claimant or admin)
            const claim = await ClaimRequest.findById(claimId)
            if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

            if (claim.claimantId.toString() !== decoded.id && decoded.role !== 'admin') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
        } else if (contactId) {
            query.contactId = contactId
            // Verify user has access to this contact
            const contact = await AdminContact.findById(contactId)
            if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

            if (contact.userId.toString() !== decoded.id && decoded.role !== 'admin') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
        }

        const messages = await Message.find(query)
            .populate('senderId', 'name email role')
            .sort({ createdAt: 1 })
            .lean()

        // Mark messages as read for the current user
        await Message.updateMany(
            { ...query, recipientId: decoded.id, read: false },
            { read: true, readAt: new Date() }
        )

        return NextResponse.json({ messages: messages.map(toClientMessage) })
    } catch (err) {
        console.error('[Messages GET]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// POST /api/messages — Send a new message (claim-based or contact-based)
export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const { claimId, contactId, message } = await request.json()

        if (!message?.trim() || (!claimId && !contactId)) {
            return NextResponse.json(
                { error: 'Message and either claimId or contactId are required' },
                { status: 400 }
            )
        }

        const isAdmin = decoded.role === 'admin'
        const sender = await User.findById(decoded.id)
        let recipientId
        let messageData = {
            senderId: decoded.id,
            senderRole: isAdmin ? 'admin' : 'user',
            senderName: sender.name || 'Unknown',
            message: message.trim(),
        }

        // Handle contact-based message
        if (contactId) {
            const contact = await AdminContact.findById(contactId)
            if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

            // Verify access (user owns contact or admin)
            if (contact.userId.toString() !== decoded.id && !isAdmin) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }

            if (contact.status === 'closed' || contact.status === 'resolved') {
                return NextResponse.json({ error: 'This chat has been closed by admin.' }, { status: 403 })
            }

            if (!isAdmin && contact.status !== 'in_progress') {
                return NextResponse.json({ error: 'Wait until admin accepts your request.' }, { status: 403 })
            }

            // Determine recipient
            if (isAdmin) {
                recipientId = contact.userId
            } else {
                // User sending to assigned admin or first admin
                recipientId = contact.assignedTo || await User.findOne({ role: 'admin' }).then(a => a?._id)
                if (!recipientId) {
                    return NextResponse.json({ error: 'No admin available' }, { status: 400 })
                }
            }

            messageData.contactId = contactId
            messageData.recipientId = recipientId

            const newMessage = await Message.create(messageData)

            // Update contact
            await AdminContact.findByIdAndUpdate(
                contactId,
                {
                    $push: { messages: newMessage._id },
                    lastMessageAt: new Date(),
                    ...(isAdmin && contact.status === 'open' ? { status: 'in_progress', assignedTo: decoded.id } : {}),
                }
            )

            // Notify recipient
            const notificationTitle = isAdmin
                ? `💬 New message in: ${contact.subject}`
                : `💬 Admin replied`

            await Notification.create({
                userId: recipientId,
                type: 'chat_message',
                title: notificationTitle,
                message: message.substring(0, 50),
                contactId,
                messageId: newMessage._id,
            })

            const populatedMessage = await Message.findById(newMessage._id)
                .populate('senderId', 'name email role')
                .lean()

            return NextResponse.json({ message: toClientMessage(populatedMessage) }, { status: 201 })
        }

        // Handle claim-based message
        if (claimId) {
            const claim = await ClaimRequest.findById(claimId)
                .populate('claimantId', 'name email')
                .populate('foundItemId', 'submittedBy')

            if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

            const isClaimant = claim.claimantId._id.toString() === decoded.id

            if (!isAdmin && !isClaimant) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }

            // Determine recipient
            if (isAdmin) {
                recipientId = claim.claimantId._id
            } else {
                const admin = await User.findOne({ role: 'admin' })
                if (!admin) {
                    return NextResponse.json({ error: 'No admin available' }, { status: 400 })
                }
                recipientId = admin._id
            }

            messageData.claimId = claimId
            messageData.recipientId = recipientId

            const newMessage = await Message.create(messageData)

            // Create notification for recipient
            const notificationTitle = isAdmin
                ? `💬 Message from Admin`
                : `💬 Message from ${sender.name}`

            const notificationMessage = isAdmin
                ? `Admin: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`
                : `"${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`

            await Notification.create({
                userId: recipientId,
                type: 'chat_message',
                title: notificationTitle,
                message: notificationMessage,
                claimId,
                messageId: newMessage._id,
            })

            const populatedMessage = await Message.findById(newMessage._id)
                .populate('senderId', 'name email role')
                .lean()

            return NextResponse.json({ message: toClientMessage(populatedMessage) }, { status: 201 })
        }
    } catch (err) {
        console.error('[Messages POST]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// PATCH /api/messages — Edit a sent message within 1 minute
export async function PATCH(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const { messageId, message } = await request.json()

        if (!messageId || !message?.trim()) {
            return NextResponse.json({ error: 'messageId and message are required' }, { status: 400 })
        }

        const existing = await Message.findById(messageId)
        if (!existing) return NextResponse.json({ error: 'Message not found' }, { status: 404 })

        if (existing.senderId?.toString() !== decoded.id) {
            return NextResponse.json({ error: 'You can only edit your own messages' }, { status: 403 })
        }

        const createdAtMs = new Date(existing.createdAt).getTime()
        if (!Number.isFinite(createdAtMs) || Date.now() - createdAtMs > EDIT_WINDOW_MS) {
            return NextResponse.json({ error: 'Edit time window expired' }, { status: 403 })
        }

        existing.message = message.trim()
        existing.edited = true
        existing.editedAt = new Date()
        await existing.save()

        const populated = await Message.findById(existing._id)
            .populate('senderId', 'name email role')
            .lean()

        return NextResponse.json({ message: toClientMessage(populated) })
    } catch (err) {
        console.error('[Messages PATCH]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
