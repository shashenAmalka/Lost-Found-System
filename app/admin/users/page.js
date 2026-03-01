'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard, FileText, ShieldAlert, Activity,
    Users, AlertTriangle, Star, Search, LogOut,
    ChevronRight, Shield, CheckCircle2, XCircle
} from 'lucide-react'

function StatusPill({ status }) {
    const map = {
        active: { label: 'Active', color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' },
        restricted: { label: 'Restricted', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
        warned: { label: 'Warned', color: '#D4AF37', bg: 'rgba(212,175,55,0.12)', border: 'rgba(212,175,55,0.3)' },
    }
    const s = map[status] || { label: status || 'Active', color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' }
    return (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border"
            style={{ color: s.color, background: s.bg, borderColor: s.border }}>
            {s.label}
        </span>
    )
}

export default function AdminUsersPage() {
    const { user, loading: authLoading, isAdmin, logout } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)
    const [search, setSearch] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        if (!user) return
        fetch('/api/admin/users', { credentials: 'include' })
            .then(r => r.json())
            .then(d => setUsers(d.users || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [user])

    const handleAction = async (userId, action) => {
        setActionLoading(userId)
        setSuccessMsg('')
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            const labels = { warn: 'warned', restrict: 'restricted', unrestrict: 'unrestricted' }
            setSuccessMsg(`User ${labels[action] || action} successfully!`)
            setUsers(prev => prev.map(u => u._id === userId ? data.user : u))
            setTimeout(() => setSuccessMsg(''), 4000)
        } catch (err) {
            alert(err.message)
        } finally {
            setActionLoading(null)
        }
    }

    if (authLoading) return <div className="min-h-screen" style={{ backgroundColor: '#0B0F19' }} />
    if (!user || !isAdmin) { router.push('/login'); return null }

    const filtered = users.filter(u => {
        if (!search) return true
        const s = search.toLowerCase()
        return u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.campusId?.toLowerCase().includes(s)
    })

    const restricted = users.filter(u => u.status === 'restricted').length
    const warned = users.filter(u => u.warningCount > 0).length
    const trusted = users.filter(u => u.trustedFinderBadge).length

    const navItems = [
        { name: 'Overview', icon: LayoutDashboard, href: '/admin/dashboard' },
        { name: 'Claim Management', icon: FileText, href: '/admin/claims' },
        { name: 'User Moderation', icon: ShieldAlert, href: '/admin/users', active: true },
        { name: 'Analytics Data', icon: Activity, href: '/admin/audit' },
    ]

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: '#0B0F19', color: '#F5F6FA', position: 'relative', overflow: 'hidden' }}>

            {/* Ambient Orbs */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[150px] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, #1A1A64 0%, transparent 70%)' }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-15 blur-[120px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #F06414 0%, transparent 70%)' }} />

            {/* Sidebar */}
            <aside className="w-64 h-screen hidden lg:flex flex-col justify-between border-r sticky top-0 z-50 shrink-0"
                style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(40px)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div>
                    <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                                style={{ background: 'rgba(26,26,100,0.4)', borderColor: 'rgba(26,26,100,0.8)' }}>
                                <ShieldAlert size={20} className="text-white" />
                            </div>
                            <h1 className="font-bold text-white tracking-wide">Command<br />Center</h1>
                        </div>
                    </div>
                    <nav className="p-4 space-y-2">
                        {navItems.map((item, i) => (
                            <Link key={i} href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${item.active ? '' : 'hover:bg-white/5'}`}
                                style={item.active ? { background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' } : { border: '1px solid transparent' }}>
                                <item.icon size={18} style={{ color: item.active ? '#D4AF37' : 'rgba(245,246,250,0.5)' }} />
                                <span className={`text-sm font-semibold ${item.active ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1A1A64] to-[#F06414] flex items-center justify-center font-bold text-xs">A</div>
                        <div className="text-sm">
                            <p className="font-bold text-white leading-tight">Admin System</p>
                            <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-bold">Authorized</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-white/5 text-white/50 hover:text-white">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen relative z-10 p-6 md:p-8 overflow-y-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(245,246,250,0.4)' }}>
                            <Link href="/admin/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                            <ChevronRight size={12} />
                            <span style={{ color: '#D4AF37' }}>User Moderation</span>
                        </div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-wide">
                            <Users size={24} style={{ color: '#D4AF37' }} />
                            User Moderation
                        </h2>
                        <p className="text-sm mt-1 font-medium" style={{ color: 'rgba(245,246,250,0.5)' }}>
                            Monitor, warn, and moderate student accounts
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(245,246,250,0.4)' }} />
                        <input
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none font-medium"
                            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#F5F6FA' }}
                            placeholder="Search by name, ID, email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Success Banner */}
                {successMsg && (
                    <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold"
                        style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
                        <CheckCircle2 size={16} /> {successMsg}
                    </div>
                )}

                {/* Stats Row */}
                {!loading && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total Users', value: users.length, color: '#60a5fa' },
                            { label: 'Restricted', value: restricted, color: '#ef4444' },
                            { label: 'Warned', value: warned, color: '#D4AF37' },
                            { label: 'Trusted Finders', value: trusted, color: '#4ade80' },
                        ].map((s, i) => (
                            <div key={i} className="rounded-2xl p-5 border relative overflow-hidden"
                                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                <div className="absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-20 rounded-full"
                                    style={{ background: s.color }} />
                                <p className="text-3xl font-black text-white relative z-10">{s.value}</p>
                                <p className="text-xs font-bold uppercase tracking-wider mt-1 relative z-10" style={{ color: 'rgba(245,246,250,0.5)' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Users Table */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="rounded-2xl h-16 animate-pulse border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-3xl border p-16 text-center" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-white font-bold text-lg">No users found</h3>
                        <p className="text-sm mt-2" style={{ color: 'rgba(245,246,250,0.4)' }}>Try adjusting your search query.</p>
                    </div>
                ) : (
                    <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                        {/* Table Header */}
                        <div className="grid grid-cols-[1fr_120px_120px_80px_90px_80px_160px] gap-4 px-5 py-3 text-[10px] font-bold uppercase tracking-wider border-b"
                            style={{ borderBottomColor: 'rgba(255,255,255,0.05)', color: 'rgba(245,246,250,0.4)' }}>
                            <span>Name / Campus ID</span>
                            <span>Email</span>
                            <span>Role</span>
                            <span>Warnings</span>
                            <span>Status</span>
                            <span>Badge</span>
                            <span>Actions</span>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                            {filtered.map(u => (
                                <div key={u._id}
                                    className="grid grid-cols-[1fr_120px_120px_80px_90px_80px_160px] gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors"
                                    style={{ borderBottomColor: 'rgba(255,255,255,0.04)' }}>

                                    {/* Name / ID */}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                                                style={{ background: u.status === 'restricted' ? 'rgba(239,68,68,0.15)' : 'rgba(26,26,100,0.3)', color: u.status === 'restricted' ? '#ef4444' : '#D4AF37' }}>
                                                {u.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold text-white truncate">{u.name}</div>
                                                <div className="text-[10px] font-medium truncate" style={{ color: 'rgba(245,246,250,0.4)' }}>{u.campusId}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="text-xs font-medium truncate" style={{ color: 'rgba(245,246,250,0.5)' }}>{u.email}</div>

                                    {/* Role */}
                                    <div>
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border"
                                            style={{
                                                color: u.role === 'admin' ? '#c4b5fd' : '#a5b4fc',
                                                background: u.role === 'admin' ? 'rgba(167,139,250,0.12)' : 'rgba(99,102,241,0.1)',
                                                borderColor: u.role === 'admin' ? 'rgba(167,139,250,0.3)' : 'rgba(99,102,241,0.2)',
                                            }}>{u.role}</span>
                                    </div>

                                    {/* Warnings */}
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-black" style={{ color: (u.warningCount || 0) >= 2 ? '#ef4444' : (u.warningCount || 0) >= 1 ? '#D4AF37' : '#4ade80' }}>
                                                {u.warningCount || 0}/3
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div><StatusPill status={u.status || 'active'} /></div>

                                    {/* Badge */}
                                    <div>
                                        {u.trustedFinderBadge ? (
                                            <div className="flex items-center gap-1">
                                                <Star size={14} style={{ color: '#D4AF37' }} />
                                                <span className="text-[10px] font-bold" style={{ color: '#D4AF37' }}>Trusted</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs" style={{ color: 'rgba(245,246,250,0.2)' }}>—</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div>
                                        {u.role !== 'admin' && (
                                            <div className="flex gap-2 flex-wrap">
                                                {u.status !== 'restricted' ? (
                                                    <>
                                                        <button onClick={() => handleAction(u._id, 'warn')} disabled={actionLoading === u._id}
                                                            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-90 disabled:opacity-40"
                                                            style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }}>
                                                            <AlertTriangle size={10} /> Warn
                                                        </button>
                                                        <button onClick={() => handleAction(u._id, 'restrict')} disabled={actionLoading === u._id}
                                                            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-90 disabled:opacity-40"
                                                            style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                                                            <XCircle size={10} /> Restrict
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => handleAction(u._id, 'unrestrict')} disabled={actionLoading === u._id}
                                                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-90 disabled:opacity-40"
                                                        style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                                                        <CheckCircle2 size={10} /> Unrestrict
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
