export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import FoundItem from '@/models/FoundItem'
import { verifyToken } from '@/lib/auth'

function sanitizePrivateAiFields(doc) {
    const raw = doc && typeof doc.toObject === 'function' ? doc.toObject() : { ...(doc || {}) }
    delete raw.aiGeneratedDescription
    delete raw.aiProfile
    return raw
}

export async function GET(request, { params }) {
    try {
        await connectDB()
        const item = await FoundItem.findById(params.id).lean()
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        await FoundItem.findByIdAndUpdate(params.id, { $inc: { views: 1 } })

        // Privacy: check if requester is owner or admin
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        const isOwner = decoded && item.submittedBy?.toString() === decoded.id
        const isAdmin = decoded && decoded.role === 'admin'

        if (isOwner || isAdmin) {
            return NextResponse.json({ item: sanitizePrivateAiFields(item) })
        }

        // Public view: hide sensitive details to prevent fake claims
        const { keywords, color, brand, condition, submittedByEmail, submittedBy, locationFound, description, aiGeneratedDescription, aiProfile, ...publicItem } = item
        return NextResponse.json({
            item: {
                ...publicItem,
                description: '[Hidden for security] Please provide specific details in your claim request.',
                locationFound: '[Hidden]',
                isPrivate: true,
            }
        })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function PUT(request, { params }) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const item = await FoundItem.findById(params.id)
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        if (item.submittedBy.toString() !== decoded.id && decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        const body = await request.json()
        const updated = await FoundItem.findByIdAndUpdate(params.id, body, { new: true })
        return NextResponse.json({ item: sanitizePrivateAiFields(updated) })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const item = await FoundItem.findById(params.id)
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        if (item.submittedBy.toString() !== decoded.id && decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        await FoundItem.findByIdAndDelete(params.id)
        return NextResponse.json({ message: 'Deleted' })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
