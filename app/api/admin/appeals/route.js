export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserAppeal from '@/models/UserAppeal'
import User from '@/models/User'
import UserWarning from '@/models/UserWarning'
import AuditLog from '@/models/AuditLog'
import { verifyToken } from '@/lib/auth'

// GET — list appeals (admin: all pending, or filtered)
export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await connectDB()
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'PENDING'
        const userId = searchParams.get('userId')

        const filter = {}
        if (status !== 'all') filter.status = status
        if (userId) filter.userId = userId

        const appeals = await UserAppeal.find(filter)
            .populate('userId', 'name email campusId warningCount status restrictionLevel avatar')
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json({ appeals })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// PATCH — approve or reject an appeal
export async function PATCH(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await connectDB()
        const { appealId, decision, adminResponse, reviewNotes } = await request.json()

        if (!appealId || !decision) {
            return NextResponse.json({ error: 'appealId and decision are required' }, { status: 400 })
        }

        const appeal = await UserAppeal.findById(appealId)
        if (!appeal) return NextResponse.json({ error: 'Appeal not found' }, { status: 404 })

        appeal.status = decision === 'approve' ? 'APPROVED' : 'REJECTED'
        appeal.reviewedBy = decoded.id
        appeal.reviewedByName = decoded.name || 'Admin'
        appeal.reviewedAt = new Date()
        appeal.adminResponse = adminResponse || reviewNotes || ''
        await appeal.save()

        // If approved, unrestrict the user and revoke all active warnings
        if (decision === 'approve') {
            const user = await User.findById(appeal.userId)
            if (user) {
                user.status = 'active'
                user.restrictionLevel = 'NONE'
                user.restrictionReason = ''
                user.restrictedAt = null
                user.warningCount = 0
                await user.save()

                // Revoke all active warnings
                await UserWarning.updateMany(
                    { userId: appeal.userId, status: 'ACTIVE' },
                    { status: 'REVOKED' }
                )
            }
        }

        // Audit log
        await AuditLog.create({
            adminName: decoded.name || 'Admin',
            action: decision === 'approve' ? 'APPROVE_APPEAL' : 'REJECT_APPEAL',
            targetType: 'User',
            targetId: appeal.userId,
            details: `Appeal ${decision}d. ${adminResponse || ''}`,
        })

        return NextResponse.json({ appeal })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
