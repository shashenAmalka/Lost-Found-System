export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Item from '@/models/Item'

// GET all items
export async function GET() {
    try {
        await connectDB()
        const items = await Item.find({})
        return NextResponse.json(items, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
    }
}

// POST - create a new item
export async function POST(request) {
    try {
        await connectDB()
        const body = await request.json()
        const newItem = await Item.create(body)
        return NextResponse.json(newItem, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
    }
}
