'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { GraduationCap, Eye, EyeOff, LogIn, Shield } from 'lucide-react'

export default function LoginPage() {
    const { login } = useAuth()
    const router = useRouter()
    const [campusId, setCampusId] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const user = await login(campusId, password)
            if (user.role === 'admin') router.push('/admin/dashboard')
            else router.push('/')
        } catch (err) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors"
    const labelClass = "text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1 block"

    return (
        <div className="bg-[#F4F5F7] min-h-screen flex items-center justify-center px-4 font-sans">
            <div className="w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 bg-white border-2 border-[#1C2A59] shadow-sm">
                        🎓
                    </div>
                    <h1 className="text-2xl font-extrabold text-[#1C2A59]">Welcome Back</h1>
                    <p className="text-[#3E4A56] font-medium text-sm mt-1">Sign in to Smart Campus Lost & Found</p>
                </div>

                {/* Card */}
                <div className="bg-white p-8 rounded border border-gray-200 shadow-sm">
                    {/* Admin hint */}
                    <div className="mb-6 p-4 rounded flex items-start gap-4"
                        style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                        <Shield size={20} className="text-[#D97706] mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-[#92400E]">Admin Access</p>
                            <p className="text-xs text-[#92400E]/80 mt-1">Use Campus ID: <code className="bg-white px-1 py-0.5 rounded text-[#92400E] font-bold border border-[#FDE68A]">admin</code> with your admin password</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className={labelClass}>Campus ID</label>
                            <input
                                type="text"
                                className={inputClass}
                                placeholder="e.g. IT23844292 or admin"
                                value={campusId}
                                onChange={e => setCampusId(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    className={inputClass}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1C2A59] transition-colors">
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded border bg-red-50 border-red-200 text-red-600 text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-3 rounded text-sm font-extrabold uppercase tracking-wide transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#1C2A59', color: '#FFFFFF' }}>
                            <LogIn size={18} />
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-[#3E4A56] font-medium text-sm mt-6">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-[#008489] hover:underline font-bold">
                            Register here
                        </Link>
                    </p>
                    <p className="text-center mt-3">
                        <Link href="/" className="text-gray-400 hover:text-[#1C2A59] text-xs font-bold transition-colors">← Back to Home</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
