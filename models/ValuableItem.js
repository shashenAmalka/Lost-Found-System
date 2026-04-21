import mongoose from 'mongoose'

const ValuableItemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    category: { type: String, default: '', trim: true },
    uniqueIdentifier: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '' },
    qrCode: { type: String, required: true, unique: true, index: true },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerName: { type: String, default: '' },
    ownerEmail: { type: String, default: '' },
}, { timestamps: true })

ValuableItemSchema.index({ ownerId: 1, createdAt: -1 })

const ValuableItem = mongoose.models.ValuableItem || mongoose.model('ValuableItem', ValuableItemSchema)
export default ValuableItem