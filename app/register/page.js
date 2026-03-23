'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { validateStudentId, validatePhone, validatePassword, validateEmail, validateName, validateFaculty, getFaculties, formatPhoneNumber, stripPhoneNumber } from '@/lib/validations'

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({ name: '', email: '', studentId: '', password: '', faculty: '', phone: '' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [passwordStrength, setPasswordStrength] = useState(null)

    const change = (k) => (e) => {
        const value = e.target.value
        setForm(f => ({ ...f, [k]: value }))
        
        // Clear error for this field
        if (fieldErrors[k]) {
            setFieldErrors(err => {
                const newErrors = { ...err }
                delete newErrors[k]
                return newErrors
            })
        }

        // Real-time validation
        if (k === 'studentId') {
            const validation = validateStudentId(value)
            if (!validation.valid && value) {
                setFieldErrors(err => ({ ...err, studentId: validation.error }))
            }
        } else if (k === 'phone') {
            const validation = validatePhone(value)
            if (!validation.valid && value) {
                setFieldErrors(err => ({ ...err, phone: validation.error }))
            }
        } else if (k === 'password') {
            const validation = validatePassword(value)
            setPasswordStrength(validation.strength || null)
            if (!validation.valid && value) {
                setFieldErrors(err => ({ ...err, password: validation.error }))
            }
        } else if (k === 'email') {
            const validation = validateEmail(value)
            if (!validation.valid && value) {
                setFieldErrors(err => ({ ...err, email: validation.error }))
            }
        } else if (k === 'name') {
            const validation = validateName(value)
            if (!validation.valid && value) {
                setFieldErrors(err => ({ ...err, name: validation.error }))
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        
        // Validate all fields
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

        setError('')
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

    const inputClass = "w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors"
    const errorInputClass = "w-full px-4 py-2.5 bg-[#FFF5F5] border border-red-300 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
    const labelClass = "text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1 block"

    const faculties = getFaculties()

    return (
        <div className="bg-[#F4F5F7] min-h-screen flex items-center justify-center px-4 py-12 font-sans">
            <div className="w-full max-w-lg animate-slide-up">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 bg-white border-2 border-[#1C2A59] shadow-sm">
                        🎓
                    </div>
                    <h1 className="text-2xl font-extrabold text-[#1C2A59]">Create Account</h1>
                    <p className="text-[#3E4A56] font-medium text-sm mt-1">Join Smart Campus Lost & Found</p>
                </div>

                <div className="bg-white p-8 rounded border border-gray-200 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                            <input 
                                className={fieldErrors.name ? errorInputClass : inputClass} 
                                placeholder="John Doe" 
                                value={form.name} 
                                onChange={change('name')} 
                            />
                            {fieldErrors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{fieldErrors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Student ID <span className="text-red-500">*</span></label>
                                <input 
                                    className={fieldErrors.studentId ? errorInputClass : inputClass} 
                                    placeholder="IT23844292" 
                                    value={form.studentId} 
                                    onChange={change('studentId')} 
                                    maxLength="10"
                                />
                                {fieldErrors.studentId && <p className="text-red-500 text-xs mt-1 font-semibold">{fieldErrors.studentId}</p>}
                                {!fieldErrors.studentId && form.studentId && (
                                    <p className="text-green-600 text-xs mt-1 font-semibold flex items-center gap-1"><CheckCircle size={12} /> Valid format</p>
                                )}
                            </div>
                            <div>
                                <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                                <input 
                                    type="email" 
                                    className={fieldErrors.email ? errorInputClass : inputClass} 
                                    placeholder="you@uni.edu" 
                                    value={form.email} 
                                    onChange={change('email')} 
                                />
                                {fieldErrors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{fieldErrors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Faculty <span className="text-red-500">*</span></label>
                            <select 
                                className={fieldErrors.faculty ? errorInputClass : inputClass} 
                                value={form.faculty} 
                                onChange={change('faculty')}
                            >
                                <option value="">Select your faculty</option>
                                {faculties.map(f => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                            {fieldErrors.faculty && <p className="text-red-500 text-xs mt-1 font-semibold">{fieldErrors.faculty}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Phone Number (optional)</label>
                            <input 
                                className={fieldErrors.phone ? errorInputClass : inputClass} 
                                placeholder="0712345678" 
                                value={form.phone} 
                                onChange={change('phone')}
                                maxLength="13"
                            />
                            {fieldErrors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{fieldErrors.phone}</p>}
                            {!fieldErrors.phone && form.phone && (
                                <p className="text-green-600 text-xs mt-1 font-semibold flex items-center gap-1"><CheckCircle size={12} /> {formatPhoneNumber(form.phone)}</p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input 
                                    type={showPw ? 'text' : 'password'} 
                                    className={fieldErrors.password ? errorInputClass : inputClass} 
                                    placeholder="Min 8 characters"
                                    value={form.password} 
                                    onChange={change('password')} 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1C2A59] transition-colors"
                                >
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {fieldErrors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{fieldErrors.password}</p>}
                            {passwordStrength && form.password && !fieldErrors.password && (
                                <p className={`text-xs mt-1 font-semibold flex items-center gap-1 ${
                                    passwordStrength === 'strong' ? 'text-green-600' : 'text-amber-600'
                                }`}>
                                    <CheckCircle size={12} /> Password strength: {passwordStrength}
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 rounded border bg-red-50 border-red-200 text-red-600 text-sm font-semibold flex items-start gap-3">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading || Object.keys(fieldErrors).length > 0} 
                            className="w-full flex items-center justify-center gap-3 py-3 rounded text-sm font-extrabold uppercase tracking-wide transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            style={{ backgroundColor: '#1C2A59', color: '#FFFFFF' }}>
                            <UserPlus size={18} />
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-[#3E4A56] font-medium text-sm mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#008489] hover:underline font-bold">Sign in</Link>
                    </p>
                    <p className="text-center mt-3">
                        <Link href="/" className="text-gray-400 hover:text-[#1C2A59] text-xs font-bold transition-colors">← Back to Home</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
