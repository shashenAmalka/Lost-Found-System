export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { analyzeItemImageWithGroq } from '@/lib/groqItemAI'

export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const imageUrl = body?.imageUrl
        const itemType = body?.itemType || 'item'

        if (!imageUrl) {
            return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
        }

        const ai = await analyzeItemImageWithGroq(imageUrl, { itemType })
        const { aiGeneratedDescription, fullScanDescription, ...publicAi } = ai
        return NextResponse.json({ ai: publicAi }, { status: 200 })
    } catch (err) {
        console.error('[Describe Image API]', err)
        return NextResponse.json({ error: err.message || 'Image analysis failed' }, { status: 500 })
    }
}
