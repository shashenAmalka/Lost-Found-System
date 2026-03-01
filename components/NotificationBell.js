'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, Sparkles, CheckCircle2, Clock, X } from 'lucide-react'
import Link from 'next/link'

/**
 * NotificationBell — Navbar bell icon with unread count badge and dropdown.
 * Polls /api/notifications every 30 seconds for updates.
 */
export default function NotificationBell() {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications', { credentials: 'include' })
            if (!res.ok) return
            const data = await res.json()
            setNotifications(data.notifications || [])
            setUnreadCount(data.unreadCount || 0)
        } catch { /* silent */ }
    }, [])

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [fetchNotifications])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMarkAllRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_all_read' }),
                credentials: 'include',
            })
            setUnreadCount(0)
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        } catch { /* silent */ }
    }

    const handleDismiss = async (e, id) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'dismiss', notificationId: id }),
                credentials: 'include',
            })
            setNotifications(prev => prev.filter(n => n._id !== id))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch { /* silent */ }
    }

    function timeAgo(dateStr) {
        const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
        if (seconds < 60) return 'Just now'
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    const scoreColor = (score) => {
        if (score >= 70) return '#4ade80'
        if (score >= 50) return '#D4AF37'
        return '#F06414'
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 border border-transparent hover:border-white/10"
                style={{ color: 'rgba(245, 246, 250, 0.7)' }}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1 animate-pulse"
                        style={{
                            background: '#F06414',
                            boxShadow: '0 0 10px rgba(240, 100, 20, 0.5)',
                        }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 mt-2 w-96 rounded-2xl shadow-2xl border overflow-hidden"
                    style={{
                        background: 'rgba(11, 15, 25, 0.97)',
                        backdropFilter: 'blur(30px)',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
                        zIndex: 200,
                    }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b"
                        style={{ borderBottomColor: 'rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                        background: 'rgba(240, 100, 20, 0.15)',
                                        color: '#F06414',
                                        border: '1px solid rgba(240, 100, 20, 0.3)',
                                    }}>
                                    {unreadCount} New
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead}
                                className="text-[10px] font-bold uppercase tracking-wider transition-colors hover:text-white"
                                style={{ color: 'rgba(245, 246, 250, 0.5)' }}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center border"
                                    style={{ background: 'rgba(212, 175, 55, 0.05)', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                                    <Sparkles size={20} color="#D4AF37" />
                                </div>
                                <p className="text-xs font-medium" style={{ color: 'rgba(245,246,250,0.4)' }}>
                                    No notifications yet
                                </p>
                                <p className="text-[10px] mt-1" style={{ color: 'rgba(245,246,250,0.3)' }}>
                                    AI will notify you when matches are found
                                </p>
                            </div>
                        ) : (
                            notifications.map(n => {
                                const foundId = n.foundItemId?._id || n.foundItemId
                                return (
                                    <Link
                                        key={n._id}
                                        href={`/found-items/${foundId}`}
                                        onClick={() => setOpen(false)}
                                        className="flex gap-3 px-5 py-3.5 transition-colors hover:bg-white/5 relative group border-b"
                                        style={{ borderBottomColor: 'rgba(255,255,255,0.03)' }}
                                    >
                                        {/* Unread indicator */}
                                        {!n.read && (
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                                                style={{ background: '#F06414', boxShadow: '0 0 8px rgba(240, 100, 20, 0.5)' }} />
                                        )}

                                        {/* Icon */}
                                        <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border mt-0.5"
                                            style={{
                                                background: n.type === 'ai_match' ? 'rgba(212, 175, 55, 0.08)' : 'rgba(26, 26, 100, 0.2)',
                                                borderColor: n.type === 'ai_match' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(26, 26, 100, 0.4)',
                                            }}>
                                            {n.type === 'ai_match' ? (
                                                <Sparkles size={16} color="#D4AF37" />
                                            ) : (
                                                <CheckCircle2 size={16} color="#4ade80" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <h4 className={`text-xs font-bold truncate ${n.read ? 'text-white/70' : 'text-white'}`}>
                                                    {n.title}
                                                </h4>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {n.matchScore > 0 && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                                            style={{
                                                                color: scoreColor(n.matchScore),
                                                                background: `${scoreColor(n.matchScore)}10`,
                                                            }}>
                                                            {n.matchScore}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-[11px] leading-relaxed line-clamp-2 mb-1"
                                                style={{ color: 'rgba(245, 246, 250, 0.5)' }}>
                                                {n.message}
                                            </p>
                                            <div className="flex items-center gap-1 text-[10px]"
                                                style={{ color: 'rgba(245, 246, 250, 0.35)' }}>
                                                <Clock size={10} />
                                                {timeAgo(n.createdAt)}
                                            </div>
                                        </div>

                                        {/* Dismiss */}
                                        <button
                                            onClick={(e) => handleDismiss(e, n._id)}
                                            className="opacity-0 group-hover:opacity-100 shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-white/10 self-center"
                                            style={{ color: 'rgba(245,246,250,0.4)' }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </Link>
                                )
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-5 py-3 border-t text-center"
                            style={{ borderTopColor: 'rgba(255,255,255,0.06)' }}>
                            <Link href="/user-dashboard" onClick={() => setOpen(false)}
                                className="text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-white"
                                style={{ color: 'rgba(245, 246, 250, 0.5)' }}>
                                View All in Dashboard
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
