import mongoose from 'mongoose'

const UserWarningSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClaimRequest', default: null },
    reason: { type: String, required: true },
    shortAutoSummary: { type: String, default: '' },
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM',
    },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issuedByName: { type: String, default: '' },
    expiresAt: { type: Date, default: null },
    status: {
        type: String,
        enum: ['ACTIVE', 'EXPIRED', 'REVOKED'],
        default: 'ACTIVE',
    },
}, { timestamps: true })

UserWarningSchema.index({ userId: 1, status: 1, createdAt: -1 })

const UserWarning = mongoose.models.UserWarning || mongoose.model('UserWarning', UserWarningSchema)
export default UserWarning
