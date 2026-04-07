import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
        type: String,
        enum: ['ai_match', 'claim_update', 'system', 'warning', 'restriction', 'appeal_approved', 'appeal_rejected', 'unrestricted', 'claim_approved', 'claim_rejected', 'claim_info_requested', 'system_update', 'important_alert', 'action_required', 'chat_message'],
        default: 'ai_match',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    lostItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem' },
    foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem' },
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClaimRequest' },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    matchScore: { type: Number, default: 0 },
    read: { type: Boolean, default: false },
    dismissed: { type: Boolean, default: false },
}, { timestamps: true })

// Compound index for efficient querying
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 })

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)
export default Notification
