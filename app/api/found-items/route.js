export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import FoundItem from '@/models/FoundItem'
import { verifyToken } from '@/lib/auth'

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
        const items = await FoundItem.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()

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

        return NextResponse.json({ item }, { status: 201 })
    } catch (err) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
