'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import {
    FileText, ShieldAlert,
    Shield, Check, X, MessageCircle, ChevronDown, ChevronUp,
    Filter, AlertTriangle, ChevronRight, Sparkles,
    ArrowUpDown, User as UserIcon, History, Trophy, Send,
    Eye, MapPin, Calendar, Tag, Package, Unlock, Clock,
} from 'lucide-react'

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusPill({ status }) {
    const map = {
        under_review: { label: 'Under Review', bg: '#fef3c7', color: '#F0A500', border: 'transparent' },
        ai_matched: { label: 'AI Matched', bg: '#e0e7ff', color: '#1C2A59', border: 'transparent' },
        admin_review: { label: 'Info Requested', bg: '#ffedd5', color: '#f97316', border: 'transparent' },
        approved: { label: 'Approved', bg: '#d1fae5', color: '#10B981', border: 'transparent' },
        rejected: { label: 'Rejected', bg: '#fee2e2', color: '#ef4444', border: 'transparent' },
        completed: { label: 'Completed', bg: '#d1fae5', color: '#10B981', border: 'transparent' },
    }
    const s = map[status] || { label: status, bg: '#f3f4f6', color: '#6b7280', border: 'transparent' }
    return (
        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
            style={{ background: s.bg, color: s.color, borderColor: s.border }}>
            {s.label}
        </span>
    )
}

