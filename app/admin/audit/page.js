'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { TrendingUp, Clock, ChevronRight } from 'lucide-react'

export default function AdminAuditPage() {
    const { user } = useAuth()
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

    const actionColors = {
        APPROVE_CLAIM: { bg: '#d1fae5', color: '#10B981', icon: '✅' },
        REJECT_CLAIM: { bg: '#fee2e2', color: '#ef4444', icon: '❌' },
        WARN_USER: { bg: '#fef3c7', color: '#F0A500', icon: '⚠️' },
        RESTRICT_USER: { bg: '#fee2e2', color: '#ef4444', icon: '🚫' },
        UNRESTRICT_USER: { bg: '#d1fae5', color: '#10B981', icon: '🔓' },
        NEW_SUBMISSION: { bg: '#e0e7ff', color: '#6366f1', icon: '📝' },
        NEW_CLAIM: { bg: '#e0e7ff', color: '#6366f1', icon: '📥' },
        HIGH_MATCH_VERIFIED: { bg: '#fef3c7', color: '#F0A500', icon: '✨' },
        default: { bg: '#e0e7ff', color: '#6366f1', icon: '📋' },
    }

    return (
        <>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 text-gray-400">
                        <Link href="/admin/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
                        <ChevronRight size={12} />
                        <span className="text-[#F0A500]">Audit Logs</span>
                    </div>
                    <h1 className="text-2xl font-black text-[#1C2A59] tracking-tight flex items-center gap-3">
                        <TrendingUp size={22} className="text-[#F0A500]" /> Audit Logs
                    </h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">Full traceability of admin actions</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-200 h-16 animate-pulse" />
                    ))}
                </div>
            ) : logs.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200 border-dashed p-16 text-center shadow-sm">
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className="text-[#1C2A59] font-black text-lg mb-2">No audit logs yet</h3>
                    <p className="text-gray-400 text-sm">Action records will appear here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {logs.map((log, i) => {
                        const style = actionColors[log.action] || actionColors.default
                        return (
                            <div key={log._id || i} className="bg-white rounded-2xl border border-gray-200 p-4 shrink-0 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg border cursor-default"
                                    style={{ background: style.bg, borderColor: style.color + '40' }}>{style.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-[#1C2A59] text-sm font-black">{log.adminName || 'Admin'}</span>
                                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-black border" style={{ background: style.bg, color: style.color, borderColor: style.color + '40' }}>
                                            {log.action?.replace(/_/g, ' ') || 'ACTION'}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-xs mt-0.5 truncate">{log.details || 'No details'}</p>
                                </div>
                                <div className="text-gray-400 font-bold text-xs shrink-0 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Clock size={12} className="text-[#008489]" />
                                    {new Date(log.createdAt).toLocaleString()}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </>
    )
}
