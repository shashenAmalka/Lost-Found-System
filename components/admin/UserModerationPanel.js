'use client'
import { useState, useEffect, useCallback } from 'react'
import { Users, Shield, ShieldAlert, ShieldOff, AlertTriangle, ChevronDown, ChevronUp, Eye, Clock, Search, Ban, Undo2, MinusCircle, Loader2 } from 'lucide-react'
import IssueWarningModal from './IssueWarningModal'
import AppealReviewCard from './AppealReviewCard'

const STATUS_STYLES = {
    active: { bg: 'rgba(74,222,128,0.12)', color: '#4ade80', label: 'Active' },
    limited: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', label: 'Limited' },
    restricted: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', label: 'Restricted' },
}

export default function UserModerationPanel() {
    const [users, setUsers] = useState([])
    const [appeals, setAppeals] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [expandedId, setExpandedId] = useState(null)
    const [warningModalUser, setWarningModalUser] = useState(null)
    const [expandedWarnings, setExpandedWarnings] = useState({})
    const [actionLoading, setActionLoading] = useState(null)

    const fetchData = useCallback(async () => {
        try {
            const [usersRes, appealsRes] = await Promise.all([
                fetch('/api/admin/users', { credentials: 'include' }),
                fetch('/api/admin/appeals?status=PENDING', { credentials: 'include' }),
            ])
            const usersData = await usersRes.json()
            const appealsData = await appealsRes.json()
            setUsers(usersData.users || [])
            setAppeals(appealsData.appeals || [])
        } catch { }
        setLoading(false)
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const handleAction = async (userId, action, reason) => {
        setActionLoading(userId)
        try {
            await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action, reason }),
                credentials: 'include',
            })
            fetchData()
        } catch { }
        setActionLoading(null)
    }

    const fetchWarnings = async (userId) => {
        try {
            const res = await fetch(`/api/admin/warnings?userId=${userId}`, { credentials: 'include' })
            const data = await res.json()
            setExpandedWarnings(prev => ({ ...prev, [userId]: data.warnings || [] }))
        } catch { }
    }

    const toggleExpand = (userId) => {
        if (expandedId === userId) {
            setExpandedId(null)
        } else {
            setExpandedId(userId)
            if (!expandedWarnings[userId]) fetchWarnings(userId)
        }
    }

    const filtered = users.filter(u =>
        u.role !== 'admin' && (
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.campusId?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
        )
    )

    // Stats
    const stats = {
        total: users.filter(u => u.role !== 'admin').length,
        active: users.filter(u => u.role !== 'admin' && u.status === 'active').length,
        limited: users.filter(u => u.role !== 'admin' && (u.status === 'limited' || u.restrictionLevel === 'LIMITED')).length,
        full: users.filter(u => u.role !== 'admin' && (u.status === 'restricted' || u.restrictionLevel === 'FULL')).length,
    }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-white/20" size={32} />
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { icon: Users, label: 'Total Users', value: stats.total, color: '#6366f1' },
                    { icon: Shield, label: 'Active', value: stats.active, color: '#4ade80' },
                    { icon: ShieldAlert, label: 'Limited', value: stats.limited, color: '#fbbf24' },
                    { icon: ShieldOff, label: 'Full Restricted', value: stats.full, color: '#f87171' },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="glass-card p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: `${color}15` }}>
                            <Icon size={16} style={{ color }} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white">{value}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending Appeals */}
            {appeals.length > 0 && (
                <div className="glass-card p-5">
                    <h3 className="text-sm font-bold text-yellow-300 flex items-center gap-2 mb-4">
                        <AlertTriangle size={14} /> Pending Appeals ({appeals.length})
                    </h3>
                    <div className="grid gap-3">
                        {appeals.map(a => (
                            <AppealReviewCard key={a._id} appeal={a} onDecision={() => fetchData()} />
                        ))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input className="glass-input pl-9 text-xs" placeholder="Search users by name, campus ID, or email..."
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* User Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {['User', 'Campus ID', 'Role', 'Status', 'Warnings', 'Appeals', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-[9px] font-bold text-white/30 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => {
                                const st = STATUS_STYLES[u.status] || STATUS_STYLES.active
                                const isExpanded = expandedId === u._id
                                return (
                                    <>
                                        <tr key={u._id} className="group cursor-pointer hover:bg-white/[0.02] transition-colors"
                                            onClick={() => toggleExpand(u._id)}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                                                        style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                                                        {(u.name || '?')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium text-xs">{u.name}</p>
                                                        <p className="text-[9px] text-white/30">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-white/50">{u.campusId}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                                                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                                                    style={{ background: st.bg, color: st.color }}>
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-2 h-2 rounded-full"
                                                            style={{
                                                                background: i <= (u.activeWarnings || u.warningCount || 0) ? '#ef4444' : 'rgba(255,255,255,0.1)',
                                                                boxShadow: i <= (u.activeWarnings || u.warningCount || 0) ? '0 0 4px rgba(239,68,68,0.5)' : 'none',
                                                            }} />
                                                    ))}
                                                    <span className="text-[9px] text-white/30 ml-1">{u.activeWarnings || u.warningCount || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {u.hasPendingAppeal && (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                                                        style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}>
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                <div className="flex gap-1.5">
                                                    <button onClick={() => setWarningModalUser(u)} title="Issue Warning"
                                                        className="p-1.5 rounded-lg hover:bg-yellow-500/10 transition-colors">
                                                        <AlertTriangle size={12} className="text-yellow-400" />
                                                    </button>
                                                    {u.status === 'active' && (
                                                        <button onClick={() => handleAction(u._id, 'restrict_limited', 'Admin action')}
                                                            title="Restrict (Limited)" disabled={actionLoading === u._id}
                                                            className="p-1.5 rounded-lg hover:bg-amber-500/10 transition-colors">
                                                            <ShieldAlert size={12} className="text-amber-400" />
                                                        </button>
                                                    )}
                                                    {(u.status === 'limited' || u.status === 'active') && (
                                                        <button onClick={() => handleAction(u._id, 'restrict_full', 'Admin action')}
                                                            title="Restrict (Full)" disabled={actionLoading === u._id}
                                                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                                                            <Ban size={12} className="text-red-400" />
                                                        </button>
                                                    )}
                                                    {u.status !== 'active' && (
                                                        <button onClick={() => handleAction(u._id, 'unrestrict')}
                                                            title="Unrestrict" disabled={actionLoading === u._id}
                                                            className="p-1.5 rounded-lg hover:bg-green-500/10 transition-colors">
                                                            <Undo2 size={12} className="text-green-400" />
                                                        </button>
                                                    )}
                                                    {(u.activeWarnings || u.warningCount || 0) > 0 && (
                                                        <button onClick={() => handleAction(u._id, 'reduce_warning')}
                                                            title="Reduce Warning" disabled={actionLoading === u._id}
                                                            className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors">
                                                            <MinusCircle size={12} className="text-indigo-400" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded Panel */}
                                        {isExpanded && (
                                            <tr key={`${u._id}-exp`}>
                                                <td colSpan={7} className="p-4" style={{ background: 'rgba(255,255,255,0.01)' }}>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {/* User Info */}
                                                        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <p className="text-[9px] font-bold uppercase text-white/30 mb-2">User Info</p>
                                                            <div className="space-y-1.5 text-[10px]">
                                                                <p className="text-white/50"><span className="text-white/30">Name:</span> <span className="text-white">{u.name}</span></p>
                                                                <p className="text-white/50"><span className="text-white/30">Email:</span> <span className="text-white">{u.email}</span></p>
                                                                <p className="text-white/50"><span className="text-white/30">Campus ID:</span> <span className="text-white">{u.campusId}</span></p>
                                                                <p className="text-white/50"><span className="text-white/30">Dept:</span> <span className="text-white">{u.department || '—'}</span></p>
                                                                <p className="text-white/50"><span className="text-white/30">Restriction:</span> <span className="text-white">{u.restrictionLevel || 'NONE'}</span></p>
                                                                {u.restrictionReason && (
                                                                    <p className="text-white/50"><span className="text-white/30">Reason:</span> <span className="text-yellow-400">{u.restrictionReason}</span></p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Warning Timeline */}
                                                        <div className="md:col-span-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <p className="text-[9px] font-bold uppercase text-white/30 mb-2">Warning History</p>
                                                            {expandedWarnings[u._id] ? (
                                                                expandedWarnings[u._id].length === 0 ? (
                                                                    <p className="text-[10px] text-white/20 italic">No warnings recorded.</p>
                                                                ) : (
                                                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                                        {expandedWarnings[u._id].map(w => {
                                                                            const sevColors = { LOW: '#818cf8', MEDIUM: '#fbbf24', HIGH: '#f87171' }
                                                                            const statColors = { ACTIVE: '#f87171', EXPIRED: 'rgba(255,255,255,0.3)', REVOKED: '#4ade80' }
                                                                            return (
                                                                                <div key={w._id} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                                                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: statColors[w.status] || '#fff' }} />
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                                                            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded"
                                                                                                style={{ background: `${sevColors[w.severity]}20`, color: sevColors[w.severity] }}>
                                                                                                {w.severity}
                                                                                            </span>
                                                                                            <span className="text-[8px] uppercase" style={{ color: statColors[w.status] }}>{w.status}</span>
                                                                                        </div>
                                                                                        <p className="text-[10px] text-white/60">{w.reason}</p>
                                                                                        <p className="text-[8px] text-white/25 mt-0.5">
                                                                                            {new Date(w.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                                            {' · '}{w.issuedByName || 'Admin'}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <Loader2 size={14} className="animate-spin text-white/20" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Warning Modal */}
            {warningModalUser && (
                <IssueWarningModal user={warningModalUser}
                    onClose={() => setWarningModalUser(null)}
                    onSuccess={() => { setWarningModalUser(null); fetchData() }} />
            )}
        </div>
    )
}
