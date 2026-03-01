'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard, FileText, ShieldAlert, Activity,
    ArrowUpRight, AlertTriangle, ShieldCheck, Clock,
    Search, LogOut
} from 'lucide-react'

export default function AdminCommandCenter() {
    const { user, loading: authLoading, isAdmin, logout } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState(null)
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        fetch('/api/admin/stats', { method: 'POST', credentials: 'include' })
            .then(r => r.json())
            .then(d => {
                setStats(d.stats)
                setActivities(d.recentActivities || [])
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [user])

    function timeAgo(dateStr) {
        if (!dateStr) return 'Recently'
        const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
        if (seconds < 60) return 'Just now'
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    function getActivityStyle(action) {
        if (action === 'HIGH_MATCH_VERIFIED') return { label: 'High Match Verified', color: '#F06414', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255,255,255,0.05)' }
        if (action === 'NEW_SUBMISSION') return { label: 'New Submission', color: '#FFFFFF', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255,255,255,0.05)' }
        if (action === 'SECURITY_ALERT' || action === 'RESTRICT_USER') return { label: 'Security Alert', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' }
        if (action === 'APPROVE_CLAIM') return { label: 'Claim Reunited', color: '#D4AF37', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255,255,255,0.05)' }
        return { label: action.replace('_', ' '), color: '#FFFFFF', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255,255,255,0.05)' }
    }

    if (authLoading) return <div className="min-h-screen" style={{ backgroundColor: '#0B0F19' }} />
    if (!user || !isAdmin) { router.push('/login'); return null }

    const statCards = [
        { label: 'Total Claims', value: stats?.totalClaims || 0, color: '#1A1A64', glow: 'rgba(26,26,100,0.5)', icon: FileText, change: '+12%' },
        { label: 'Resolved', value: stats?.totalFound || 0, color: '#D4AF37', glow: 'rgba(212,175,55,0.4)', icon: ShieldCheck, change: '+5%' },
        { label: 'Pending Review', value: stats?.pendingClaims || 0, color: '#F06414', glow: 'rgba(240,100,20,0.4)', icon: Clock, change: '-2%' },
        { label: 'Fraud Alerts', value: stats?.restrictedUsers || 0, color: '#ef4444', glow: 'rgba(239,68,68,0.4)', icon: AlertTriangle, change: '+1 alert' },
    ]

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: '#0B0F19', color: '#F5F6FA', position: 'relative', overflow: 'hidden' }}>

            {/* Command Center Ambient Glowing Orbs */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[150px] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, #1A1A64 0%, transparent 70%)' }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-15 blur-[120px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #F06414 0%, transparent 70%)' }} />

            {/* Premium Frosted Sidebar */}
            <aside className="w-64 h-screen hidden lg:flex flex-col justify-between border-r sticky top-0 z-50 shrink-0"
                style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(40px)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                <div>
                    {/* Header */}
                    <div className="p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                                style={{ background: 'rgba(26, 26, 100, 0.4)', borderColor: 'rgba(26, 26, 100, 0.8)' }}>
                                <ShieldAlert size={20} className="text-white drop-shadow-md" />
                            </div>
                            <div>
                                <h1 className="font-bold text-white tracking-wide">Command<br />Center</h1>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="p-4 space-y-2">
                        {[
                            { name: 'Overview', icon: LayoutDashboard, active: true },
                            { name: 'Claim Management', icon: FileText, href: '/admin/claims' },
                            { name: 'User Moderation', icon: ShieldAlert, href: '/admin/users' },
                            { name: 'Analytics Data', icon: Activity, href: '/admin/audit' },
                        ].map((item, i) => (
                            <Link key={i} href={item.href || '#'}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${item.active ? '' : 'hover:bg-white/5'}`}
                                style={item.active ? { background: 'rgba(212, 175, 55, 0.15)', borderColor: 'rgba(212, 175, 55, 0.3)', border: '1px solid' } : { border: '1px solid transparent' }}>
                                <item.icon size={18} style={{ color: item.active ? '#D4AF37' : 'rgba(245, 246, 250, 0.5)' }} className="group-hover:text-white transition-colors" />
                                <span className={`text-sm font-semibold transition-colors ${item.active ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1A1A64] to-[#F06414] flex items-center justify-center font-bold text-xs ring-2 ring-transparent">
                            A
                        </div>
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

            {/* Main Content Workspace */}
            <main className="flex-1 w-full min-h-screen relative z-10 p-6 md:p-8 overflow-y-auto">
                {/* Mobile Top Bar */}
                <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <ShieldAlert size={24} className="text-[#D4AF37]" />
                        <span className="font-bold text-lg text-white">Admin Network</span>
                    </div>
                </div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    {loading ? (
                        [...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl border animate-pulse" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} />)
                    ) : (
                        statCards.map((card, idx) => (
                            <div key={idx} className="rounded-2xl p-6 border relative overflow-hidden group transition-transform hover:-translate-y-1"
                                style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(30px)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-30 pointer-events-none transition-opacity group-hover:opacity-50"
                                    style={{ background: card.color }} />

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="p-2.5 rounded-lg border shadow-lg" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                                        <card.icon size={20} color={card.color} />
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 border border-white/10 flex items-center gap-1">
                                        <ArrowUpRight size={12} color={card.color} /> {card.change}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black text-white drop-shadow-md mb-1 relative z-10">{card.value}</h3>
                                <p className="text-xs font-bold uppercase tracking-wider relative z-10" style={{ color: 'rgba(245, 246, 250, 0.5)' }}>{card.label}</p>
                            </div>
                        ))
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
                    {/* Central Area Chart */}
                    <div className="rounded-3xl border flex flex-col p-8"
                        style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(30px)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <div className="flex justify-between items-center mb-8 border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                                <Activity size={18} className="text-[#1A1A64] drop-shadow-[0_0_8px_rgba(26,26,100,1)]" /> Lost vs. Found Trajectory
                            </h2>
                            <span className="text-xs font-semibold px-3 py-1 bg-white/5 rounded text-white/60">Last 30 Days</span>
                        </div>

                        <div className="flex-1 min-h-[300px] w-full relative flex items-end justify-between px-2 pb-8 pt-10"
                            style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.01) 0%, transparent 100%)' }}>
                            {/* Abstract Chart Representation Visual */}
                            <div className="absolute bottom-8 left-0 w-full h-[200px] pointer-events-none">
                                <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
                                    <path d="M0,200 L0,150 C100,100 200,180 300,120 C400,60 500,140 600,90 C700,40 800,80 800,80 L800,200 Z"
                                        fill="url(#gradient-blue)" stroke="#1A1A64" strokeWidth="3" className="drop-shadow-[0_0_10px_rgba(26,26,100,0.8)]" />
                                    <path d="M0,200 L0,100 C150,140 250,60 350,110 C450,160 550,50 650,100 C750,150 800,30 800,30 L800,200 Z"
                                        fill="url(#gradient-orange)" stroke="#F06414" strokeWidth="3" className="drop-shadow-[0_0_10px_rgba(240,100,20,0.8)]" />
                                    <defs>
                                        <linearGradient id="gradient-blue" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(26,26,100,0.4)" />
                                            <stop offset="100%" stopColor="transparent" />
                                        </linearGradient>
                                        <linearGradient id="gradient-orange" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(240,100,20,0.3)" />
                                            <stop offset="100%" stopColor="transparent" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            {/* Grid Lines */}
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="absolute left-0 w-full border-t border-white/5" style={{ bottom: `${i * 20}%` }} />
                            ))}
                            <div className="w-full flex justify-between text-[10px] uppercase font-bold text-white/30 absolute bottom-0 left-0 px-4">
                                <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
                            </div>
                        </div>

                        <div className="flex gap-6 mt-8 justify-center">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#1A1A64] shadow-[0_0_8px_rgba(26,26,100,0.8)]" />
                                <span className="text-xs font-semibold text-white/70">Lost Items Reported</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#F06414] shadow-[0_0_8px_rgba(240,100,20,0.8)]" />
                                <span className="text-xs font-semibold text-white/70">Found Items Logged</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Activity Feed) */}
                    <div className="rounded-3xl border p-6 overflow-hidden flex flex-col"
                        style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(30px)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2 mb-6">
                            <Clock size={16} className="text-[#D4AF37] animate-pulse" /> Live Activity Feed
                        </h2>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2" style={{ scrollbarWidth: 'thin' }}>
                            {activities.length > 0 ? (
                                activities.map((activity, i) => {
                                    const style = getActivityStyle(activity.action)
                                    return (
                                        <div key={i} className="p-4 rounded-xl border transition-colors hover:brightness-110"
                                            style={{ background: style.bg, borderColor: style.border }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: style.color }}>{style.label}</span>
                                                <span className="text-[10px] font-medium text-white/40">{timeAgo(activity.createdAt)}</span>
                                            </div>
                                            <p className="text-xs font-medium leading-relaxed" style={{ color: activity.action.includes('SECURITY') ? '#ef4444' : 'rgba(255,255,255,0.8)' }}>
                                                {activity.details}
                                            </p>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="py-12 text-center">
                                    <Activity size={32} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-xs text-white/40">No recent activity found</p>
                                </div>
                            )}
                        </div>

                        <button className="w-full mt-4 py-2 text-xs font-bold uppercase tracking-widest border-t border-white/10 text-white/40 hover:text-white transition-colors">
                            Load historical feed
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
