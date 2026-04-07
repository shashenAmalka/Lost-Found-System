'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle, User, Mail, Hash, BookOpen, Phone, Lock, ArrowLeft } from 'lucide-react'
import { validateStudentId, validatePhone, validatePassword, validateEmail, validateName, validateFaculty, getFaculties, formatPhoneNumber, stripPhoneNumber } from '@/lib/validations'

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({ name: '', email: '', studentId: '', password: '', faculty: '', phone: '' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [passwordStrength, setPasswordStrength] = useState(null)
    const [focusedField, setFocusedField] = useState(null)

    const change = (k) => (e) => {
        const value = e.target.value
        setForm(f => ({ ...f, [k]: value }))
        
        if (fieldErrors[k]) {
            setFieldErrors(err => {
                const newErrors = { ...err }
                delete newErrors[k]
                return newErrors
            })
        }

        if (k === 'studentId') {
            const validation = validateStudentId(value)
            if (!validation.valid && value) setFieldErrors(err => ({ ...err, studentId: validation.error }))
        } else if (k === 'phone') {
            const validation = validatePhone(value)
            if (!validation.valid && value) setFieldErrors(err => ({ ...err, phone: validation.error }))
        } else if (k === 'password') {
            const validation = validatePassword(value)
            setPasswordStrength(validation.strength || null)
            if (!validation.valid && value) setFieldErrors(err => ({ ...err, password: validation.error }))
        } else if (k === 'email') {
            const validation = validateEmail(value)
            if (!validation.valid && value) setFieldErrors(err => ({ ...err, email: validation.error }))
        } else if (k === 'name') {
            const validation = validateName(value)
            if (!validation.valid && value) setFieldErrors(err => ({ ...err, name: validation.error }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        
        const errors = {}
        const nameValidation = validateName(form.name)
        if (!nameValidation.valid) errors.name = nameValidation.error
        const emailValidation = validateEmail(form.email)
        if (!emailValidation.valid) errors.email = emailValidation.error
        const studentIdValidation = validateStudentId(form.studentId)
        if (!studentIdValidation.valid) errors.studentId = studentIdValidation.error
        const facultyValidation = validateFaculty(form.faculty)
        if (!facultyValidation.valid) errors.faculty = facultyValidation.error
        const passwordValidation = validatePassword(form.password)
        if (!passwordValidation.valid) errors.password = passwordValidation.error
        if (form.phone) {
            const phoneValidation = validatePhone(form.phone)
            if (!phoneValidation.valid) errors.phone = phoneValidation.error
        }
        
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            setError('Please fix the errors below')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    studentId: form.studentId.trim(),
                    password: form.password,
                    faculty: form.faculty.trim(),
                    phone: stripPhoneNumber(form.phone)
                }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Registration failed')
            router.push('/user-dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const faculties = getFaculties()

    // Shared input style builder
    const getInputStyle = (fieldName, hasError) => ({
        background: hasError ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)',
        border: hasError
            ? '1.5px solid rgba(239,68,68,0.4)'
            : focusedField === fieldName
                ? '1.5px solid rgba(240,165,0,0.5)'
                : '1px solid rgba(255,255,255,0.1)',
        boxShadow: focusedField === fieldName ? '0 0 20px rgba(240,165,0,0.08)' : 'none',
    })

    const getIconColor = (fieldName) =>
        focusedField === fieldName ? '#F0A500' : 'rgba(255,255,255,0.3)'

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 font-sans relative overflow-hidden">
            {/* Background Image with Blur */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/sliit image.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: 'blur(2px) brightness(0.5)' }}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4))' }} />
            </div>

            {/* Decorative orbs */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #F0A500, transparent)' }} />
                <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #008489, transparent)' }} />
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-5"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        }}>
                        🎓
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h1>
                    <p className="text-white/50 font-medium text-sm mt-2">Join Smart Campus Lost & Found</p>
                </div>

                {/* Glassmorphism Card */}
                <div style={{
                    borderRadius: '1.5rem',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                    padding: '2rem',
                }}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="text-[10px] font-extrabold text-white/40 tracking-[0.15em] uppercase mb-2 block">
                                Full Name <span className="text-[#F0A500]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300"
                                    style={{ color: getIconColor('name') }}>
                                    <User size={16} />
                                </div>
                                <input
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold text-white placeholder-white/25 focus:outline-none transition-all duration-300"
                                    style={getInputStyle('name', fieldErrors.name)}
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={change('name')}
                                    onFocus={() => setFocusedField('name')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </div>
                            {fieldErrors.name && <p className="text-[#fca5a5] text-xs mt-1.5 font-semibold">{fieldErrors.name}</p>}
                        </div>

                        {/* Student ID & Email — 2-column grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-extrabold text-white/40 tracking-[0.15em] uppercase mb-2 block">
                                    Student ID <span className="text-[#F0A500]">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300"
                                        style={{ color: getIconColor('studentId') }}>
                                        <Hash size={16} />
                                    </div>
                                    <input
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold text-white placeholder-white/25 focus:outline-none transition-all duration-300"
                                        style={getInputStyle('studentId', fieldErrors.studentId)}
                                        placeholder="IT23844292"
                                        value={form.studentId}
                                        onChange={change('studentId')}
                                        onFocus={() => setFocusedField('studentId')}
                                        onBlur={() => setFocusedField(null)}
                                        maxLength="10"
                                    />
                                </div>
                                {fieldErrors.studentId && <p className="text-[#fca5a5] text-xs mt-1.5 font-semibold">{fieldErrors.studentId}</p>}
                                {!fieldErrors.studentId && form.studentId && (
                                    <p className="text-emerald-400 text-xs mt-1.5 font-semibold flex items-center gap-1"><CheckCircle size={12} /> Valid format</p>
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] font-extrabold text-white/40 tracking-[0.15em] uppercase mb-2 block">
                                    Email <span className="text-[#F0A500]">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300"
                                        style={{ color: getIconColor('email') }}>
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold text-white placeholder-white/25 focus:outline-none transition-all duration-300"
                                        style={getInputStyle('email', fieldErrors.email)}
                                        placeholder="you@uni.edu"
                                        value={form.email}
                                        onChange={change('email')}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                </div>
                                {fieldErrors.email && <p className="text-[#fca5a5] text-xs mt-1.5 font-semibold">{fieldErrors.email}</p>}
                            </div>
                        </div>

                        {/* Faculty */}
                        <div>
                            <label className="text-[10px] font-extrabold text-white/40 tracking-[0.15em] uppercase mb-2 block">
                                Faculty <span className="text-[#F0A500]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300"
                                    style={{ color: getIconColor('faculty') }}>
                                    <BookOpen size={16} />
                                </div>
                                <select
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold text-white focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
                                    style={{
                                        ...getInputStyle('faculty', fieldErrors.faculty),
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 1rem center',
                                    }}
                                    value={form.faculty}
                                    onChange={change('faculty')}
                                    onFocus={() => setFocusedField('faculty')}
                                    onBlur={() => setFocusedField(null)}
                                >
                                    <option value="" style={{ background: '#1C2A59', color: 'rgba(255,255,255,0.5)' }}>Select your faculty</option>
                                    {faculties.map(f => (
                                        <option key={f} value={f} style={{ background: '#1C2A59', color: '#fff' }}>{f}</option>
                                    ))}
                                </select>
                            </div>
                            {fieldErrors.faculty && <p className="text-[#fca5a5] text-xs mt-1.5 font-semibold">{fieldErrors.faculty}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-[10px] font-extrabold text-white/40 tracking-[0.15em] uppercase mb-2 block">
                                Phone Number <span className="text-white/20">(optional)</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300"
                                    style={{ color: getIconColor('phone') }}>
                                    <Phone size={16} />
                                </div>
                                <input
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold text-white placeholder-white/25 focus:outline-none transition-all duration-300"
                                    style={getInputStyle('phone', fieldErrors.phone)}
                                    placeholder="0712345678"
                                    value={form.phone}
                                    onChange={change('phone')}
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                    maxLength="13"
                                />
                            </div>
                            {fieldErrors.phone && <p className="text-[#fca5a5] text-xs mt-1.5 font-semibold">{fieldErrors.phone}</p>}
                            {!fieldErrors.phone && form.phone && (
                                <p className="text-emerald-400 text-xs mt-1.5 font-semibold flex items-center gap-1"><CheckCircle size={12} /> {formatPhoneNumber(form.phone)}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-[10px] font-extrabold text-white/40 tracking-[0.15em] uppercase mb-2 block">
                                Password <span className="text-[#F0A500]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300"
                                    style={{ color: getIconColor('password') }}>
                                    <Lock size={16} />
                                </div>
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm font-semibold text-white placeholder-white/25 focus:outline-none transition-all duration-300"
                                    style={getInputStyle('password', fieldErrors.password)}
                                    placeholder="Min 8 characters"
                                    value={form.password}
                                    onChange={change('password')}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#F0A500] transition-colors duration-300">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {fieldErrors.password && <p className="text-[#fca5a5] text-xs mt-1.5 font-semibold">{fieldErrors.password}</p>}
                            {passwordStrength && form.password && !fieldErrors.password && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                        <div className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: passwordStrength === 'strong' ? '100%' : passwordStrength === 'medium' ? '60%' : '30%',
                                                background: passwordStrength === 'strong'
                                                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                                                    : passwordStrength === 'medium'
                                                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                        : 'linear-gradient(90deg, #ef4444, #f87171)',
                                            }} />
                                    </div>
                                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                                        passwordStrength === 'strong' ? 'text-emerald-400' : 'text-amber-400'
                                    }`}>{passwordStrength}</span>
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-4 rounded-xl text-sm font-semibold flex items-start gap-2.5"
                                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || Object.keys(fieldErrors).length > 0}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-extrabold uppercase tracking-wider transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed mt-2 group"
                            style={{
                                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #F0A500, #D89200)',
                                color: loading ? 'rgba(255,255,255,0.5)' : '#1C2A59',
                                boxShadow: loading ? 'none' : '0 8px 24px rgba(240,165,0,0.3)',
                            }}>
                            <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <p className="text-center text-white/50 font-medium text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-[#F0A500] hover:text-[#FFD166] font-bold transition-colors">Sign in</Link>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-6">
                    <Link href="/" className="text-white/30 hover:text-white/70 text-xs font-bold transition-colors inline-flex items-center gap-1.5 group">
                        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
                    </Link>
                </p>
            </div>
        </div>
    )
}
