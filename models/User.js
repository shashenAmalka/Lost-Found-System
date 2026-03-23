import mongoose from 'mongoose'

const FACULTIES = [
    'COMPUTING',
    'ENGINEERING',
    'SLIIT BUSINESS SCHOOL',
    'HUMANITIES & SCIENCES',
    'GRADUATE STUDIES',
    'SCHOOL OF ARCHITECTURE',
    'SCHOOL OF LAW',
    'SCHOOL OF HOSPITALITY & CULINARY',
    'FOUNDATION PROGRAMME'
];

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    campusId: { type: String, required: true, unique: true },
    faculty: {
        type: String,
        enum: FACULTIES,
        required: false,
        default: ''
    },
    // Keep department for backward compatibility
    department: { type: String, default: '' },
    studentId: {
        type: String,
        match: /^[A-Za-z]{2}\d{8}$/,
        default: ''
    },
    phone: {
        type: String,
        match: /^\d{10}$/,
        default: ''
    },
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
