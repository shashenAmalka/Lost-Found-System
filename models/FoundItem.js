import mongoose from 'mongoose'

const FoundItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Books', 'Clothing', 'Keys', 'ID Card', 'Bag', 'Jewelry', 'Sports', 'Other'],
    },
    description: { type: String, required: true },
    keywords: [{ type: String }],
    color: { type: String, default: '' },
    brand: { type: String, default: '' },
    condition: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor'],
        default: 'Good',
    },
    dateFound: { type: Date, required: true },
    locationFound: { type: String, required: true },
    photoUrl: { type: String, default: '' },
    aiGeneratedDescription: { type: String, default: '' },
    aiLabels: [{ type: String }],
    aiCategory: { type: String, default: '' },
    aiColor: { type: String, default: '' },
    aiConfidence: { type: Number, default: 0 },
    aiProfile: { type: mongoose.Schema.Types.Mixed, default: {} },
    aiSource: { type: String, default: '' },
    smartMode: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['unclaimed', 'under_review', 'claimed', 'archived'],
        default: 'unclaimed',
    },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submittedByName: { type: String, default: '' },
    submittedByEmail: { type: String, default: '' },
    views: { type: Number, default: 0 },
}, { timestamps: true })

FoundItemSchema.index({ title: 'text', description: 'text', keywords: 'text', locationFound: 'text' })

const FoundItem = mongoose.models.FoundItem || mongoose.model('FoundItem', FoundItemSchema)
export default FoundItem
