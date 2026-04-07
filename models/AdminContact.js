import mongoose from 'mongoose'

const AdminContactSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        userName: { type: String, required: true, trim: true },
        userEmail: { type: String, required: true, trim: true, lowercase: true },
        subject: { type: String, required: true, trim: true },
        initialMessage: { type: String, required: true, trim: true },
        claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClaimRequest', default: null },
        status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open', index: true },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
        lastMessageAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
)

AdminContactSchema.index({ userId: 1, createdAt: -1 })
AdminContactSchema.index({ status: 1, lastMessageAt: -1 })

const AdminContact = mongoose.models.AdminContact || mongoose.model('AdminContact', AdminContactSchema)

export default AdminContact
