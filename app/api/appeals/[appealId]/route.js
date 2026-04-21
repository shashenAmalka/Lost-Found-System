export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserAppeal from '@/models/UserAppeal'
import { verifyToken } from '@/lib/auth'

async function getAuthUser(request) {
    const token = request.cookies.get('auth_token')?.value
    const decoded = token ? verifyToken(token) : null
    if (!decoded) return null
    return decoded
}

async function getOwnedAppeal(request, appealId) {
    const decoded = await getAuthUser(request)
    if (!decoded) {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }

    await connectDB()

    const appeal = await UserAppeal.findById(appealId)
    if (!appeal) {
        return { error: NextResponse.json({ error: 'Appeal not found' }, { status: 404 }) }
    }

    if (String(appeal.userId) !== String(decoded.id)) {
        return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    }

    return { decoded, appeal }
}

export async function GET(request, { params }) {
    try {
        const result = await getOwnedAppeal(request, params.appealId)
        if (result.error) return result.error

        return NextResponse.json({ appeal: result.appeal })
    } catch (err) {
        console.error('[Appeals GET by ID]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function PATCH(request, { params }) {
    try {
        const result = await getOwnedAppeal(request, params.appealId)
        if (result.error) return result.error

        const { appeal } = result

        if (appeal.status !== 'PENDING' || appeal.openedAt) {
            return NextResponse.json({ error: 'This appeal is locked and can no longer be edited.' }, { status: 409 })
        }

        const { appealMessage, supportingExplanation, evidenceUrl, acknowledgedPolicy } = await request.json()

        if (!appealMessage || !appealMessage.trim()) {
            return NextResponse.json({ error: 'Appeal message is required' }, { status: 400 })
        }

        appeal.appealMessage = appealMessage.trim()
        appeal.supportingExplanation = supportingExplanation?.trim() || ''
        appeal.evidenceUrl = evidenceUrl || ''
        appeal.acknowledgedPolicy = !!acknowledgedPolicy

        await appeal.save()

        return NextResponse.json({ appeal })
    } catch (err) {
        console.error('[Appeals PATCH by ID]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const result = await getOwnedAppeal(request, params.appealId)
        if (result.error) return result.error

        const { appeal } = result

        if (appeal.status !== 'PENDING' || appeal.openedAt) {
            return NextResponse.json({ error: 'This appeal is locked and can no longer be deleted.' }, { status: 409 })
        }

        await UserAppeal.deleteOne({ _id: appeal._id })
        return NextResponse.json({ message: 'Appeal deleted' })
    } catch (err) {
        console.error('[Appeals DELETE by ID]', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}