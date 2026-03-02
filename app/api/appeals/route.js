export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserAppeal from '@/models/UserAppeal'
import UserWarning from '@/models/UserWarning'
import { verifyToken } from '@/lib/auth'

// GET — user's own appeals + warnings
export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const [appeals, warnings] = await Promise.all([
            UserAppeal.find({ userId: decoded.id }).sort({ createdAt: -1 }).lean(),
            UserWarning.find({ userId: decoded.id }).sort({ createdAt: -1 }).lean(),
        ])

        return NextResponse.json({ appeals, warnings })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// POST — submit a new appeal (restricted users only)
export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const { appealMessage, supportingExplanation, evidenceUrl, acknowledgedPolicy } = await request.json()

        if (!appealMessage || !appealMessage.trim()) {
            return NextResponse.json({ error: 'Appeal message is required' }, { status: 400 })
        }

        // Check if user already has a pending appeal
        const existingPending = await UserAppeal.findOne({ userId: decoded.id, status: 'PENDING' })
        if (existingPending) {
            return NextResponse.json({ error: 'You already have a pending appeal. Please wait for admin review.' }, { status: 409 })
        }

        const appeal = await UserAppeal.create({
            userId: decoded.id,
            appealMessage: appealMessage.trim(),
            supportingExplanation: supportingExplanation?.trim() || '',
            evidenceUrl: evidenceUrl || '',
            acknowledgedPolicy: !!acknowledgedPolicy,
        })

        return NextResponse.json({ appeal }, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
