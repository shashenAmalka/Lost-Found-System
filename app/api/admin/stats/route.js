export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import AuditLog from '@/models/AuditLog'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import ClaimRequest from '@/models/ClaimRequest'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        await connectDB()
        const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100).lean()
        return NextResponse.json({ logs })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// Admin stats
export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        await connectDB()
        const [totalLost, totalFound, totalClaims, pendingClaims, resolvedClaims, totalUsers, restrictedUsers] = await Promise.all([
            LostItem.countDocuments(),
            FoundItem.countDocuments(),
            ClaimRequest.countDocuments(),
            ClaimRequest.countDocuments({ status: { $in: ['under_review', 'ai_matched', 'admin_review'] } }),
            ClaimRequest.countDocuments({ status: 'approved' }),
            User.countDocuments({ role: { $ne: 'admin' } }),
            User.countDocuments({ status: 'restricted' }),
        ])

        return NextResponse.json({ totalLost, totalFound, totalClaims, pendingClaims, resolvedClaims, totalUsers, restrictedUsers })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
