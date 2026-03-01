import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic' // Ensure it's not statically cached permanently
export const revalidate = 300 // 5 minutes cache

export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await connectDB()

        const { searchParams } = new URL(request.url)
        const range = parseInt(searchParams.get('range') || '30')

        // Define timeframe
        const endDate = new Date()
        endDate.setHours(23, 59, 59, 999)
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - range + 1)
        startDate.setHours(0, 0, 0, 0)

        const matchStage = {
            createdAt: { $gte: startDate, $lte: endDate }
        }

        const groupStage = {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
        }

        const [lostResults, foundResults] = await Promise.all([
            LostItem.aggregate([
                { $match: matchStage },
                { $group: groupStage },
                { $sort: { _id: 1 } }
            ]),
            FoundItem.aggregate([
                { $match: matchStage },
                { $group: groupStage },
                { $sort: { _id: 1 } }
            ])
        ])

        // Fill in missing days
        const data = []
        for (let i = 0; i < range; i++) {
            const dateStr = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000))
                .toISOString()
                .split('T')[0]

            const lostCount = lostResults.find(r => r._id === dateStr)?.count || 0
            const foundCount = foundResults.find(r => r._id === dateStr)?.count || 0

            // Format labels like "Mar 01"
            const label = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(new Date(dateStr))

            data.push({
                fullDate: dateStr,
                date: label,
                lost: lostCount,
                found: foundCount
            })
        }

        return NextResponse.json({ trajectory: data })

    } catch (err) {
        console.error('Analytics Trajectory Error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
