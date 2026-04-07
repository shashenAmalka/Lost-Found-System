export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserAppeal from '@/models/UserAppeal'
import UserWarning from '@/models/UserWarning'
import Notification from '@/models/Notification'
import { verifyToken } from '@/lib/auth'

// GET — user's warning removal appeals
export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const appeals = await UserAppeal.find({
            userId: decoded.id,
            appealType: 'WARNING_REMOVAL',
        })
            .populate('warningId')
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json({ appeals })
    } catch (err) {
        console.error('[Warning Appeals GET]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// POST — submit a new warning removal appeal
export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const {
            warningId,
            appealMessage,
            supportingExplanation,
            evidenceUrl,
            acknowledgedPolicy,
        } = await request.json()

        if (!warningId || !appealMessage?.trim()) {
            return NextResponse.json(
                { error: 'warningId and appealMessage are required' },
                { status: 400 }
            )
        }

        // Verify the warning exists and belongs to the user
        const warning = await UserWarning.findById(warningId)
        if (!warning) {
            return NextResponse.json({ error: 'Warning not found' }, { status: 404 })
        }
        if (warning.userId.toString() !== decoded.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Check if user already has a pending appeal for this warning
        const existingAppeal = await UserAppeal.findOne({
            userId: decoded.id,
            warningId,
            status: 'PENDING',
        })
        if (existingAppeal) {
            return NextResponse.json(
                { error: 'You already have a pending appeal for this warning. Please wait for admin review.' },
                { status: 409 }
            )
        }

        // Create the appeal
        const appeal = await UserAppeal.create({
            userId: decoded.id,
            warningId,
            appealMessage: appealMessage.trim(),
            supportingExplanation: supportingExplanation?.trim() || '',
            evidenceUrl: evidenceUrl || '',
            acknowledgedPolicy: !!acknowledgedPolicy,
            appealType: 'WARNING_REMOVAL',
            status: 'PENDING',
        })

        // Notify admins that a new warning appeal was submitted
        await Notification.create({
            userId: decoded.id,
            type: 'system',
            title: '📋 Warning Removal Appeal Submitted',
            message: `Your appeal for the warning "${warning.reason}" has been submitted and is pending admin review.`,
        })

        return NextResponse.json({ appeal }, { status: 201 })
    } catch (err) {
        console.error('[Warning Appeals POST]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
