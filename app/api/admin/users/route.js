export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import UserWarning from '@/models/UserWarning'
import UserAppeal from '@/models/UserAppeal'
import Notification from '@/models/Notification'
import AuditLog from '@/models/AuditLog'
import { verifyToken } from '@/lib/auth'

// GET — list all users with warning + appeal counts
export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        await connectDB()
        const users = await User.find({ isDeleted: { $ne: true } }).select('-password').sort({ createdAt: -1 }).lean()

        // Enrich with warning counts and pending appeal status
        const userIds = users.map(u => u._id)
        const [warningCounts, pendingAppeals, appealCounts] = await Promise.all([
            UserWarning.aggregate([
                { $match: { userId: { $in: userIds }, status: 'ACTIVE' } },
                { $group: { _id: '$userId', count: { $sum: 1 } } },
            ]),
            UserAppeal.find({ userId: { $in: userIds }, status: 'PENDING' }).select('userId').lean(),
            UserAppeal.aggregate([
                { $match: { userId: { $in: userIds } } },
                { $group: { _id: '$userId', count: { $sum: 1 } } },
            ]),
        ])

        const warningMap = Object.fromEntries(warningCounts.map(w => [w._id.toString(), w.count]))
        const appealSet = new Set(pendingAppeals.map(a => a.userId.toString()))
        const appealCountMap = Object.fromEntries(appealCounts.map(a => [a._id.toString(), a.count]))

        const enriched = users.map(u => ({
            ...u,
            activeWarnings: warningMap[u._id.toString()] || 0,
            hasPendingAppeal: appealSet.has(u._id.toString()),
            appealCount: appealCountMap[u._id.toString()] || 0,
        }))

        return NextResponse.json({ users: enriched })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// PATCH — moderation actions on a user
export async function PATCH(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        await connectDB()
        const { userId, action, reason } = await request.json()
        const user = await User.findById(userId)
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        let logAction = ''
        let details = ''

        switch (action) {
            case 'restrict_limited':
                user.status = 'limited'
                user.restrictionLevel = 'LIMITED'
                user.restrictionReason = reason || 'Account restricted by admin.'
                user.restrictedAt = new Date()
                logAction = 'RESTRICT_LIMITED'
                details = `User ${user.name} restricted to LIMITED. Reason: ${user.restrictionReason}`
                await Notification.create({
                    userId, type: 'restriction',
                    title: '🛡️ Account Restricted',
                    message: `Your account has been restricted: ${user.restrictionReason}. You cannot post items or submit claims. Submit an appeal from your dashboard.`,
                })
                break

            case 'restrict_full':
                user.status = 'restricted'
                user.restrictionLevel = 'FULL'
                user.restrictionReason = reason || 'Account fully restricted by admin.'
                user.restrictedAt = new Date()
                logAction = 'RESTRICT_FULL'
                details = `User ${user.name} fully restricted (login blocked). Reason: ${user.restrictionReason}`
                await Notification.create({
                    userId, type: 'restriction',
                    title: '🔒 Account Fully Restricted',
                    message: `Your account has been fully restricted: ${user.restrictionReason}. Login access has been revoked.`,
                })
                break

            case 'unrestrict':
                user.status = 'active'
                user.restrictionLevel = 'NONE'
                user.restrictionReason = ''
                user.restrictedAt = null
                user.warningCount = 0
                // Revoke all active warnings
                await UserWarning.updateMany({ userId, status: 'ACTIVE' }, { status: 'REVOKED' })
                logAction = 'UNRESTRICT_USER'
                details = `User ${user.name} unrestricted. All warnings revoked.`
                await Notification.create({
                    userId, type: 'unrestricted',
                    title: '✅ Restriction Lifted',
                    message: 'Your account restriction has been lifted and all warnings have been revoked. You can now use the platform normally.',
                })
                break

            case 'reduce_warning':
                // Revoke the most recent active warning
                const latestWarning = await UserWarning.findOne({ userId, status: 'ACTIVE' }).sort({ createdAt: -1 })
                if (latestWarning) {
                    latestWarning.status = 'REVOKED'
                    await latestWarning.save()
                }
                const remaining = await UserWarning.countDocuments({ userId, status: 'ACTIVE' })
                user.warningCount = remaining
                if (remaining < 3 && user.restrictionLevel === 'LIMITED') {
                    user.status = 'active'
                    user.restrictionLevel = 'NONE'
                    user.restrictionReason = ''
                    user.restrictedAt = null
                }
                logAction = 'REDUCE_WARNING'
                details = `Revoked latest warning for ${user.name}. Remaining: ${remaining}.`
                break

            // Legacy actions for backward compatibility
            case 'warn':
                user.warningCount = Math.min(10, user.warningCount + 1)
                if (user.warningCount >= 3 && user.restrictionLevel === 'NONE') {
                    user.status = 'limited'
                    user.restrictionLevel = 'LIMITED'
                    user.restrictionReason = 'Auto-restricted: reached 3 warnings.'
                    user.restrictedAt = new Date()
                }
                logAction = 'WARN_USER'
                details = `Warning count for ${user.name}: ${user.warningCount}`
                break

            case 'restrict':
                user.status = 'restricted'
                user.restrictionLevel = 'FULL'
                user.restrictionReason = reason || 'Restricted by admin.'
                user.restrictedAt = new Date()
                logAction = 'RESTRICT_USER'
                details = `User ${user.name} restricted.`
                break

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        await user.save()
        await AuditLog.create({
            adminId: decoded.id,
            adminName: decoded.name,
            action: logAction,
            targetType: 'User',
            targetId: user._id,
            details,
        })

        return NextResponse.json({ user: { ...user.toObject(), password: undefined } })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
