export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'
import { isDbConnectionError } from '@/lib/mongodb'

export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const decoded = verifyToken(token)
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        await connectDB()
        const user = await User.findById(decoded.id).select('-password')
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        if (user.isDeleted) {
            const response = NextResponse.json({ error: 'Account deleted' }, { status: 403 })
            response.cookies.set('auth_token', '', { maxAge: 0, path: '/' })
            return response
        }

        return NextResponse.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                campusId: user.campusId,
                status: user.status,
                warningCount: user.warningCount,
                restrictionLevel: user.restrictionLevel || 'NONE',
                restrictionReason: user.restrictionReason || '',
                restrictedAt: user.restrictedAt || null,
                department: user.department,
                studentId: user.studentId,
                phone: user.phone,
                trustedFinderBadge: user.trustedFinderBadge,
            }
        })
    } catch (err) {
        if (isDbConnectionError(err)) {
            return NextResponse.json({
                error: 'Database connection unavailable. Check network/DNS or MongoDB access settings.'
            }, { status: 503 })
        }

        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
