export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import AuditLog from '@/models/AuditLog'
import { verifyToken } from '@/lib/auth'

export async function DELETE(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { password, reason } = await request.json()
        if (!password || !String(password).trim()) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 })
        }

        await connectDB()

        const user = await User.findById(decoded.id)
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
        if (user.isDeleted) return NextResponse.json({ error: 'Account already deleted' }, { status: 409 })

        const matched = await bcrypt.compare(password, user.password)
        if (!matched) return NextResponse.json({ error: 'Invalid password' }, { status: 401 })

        user.isDeleted = true
        user.deletedAt = new Date()
        user.deleteReason = reason?.trim() || ''
        user.status = 'restricted'
        user.restrictionLevel = 'FULL'
        user.restrictionReason = 'Account deleted by user'
        user.restrictedAt = new Date()
        await user.save()

        await AuditLog.create({
            adminName: user.name || 'User',
            action: 'SELF_DELETE_ACCOUNT',
            targetType: 'User',
            targetId: user._id,
            details: `User self-deleted account. Reason: ${user.deleteReason || 'N/A'}`,
        })

        const response = NextResponse.json({ message: 'Account deleted successfully' })
        response.cookies.set('auth_token', '', { maxAge: 0, path: '/' })
        return response
    } catch (err) {
        console.error('[Delete Account]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
