export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import VerificationForm from '@/models/VerificationForm'
import ClaimRequest from '@/models/ClaimRequest'
import Notification from '@/models/Notification'
import { verifyToken } from '@/lib/auth'

// GET — List verification forms (admin: all, user: own)
export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const filter = decoded.role === 'admin' ? {} : { userId: decoded.id }
        const forms = await VerificationForm.find(filter)
            .populate('claimId', 'status aiMatchScore lostItemId foundItemId claimantName')
            .populate('foundItemId', 'title category locationFound photoUrl')
            .populate('userId', 'name email campusId')
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json({ forms })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// POST — Admin creates a verification form and sends to a claimant
export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await connectDB()
        const body = await request.json()
        const { claimId, questions } = body

        if (!claimId || !questions || !Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({ error: 'claimId and questions are required' }, { status: 400 })
        }

        const claim = await ClaimRequest.findById(claimId).lean()
        if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

        // Check if form already exists for this claim
        const existing = await VerificationForm.findOne({ claimId })
        if (existing) return NextResponse.json({ error: 'Verification form already sent for this claim' }, { status: 409 })

        // Get claimant history
        const [totalClaims, approvedClaims, rejectedClaims] = await Promise.all([
            ClaimRequest.countDocuments({ claimantId: claim.claimantId }),
            ClaimRequest.countDocuments({ claimantId: claim.claimantId, status: 'approved' }),
            ClaimRequest.countDocuments({ claimantId: claim.claimantId, status: 'rejected' }),
        ])

        const form = await VerificationForm.create({
            claimId,
            userId: claim.claimantId,
            foundItemId: claim.foundItemId,
            questions: questions.map(q => ({ question: typeof q === 'string' ? q : q.question })),
            userHistory: {
                totalClaims,
                approvedClaims,
                rejectedClaims,
                warningCount: 0,
                accountAge: '',
            },
        })

        // Notify the user
        await Notification.create({
            userId: claim.claimantId,
            type: 'action_required',
            title: 'Verification Required',
            message: `Admin has sent you a verification form to confirm your claim. Please fill it out as soon as possible.`,
            lostItemId: claim.lostItemId,
            foundItemId: claim.foundItemId,
        })

        return NextResponse.json({ form }, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// PATCH — User submits answers OR Admin reviews
export async function PATCH(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const body = await request.json()
        const { formId, answers, adminNotes, action } = body

        const form = await VerificationForm.findById(formId)
        if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

        // User submitting answers
        if (action === 'submit' && form.userId.toString() === decoded.id) {
            if (!answers || !Array.isArray(answers)) {
                return NextResponse.json({ error: 'Answers array is required' }, { status: 400 })
            }
            // Update answers
            answers.forEach((ans, i) => {
                if (form.questions[i]) {
                    form.questions[i].answer = ans
                }
            })
            form.status = 'submitted'
            form.submittedAt = new Date()
            await form.save()

            // Notify admin
            await Notification.create({
                userId: decoded.id, // Will be picked up by admin feed
                type: 'system_update',
                title: 'Verification Form Submitted',
                message: `User has submitted their verification form for review.`,
                foundItemId: form.foundItemId,
            })

            return NextResponse.json({ form })
        }

        // Admin reviewing
        if (action === 'review' && decoded.role === 'admin') {
            form.status = 'reviewed'
            form.adminNotes = adminNotes || ''
            form.reviewedAt = new Date()
            await form.save()
            return NextResponse.json({ form })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// DELETE — Admin deletes a verification form
export async function DELETE(request) {
    try {
        const token = request.cookies.get('auth_token')?.value
        const decoded = token ? verifyToken(token) : null
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await connectDB()
        const { searchParams } = new URL(request.url)
        const formId = searchParams.get('id')
        if (!formId) return NextResponse.json({ error: 'Form ID required' }, { status: 400 })

        await VerificationForm.findByIdAndDelete(formId)
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
