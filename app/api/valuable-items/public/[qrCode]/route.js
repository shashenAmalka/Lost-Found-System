export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ValuableItem from '@/models/ValuableItem'

export async function GET(_request, { params }) {
    try {
        await connectDB()

        const item = await ValuableItem.findOne({ qrCode: params.qrCode, status: 'active' }).lean()
        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }

        return NextResponse.json({
            item: {
                _id: item._id,
                name: item.name,
                description: item.description,
                category: item.category,
                uniqueIdentifier: item.uniqueIdentifier,
                imageUrl: item.imageUrl,
                ownerName: item.ownerName,
                ownerEmail: item.ownerEmail,
                qrCode: item.qrCode,
            },
        })
    } catch (err) {
        console.error('[Valuable Item Public GET]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}