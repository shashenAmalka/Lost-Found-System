import mongoose from 'mongoose'

const LostItemSchema = new mongoose.Schema({
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
    uniqueIdentifier: { type: String, default: '' },
    dateLost: { type: Date, required: true },
    timeRange: { type: String, default: '' }, // e.g. "Morning (8AM-12PM)"
    possibleLocation: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    aiGeneratedDescription: { type: String, default: '' },
    aiLabels: [{ type: String }],
    aiCategory: { type: String, default: '' },
    aiColor: { type: String, default: '' },
    aiConfidence: { type: Number, default: 0 },
    aiProfile: { type: mongoose.Schema.Types.Mixed, default: {} },
    aiSource: { type: String, default: '' },
    smartMode: { type: Boolean, default: false },
    contactPreference: {
        type: String,
        enum: ['email', 'phone', 'platform'],
        default: 'platform',
    },
    status: {
        type: String,
        enum: ['pending', 'matched', 'resolved', 'archived'],
        default: 'pending',
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postedByName: { type: String, default: '' },
    postedByEmail: { type: String, default: '' },
    views: { type: Number, default: 0 },
    // Flexible category-specific fields (e.g. serialNumber for Electronics, ISBN for Books)
    categoryFields: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true })

// Text index for search
LostItemSchema.index({ title: 'text', description: 'text', keywords: 'text', possibleLocation: 'text' })

const LostItem = mongoose.models.LostItem || mongoose.model('LostItem', LostItemSchema)
export default LostItem
