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
            else router.push('/user-dashboard')
        } catch (err) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-bg min-h-screen flex items-center justify-center px-4">
            {/* Orbs */}
            <div className="orb w-80 h-80 top-0 left-0 opacity-20" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)' }} />
            <div className="orb w-64 h-64 bottom-0 right-0 opacity-15" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)' }} />

            <div className="w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse-glow"
                        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(6,182,212,0.8) 100%)', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
                        🎓
                    </div>
                    <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                    <p className="text-white/50 text-sm mt-1">Sign in to Smart Campus Lost & Found</p>
                </div>

                {/* Card */}
                <div className="glass-card p-8">
                    {/* Admin hint */}
                    <div className="mb-6 p-3 rounded-xl flex items-start gap-3"
                        style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
                        <Shield size={16} className="mt-0.5 shrink-0" style={{ color: '#c4b5fd' }} />
                        <div>
                            <p className="text-xs font-semibold" style={{ color: '#c4b5fd' }}>Admin Access</p>
                            <p className="text-xs text-white/50 mt-0.5">Use Campus ID: <code className="text-purple-400">admin</code> with your admin password</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 font-medium uppercase tracking-wide">Campus ID</label>
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="e.g. IT23844292 or admin"
                                value={campusId}
                                onChange={e => setCampusId(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 font-medium uppercase tracking-wide">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    className="glass-input pr-10"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl text-sm text-red-400"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="btn-glass-primary w-full justify-center py-3 text-sm font-semibold">
                            <LogIn size={16} />
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-white/40 text-sm mt-6">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                            Register here
                        </Link>
                    </p>
                    <p className="text-center mt-3">
                        <Link href="/" className="text-white/30 hover:text-white/50 text-xs transition-colors">← Back to Home</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
