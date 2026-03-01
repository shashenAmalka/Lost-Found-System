export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// GET /api/seed - seeds the admin account (run once)
export async function GET() {
    try {
        await connectDB()
        const hashed = await bcrypt.hash('A123456b', 12)
        await User.findOneAndUpdate(
            { campusId: 'admin' },
            {
                name: 'System Administrator',
                email: 'admin@campus.edu',
                campusId: 'admin',
                password: hashed,
                role: 'admin',
                department: 'IT Administration',
                status: 'active',
            },
            { upsert: true, new: true }
        )
        return NextResponse.json({ message: 'Admin ready! Login with campusId: admin, password: A123456b' })
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
