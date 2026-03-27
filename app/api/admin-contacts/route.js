export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import AdminContact from '@/models/AdminContact'
import Message from '@/models/Message'
import User from '@/models/User'
import Notification from '@/models/Notification'
import { verifyToken } from '@/lib/auth'

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

// GET - Fetch admin contacts for user or all contacts for admin
export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const { searchParams } = new URL(request.url)
        const contactId = searchParams.get('contactId')

        // If contactId provided, fetch specific contact with messages
        if (contactId) {
            const contact = await AdminContact.findById(contactId)
                .populate('userId', 'name email campusId')
                .populate('assignedTo', 'name email')
            
            if (!contact) {
                return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
            }

            // Verify access (user can see their own, admin can see all)
            if (contact.userId._id.toString() !== decoded.id && decoded.role !== 'admin') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }

            // Fetch messages
            const messages = await Message.find({ contactId })
                .populate('senderId', 'name email role')
                .sort({ createdAt: 1 })
                .lean()

            // Mark messages as read for current user
            if (decoded.id) {
                await Message.updateMany(
                    { contactId, recipientId: decoded.id, read: false },
                    { read: true, readAt: new Date() }
                )
            }

            return NextResponse.json({ contact, messages: messages.map(toClientMessage) })
        }

        // List contacts
        let query = {}
        if (decoded.role !== 'admin') {
            // Users only see their own contacts
            query.userId = decoded.id
        }

        const contacts = await AdminContact.find(query)
            .populate('userId', 'name email campusId')
            .populate('assignedTo', 'name email')
            .sort({ lastMessageAt: -1, createdAt: -1 })
            .lean()

        const contactsWithUnread = await Promise.all(
            contacts.map(async (contact) => {
                const unreadCount = await Message.countDocuments({
                    contactId: contact._id,
                    recipientId: decoded.id,
                    read: false,
                })
                return {
                    ...contact,
                    unreadCount,
                }
            })
        )

        return NextResponse.json({ contacts: contactsWithUnread })
    } catch (err) {
        console.error('[AdminContact GET]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// POST - Create new admin contact request
export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const { subject, initialMessage, claimId } = await request.json()

        if (!subject?.trim() || !initialMessage?.trim()) {
            return NextResponse.json(
                { error: 'Subject and initial message are required' },
                { status: 400 }
            )
        }

        const user = await User.findById(decoded.id).select('name email')
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Create contact request
        const contact = await AdminContact.create({
            userId: decoded.id,
            userName: user.name,
            userEmail: user.email,
            subject,
            initialMessage,
            claimId: claimId || null,
        })

        const admins = await User.find({ role: 'admin' }).select('_id')

        // Create initial message
        const firstMessage = await Message.create({
            contactId: contact._id,
            senderId: decoded.id,
            senderRole: 'user',
            senderName: user.name,
            recipientId: admins[0]?._id || null,
            message: initialMessage,
        })

        // Update contact with message reference
        await AdminContact.findByIdAndUpdate(
            contact._id,
            { 
                $push: { messages: firstMessage._id },
                lastMessageAt: new Date()
            }
        )

        // Notify admins
        for (const admin of admins) {
            await Notification.create({
                userId: admin._id,
                type: 'chat_message',
                title: `📧 New Contact Request from ${user.name}`,
                message: `Subject: ${subject}`,
                contactId: contact._id,
            })
        }

        const populatedContact = await AdminContact.findById(contact._id)
            .populate('userId', 'name email')

        return NextResponse.json({ contact: populatedContact }, { status: 201 })
    } catch (err) {
        console.error('[AdminContact POST]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// PATCH - Update contact status or assign to admin
export async function PATCH(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await connectDB()
        const { contactId, status, assignedTo } = await request.json()

        if (!contactId) {
            return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
        }

        const update = {}
        if (status) update.status = status
        if (assignedTo) update.assignedTo = assignedTo
        if (status === 'in_progress' && !assignedTo) update.assignedTo = decoded.id

        const contact = await AdminContact.findByIdAndUpdate(contactId, update, { new: true })
            .populate('userId', 'name email')
            .populate('assignedTo', 'name email')

        return NextResponse.json({ contact })
    } catch (err) {
        console.error('[AdminContact PATCH]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
