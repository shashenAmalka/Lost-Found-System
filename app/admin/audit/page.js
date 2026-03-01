'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { TrendingUp, Clock, User as UserIcon, Shield, Filter } from 'lucide-react'

export default function AdminAuditPage() {
    const { user, loading: authLoading, isAdmin } = useAuth()
    const router = useRouter()
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        fetch('/api/admin/stats', { method: 'GET', credentials: 'include' })
            .then(r => r.json())
            .then(d => setLogs(d.logs || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [user])

    if (authLoading) return <div className="min-h-screen" style={{ backgroundColor: '#0B0F19' }}><Navbar /></div>
    if (!user || !isAdmin) { router.push('/login'); return null }

    const actionColors = {
        APPROVE_CLAIM: { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', icon: '✅' },
        REJECT_CLAIM: { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', icon: '❌' },
        WARN_USER: { bg: 'rgba(245,158,11,0.15)', color: '#fcd34d', icon: '⚠️' },
        RESTRICT_USER: { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', icon: '🚫' },
        UNRESTRICT_USER: { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', icon: '🔓' },
        NEW_SUBMISSION: { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', icon: '📝' },
        NEW_CLAIM: { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', icon: '📥' },
        HIGH_MATCH_VERIFIED: { bg: 'rgba(212,175,55,0.15)', color: '#D4AF37', icon: '✨' },
        default: { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', icon: '📋' },
    }

    return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3"><TrendingUp size={22} className="text-pink-400" /> Audit Logs</h1>
                    <p className="text-white/50 text-sm mt-1">Full traceability of admin actions</p>
                </div>

                {loading ? (
                    <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="glass-card h-16 animate-pulse" style={{ opacity: 0.4 }} />)}</div>
                ) : logs.length === 0 ? (
                    <div className="glass-card p-16 text-center"><div className="text-5xl mb-4">📋</div><h3 className="text-white font-semibold mb-2">No audit logs yet</h3></div>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log, i) => {
                            const style = actionColors[log.action] || actionColors.default
                            return (
                                <div key={log._id || i} className="glass-card p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                                        style={{ background: style.bg }}>{style.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-white text-sm font-semibold">{log.adminName || 'Admin'}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: style.bg, color: style.color }}>
                                                {log.action?.replace(/_/g, ' ') || 'ACTION'}
                                            </span>
                                        </div>
                                        <p className="text-white/50 text-xs mt-0.5 truncate">{log.details || 'No details'}</p>
                                    </div>
                                    <div className="text-white/30 text-xs shrink-0 flex items-center gap-1">
                                        <Clock size={10} />
                                        {new Date(log.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
