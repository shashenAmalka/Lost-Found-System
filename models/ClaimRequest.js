import mongoose from 'mongoose'

const TrackingEventSchema = new mongoose.Schema({
    status: String,
    note: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'system' },
})

const ClaimRequestSchema = new mongoose.Schema({
    // References
    lostItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem', default: null },
    foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
    claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimantName: { type: String, default: '' },
    claimantEmail: { type: String, default: '' },

    // Ownership proof
    ownershipExplanation: { type: String, required: true },
    hiddenDetails: { type: String, default: '' }, // identifying marks not in public description
    exactColorBrand: { type: String, default: '' },
    dateLost: { type: Date },
    timeLost: { type: String, default: '' },
    locationLost: { type: String, default: '' },
    proofUrl: { type: String, default: '' }, // optional upload
    pickupPreference: { type: String, default: 'Campus Lost & Found Office' },

    // Claim lifecycle status
    status: {
        type: String,
        enum: ['under_review', 'ai_matched', 'admin_review', 'approved', 'rejected', 'withdrawn', 'pickup_scheduled', 'completed'],
        default: 'under_review',
    },

    // AI Matching
    aiMatchScore: { type: Number, default: 0, min: 0, max: 100 },
    aiRiskScore: { type: Number, default: 0, min: 0, max: 100 },
    aiMatchLevel: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW', 'UNLIKELY', 'PENDING'], default: 'PENDING' },
    aiSuggestedDecision: {
        type: String,
        enum: ['approve', 'review', 'reject', 'pending'],
        default: 'pending',
    },
    aiMatchReasons: [{ type: String }],
    aiRedFlags: [{ type: String }],
    aiBreakdown: {
        descriptionScore: { type: Number, default: 0 },
        keywordScore: { type: Number, default: 0 },
        locationScore: { type: Number, default: 0 },
        dateScore: { type: Number, default: 0 },
        categoryScore: { type: Number, default: 0 },
    },

    // Claim type: direct = browsed found items directly, matched = came via AI match notification
    claimType: { type: String, enum: ['direct', 'matched'], default: 'direct' },

    // Admin actions
    adminNote: { type: String, default: '' },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },

    // Tracking timeline
    trackingHistory: [TrackingEventSchema],

    // Pickup info
    pickupScheduledAt: { type: Date },
    completedAt: { type: Date },
}, { timestamps: true })

// Delete cached model in dev to pick up schema changes on hot-reload
if (mongoose.models.ClaimRequest) {
    delete mongoose.models.ClaimRequest
}
const ClaimRequest = mongoose.model('ClaimRequest', ClaimRequestSchema)
export default ClaimRequest
