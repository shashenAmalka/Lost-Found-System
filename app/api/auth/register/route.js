export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { signToken } from '@/lib/auth'

export async function POST(request) {
    try {
        await connectDB()
        const body = await request.json()
        const { name, email, campusId, password, department, studentId, phone } = body

        if (!name || !email || !campusId || !password) {
            return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 })
        }

        const existing = await User.findOne({ $or: [{ email }, { campusId }] })
        if (existing) {
            return NextResponse.json({ error: 'Email or Campus ID already registered' }, { status: 409 })
        }

        const hashed = await bcrypt.hash(password, 12)
        const user = await User.create({
            name, email, campusId, password: hashed,
            department: department || '',
            studentId: studentId || '',
            phone: phone || '',
            role: 'student',
        })

        const token = signToken({ id: user._id.toString(), role: user.role, campusId: user.campusId, name: user.name })
        const response = NextResponse.json({
            message: 'Account created successfully',
            user: { id: user._id, name: user.name, email: user.email, role: user.role, campusId: user.campusId }
        }, { status: 201 })
        response.cookies.set('auth_token', token, {
            httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/'
        })
        return response
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
