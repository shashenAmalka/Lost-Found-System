import mongoose from 'mongoose'

const VerificationQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, default: '' },
})

const VerificationFormSchema = new mongoose.Schema({
    // References
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClaimRequest', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },

    // Questions set by admin
    questions: [VerificationQuestionSchema],

    // Auto-populated user history snapshot
    userHistory: {
        totalClaims: { type: Number, default: 0 },
        approvedClaims: { type: Number, default: 0 },
        rejectedClaims: { type: Number, default: 0 },
        warningCount: { type: Number, default: 0 },
        accountAge: { type: String, default: '' },
    },

    // Lifecycle
    status: {
        type: String,
        enum: ['pending', 'submitted', 'reviewed'],
        default: 'pending',
    },
    adminNotes: { type: String, default: '' },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
}, { timestamps: true })

const VerificationForm = mongoose.models.VerificationForm || mongoose.model('VerificationForm', VerificationFormSchema)
export default VerificationForm
