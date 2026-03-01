export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export async function PUT(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const decoded = verifyToken(token)
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const body = await request.json()
        const { name, email, department, studentId, phone } = body

        // Validation
        if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

        await connectDB()

        // Check email uniqueness if changed
        const existingEmail = await User.findOne({ email: email.trim(), _id: { $ne: decoded.id } })
        if (existingEmail) return NextResponse.json({ error: 'Email is already in use' }, { status: 409 })

        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            {
                name: name.trim(),
                email: email.trim(),
                department: department?.trim() || '',
                studentId: studentId?.trim() || '',
                phone: phone?.trim() || '',
            },
            { new: true, runValidators: true }
        ).select('-password')

        if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                campusId: updatedUser.campusId,
                status: updatedUser.status,
                warningCount: updatedUser.warningCount,
                department: updatedUser.department,
                studentId: updatedUser.studentId,
                phone: updatedUser.phone,
                trustedFinderBadge: updatedUser.trustedFinderBadge,
            }
        })
    } catch (err) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
