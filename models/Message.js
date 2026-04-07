import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
    // A message can belong to either a claim chat or an admin contact chat.
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClaimRequest', default: null, index: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminContact', default: null, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['user', 'admin'], required: true },
    senderName: { type: String, default: '' },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    message: { type: String, required: true },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
}, { timestamps: true })

MessageSchema.index({ claimId: 1, createdAt: -1 })
MessageSchema.index({ contactId: 1, createdAt: -1 })
MessageSchema.index({ recipientId: 1, read: 1, createdAt: -1 })
MessageSchema.index({ senderId: 1, createdAt: -1 })

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema)
export default Message
