'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, LogIn, Shield, User, Lock, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
    const { login } = useAuth()
    const router = useRouter()
    const [campusId, setCampusId] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [focusedField, setFocusedField] = useState(null)

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

    return (
        <div className="min-h-screen flex items-center justify-center px-4 font-sans relative overflow-hidden">
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

            <div className="w-full max-w-md relative z-10">
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
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h1>
                    <p className="text-white/50 font-medium text-sm mt-2">Sign in to Smart Campus Lost & Found</p>
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
                    {/* Admin hint */}
                    <div className="mb-6 p-4 rounded-xl flex items-start gap-3"
                        style={{
                            background: 'rgba(240,165,0,0.08)',
                            border: '1px solid rgba(240,165,0,0.2)',
                            backdropFilter: 'blur(8px)',
                        }}>
                        <Shield size={18} className="text-[#F0A500] mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-[#F0A500]">Admin Access</p>
                            <p className="text-xs text-white/50 mt-1">Use Campus ID: <code className="px-1.5 py-0.5 rounded-md text-[#F0A500] font-bold text-[11px]"
                                style={{ background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.2)' }}>admin</code> with your admin password</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Campus ID — Floating Label with Icon */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300"
                                style={{ color: focusedField === 'campusId' ? '#F0A500' : 'rgba(255,255,255,0.3)' }}>
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-4 rounded-xl text-sm font-semibold text-white placeholder-white/30 focus:outline-none transition-all duration-300"
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: focusedField === 'campusId' ? '1.5px solid rgba(240,165,0,0.5)' : '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: focusedField === 'campusId' ? '0 0 20px rgba(240,165,0,0.08)' : 'none',
                                }}
                                placeholder="Campus ID (e.g. IT23844292)"
                                value={campusId}
                                onChange={e => setCampusId(e.target.value)}
                                onFocus={() => setFocusedField('campusId')}
                                onBlur={() => setFocusedField(null)}
                                required
                            />
                        </div>

                        {/* Password — Floating Label with Icon */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300"
                                style={{ color: focusedField === 'password' ? '#F0A500' : 'rgba(255,255,255,0.3)' }}>
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPw ? 'text' : 'password'}
                                className="w-full pl-12 pr-12 py-4 rounded-xl text-sm font-semibold text-white placeholder-white/30 focus:outline-none transition-all duration-300"
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: focusedField === 'password' ? '1.5px solid rgba(240,165,0,0.5)' : '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: focusedField === 'password' ? '0 0 20px rgba(240,165,0,0.08)' : 'none',
                                }}
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                required
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#F0A500] transition-colors duration-300">
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl text-sm font-semibold flex items-center gap-2"
                                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                                <span className="text-base">⚠️</span> {error}
                            </div>
                        )}

                        {/* Modern Gradient Button */}
                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-extrabold uppercase tracking-wider transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed group"
                            style={{
                                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #F0A500, #D89200)',
                                color: loading ? 'rgba(255,255,255,0.5)' : '#1C2A59',
                                boxShadow: loading ? 'none' : '0 8px 24px rgba(240,165,0,0.3)',
                            }}>
                            <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" />
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <p className="text-center text-white/50 font-medium text-sm">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-[#F0A500] hover:text-[#FFD166] font-bold transition-colors">
                                Register here
                            </Link>
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
