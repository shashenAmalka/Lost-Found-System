export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { signToken } from '@/lib/auth'

const FACULTIES = [
    'COMPUTING',
    'ENGINEERING',
    'SLIIT BUSINESS SCHOOL',
    'HUMANITIES & SCIENCES',
    'GRADUATE STUDIES',
    'SCHOOL OF ARCHITECTURE',
    'SCHOOL OF LAW',
    'SCHOOL OF HOSPITALITY & CULINARY',
    'FOUNDATION PROGRAMME'
];

/**
 * Validate student ID format (2 English characters + 8 numbers)
 */
function validateStudentId(id) {
    if (!id || !id.trim()) return false;
    return /^[A-Za-z]{2}\d{8}$/.test(id.trim());
}

/**
 * Validate phone format (10 digits)
 */
function validatePhone(phone) {
    if (!phone) return true; // Optional field
    return /^\d{10}$/.test(phone.replace(/\D/g, ''));
}

/**
 * Validate password strength (minimum 8 characters)
 */
function validatePassword(password) {
    if (!password) return false;
    return password.length >= 8;
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

/**
 * Validate faculty selection
 */
function validateFaculty(faculty) {
    if (!faculty || !faculty.trim()) return false;
    return FACULTIES.includes(faculty.trim());
}

export async function POST(request) {
    try {
        await connectDB()
        const body = await request.json()
        const { name, email, studentId, password, faculty, phone } = body

        // Comprehensive validation
        if (!name || !validateName(name)) {
            return NextResponse.json({ error: 'Full name is required and must be at least 2 characters' }, { status: 400 })
        }

        if (!email || !validateEmail(email)) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
        }

        if (!studentId || !validateStudentId(studentId)) {
            return NextResponse.json({ error: 'Student ID must be 2 English letters followed by 8 numbers (e.g., IT23844292)' }, { status: 400 })
        }

        if (!password || !validatePassword(password)) {
            return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
        }

        if (!faculty || !validateFaculty(faculty)) {
            return NextResponse.json({ error: 'Please select a valid faculty' }, { status: 400 })
        }

        if (phone && !validatePhone(phone)) {
            return NextResponse.json({ error: 'Phone number must be exactly 10 digits' }, { status: 400 })
        }

        // Check for existing user
        const existing = await User.findOne({ $or: [{ email: email.trim() }, { campusId: studentId.trim() }] })
        if (existing) {
            if (existing.email === email.trim()) {
                return NextResponse.json({ error: 'Email is already registered' }, { status: 409 })
            }
            return NextResponse.json({ error: 'Student ID is already registered' }, { status: 409 })
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 12)

        // Create user with validated data
        // Map studentId to campusId in the database
        const user = await User.create({
            name: name.trim(),
            email: email.trim(),
            campusId: studentId.trim(),
            studentId: studentId.trim(),
            password: hashed,
            faculty: faculty.trim(),
            department: faculty.trim(), // Keep for backward compatibility
            phone: phone ? phone.replace(/\D/g, '') : '',
            role: 'student',
        })

        // Sign token
        const token = signToken({ id: user._id.toString(), role: user.role, campusId: user.campusId, name: user.name })
        
        const response = NextResponse.json({
            message: 'Account created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                campusId: user.campusId,
                faculty: user.faculty,
                phone: user.phone
            }
        }, { status: 201 })

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/'
        })

        return response
    } catch (err) {
        console.error('Registration error:', err)
        return NextResponse.json({ error: 'Server error during registration' }, { status: 500 })
    }
}

