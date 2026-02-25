'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({ name: '', email: '', campusId: '', password: '', department: '', studentId: '', phone: '' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
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

    return (
        <div className="page-bg min-h-screen flex items-center justify-center px-4 py-12">
            <div className="orb w-80 h-80 top-0 right-0 opacity-15" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)' }} />
            <div className="orb w-64 h-64 bottom-0 left-0 opacity-10" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.5) 0%, transparent 70%)' }} />

            <div className="w-full max-w-lg animate-slide-up">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                        style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.8) 0%, rgba(99,102,241,0.8) 100%)', boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}>
                        🎓
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create Account</h1>
                    <p className="text-white/50 text-sm mt-1">Join Smart Campus Lost & Found</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Full Name *</label>
                                <input className="glass-input" placeholder="John Doe" value={form.name} onChange={change('name')} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Campus ID *</label>
                                <input className="glass-input" placeholder="IT23844292" value={form.campusId} onChange={change('campusId')} required />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Email *</label>
                            <input type="email" className="glass-input" placeholder="you@uni.edu" value={form.email} onChange={change('email')} required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Department</label>
                                <input className="glass-input" placeholder="e.g. Computer Science" value={form.department} onChange={change('department')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Student/Staff ID</label>
                                <input className="glass-input" placeholder="e.g. 2021IT0123" value={form.studentId} onChange={change('studentId')} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Phone (optional)</label>
                            <input className="glass-input" placeholder="+94 7X XXX XXXX" value={form.phone} onChange={change('phone')} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Password *</label>
                            <div className="relative">
                                <input type={showPw ? 'text' : 'password'} className="glass-input pr-10" placeholder="Min 6 characters"
                                    value={form.password} onChange={change('password')} minLength={6} required />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-glass-cyan w-full justify-center py-3 text-sm font-semibold mt-2">
                            <UserPlus size={16} />
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-white/40 text-sm mt-5">
                        Already have an account?{' '}
                        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
