'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard, FileText, ShieldAlert, Activity,
    Shield, Check, X, MessageCircle, ChevronDown, ChevronUp,
    Filter, Clock, LogOut, AlertTriangle, ChevronRight, Sparkles,
    ArrowUpDown, User as UserIcon, History, Trophy, Send, ClipboardCheck
} from 'lucide-react'

function StatusPill({ status }) {
    const map = {
        ai_matched: { label: 'AI Matched', color: '#D4AF37', bg: 'rgba(212,175,55,0.12)', border: 'rgba(212,175,55,0.3)' },
        under_review: { label: 'Under Review', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)' },
        admin_review: { label: 'Admin Review', color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.3)' },
        approved: { label: 'Approved', color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' },
        rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
        completed: { label: 'Completed', color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' },
    }
    const s = map[status] || { label: status, color: '#a1a1aa', bg: 'rgba(161,161,170,0.1)', border: 'rgba(161,161,170,0.2)' }
    return (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border"
            style={{ color: s.color, background: s.bg, borderColor: s.border }}>
            {s.label}
        </span>
    )
}

export default function AdminClaimsPage() {
    const { user, loading: authLoading, isAdmin, logout } = useAuth()
    const router = useRouter()
    const [claims, setClaims] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [expanded, setExpanded] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const [adminNote, setAdminNote] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [sortBy, setSortBy] = useState('score')
    const [verifyClaimId, setVerifyClaimId] = useState(null)
    const [verifyQuestions, setVerifyQuestions] = useState([])
    const [sendingForm, setSendingForm] = useState(false)

    const TEMPLATE_QUESTIONS = [
        'Describe at least 3 unique identifying marks or features of this item that are not visible in photos.',
        'Where and when exactly did you lose this item? Include the building, floor, and approximate time.',
        'What was inside the item or attached to it? (e.g., contents of a bag, keychain on keys)',
        'Can you provide proof of purchase, serial number, or any ownership documentation?',
        'Describe the exact condition of the item (scratches, dents, wear marks).',
    ]

    useEffect(() => {
        if (!user) return
        setLoading(true)
        const qs = new URLSearchParams()
        if (filter) qs.set('status', filter)
        qs.set('sort', sortBy)
        fetch(`/api/admin/claims?${qs}`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => setClaims(d.claims || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [user, filter, sortBy])

    const handleAction = async (claimId, action) => {
        setActionLoading(claimId)
        setSuccessMsg('')
        try {
            const res = await fetch('/api/admin/claims', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claimId, action, adminNote }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setSuccessMsg(`Claim ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'sent for review'} successfully!`)
            setClaims(prev => prev.map(c => c._id === claimId ? { ...c, status: data.claim.status } : c))
            setAdminNote('')
            setTimeout(() => setSuccessMsg(''), 4000)
        } catch (err) {
            alert(err.message)
        } finally {
            setActionLoading(null)
        }
    }

    if (authLoading) return <div className="min-h-screen" style={{ backgroundColor: '#0B0F19' }} />
    if (!user || !isAdmin) { router.push('/login'); return null }

    const scoreColor = (s) => s >= 70 ? '#4ade80' : s >= 40 ? '#D4AF37' : '#ef4444'

    const navItems = [
        { name: 'Overview', icon: LayoutDashboard, href: '/admin/dashboard' },
        { name: 'Claim Management', icon: FileText, href: '/admin/claims', active: true },
        { name: 'User Moderation', icon: ShieldAlert, href: '/admin/users' },
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
                            <span style={{ color: '#D4AF37' }}>Claim Management</span>
                        </div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-wide">
                            <FileText size={24} style={{ color: '#D4AF37' }} />
                            Claim Management
                        </h2>
                        <p className="text-sm mt-1 font-medium" style={{ color: 'rgba(245,246,250,0.5)' }}>
                            Review, approve, or reject student item claims
                        </p>
                    </div>

                    {/* Filter & Sort */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
                            <ArrowUpDown size={14} style={{ color: 'rgba(245,246,250,0.4)' }} />
                            <button onClick={() => setSortBy('score')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${sortBy === 'score' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                                style={sortBy === 'score' ? { background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' } : { border: '1px solid transparent' }}>
                                AI Score
                            </button>
                            <button onClick={() => setSortBy('date')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${sortBy === 'date' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                                style={sortBy === 'date' ? { background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.3)' } : { border: '1px solid transparent' }}>
                                Date
                            </button>
                        </div>
                        <Filter size={14} style={{ color: 'rgba(245,246,250,0.4)' }} />
                        <select
                            className="px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none"
                            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#F5F6FA' }}
                            value={filter} onChange={e => setFilter(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="under_review">Under Review</option>
                            <option value="ai_matched">AI Matched</option>
                            <option value="admin_review">Admin Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Success Banner */}
                {successMsg && (
                    <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold"
                        style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
                        <Check size={16} /> {successMsg}
                    </div>
                )}

                {/* Stats Row */}
                {!loading && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total Claims', value: claims.length, color: '#60a5fa' },
                            { label: 'Pending Review', value: claims.filter(c => ['ai_matched', 'under_review', 'admin_review'].includes(c.status)).length, color: '#D4AF37' },
                            { label: 'Approved', value: claims.filter(c => c.status === 'approved').length, color: '#4ade80' },
                            { label: 'Rejected', value: claims.filter(c => c.status === 'rejected').length, color: '#ef4444' },
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

                {/* Claims List */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="rounded-2xl h-20 animate-pulse border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }} />
                        ))}
                    </div>
                ) : claims.length === 0 ? (
                    <div className="rounded-3xl border p-16 text-center" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-white font-bold text-lg">No claims to review</h3>
                        <p className="text-sm mt-2" style={{ color: 'rgba(245,246,250,0.4)' }}>All claims have been processed or none exist with the selected filter.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {claims.map(c => (
                            <div key={c._id} className="rounded-2xl border overflow-hidden transition-all"
                                style={{ background: 'rgba(255,255,255,0.02)', borderColor: expanded === c._id ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)' }}>

                                {/* Claim Row */}
                                <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                    onClick={() => setExpanded(expanded === c._id ? null : c._id)}>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <span className="text-white font-bold text-sm truncate">{c.lostItemId?.title || 'Unknown Item'}</span>
                                            <ChevronRight size={14} style={{ color: 'rgba(245,246,250,0.3)' }} />
                                            <span className="font-medium text-sm truncate" style={{ color: 'rgba(245,246,250,0.6)' }}>{c.foundItemId?.title || 'Unknown Found Item'}</span>
                                        </div>
                                        <div className="text-xs font-medium" style={{ color: 'rgba(245,246,250,0.4)' }}>
                                            by {c.claimantName || c.claimant?.name || 'Unknown'} · {new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {c.aiMatchScore != null && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border"
                                                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                                                <Sparkles size={12} style={{ color: scoreColor(c.aiMatchScore) }} />
                                                <span className="text-xs font-bold" style={{ color: scoreColor(c.aiMatchScore) }}>
                                                    {c.aiMatchScore}% AI
                                                </span>
                                            </div>
                                        )}
                                        <StatusPill status={c.status} />
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center border"
                                            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                                            {expanded === c._id
                                                ? <ChevronUp size={14} style={{ color: 'rgba(245,246,250,0.5)' }} />
                                                : <ChevronDown size={14} style={{ color: 'rgba(245,246,250,0.5)' }} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Detail Panel */}
                                {expanded === c._id && (
                                    <div className="border-t px-5 pb-6 pt-5 space-y-5"
                                        style={{ borderTopColor: 'rgba(255,255,255,0.06)' }}>

                                        {/* 🚨 Conflict Alert */}
                                        {c.hasConflict && (
                                            <div className="rounded-2xl p-4 border flex items-start gap-3"
                                                style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>
                                                <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                                                <div>
                                                    <p className="text-sm font-bold text-red-400">⚠ Conflict Alert: {c.conflictCount} claims for this item</p>
                                                    <p className="text-xs mt-1" style={{ color: 'rgba(245,246,250,0.5)' }}>
                                                        Multiple users have claimed this found item. Consider sending verification forms to confirm the true owner.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* User History Panel */}
                                        {c.claimantHistory && (
                                            <div className="rounded-2xl p-5 border"
                                                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <UserIcon size={14} style={{ color: '#D4AF37' }} />
                                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(245,246,250,0.5)' }}>Claimant History</span>
                                                    {c.claimantHistory.trustedFinder && (
                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border" style={{ color: '#D4AF37', background: 'rgba(212,175,55,0.1)', borderColor: 'rgba(212,175,55,0.3)' }}>
                                                            <Trophy size={8} className="inline mr-1" />TRUSTED FINDER
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                        <p className="text-lg font-black text-white">{c.claimantHistory.totalClaims}</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(245,246,250,0.4)' }}>Total Claims</p>
                                                    </div>
                                                    <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(74,222,128,0.05)' }}>
                                                        <p className="text-lg font-black" style={{ color: '#4ade80' }}>{c.claimantHistory.approvedClaims}</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(245,246,250,0.4)' }}>Approved</p>
                                                    </div>
                                                    <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)' }}>
                                                        <p className="text-lg font-black" style={{ color: '#ef4444' }}>{c.claimantHistory.rejectedClaims}</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(245,246,250,0.4)' }}>Rejected</p>
                                                    </div>
                                                    <div className="text-center p-3 rounded-xl" style={{ background: c.claimantHistory.warningCount > 0 ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.03)' }}>
                                                        <p className="text-lg font-black" style={{ color: c.claimantHistory.warningCount > 0 ? '#f97316' : 'white' }}>{c.claimantHistory.warningCount}/3</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(245,246,250,0.4)' }}>Warnings</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'rgba(245,246,250,0.4)' }}>
                                                    <span className="flex items-center gap-1"><History size={10} /> Member since {new Date(c.claimantHistory.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                                                    {c.claimantHistory.accountStatus === 'restricted' && (
                                                        <span className="text-red-400 font-bold uppercase tracking-wider">⛔ RESTRICTED ACCOUNT</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Score Bar */}
                                        {c.aiMatchScore != null && (
                                            <div className="rounded-2xl p-5 border"
                                                style={{ background: 'rgba(26,26,100,0.15)', borderColor: 'rgba(26,26,100,0.4)' }}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(245,246,250,0.5)' }}>AI Analysis</span>
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles size={14} color="#D4AF37" />
                                                        <span className="text-sm font-black" style={{ color: scoreColor(c.aiMatchScore) }}>
                                                            {c.aiMatchScore}% Match · {c.aiRiskScore}% Risk
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                                    <div className="h-full rounded-full transition-all" style={{ width: `${c.aiMatchScore}%`, background: `linear-gradient(90deg, ${scoreColor(c.aiMatchScore)}, ${scoreColor(c.aiMatchScore)}80)` }} />
                                                </div>
                                                {c.aiSuggestedDecision && (
                                                    <p className="text-xs mt-2 font-semibold" style={{ color: 'rgba(245,246,250,0.6)' }}>
                                                        Suggestion: <span className="text-white">{c.aiSuggestedDecision}</span>
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="rounded-xl p-4 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                                <span className="text-[10px] uppercase font-bold tracking-wider block mb-2" style={{ color: 'rgba(245,246,250,0.4)' }}>Ownership Explanation</span>
                                                <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(245,246,250,0.8)' }}>{c.ownershipExplanation || 'Not provided'}</p>
                                            </div>
                                            <div className="rounded-xl p-4 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                                <span className="text-[10px] uppercase font-bold tracking-wider block mb-2" style={{ color: 'rgba(245,246,250,0.4)' }}>Hidden Identifying Details</span>
                                                <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(245,246,250,0.8)' }}>{c.hiddenDetails || 'Not provided'}</p>
                                            </div>
                                        </div>

                                        {c.exactColorBrand && (
                                            <p className="text-sm" style={{ color: 'rgba(245,246,250,0.6)' }}>
                                                <span className="font-bold text-white/40">Color/Brand: </span>{c.exactColorBrand}
                                            </p>
                                        )}

                                        {/* Admin Actions */}
                                        {!['approved', 'rejected', 'completed'].includes(c.status) && (
                                            <div className="space-y-4 pt-2 border-t" style={{ borderTopColor: 'rgba(255,255,255,0.05)' }}>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'rgba(245,246,250,0.5)' }}>
                                                        Admin Note (optional)
                                                    </label>
                                                    <textarea
                                                        className="w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none min-h-[72px]"
                                                        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#F5F6FA' }}
                                                        placeholder="Add a note for the student..."
                                                        value={adminNote}
                                                        onChange={e => setAdminNote(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    <button onClick={() => handleAction(c._id, 'approve')} disabled={actionLoading === c._id}
                                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                                                        style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                                                        <Check size={14} /> Approve Claim
                                                    </button>
                                                    <button onClick={() => handleAction(c._id, 'reject')} disabled={actionLoading === c._id}
                                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                                                        style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                                                        <X size={14} /> Reject Claim
                                                    </button>
                                                    <button onClick={() => handleAction(c._id, 'request_info')} disabled={actionLoading === c._id}
                                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                                                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(245,246,250,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                        <MessageCircle size={14} /> Request More Info
                                                    </button>
                                                    {c.hasConflict && (
                                                        <button onClick={() => { setVerifyClaimId(c._id); setVerifyQuestions([]) }}
                                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                                                            style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}>
                                                            <ClipboardCheck size={14} /> Send Verification Form
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Verification Form Builder */}
                                                {verifyClaimId === c._id && (
                                                    <div className="mt-4 rounded-2xl p-5 border space-y-4"
                                                        style={{ background: 'rgba(168,85,247,0.05)', borderColor: 'rgba(168,85,247,0.2)' }}>
                                                        <div className="flex items-center gap-2">
                                                            <ClipboardCheck size={16} style={{ color: '#a855f7' }} />
                                                            <span className="text-sm font-bold text-white">Select Verification Questions</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {TEMPLATE_QUESTIONS.map((q, i) => (
                                                                <label key={i} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl transition-colors hover:bg-white/5">
                                                                    <input type="checkbox" className="mt-1 accent-purple-500"
                                                                        checked={verifyQuestions.includes(q)}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) setVerifyQuestions(prev => [...prev, q])
                                                                            else setVerifyQuestions(prev => prev.filter(x => x !== q))
                                                                        }} />
                                                                    <span className="text-sm" style={{ color: 'rgba(245,246,250,0.7)' }}>{q}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button disabled={verifyQuestions.length === 0 || sendingForm}
                                                                onClick={async () => {
                                                                    setSendingForm(true)
                                                                    try {
                                                                        const res = await fetch('/api/admin/verification-forms', {
                                                                            method: 'POST',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ claimId: c._id, questions: verifyQuestions }),
                                                                            credentials: 'include'
                                                                        })
                                                                        const data = await res.json()
                                                                        if (!res.ok) throw new Error(data.error)
                                                                        setSuccessMsg('Verification form sent successfully!')
                                                                        setVerifyClaimId(null)
                                                                        setTimeout(() => setSuccessMsg(''), 4000)
                                                                    } catch (err) { alert(err.message) }
                                                                    finally { setSendingForm(false) }
                                                                }}
                                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                                                                style={{ background: 'rgba(168,85,247,0.2)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.35)' }}>
                                                                <Send size={14} /> {sendingForm ? 'Sending...' : `Send Form (${verifyQuestions.length} questions)`}
                                                            </button>
                                                            <button onClick={() => setVerifyClaimId(null)}
                                                                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white transition-colors">
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
