export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { signToken } from '@/lib/auth'
import { isDbConnectionError } from '@/lib/mongodb'

export async function POST(request) {
    try {
        await connectDB()
        const { campusId, password } = await request.json()

        if (!campusId || !password) {
            return NextResponse.json({ error: 'Campus ID and password are required' }, { status: 400 })
        }

        const user = await User.findOne({ campusId })
        if (!user) {
            return NextResponse.json({ error: 'Invalid Campus ID or password' }, { status: 401 })
        }

        if (user.isDeleted) {
            return NextResponse.json({
                error: 'This account was deleted. Please contact admin if this is a mistake.',
            }, { status: 403 })
        }

        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return NextResponse.json({ error: 'Invalid Campus ID or password' }, { status: 401 })
        }

        // Tiered restriction check
        const level = user.restrictionLevel || 'NONE'

        if (level === 'FULL' || (user.status === 'restricted' && level !== 'LIMITED')) {
            return NextResponse.json({
                error: 'Your account has been fully restricted. You cannot log in. Please contact the admin.',
                restricted: true,
                restrictionLevel: 'FULL',
            }, { status: 403 })
        }

        const token = signToken({
            id: user._id.toString(),
            role: user.role,
            campusId: user.campusId,
            name: user.name,
            email: user.email,
        })

        const response = NextResponse.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                campusId: user.campusId,
                status: user.status,
                warningCount: user.warningCount,
                restrictionLevel: level,
                restrictionReason: user.restrictionReason || '',
                trustedFinderBadge: user.trustedFinderBadge,
            }
        })

        response.cookies.set('auth_token', token, {
            httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/'
        })
        return response
    } catch (err) {
        console.error(err)
        if (isDbConnectionError(err)) {
            return NextResponse.json({
                error: 'Database connection unavailable. Check network/DNS or MongoDB access settings.'
            }, { status: 503 })
        }

        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
