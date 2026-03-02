export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserWarning from '@/models/UserWarning'
import User from '@/models/User'
import AuditLog from '@/models/AuditLog'
import { verifyToken } from '@/lib/auth'

// Auto-summary generator based on warning type
const AUTO_SUMMARIES = {
    'Fake claim attempt': 'Submitted a claim with fabricated or inconsistent ownership details.',
    'Mismatched serial number': 'Provided serial number does not match the item records.',
    'Spam submissions': 'Multiple low-quality or duplicate submissions detected.',
    'Inappropriate content': 'Posted content that violates platform community guidelines.',
    'Suspicious activity': 'Account flagged for unusual or suspicious behavior patterns.',
    'False information': 'Intentionally provided misleading information in reports.',
}

// GET — list warnings for a user (admin only)
export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await connectDB()
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const warnings = await UserWarning.find({ userId }).sort({ createdAt: -1 }).lean()
        return NextResponse.json({ warnings })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// POST — issue a new warning (admin only)
export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await connectDB()
        const { userId, reason, severity, claimId, adminNotes, expiresAt } = await request.json()

        if (!userId || !reason) {
            return NextResponse.json({ error: 'userId and reason are required' }, { status: 400 })
        }

        const user = await User.findById(userId)
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        // Auto-generate summary
        const shortAutoSummary = AUTO_SUMMARIES[reason] || adminNotes || reason

        const warning = await UserWarning.create({
            userId,
            claimId: claimId || null,
            reason,
            shortAutoSummary,
            severity: severity || 'MEDIUM',
            issuedBy: decoded.id,
            issuedByName: decoded.name || 'Admin',
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            status: 'ACTIVE',
        })

        // Update user warning count
        const activeWarnings = await UserWarning.countDocuments({ userId, status: 'ACTIVE' })
        user.warningCount = activeWarnings

        // Auto-restrict at 3+ active warnings → LIMITED
        if (activeWarnings >= 3 && user.restrictionLevel === 'NONE') {
            user.status = 'limited'
            user.restrictionLevel = 'LIMITED'
            user.restrictionReason = `Auto-restricted: ${activeWarnings} active warnings. Latest: ${reason}`
            user.restrictedAt = new Date()
        }

        await user.save()

        // Audit log
        await AuditLog.create({
            adminName: decoded.name || 'Admin',
            action: 'ISSUE_WARNING',
            targetType: 'User',
            targetId: user._id,
            details: `Warning issued to ${user.name}: "${reason}" (Severity: ${severity || 'MEDIUM'}). Active warnings: ${activeWarnings}.`,
        })

        return NextResponse.json({ warning, activeWarnings }, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// PATCH — update warning (revoke, change severity)
export async function PATCH(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await connectDB()
        const { warningId, action, severity } = await request.json()

        const warning = await UserWarning.findById(warningId)
        if (!warning) return NextResponse.json({ error: 'Warning not found' }, { status: 404 })

        if (action === 'revoke') {
            warning.status = 'REVOKED'
        } else if (action === 'update_severity' && severity) {
            warning.severity = severity
        }

        await warning.save()

        // Recalculate user warning count
        const activeWarnings = await UserWarning.countDocuments({ userId: warning.userId, status: 'ACTIVE' })
        const user = await User.findById(warning.userId)
        if (user) {
            user.warningCount = activeWarnings
            // If warnings drop below 3 and user is LIMITED (not FULL), consider auto-unrestricting
            if (activeWarnings < 3 && user.restrictionLevel === 'LIMITED') {
                user.status = 'active'
                user.restrictionLevel = 'NONE'
                user.restrictionReason = ''
                user.restrictedAt = null
            }
            await user.save()
        }

        await AuditLog.create({
            adminName: decoded.name || 'Admin',
            action: action === 'revoke' ? 'REVOKE_WARNING' : 'UPDATE_WARNING',
            targetType: 'User',
            targetId: warning.userId,
            details: `Warning ${action === 'revoke' ? 'revoked' : 'updated'} for user. Active warnings: ${activeWarnings}.`,
        })

        return NextResponse.json({ warning, activeWarnings })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
