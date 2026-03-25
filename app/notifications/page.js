'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import WarningAppealModal from '@/components/WarningAppealModal'
import Link from 'next/link'
import {
    Bell, CheckCircle2, Sparkles, AlertCircle, AlertTriangle,
    ShieldAlert, XCircle, Unlock, Clock, Filter, Eye, ChevronRight,
    Target, Package, MapPin, Tag, MailQuestion, Trash2, CheckCheck,
    ArrowLeft, Loader2, Info,
} from 'lucide-react'

function timeAgo(dateStr) {
    if (!dateStr) return ''
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getNotifConfig(type) {
    const configs = {
        ai_match: { icon: Sparkles, color: '#b45309', bg: '#fef3c7', border: '#fde68a', label: 'AI Match', emoji: '🤖' },
        claim_update: { icon: CheckCircle2, color: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe', label: 'Claim Update', emoji: '📋' },
        claim_approved: { icon: CheckCircle2, color: '#15803d', bg: '#dcfce7', border: '#bbf7d0', label: 'Approved', emoji: '✅' },
        claim_rejected: { icon: XCircle, color: '#dc2626', bg: '#fee2e2', border: '#fecaca', label: 'Rejected', emoji: '❌' },
        claim_info_requested: { icon: MailQuestion, color: '#c2410c', bg: '#ffedd5', border: '#fed7aa', label: 'Info Requested', emoji: 'ℹ️' },
        warning: { icon: AlertTriangle, color: '#b45309', bg: '#fef3c7', border: '#fde68a', label: 'Warning', emoji: '⚠️' },
        restriction: { icon: ShieldAlert, color: '#dc2626', bg: '#fee2e2', border: '#fecaca', label: 'Restricted', emoji: '🔒' },
        unrestricted: { icon: Unlock, color: '#15803d', bg: '#dcfce7', border: '#bbf7d0', label: 'Unrestricted', emoji: '🔓' },
        appeal_approved: { icon: CheckCircle2, color: '#15803d', bg: '#dcfce7', border: '#bbf7d0', label: 'Appeal Approved', emoji: '✅' },
        appeal_rejected: { icon: XCircle, color: '#dc2626', bg: '#fee2e2', border: '#fecaca', label: 'Appeal Rejected', emoji: '❌' },
        system: { icon: Info, color: '#7c3aed', bg: '#ede9fe', border: '#ddd6fe', label: 'System', emoji: '🔔' },
        system_update: { icon: Info, color: '#7c3aed', bg: '#ede9fe', border: '#ddd6fe', label: 'System', emoji: '🔔' },
    }
    return configs[type] || { icon: AlertCircle, color: '#1C2A59', bg: '#e0e7ff', border: '#c7d2fe', label: 'Update', emoji: '🔔' }
}

function ItemPreview({ item, type = 'found' }) {
    if (!item) return null
    const href = type === 'lost' ? `/lost-items/${item._id}` : `/found-items/${item._id}`
    const image = type === 'lost' ? item.imageUrl : item.photoUrl
    const isLost = type === 'lost'
    return (
        <Link href={href} className="flex items-center gap-3 p-3 rounded-xl mt-3 group hover:bg-gray-50 transition-all border border-gray-100 bg-white">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100"
                style={{ background: isLost ? '#fee2e2' : '#dcfce7' }}>
                {image ? (
                    <img src={image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package size={18} className="text-gray-300" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: isLost ? '#dc2626' : '#15803d' }}>
                    {isLost ? '🔍 Lost Item' : '📦 Found Item'}
                </p>
                <p className="text-[#1C2A59] text-sm font-bold truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    {item.category && <span className="text-[10px] text-gray-400 flex items-center gap-1"><Tag size={8} /> {item.category}</span>}
                    {(item.locationFound || item.possibleLocation) && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin size={8} /> {item.locationFound || item.possibleLocation}</span>
                    )}
                </div>
            </div>
            <ChevronRight size={14} className="text-gray-300 group-hover:text-[#1C2A59] transition-colors shrink-0" />
        </Link>
    )
}

function AdminNote({ message, type }) {
    const noteMatch = message?.match(/(?:Admin (?:note|message|says)|Reason|Note):\s*(.+)/i)
    if (!noteMatch) return null
    const isRejected = type === 'claim_rejected'
    const isApproved = type === 'claim_approved'
    return (
        <div className="mt-3 p-3 rounded-xl border" style={{
            background: isRejected ? '#fef2f2' : isApproved ? '#f0fdf4' : '#fff7ed',
            borderColor: isRejected ? '#fecaca' : isApproved ? '#bbf7d0' : '#fed7aa',
        }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{
                color: isRejected ? '#dc2626' : isApproved ? '#15803d' : '#c2410c',
            }}>
                Admin Note
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">{noteMatch[1]}</p>
        </div>
    )
}

function MatchScoreBadge({ score }) {
    if (!score || score <= 0) return null
    const color = score >= 70 ? '#15803d' : score >= 50 ? '#b45309' : '#c2410c'
    const bg = score >= 70 ? '#dcfce7' : score >= 50 ? '#fef3c7' : '#ffedd5'
    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full border"
            style={{ background: bg, color, borderColor: bg }}>
            <Target size={11} /> {score}% Match
        </span>
    )
}

function NotificationCard({ notif, onMarkRead, onDismiss, onWarningAppeal }) {
    const config = getNotifConfig(notif.type)
    const Icon = config.icon
    const foundItem = notif.foundItemId && typeof notif.foundItemId === 'object' ? notif.foundItemId : null
    const lostItem = notif.lostItemId && typeof notif.lostItemId === 'object' ? notif.lostItemId : null

    let actionBtn = null
    if (notif.type === 'claim_approved') {
        actionBtn = (
            <Link href={foundItem ? `/found-items/${foundItem._id}` : '/user-dashboard'}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all hover:shadow-sm"
                style={{ background: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' }}>
                <Eye size={12} /> View Pickup Details
            </Link>
        )
    } else if (notif.type === 'claim_info_requested') {
        actionBtn = (
            <Link href={foundItem ? `/claims/new?foundItemId=${foundItem._id}` : '/user-dashboard'}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all hover:shadow-sm"
                style={{ background: '#ffedd5', color: '#c2410c', borderColor: '#fed7aa' }}>
                <MailQuestion size={12} /> Reply to Admin
            </Link>
        )
    } else if (notif.type === 'ai_match' && foundItem) {
        actionBtn = (
            <Link href={`/found-items/${foundItem._id}`}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all hover:shadow-sm"
                style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
                <Sparkles size={12} /> Review Match & Claim
            </Link>
        )
    } else if (notif.type === 'warning') {
        actionBtn = (
            <button onClick={() => onWarningAppeal?.(notif)}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all hover:shadow-sm"
                style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
                <AlertTriangle size={12} /> Request Removal
            </button>
        )
    }

    return (
        <div className={`group rounded-2xl p-5 border bg-white transition-all duration-200 hover:shadow-md ${!notif.read ? 'border-l-4' : 'border-gray-100'}`}
            style={{ borderLeftColor: !notif.read ? config.color : undefined }}>
            <div className="flex gap-4">
                <div className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105"
                    style={{ background: config.bg, borderColor: config.border, color: config.color }}>
                    <Icon size={19} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-black text-sm ${!notif.read ? 'text-[#1C2A59]' : 'text-gray-500'}`}>
                                {config.emoji} {notif.title}
                            </h3>
                            {notif.matchScore > 0 && <MatchScoreBadge score={notif.matchScore} />}
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                                style={{ background: config.bg, color: config.color, borderColor: config.border }}>
                                {config.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold tracking-wider text-gray-400 flex items-center gap-1">
                                <Clock size={10} /> {timeAgo(notif.createdAt)}
                            </span>
                            {!notif.read && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#F0A500]" />
                            )}
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed font-medium text-gray-500">
                        {notif.message}
                    </p>
                    <AdminNote message={notif.message} type={notif.type} />
                    {foundItem && <ItemPreview item={foundItem} type="found" />}
                    {lostItem && <ItemPreview item={lostItem} type="lost" />}
                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                        {actionBtn}
                        {!notif.read && (
                            <button onClick={() => onMarkRead(notif._id)}
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-gray-400 hover:text-[#1C2A59] hover:bg-gray-50 transition-all">
                                <CheckCircle2 size={10} /> Mark Read
                            </button>
                        )}
                        <button onClick={() => onDismiss(notif._id)}
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                            <Trash2 size={10} /> Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function NotificationsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('')
    const [counts, setCounts] = useState({ all: 0, claims: 0, ai_matches: 0, warnings: 0, system: 0 })
    const [unreadCount, setUnreadCount] = useState(0)
    const [markingAll, setMarkingAll] = useState(false)
    const [selectedWarning, setSelectedWarning] = useState(null)
    const [warningDetails, setWarningDetails] = useState(null)
    const [loadingWarning, setLoadingWarning] = useState(false)

    const TABS = [
        { key: '', label: 'All', icon: Bell },
        { key: 'claims', label: 'Claims', icon: Target },
        { key: 'ai_matches', label: 'AI Matches', icon: Sparkles },
        { key: 'warnings', label: 'Warnings', icon: AlertTriangle },
        { key: 'system', label: 'System', icon: Info },
    ]

    const fetchNotifications = useCallback(() => {
        if (!user) return
        setLoading(true)
        const qs = activeTab ? `?type=${activeTab}` : ''
        fetch(`/api/notifications${qs}`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => {
                setNotifications(d.notifications || [])
                setCounts(d.counts || { all: 0, claims: 0, ai_matches: 0, warnings: 0, system: 0 })
                setUnreadCount(d.unreadCount || 0)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [user, activeTab])

    useEffect(() => { fetchNotifications() }, [fetchNotifications])

    const handleMarkRead = async (id) => {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_read', notificationId: id }),
            credentials: 'include',
        })
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
        setUnreadCount(c => Math.max(0, c - 1))
    }

    const handleDismiss = async (id) => {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'dismiss', notificationId: id }),
            credentials: 'include',
        })
        setNotifications(prev => prev.filter(n => n._id !== id))
    }

    const handleMarkAllRead = async () => {
        setMarkingAll(true)
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_all_read' }),
            credentials: 'include',
        })
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
        setMarkingAll(false)
    }

    const handleWarningAppeal = async (notif) => {
        setSelectedWarning(notif)
        setLoadingWarning(true)
        try {
            // Fetch the user's active warnings to find the one that matches this notification
            const res = await fetch('/api/appeals', { credentials: 'include' })
            const data = await res.json()
            if (res.ok && data.warnings && data.warnings.length > 0) {
                // Try to find warning based on notification message or just use the first active warning
                const warning = data.warnings.find(w => w.reason && notif.message?.includes(w.reason)) || data.warnings[0]
                setWarningDetails(warning)
            }
        } catch (err) {
            console.error('Failed to fetch warning details:', err)
        } finally {
            setLoadingWarning(false)
        }
    }

    if (authLoading) return <div className="min-h-screen bg-[#F4F5F7]"><Navbar /><div className="pt-32 text-center"><Loader2 className="animate-spin text-gray-300 mx-auto" size={32} /></div></div>
    if (!user) { router.push('/login'); return null }

    return (
        <div className="bg-[#F4F5F7] min-h-screen font-sans">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                    <Link href="/user-dashboard" className="hover:text-[#1C2A59] transition-colors flex items-center gap-1">
                        <ArrowLeft size={12} /> Dashboard
                    </Link>
                    <ChevronRight size={12} />
                    <span className="text-[#F0A500]">Notifications</span>
                </div>

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1C2A59] flex items-center gap-3 tracking-tight">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#fef3c7] border border-[#fde68a]">
                                <Bell size={20} className="text-[#F0A500]" />
                            </div>
                            Notification Center
                        </h1>
                        <p className="text-sm mt-1.5 font-medium text-gray-500">
                            Stay updated on your claims, AI matches, and account activity
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} disabled={markingAll}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-500 hover:text-[#1C2A59] hover:border-[#1C2A59] transition-all disabled:opacity-50">
                            {markingAll ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
                            Mark All as Read ({unreadCount})
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                    {TABS.map(({ key, label, icon: TabIcon }) => {
                        const isActive = activeTab === key
                        return (
                            <button key={key} onClick={() => setActiveTab(key)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all"
                                style={isActive
                                    ? { background: '#1C2A59', color: '#fff', borderColor: '#1C2A59' }
                                    : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                                }>
                                <TabIcon size={13} />
                                {label}
                                {(counts[key || 'all'] || 0) > 0 && (
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full ml-0.5"
                                        style={isActive
                                            ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                                            : { background: '#F4F5F7', color: '#6b7280' }
                                        }>
                                        {counts[key || 'all']}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Notification List */}
                {loading ? (
                    <div className="py-16 text-center">
                        <Loader2 className="animate-spin text-gray-300 mx-auto mb-3" size={28} />
                        <p className="text-xs font-medium text-gray-400">Loading notifications...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map(notif => (
                            <NotificationCard
                                key={notif._id}
                                notif={notif}
                                onMarkRead={handleMarkRead}
                                onDismiss={handleDismiss}
                                onWarningAppeal={handleWarningAppeal}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center bg-[#fef3c7] border border-[#fde68a]">
                            <Sparkles size={28} className="text-[#F0A500] animate-pulse" />
                        </div>
                        <h3 className="text-[#1C2A59] font-black text-lg mb-2">
                            {activeTab ? 'No notifications in this category' : 'All caught up!'}
                        </h3>
                        <p className="text-sm font-medium text-gray-400 max-w-xs mx-auto">
                            {activeTab
                                ? 'Try switching to a different tab or check back later.'
                                : "AI is monitoring for potential matches. You'll be notified here instantly."}
                        </p>
                    </div>
                )}

                {/* Warning Appeal Modal */}
                {selectedWarning && warningDetails && (
                    <WarningAppealModal
                        warning={warningDetails}
                        onClose={() => {
                            setSelectedWarning(null)
                            setWarningDetails(null)
                        }}
                        onSuccess={() => {
                            fetchNotifications()
                        }}
                    />
                )}
            </div>
        </div>
    )
}
