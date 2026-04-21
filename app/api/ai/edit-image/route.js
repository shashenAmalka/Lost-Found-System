export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const EDIT_TRANSFORMATION = 'e_background_removal,c_pad,ar_1:1,w_1200,h_1200,b_white'

function buildEditedCloudinaryUrl(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string') return ''
    if (!imageUrl.includes('/upload/')) return ''
    return imageUrl.replace('/upload/', `/upload/${EDIT_TRANSFORMATION}/`)
}

export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const decoded = verifyToken(token)
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const body = await request.json()
        const { imageUrl } = body || {}

        if (!imageUrl) {
            return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
        }

        const editedImageUrl = buildEditedCloudinaryUrl(String(imageUrl))
        if (!editedImageUrl) {
            return NextResponse.json({ error: 'Only Cloudinary upload URLs are supported' }, { status: 400 })
        }

        return NextResponse.json({ editedImageUrl })
    } catch (err) {
        console.error('[AI Edit Image Error]', err)
        return NextResponse.json({ error: 'Failed to edit image' }, { status: 500 })
    }
}