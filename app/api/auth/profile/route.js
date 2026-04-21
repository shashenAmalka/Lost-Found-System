export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

/**
 * Validate phone format (10 digits)
 */
function validatePhone(phone) {
    if (!phone) return true; // Optional field
    return /^\d{10}$/.test(phone.replace(/\D/g, ''));
}

/**
 * Validate email format
 */
function validateEmail(email) {
    if (!email || !email.trim()) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate name
 */
function validateName(name) {
    if (!name || !name.trim()) return false;
    return name.trim().length >= 2;
}

export async function PUT(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const decoded = verifyToken(token)
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const body = await request.json()
        const { name, email, phone } = body

        // Validation
        if (!validateName(name)) {
            return NextResponse.json({ error: 'Full name is required and must be at least 2 characters' }, { status: 400 })
        }

        if (!validateEmail(email)) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
        }

        if (phone && !validatePhone(phone)) {
            return NextResponse.json({ error: 'Phone number must be exactly 10 digits' }, { status: 400 })
        }

        await connectDB()

        const currentUser = await User.findById(decoded.id).select('isDeleted')
        if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })
        if (currentUser.isDeleted) {
            return NextResponse.json({ error: 'Account is deleted' }, { status: 403 })
        }

        // Check email uniqueness if changed
        const existingEmail = await User.findOne({ email: email.trim(), _id: { $ne: decoded.id } })
        if (existingEmail) return NextResponse.json({ error: 'Email is already in use' }, { status: 409 })

        // Update only allowed fields - faculty and studentId are read-only
        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            {
                name: name.trim(),
                email: email.trim(),
                phone: phone ? phone.replace(/\D/g, '') : '',
                // faculty and studentId are intentionally NOT updated - they are read-only after registration
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
                studentId: updatedUser.studentId,
                status: updatedUser.status,
                warningCount: updatedUser.warningCount,
                faculty: updatedUser.faculty,
                department: updatedUser.department,
                phone: updatedUser.phone,
                trustedFinderBadge: updatedUser.trustedFinderBadge,
            }
        })
    } catch (err) {
        console.error('Profile update error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
