import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    campusId: { type: String, required: true, unique: true },
    department: { type: String, default: '' },
    studentId: { type: String, default: '' },
    phone: { type: String, default: '' },
    role: {
        type: String,
        enum: ['student', 'staff', 'admin'],
        default: 'student',
    },
    status: {
        type: String,
        enum: ['active', 'limited', 'restricted'],
        default: 'active',
    },
    restrictionLevel: {
        type: String,
        enum: ['NONE', 'LIMITED', 'FULL'],
        default: 'NONE',
    },
    restrictionReason: { type: String, default: '' },
    restrictedAt: { type: Date, default: null },
    warningCount: { type: Number, default: 0, min: 0 },
    trustedFinderBadge: { type: Boolean, default: false },
    trustedFinderCount: { type: Number, default: 0 },
    avatar: { type: String, default: '' },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
export default User
