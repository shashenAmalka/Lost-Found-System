export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { verifyToken } from '@/lib/auth'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const decoded = verifyToken(token)
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const body = await request.json()
        const { imageFile } = body // Expected to be a base64 string
        if (!imageFile) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

        // Upload to cloudinary
        const result = await cloudinary.uploader.upload(imageFile, {
            folder: 'lost_found_system',
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' }
            ]
        })

        return NextResponse.json({ url: result.secure_url }, { status: 200 })
    } catch (err) {
        console.error('[Cloudinary Upload Error]', err)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