function AiScoreWidget({ score, level, reasons = [], redFlags = [], suggestion }) {
    const levelMap = {
        HIGH: { color: '#10B981', bg: '#d1fae5', label: 'HIGH MATCH' },
        MEDIUM: { color: '#3b82f6', bg: '#dbeafe', label: 'MEDIUM MATCH' },
        LOW: { color: '#F0A500', bg: '#fef3c7', label: 'LOW MATCH' },
        UNLIKELY: { color: '#ef4444', bg: '#fee2e2', label: 'UNLIKELY' },
        PENDING: { color: '#9ca3af', bg: '#f3f4f6', label: 'PENDING' },
    }
    const suggestMap = {
        approve: { color: '#10B981', label: '✓ Recommend: APPROVE' },
        review: { color: '#F0A500', label: '◉ Recommend: REVIEW' },
        reject: { color: '#ef4444', label: '✕ Recommend: REJECT' },
        pending: { color: '#9ca3af', label: '— Pending' },
    }
    const lv = levelMap[level] || levelMap.PENDING
    const sg = suggestMap[suggestion] || suggestMap.pending

    return (
        <div className="rounded-2xl p-5 border bg-white border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#F0A500]" />
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">AI Analysis</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: lv.bg, color: lv.color }}>
                    {lv.label}
                </span>
            </div>

            {/* Score bar */}
            <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-black" style={{ color: lv.color }}>{score ?? '—'}%</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-gray-100">
                    <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${score ?? 0}%`, background: `linear-gradient(90deg, ${lv.color}80, ${lv.color})` }} />
                </div>
                <span className="text-xs font-bold" style={{ color: sg.color }}>{sg.label}</span>
            </div>

            {/* Match reasons */}
            {reasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {reasons.map((r, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-green-50 text-green-600 border border-green-100">
                            ✓ {r}
                        </span>
                    ))}
                </div>
            )}

            {/* Red flags */}
            {redFlags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {redFlags.map((f, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100">
                            ⚠ {f}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Confirm Action Modal ─────────────────────────────────────────────────────
function ConfirmModal({ action, claimId, foundItemTitle, onConfirm, onCancel, loading }) {
    const [note, setNote] = useState('')
    const [error, setError] = useState('')
    const isReject = action === 'reject'
    const isApprove = action === 'approve'
    const title = isApprove ? '✅ Approve Claim' : '❌ Reject Claim'
    const accentColor = isApprove ? '#10B981' : '#ef4444'
    const accentBg = isApprove ? '#d1fae5' : '#fee2e2'

    const submit = () => {
        if (isReject && !note.trim()) { setError('A rejection reason is required.'); return }
        setError('')
        onConfirm(claimId, action, note)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="rounded-3xl w-full max-w-lg p-7 space-y-5 bg-white border border-gray-200 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                        style={{ background: accentBg, borderColor: accentColor + '30' }}>
                        {isApprove ? <Check size={18} style={{ color: accentColor }} /> : <X size={18} style={{ color: accentColor }} />}
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-[#1C2A59]">{title}</h3>
                        <p className="text-xs font-medium mt-0.5 text-gray-500">
                            For: <span className="text-[#1C2A59]">{foundItemTitle}</span>
                        </p>
                    </div>
                </div>

                {isApprove && (
                    <div className="p-4 rounded-2xl border bg-red-50 border-red-100">
                        <p className="text-xs font-semibold text-red-600">
                            ⚠️ All other pending claims for this item will be automatically rejected and those users notified.
                        </p>
                    </div>
                )}

                <div>
                    <label className="text-xs font-black uppercase tracking-wider block mb-2 text-gray-400">
                        {isReject ? 'Rejection Reason *' : 'Admin Note (recommended)'}
                    </label>
                    <textarea
                        className="w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none min-h-[90px] transition-colors bg-white text-[#1C2A59]"
                        style={{ borderColor: error ? '#ef4444' : '#e5e7eb' }}
                        placeholder={isReject ? 'Explain why this claim does not meet the criteria...' : 'Add a message for the student (optional)...'}
                        value={note} onChange={e => { setNote(e.target.value); setError('') }}
                        autoFocus
                    />
                    {error && <p className="text-xs font-semibold mt-1.5 text-red-500">{error}</p>}
                </div>

                <div className="flex gap-3">
                    <button onClick={submit} disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: isApprove ? '#10B981' : '#ef4444', color: 'white' }}>
                        {loading ? <span className="animate-spin">⟳</span> : (isApprove ? <Check size={15} /> : <X size={15} />)}
                        {loading ? 'Processing...' : (isApprove ? 'Confirm Approval' : 'Confirm Rejection')}
                    </button>
                    <button onClick={onCancel} disabled={loading}
                        className="px-6 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Found Item Side Panel ────────────────────────────────────────────────────
function FoundItemPanel({ item, onClose }) {
    if (!item) return null
    return (
        <div className="fixed inset-0 z-40 flex justify-end bg-gray-900/60 backdrop-blur-sm"
            onClick={onClose}>
            <div className="h-full w-full max-w-md overflow-y-auto p-6 space-y-5 bg-white border-l border-gray-200 shadow-2xl"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h3 className="font-black text-lg text-[#1C2A59]">Found Item Details</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <X size={16} className="text-gray-400" />
                    </button>
                </div>

                {/* Image */}
                <div className="rounded-2xl overflow-hidden h-52 flex items-center justify-center bg-gray-50 border border-gray-100">
                    {item.photoUrl
                        ? <img src={item.photoUrl} alt={item.title} className="w-full h-full object-cover" />
                        : <div className="flex flex-col items-center gap-2">
                            <Package size={40} className="text-gray-300" />
                            <span className="text-xs text-gray-400">{item.category}</span>
                        </div>
                    }
                </div>

                {/* Details */}
                <div className="space-y-4">
                    <div>
                        <h4 className="font-bold text-lg text-[#1C2A59]">{item.title}</h4>
                        {item.description && <p className="text-sm mt-1 leading-relaxed text-gray-500">{item.description}</p>}
                    </div>
                    <div className="space-y-2.5">
                        {item.category && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Tag size={13} className="text-[#F0A500]" /> {item.category}
                            </div>
                        )}
                        {item.locationFound && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <MapPin size={13} className="text-[#008489]" /> {item.locationFound}
                            </div>
                        )}
                        {item.dateFound && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar size={13} className="text-[#10B981]" />
                                {new Date(item.dateFound).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        )}
                        {item.color && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="w-3 h-3 rounded-full border border-gray-200 shadow-sm" style={{ background: item.color }} />
                                Color: {item.color}
                            </div>
                        )}
                    </div>
                    {/* Keywords */}
                    {item.keywords?.length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">Keywords</p>
                            <div className="flex flex-wrap gap-1.5">
                                {item.keywords.map((k, i) => (
                                    <span key={i} className="text-[10px] px-2 py-1 rounded-lg font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                        {k}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Link href={`/found-items/${item._id}`} target="_blank"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold bg-[#1C2A59]/5 hover:bg-[#1C2A59]/10 text-[#1C2A59] border border-[#1C2A59]/10 transition-colors">
                    <Eye size={14} /> View Full Item Page
                </Link>
            </div>
        </div>
    )
}

// ─── Claim Card ───────────────────────────────────────────────────────────────
function ClaimCard({ claim, onAction, actionLoading }) {
    const [expanded, setExpanded] = useState(false)
    const [infoMode, setInfoMode] = useState(false)
    const [infoNote, setInfoNote] = useState('')
    const [infoError, setInfoError] = useState('')
    const [confirmAction, setConfirmAction] = useState(null)
    const isDone = ['approved', 'rejected', 'completed'].includes(claim.status)

    const handleInfoSubmit = () => {
        if (!infoNote.trim()) { setInfoError('Message cannot be empty.'); return }
        setInfoError('')
        onAction(claim._id, 'request_info', infoNote)
        setInfoNote('')
        setInfoMode(false)
    }

    return (
        <>
            {confirmAction && (
                <ConfirmModal
                    action={confirmAction}
                    claimId={claim._id}
                    foundItemTitle={claim.foundItemId?.title || 'item'}
                    onConfirm={(id, act, note) => { onAction(id, act, note); setConfirmAction(null) }}
                    onCancel={() => setConfirmAction(null)}
                    loading={actionLoading === claim._id}
                />
            )}
            <div className="rounded-2xl border overflow-hidden transition-all bg-white shadow-sm hover:shadow-md"
                style={{ borderColor: expanded ? '#F0A500' : '#e5e7eb' }}>
                {/* Claim row header */}
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(e => !e)}>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <UserIcon size={13} className="text-[#F0A500]" />
                            <span className="text-[#1C2A59] font-bold text-sm truncate">
                                {claim.claimantId?.name || claim.claimantName || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-400">
                                {claim.claimantId?.campusId && `· ${claim.claimantId.campusId}`}
                            </span>
                        </div>
                        <div className="text-xs text-gray-400">
                            {new Date(claim.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            {claim.claimType === 'direct' && <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-50 text-indigo-600 border border-indigo-100">Direct</span>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Compact AI score */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-gray-50 border-gray-100">
                            <Sparkles size={11} style={{ color: aiLevelColor(claim.aiMatchLevel) }} />
                            <span className="text-xs font-black" style={{ color: aiLevelColor(claim.aiMatchLevel) }}>
                                {claim.aiMatchScore ?? '—'}%
                            </span>
                        </div>
                        <StatusPill status={claim.status} />
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center border bg-gray-50 border-gray-200">
                            {expanded ? <ChevronUp size={12} className="text-gray-400" /> : <ChevronDown size={12} className="text-gray-400" />}
                        </div>
                    </div>
                </div>

                {/* Expanded detail */}
                {expanded && (
                    <div className="border-t px-5 pb-6 pt-5 space-y-5 border-gray-100">

                        {/* AI Score Widget */}
                        <AiScoreWidget
                            score={claim.aiMatchScore}
                            level={claim.aiMatchLevel || 'PENDING'}
                            reasons={claim.aiMatchReasons || []}
                            redFlags={claim.aiRedFlags || []}
                            suggestion={claim.aiSuggestedDecision}
                        />

                        {/* Claimant history */}
                        {claim.claimantHistory && (
                            <div className="rounded-xl p-4 border bg-gray-50 border-gray-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <History size={12} className="text-[#F0A500]" />
                                    <span className="text-xs font-black uppercase tracking-wider text-gray-500">Claimant History</span>
                                    {claim.claimantHistory.trustedFinder && (
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-yellow-200 bg-yellow-50 text-yellow-600">
                                            <Trophy size={8} className="inline mr-1" />TRUSTED FINDER
                                        </span>
                                    )}
                                    {claim.claimantHistory.accountStatus === 'restricted' && (
                                        <span className="text-[9px] font-bold text-red-600 uppercase">⛔ RESTRICTED</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    {[
                                        { v: claim.claimantHistory.totalClaims, l: 'Total', c: '#1C2A59' },
                                        { v: claim.claimantHistory.approvedClaims, l: 'Approved', c: '#10B981' },
                                        { v: claim.claimantHistory.rejectedClaims, l: 'Rejected', c: '#ef4444' },
                                        { v: `${claim.claimantHistory.warningCount}/3`, l: 'Warnings', c: claim.claimantHistory.warningCount > 0 ? '#F0A500' : '#1C2A59' },
                                    ].map((s, i) => (
                                        <div key={i} className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm">
                                            <p className="text-sm font-black" style={{ color: s.c }}>{s.v}</p>
                                            <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5 text-gray-400">{s.l}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Claim details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-xl p-4 border bg-gray-50 border-gray-100">
                                <span className="text-[10px] uppercase font-black tracking-wider block mb-2 text-gray-400">Ownership Explanation</span>
                                <p className="text-sm leading-relaxed text-[#1C2A59]">{claim.ownershipExplanation || 'Not provided'}</p>
                            </div>
                            <div className="rounded-xl p-4 border bg-gray-50 border-gray-100">
                                <span className="text-[10px] uppercase font-black tracking-wider block mb-2 text-gray-400">Identifying Details</span>
                                <p className="text-sm leading-relaxed text-[#1C2A59]">{claim.hiddenDetails || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            {claim.exactColorBrand && <span><strong className="text-gray-400">Color/Brand:</strong> {claim.exactColorBrand}</span>}
                            {claim.dateLost && <span><strong className="text-gray-400">Date Lost:</strong> {new Date(claim.dateLost).toLocaleDateString('en-GB')}</span>}
                            {claim.claimantId?.email && <span><strong className="text-gray-400">Email:</strong> {claim.claimantId.email}</span>}
                        </div>

                        {/* Admin note if already acted on */}
                        {claim.adminNote && isDone && (
                            <div className="p-3 rounded-xl border bg-gray-50 border-gray-100">
                                <p className="text-[10px] font-black uppercase tracking-wider mb-1 text-gray-400">Admin Note</p>
                                <p className="text-sm text-gray-600">{claim.adminNote}</p>
                            </div>
                        )}

                        {/* Action buttons */}
                        {!isDone && (
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setConfirmAction('approve')} disabled={actionLoading === claim._id}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-green-600 disabled:opacity-50 bg-green-500 text-white shadow-sm">
                                        <Check size={14} /> Approve
                                    </button>
                                    <button onClick={() => setConfirmAction('reject')} disabled={actionLoading === claim._id}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-red-600 disabled:opacity-50 bg-red-500 text-white shadow-sm">
                                        <X size={14} /> Reject
                                    </button>
                                    <button onClick={() => setInfoMode(m => !m)} disabled={actionLoading === claim._id}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-gray-100 disabled:opacity-50 bg-gray-50 text-gray-600 border border-gray-200">
                                        <MessageCircle size={14} /> Request Info
                                    </button>
                                </div>

                                {/* Inline request info form */}
                                {infoMode && (
                                    <div className="space-y-2 mt-4">
                                        <textarea
                                            className="w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none min-h-[72px] transition-colors bg-white text-[#1C2A59]"
                                            style={{ borderColor: infoError ? '#ef4444' : '#e5e7eb' }}
                                            placeholder="Type your message to the student..."
                                            value={infoNote}
                                            onChange={e => { setInfoNote(e.target.value); setInfoError('') }}
                                            autoFocus
                                        />
                                        {infoError && <p className="text-xs font-semibold text-red-500">{infoError}</p>}
                                        <div className="flex gap-2">
                                            <button onClick={handleInfoSubmit} disabled={actionLoading === claim._id}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors">
                                                <Send size={12} /> Send Message
                                            </button>
                                            <button onClick={() => { setInfoMode(false); setInfoNote(''); setInfoError('') }}
                                                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
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
        </>
    )
}

function aiLevelColor(level) {
    if (level === 'HIGH') return '#4ade80'
    if (level === 'MEDIUM') return '#60a5fa'
    if (level === 'LOW') return '#D4AF37'
    if (level === 'UNLIKELY') return '#ef4444'
    return 'rgba(245,246,250,0.4)'
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminClaimsPage() {
    const { user } = useAuth()
    const [grouped, setGrouped] = useState([])
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [sortBy, setSortBy] = useState('score')
    const [actionLoading, setActionLoading] = useState(null)
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [filterOpen, setFilterOpen] = useState(false)
    const [sidePanelItem, setSidePanelItem] = useState(null)
    const [rescoring, setRescoring] = useState(false)
    const filterRef = useRef(null)
    const [datePreset, setDatePreset] = useState('all')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [dateDropOpen, setDateDropOpen] = useState(false)
    const dateRef = useRef(null)

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
            if (dateRef.current && !dateRef.current.contains(e.target)) setDateDropOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Date preset helpers
    const applyDatePreset = (preset) => {
        setDatePreset(preset)
        const today = new Date()
        const fmt = (d) => d.toISOString().split('T')[0]
        if (preset === 'today') { setDateFrom(fmt(today)); setDateTo(fmt(today)) }
        else if (preset === '7days') { const d = new Date(); d.setDate(d.getDate() - 7); setDateFrom(fmt(d)); setDateTo(fmt(today)) }
        else if (preset === '30days') { const d = new Date(); d.setDate(d.getDate() - 30); setDateFrom(fmt(d)); setDateTo(fmt(today)) }
        else if (preset === 'all') { setDateFrom(''); setDateTo('') }
        if (preset !== 'custom') setDateDropOpen(false)
    }
    const dateLabel = datePreset === 'all' ? 'All Dates' : datePreset === 'today' ? 'Today' : datePreset === '7days' ? 'Last 7 Days' : datePreset === '30days' ? 'Last 30 Days' : dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : 'Custom'

    const fetchClaims = useCallback(() => {
        if (!user) return
        setLoading(true)
        const qs = new URLSearchParams()
        if (filter) qs.set('status', filter)
        qs.set('sort', sortBy)
        if (dateFrom) qs.set('dateFrom', dateFrom)
        if (dateTo) qs.set('dateTo', dateTo)
        fetch(`/api/admin/claims?${qs}`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => {
                setGrouped(d.grouped || [])
                setStats(d.stats || { total: 0, pending: 0, approved: 0, rejected: 0 })
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [user, filter, sortBy, dateFrom, dateTo])

    useEffect(() => { fetchClaims() }, [fetchClaims])

    const handleAction = async (claimId, action, adminNote) => {
        setActionLoading(claimId)
        setSuccessMsg('')
        setErrorMsg('')
        try {
            const res = await fetch('/api/admin/claims', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claimId, action, adminNote }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            const labels = { approve: 'approved ✅', reject: 'rejected', request_info: 'sent for review' }
            setSuccessMsg(`Claim ${labels[action] || action} successfully!`)
            setTimeout(() => setSuccessMsg(''), 4000)
            fetchClaims()
        } catch (err) {
            setErrorMsg(err.message)
            setTimeout(() => setErrorMsg(''), 5000)
        } finally {
            setActionLoading(null)
        }
    }

    const handleRescore = async () => {
        setRescoring(true)
        setSuccessMsg('')
        setErrorMsg('')
        try {
            const res = await fetch('/api/admin/claims/rescore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setSuccessMsg(`AI re-scored ${data.scored} claim${data.scored !== 1 ? 's' : ''} successfully!`)
            setTimeout(() => setSuccessMsg(''), 5000)
            fetchClaims()
        } catch (err) {
            setErrorMsg(err.message)
            setTimeout(() => setErrorMsg(''), 5000)
        } finally {
            setRescoring(false)
        }
    }

    const STATUS_FILTERS = [
        { value: '', label: 'All Statuses' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'ai_matched', label: 'AI Matched' },
        { value: 'admin_review', label: 'Info Requested' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
    ]
    const currentFilter = STATUS_FILTERS.find(f => f.value === filter) || STATUS_FILTERS[0]

    return (
        <>
            {/* Side Panel */}
            {sidePanelItem && <FoundItemPanel item={sidePanelItem} onClose={() => setSidePanelItem(null)} />}

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">
                            <Link href="/admin/dashboard" className="hover:text-[#1C2A59] transition-colors">Dashboard</Link>
                            <ChevronRight size={12} />
                            <span className="text-[#F0A500]">Claim Management</span>
                        </div>
                        <h2 className="text-2xl font-black text-[#1C2A59] flex items-center gap-3 tracking-wide">
                            <FileText size={24} className="text-[#F0A500]" /> Claim Management
                        </h2>
                        <p className="text-sm mt-1 font-medium text-gray-500">
                            Review, approve, or reject student item claims — grouped by found item
                        </p>
                    </div>

                    {/* Sort + Filter + Rescore */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <button onClick={handleRescore} disabled={rescoring}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50 bg-indigo-50 text-indigo-600 border border-indigo-100">
                            {rescoring ? <span className="animate-spin inline-block">⟳</span> : <Sparkles size={12} />}
                            {rescoring ? 'Scoring...' : 'Re-score with AI'}
                        </button>
                        <div className="flex items-center gap-1 p-1 rounded-xl border bg-white border-gray-200 shadow-sm">
                            <ArrowUpDown size={13} className="ml-2 text-gray-400" />
                            {[{ v: 'score', l: 'AI Score' }, { v: 'date', l: 'Date' }].map(({ v, l }) => (
                                <button key={v} onClick={() => setSortBy(v)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        sortBy === v
                                        ? 'bg-[#F0A500]/10 text-[#F0A500] border-[#F0A500]/20'
                                        : 'text-gray-500 border-transparent hover:text-gray-700'
                                    }`} style={{ borderWidth: '1px' }}>
                                    {l}
                                </button>
                            ))}
                        </div>

                        {/* Custom filter dropdown */}
                        <div ref={filterRef} className="relative">
                            <button onClick={() => setFilterOpen(o => !o)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border bg-white border-gray-200 text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                                style={{ minWidth: '150px' }}>
                                <Filter size={13} className="text-gray-400" />
                                {currentFilter.label}
                                <ChevronDown size={13} className={`ml-auto transition-transform ${filterOpen ? 'rotate-180' : ''} text-gray-400`} />
                            </button>
                            {filterOpen && (
                                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border overflow-hidden z-30 shadow-xl bg-white border-gray-200">
                                    {STATUS_FILTERS.map(f => (
                                        <button key={f.value}
                                            onClick={() => { setFilter(f.value); setFilterOpen(false) }}
                                            className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50 ${
                                                filter === f.value ? 'text-[#F0A500] bg-[#F0A500]/5' : 'text-gray-600'
                                            }`}>
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Date Filter Dropdown */}
                        <div ref={dateRef} className="relative">
                            <button onClick={() => setDateDropOpen(o => !o)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border bg-white border-gray-200 text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                                style={{ minWidth: '150px' }}>
                                <Calendar size={13} className="text-[#F0A500]" />
                                {dateLabel}
                                <ChevronDown size={13} className={`ml-auto transition-transform ${dateDropOpen ? 'rotate-180' : ''} text-gray-400`} />
                            </button>
                            {dateDropOpen && (
                                <div className="absolute right-0 top-full mt-1 w-64 rounded-xl border overflow-hidden z-30 shadow-xl bg-white border-gray-200 p-3 space-y-2">
                                    {[{ v: 'all', l: 'All Dates' }, { v: 'today', l: '📅 Today' }, { v: '7days', l: '📆 Last 7 Days' }, { v: '30days', l: '🗓 Last 30 Days' }, { v: 'custom', l: '✏️ Custom Range' }].map(({ v, l }) => (
                                        <button key={v} onClick={() => applyDatePreset(v)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                                datePreset === v ? 'bg-[#1C2A59] text-white' : 'text-gray-600 hover:bg-gray-50'
                                            }`}>
                                            {l}
                                        </button>
                                    ))}
                                    {datePreset === 'custom' && (
                                        <div className="pt-2 border-t border-gray-100 space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">From</label>
                                                    <input type="date" className="w-full px-2 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-[#1C2A59] focus:outline-none focus:border-[#F0A500]" value={dateFrom} onChange={e => setDateFrom(e.target.value)} max={dateTo || undefined} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">To</label>
                                                    <input type="date" className="w-full px-2 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-[#1C2A59] focus:outline-none focus:border-[#F0A500]" value={dateTo} onChange={e => setDateTo(e.target.value)} min={dateFrom || undefined} />
                                                </div>
                                            </div>
                                            <button onClick={() => setDateDropOpen(false)}
                                                disabled={!dateFrom || !dateTo}
                                                className="w-full py-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                style={{ background: 'linear-gradient(135deg, #1C2A59, #2d4080)' }}>
                                                Apply Range
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Toast messages */}
                {successMsg && (
                    <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold"
                        style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
                        <Check size={16} /> {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                        <AlertTriangle size={16} /> {errorMsg}
                    </div>
                )}

                {/* Stats */}
                {!loading && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total Claims', value: stats.total, color: 'bg-blue-500', text: 'text-blue-500' },
                            { label: 'Pending Review', value: stats.pending, color: 'bg-[#F0A500]', text: 'text-[#F0A500]' },
                            { label: 'Approved', value: stats.approved, color: 'bg-green-500', text: 'text-green-500' },
                            { label: 'Rejected', value: stats.rejected, color: 'bg-red-500', text: 'text-red-500' },
                        ].map((s, i) => (
                            <div key={i} className="rounded-2xl p-5 border relative overflow-hidden bg-white border-gray-200 shadow-sm">
                                <div className={`absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-10 rounded-full ${s.color}`} />
                                <p className={`text-3xl font-black relative z-10 ${s.text}`}>{s.value}</p>
                                <p className="text-xs font-bold uppercase tracking-wider mt-1 relative z-10 text-gray-500">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Claims grouped by found item */}
                {loading ? (
                    <div className="space-y-5">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="rounded-3xl h-40 animate-pulse border bg-white border-gray-200" />
                        ))}
                    </div>
                ) : grouped.length === 0 ? (
                    <div className="rounded-3xl border p-16 text-center bg-white border-gray-200 shadow-sm">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-[#1C2A59] font-bold text-lg">No claims to review</h3>
                        <p className="text-sm mt-2 text-gray-400">
                            All claims have been processed or none exist with the selected filter.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {grouped.map((group, gi) => {
                            const fi = group.foundItem
                            const pendingCount = group.claims.filter(c => !['approved', 'rejected', 'completed'].includes(c.status)).length
                            return (
                                <div key={fi?._id?.toString() || gi} className="rounded-3xl border overflow-hidden shadow-sm bg-gray-50 border-gray-200">

                                    {/* Found Item Header */}
                                    <div className="p-5 border-b bg-white border-gray-200">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            {/* Thumbnail */}
                                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-gray-100 border border-gray-200">
                                                {fi?.photoUrl
                                                    ? <img src={fi.photoUrl} alt={fi.title} className="w-full h-full object-cover" />
                                                    : <Package size={24} className="text-gray-400" />
                                                }
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h3 className="text-[#1C2A59] font-black text-base">{fi?.title || 'Unknown Found Item'}</h3>
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F0A500]/10 text-[#F0A500] border border-[#F0A500]/20">
                                                        Found Item
                                                    </span>
                                                    {pendingCount > 0 && (
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                                                            🎯 {pendingCount} Pending
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                    {fi?.category && <span className="flex items-center gap-1"><Tag size={10} /> {fi.category}</span>}
                                                    {fi?.locationFound && <span className="flex items-center gap-1"><MapPin size={10} /> {fi.locationFound}</span>}
                                                    {fi?.dateFound && <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(fi.dateFound).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                                </div>
                                                {fi?.keywords?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {fi.keywords.slice(0, 5).map((k, i) => (
                                                            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-gray-100 text-gray-500 border border-gray-200">{k}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-sm font-black text-gray-500">
                                                    {group.claims.length} claim{group.claims.length !== 1 ? 's' : ''}
                                                </span>
                                                <button onClick={() => setSidePanelItem(fi)}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 bg-gray-100 text-[#1C2A59] border border-gray-200 hover:bg-gray-200">
                                                    <Eye size={12} /> View Item
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Claims list within group */}
                                    <div className="p-4 space-y-3">
                                        {group.claims.map(claim => (
                                            <ClaimCard
                                                key={claim._id}
                                                claim={claim}
                                                onAction={handleAction}
                                                actionLoading={actionLoading}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
        </>
    )
}
