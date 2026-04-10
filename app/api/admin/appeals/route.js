export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserAppeal from '@/models/UserAppeal'
import User from '@/models/User'
import UserWarning from '@/models/UserWarning'
import Notification from '@/models/Notification'
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
            .populate('warningId', 'reason severity shortAutoSummary createdAt')
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
        const { appealId, decision, adminResponse, reviewNotes, action } = await request.json()

        if (!appealId || !decision) {
            if (action !== 'open') {
                return NextResponse.json({ error: 'appealId and decision are required' }, { status: 400 })
            }
        }

        const appeal = await UserAppeal.findById(appealId).populate('warningId')
        if (!appeal) return NextResponse.json({ error: 'Appeal not found' }, { status: 404 })

        if (action === 'open') {
            if (!appeal.openedAt) {
                appeal.openedAt = new Date()
                appeal.openedBy = decoded.id
                appeal.openedByName = decoded.name || 'Admin'
                await appeal.save()
            }

            return NextResponse.json({ appeal })
        }

        if (appeal.status !== 'PENDING') {
            return NextResponse.json({ error: 'Appeal has already been reviewed' }, { status: 409 })
        }

        if (!appeal.openedAt) {
            appeal.openedAt = new Date()
            appeal.openedBy = decoded.id
            appeal.openedByName = decoded.name || 'Admin'
        }

        appeal.status = decision === 'approve' ? 'APPROVED' : 'REJECTED'
        appeal.reviewedBy = decoded.id
        appeal.reviewedByName = decoded.name || 'Admin'
        appeal.reviewedAt = new Date()
        appeal.adminResponse = adminResponse || reviewNotes || ''
        await appeal.save()

        // Handle different appeal types
        if (decision === 'approve') {
            // If this is a warning removal appeal
            if (appeal.appealType === 'WARNING_REMOVAL' && appeal.warningId) {
                const warning = appeal.warningId
                const warningId = warning._id || warning
                await UserWarning.deleteOne({ _id: warningId })

                // Recalculate active warnings
                const activeWarnings = await UserWarning.countDocuments({
                    userId: appeal.userId,
                    status: 'ACTIVE',
                })

                const user = await User.findById(appeal.userId)
                if (user) {
                    user.warningCount = activeWarnings

                    // If warnings drop below 3, clear warning-driven restrictions.
                    if (activeWarnings < 3 && user.restrictionLevel !== 'NONE') {
                        user.status = 'active'
                        user.restrictionLevel = 'NONE'
                        user.restrictionReason = ''
                        user.restrictedAt = null
                    }
                    await user.save()
                }

                // Notify user about warning removal approval
                await Notification.create({
                    userId: appeal.userId,
                    type: 'appeal_approved',
                    title: '✅ Warning Removal Approved',
                    message: `Your appeal to remove the warning for "${warning.reason}" has been approved!${activeWarnings < 3 ? ' Your account restriction has been lifted.' : ''}${adminResponse ? ` Admin note: "${adminResponse}"` : ''}`,
                })
            } else {
                // General account restriction appeal - remove all warnings and unrestrict
                const user = await User.findById(appeal.userId)
                if (user) {
                    user.status = 'active'
                    user.restrictionLevel = 'NONE'
                    user.restrictionReason = ''
                    user.restrictedAt = null
                    user.warningCount = 0
                    await user.save()

                    // Remove warnings so moderation no longer lists them.
                    await UserWarning.deleteMany({ userId: appeal.userId })
                }

                // Notify user about appeal decision
                await Notification.create({
                    userId: appeal.userId,
                    type: 'appeal_approved',
                    title: '🎉 Appeal Approved',
                    message: `Your appeal has been approved! Your account restrictions have been lifted and all warnings revoked.${adminResponse ? ` Admin note: "${adminResponse}"` : ''}`,
                })
            }
        } else {
            // Rejection notification differs based on appeal type
            const appealTypeLabel = appeal.appealType === 'WARNING_REMOVAL' ? 'Warning removal' : 'Account restriction'
            await Notification.create({
                userId: appeal.userId,
                type: 'appeal_rejected',
                title: '❌ Appeal Rejected',
                message: `Your ${appealTypeLabel} appeal has been reviewed and was not approved.${adminResponse ? ` Reason: "${adminResponse}"` : ' Please contact support for further assistance.'}`,
            })
        }

        // Audit log
        await AuditLog.create({
            adminId: decoded.id,
            adminName: decoded.name || 'Admin',
            action: decision === 'approve' ? 'APPROVE_APPEAL' : 'REJECT_APPEAL',
            targetType: 'UserAppeal',
            targetId: appeal._id,
            details: `${appeal.appealType} appeal ${decision}d. ${adminResponse || ''}`,
        })

        if (decision === 'approve') {
            const userId = String(appeal.userId)
            const deletedAppealId = String(appeal._id)
            await UserAppeal.deleteOne({ _id: appeal._id })
            return NextResponse.json({ message: 'Appeal approved and removed', userId, deletedAppealId })
        }

        return NextResponse.json({ appeal, userId: String(appeal.userId) })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
