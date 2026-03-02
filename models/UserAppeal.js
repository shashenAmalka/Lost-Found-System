import mongoose from 'mongoose'

const UserAppealSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    appealMessage: { type: String, required: true },
    supportingExplanation: { type: String, default: '' },
    evidenceUrl: { type: String, default: '' },
    acknowledgedPolicy: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedByName: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
    adminResponse: { type: String, default: '' },
}, { timestamps: true })

UserAppealSchema.index({ userId: 1, status: 1, createdAt: -1 })

const UserAppeal = mongoose.models.UserAppeal || mongoose.model('UserAppeal', UserAppealSchema)
export default UserAppeal
