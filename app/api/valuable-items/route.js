export const dynamic = 'force-dynamic'

import crypto from 'crypto'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ValuableItem from '@/models/ValuableItem'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

function createQrCodeToken() {
    return `VAL-${crypto.randomBytes(6).toString('hex').toUpperCase()}`
}

async function generateUniqueQrCode() {
    for (let i = 0; i < 6; i += 1) {
        const qrCode = createQrCodeToken()
        const exists = await ValuableItem.exists({ qrCode })
        if (!exists) return qrCode
    }
    throw new Error('Unable to generate a unique QR code token')
}

function getPublicBaseUrl(request) {
    if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
    const url = new URL(request.url)
    return `${url.protocol}//${url.host}`
}

export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()

        const items = await ValuableItem.find({ ownerId: decoded.id })
            .sort({ createdAt: -1 })
            .lean()

        const baseUrl = getPublicBaseUrl(request)
        const payload = items.map((item) => ({
            ...item,
            publicUrl: `${baseUrl}/valuable-items/${item.qrCode}`,
        }))

        return NextResponse.json({ items: payload })
    } catch (err) {
        console.error('[Valuable Items GET]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()

        const owner = await User.findById(decoded.id).select('name email').lean()
        if (!owner) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const body = await request.json()
        const {
            name,
            description,
            category,
            uniqueIdentifier,
            imageUrl,
        } = body || {}

        if (!String(name || '').trim()) {
            return NextResponse.json({ error: 'Item name is required' }, { status: 400 })
        }

        const qrCode = await generateUniqueQrCode()

        const created = await ValuableItem.create({
            name: String(name || '').trim(),
            description: String(description || '').trim(),
            category: String(category || '').trim(),
            uniqueIdentifier: String(uniqueIdentifier || '').trim(),
            imageUrl: String(imageUrl || '').trim(),
            qrCode,
            ownerId: decoded.id,
            ownerName: owner.name || '',
            ownerEmail: owner.email || '',
        })

        const baseUrl = getPublicBaseUrl(request)

        return NextResponse.json({
            item: {
                ...created.toObject(),
                publicUrl: `${baseUrl}/valuable-items/${qrCode}`,
            },
        }, { status: 201 })
    } catch (err) {
        console.error('[Valuable Items POST]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}