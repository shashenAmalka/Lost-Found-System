'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard, FileText, ShieldAlert, Activity,
    ArrowUpRight, AlertTriangle, ShieldCheck, Clock,
    Search, LogOut, ChevronDown
} from 'lucide-react'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminCommandCenter() {
    const { user, loading: authLoading, isAdmin, logout } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState(null)
    const [activities, setActivities] = useState([])
    const [trajectoryData, setTrajectoryData] = useState([])
    const [timeRange, setTimeRange] = useState(30)
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

    useEffect(() => {
        if (!user) return
        fetch(`/api/admin/analytics/trajectory?range=${timeRange}`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => setTrajectoryData(d.trajectory || []))
            .catch(() => { })
    }, [user, timeRange])

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
        if (action === 'HIGH_MATCH_VERIFIED') return { label: 'High Match Verified', color: '#F0A500', bg: 'rgba(240, 165, 0, 0.1)', border: 'rgba(240, 165, 0, 0.2)' }
        if (action === 'NEW_SUBMISSION') return { label: 'New Submission', color: '#1C2A59', bg: 'rgba(28, 42, 89, 0.1)', border: 'rgba(28, 42, 89, 0.2)' }
        if (action === 'SECURITY_ALERT' || action === 'RESTRICT_USER') return { label: 'Security Alert', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' }
        if (action === 'APPROVE_CLAIM') return { label: 'Claim Reunited', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' }
        return { label: action.replace('_', ' '), color: '#3E4A56', bg: 'rgba(62, 74, 86, 0.1)', border: 'rgba(62, 74, 86, 0.2)' }
    }

    if (authLoading) return <div className="min-h-screen bg-[#F4F5F7]" />
    if (!user || !isAdmin) { router.push('/login'); return null }

    const statCards = [
        { label: 'Total Claims', value: stats?.totalClaims || 0, color: '#1C2A59', icon: FileText, change: '+12%' },
        { label: 'Resolved', value: stats?.totalFound || 0, color: '#10B981', icon: ShieldCheck, change: '+5%' },
        { label: 'Pending Review', value: stats?.pendingClaims || 0, color: '#F0A500', icon: Clock, change: '-2%' },
        { label: 'Fraud Alerts', value: stats?.restrictedUsers || 0, color: '#ef4444', icon: AlertTriangle, change: '+1 alert' },
    ]

    return (
        <div className="min-h-screen flex bg-[#F4F5F7] text-[#1C2A59] relative overflow-hidden">

            {/* Premium Frosted Sidebar */}
            <aside className="w-64 h-screen hidden lg:flex flex-col justify-between border-r sticky top-0 z-50 shrink-0 bg-white border-gray-200">
                <div>
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-200">
                                <ShieldAlert size={20} className="text-[#1C2A59]" />
                            </div>
                            <div>
                                <h1 className="font-bold text-[#1C2A59] tracking-wide">Command<br />Center</h1>
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
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${item.active ? 'bg-amber-50 border border-amber-200' : 'hover:bg-gray-50 border border-transparent'}`}>
                                <item.icon size={18} className={`transition-colors ${item.active ? 'text-[#F0A500]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                <span className={`text-sm font-semibold transition-colors ${item.active ? 'text-[#1C2A59]' : 'text-gray-500 group-hover:text-gray-700'}`}>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1C2A59] to-[#3E4A56] flex items-center justify-center font-bold text-xs text-white">
                            A
                        </div>
                        <div className="text-sm">
                            <p className="font-bold text-[#1C2A59] leading-tight">Admin System</p>
                            <p className="text-[10px] text-[#F0A500] uppercase tracking-wider font-bold">Authorized</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-gray-50 text-gray-500 hover:text-gray-700">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Workspace */}
            <main className="flex-1 w-full min-h-screen relative z-10 p-6 md:p-8 overflow-y-auto">
                {/* Mobile Top Bar */}
                <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <ShieldAlert size={24} className="text-[#F0A500]" />
                        <span className="font-bold text-lg text-[#1C2A59]">Admin Network</span>
                    </div>
                </div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    {loading ? (
                        [...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl border border-gray-100 bg-white shadow-sm animate-pulse" />)
                    ) : (
                        statCards.map((card, idx) => (
                            <div key={idx} className="rounded-2xl p-6 border border-gray-200 bg-white relative overflow-hidden group transition-transform hover:-translate-y-1 shadow-sm">
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="p-2.5 rounded-lg border border-gray-100 bg-gray-50 shadow-sm">
                                        <card.icon size={20} color={card.color} />
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-50 border border-gray-100 flex items-center gap-1 text-gray-600">
                                        <ArrowUpRight size={12} color={card.color} /> {card.change}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black text-[#1C2A59] mb-1 relative z-10">{card.value}</h3>
                                <p className="text-xs font-bold uppercase tracking-wider relative z-10 text-[#3E4A56]">{card.label}</p>
                            </div>
                        ))
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
                    {/* Central Area Chart */}
                    <div className="rounded-3xl border border-gray-200 bg-white flex flex-col p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                            <h2 className="text-lg font-bold text-[#1C2A59] tracking-wide flex items-center gap-2">
                                <Activity size={18} className="text-[#1C2A59]" /> Lost vs. Found Trajectory
                            </h2>
                            <div className="relative">
                                <select
                                    className="appearance-none text-xs font-bold px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-[#1C2A59] transition-colors cursor-pointer outline-none border border-gray-200"
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(Number(e.target.value))}>
                                    <option value={7} className="bg-white text-[#1C2A59]">Last 7 Days</option>
                                    <option value={30} className="bg-white text-[#1C2A59]">Last 30 Days</option>
                                    <option value={90} className="bg-white text-[#1C2A59]">Last 90 Days</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex-1 min-h-[300px] w-full relative pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trajectoryData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1C2A59" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#1C2A59" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F0A500" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#F0A500" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                        minTickGap={30}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(255,255,255,0.95)',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                                        labelStyle={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}
                                    />
                                    <Area type="monotone" dataKey="lost" name="Lost Items" stroke="#1C2A59" strokeWidth={3} fill="url(#colorLost)" activeDot={{ r: 6, fill: '#1C2A59', stroke: '#fff', strokeWidth: 2 }} animationDuration={1500} />
                                    <Area type="monotone" dataKey="found" name="Found Items" stroke="#F0A500" strokeWidth={3} fill="url(#colorFound)" activeDot={{ r: 6, fill: '#F0A500', stroke: '#fff', strokeWidth: 2 }} animationDuration={1500} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex gap-6 mt-6 justify-center">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#1C2A59]" />
                                <span className="text-xs font-semibold text-[#3E4A56]">Lost Items Reported</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#F0A500]" />
                                <span className="text-xs font-semibold text-[#3E4A56]">Found Items Logged</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Activity Feed) */}
                    <div className="rounded-3xl border border-gray-200 bg-white p-6 overflow-hidden flex flex-col shadow-sm">
                        <h2 className="text-lg font-bold text-[#1C2A59] tracking-wide flex items-center gap-2 mb-6">
                            <Clock size={16} className="text-[#F0A500] animate-pulse" /> Live Activity Feed
                        </h2>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2" style={{ scrollbarWidth: 'thin' }}>
                            {activities.length > 0 ? (
                                activities.map((activity, i) => {
                                    const style = getActivityStyle(activity.action)
                                    return (
                                        <div key={i} className="p-4 rounded-xl border transition-colors hover:brightness-95"
                                            style={{ background: style.bg, borderColor: style.border }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: style.color }}>{style.label}</span>
                                                <span className="text-[10px] font-medium text-gray-500">{timeAgo(activity.createdAt)}</span>
                                            </div>
                                            <p className="text-xs font-medium leading-relaxed" style={{ color: activity.action.includes('SECURITY') ? '#ef4444' : '#1C2A59' }}>
                                                {activity.details}
                                            </p>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="py-12 text-center">
                                    <Activity size={32} className="mx-auto mb-4 opacity-20 text-gray-400" />
                                    <p className="text-xs text-gray-400 font-medium">No recent activity found</p>
                                </div>
                            )}
                        </div>

                        <button className="w-full mt-4 py-2 text-xs font-bold uppercase tracking-widest border-t border-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            Load historical feed
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
