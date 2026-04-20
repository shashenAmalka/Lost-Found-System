export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { analyseItemWithGroq } from '@/lib/analyseItemWithGroq'

export async function POST(request) {
	try {
		const formData = await request.formData()
		const imageFile = formData.get('image')

		if (!imageFile || imageFile.size === 0) {
			return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 })
		}

		const buffer = Buffer.from(await imageFile.arrayBuffer())
		const mimeType = imageFile.type || 'image/jpeg'
		const result = await analyseItemWithGroq(buffer, mimeType)

		return NextResponse.json({ success: true, result }, { status: 200 })
	} catch (err) {
		console.error('[Analyse Item API]', err)
		return NextResponse.json({ success: false, error: err.message || 'Image analysis failed' }, { status: 500 })
	}
}
