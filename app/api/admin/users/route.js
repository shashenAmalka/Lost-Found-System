export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import AuditLog from '@/models/AuditLog'
import { verifyToken } from '@/lib/auth'

export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        await connectDB()
        const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean()
        return NextResponse.json({ users })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function PATCH(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        await connectDB()
        const { userId, action } = await request.json()
        const user = await User.findById(userId)
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        let logAction = ''
        if (action === 'warn') {
            user.warningCount = Math.min(3, user.warningCount + 1)
            if (user.warningCount >= 3) user.status = 'restricted'
            logAction = 'WARN_USER'
        } else if (action === 'restrict') {
            user.status = 'restricted'
            logAction = 'RESTRICT_USER'
        } else if (action === 'unrestrict') {
            user.status = 'active'
            user.warningCount = 0
            logAction = 'UNRESTRICT_USER'
        }

        await user.save()
        await AuditLog.create({ adminId: decoded.id, adminName: decoded.name, action: logAction, targetType: 'User', targetId: user._id })
        return NextResponse.json({ user: { ...user.toObject(), password: undefined } })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
