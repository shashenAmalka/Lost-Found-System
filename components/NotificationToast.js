'use client'
import { useState, useEffect, useCallback } from 'react'
import { Sparkles, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'

/**
 * NotificationToast — Slide-in glassmorphism toast for AI match notifications.
 * Polls for new unread notifications and displays them one at a time.
 */
export default function NotificationToast() {
    const [toast, setToast] = useState(null)
    const [visible, setVisible] = useState(false)
    const [shownIds, setShownIds] = useState(new Set())

    const checkForNew = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications', { credentials: 'include' })
            if (!res.ok) return
            const data = await res.json()
            const unread = (data.notifications || []).filter(
                n => !n.read && !n.dismissed && !shownIds.has(n._id)
            )
            if (unread.length > 0) {
                const newest = unread[0]
                setToast(newest)
                setVisible(true)
                setShownIds(prev => new Set([...prev, newest._id]))

                // Auto-dismiss after 10 seconds
                setTimeout(() => {
                    setVisible(false)
                    setTimeout(() => setToast(null), 400) // wait for exit animation
                }, 10000)
            }
        } catch { /* silent */ }
    }, [shownIds])

    useEffect(() => {
        // Check on mount
        checkForNew()
        // Poll every 30 seconds
        const interval = setInterval(checkForNew, 30000)
        return () => clearInterval(interval)
    }, [checkForNew])

    const handleDismiss = async () => {
        setVisible(false)
        setTimeout(() => setToast(null), 400)
        if (toast?._id) {
            try {
                await fetch('/api/notifications', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'mark_read', notificationId: toast._id }),
                    credentials: 'include',
                })
            } catch { /* silent */ }
        }
    }

    if (!toast) return null

    const scoreColor = toast.matchScore >= 70 ? '#4ade80' : toast.matchScore >= 50 ? '#D4AF37' : '#F06414'

    return (
        <div
            className={`fixed top-20 right-4 z-[9999] max-w-sm w-full transition-all duration-500 ${visible
                ? 'translate-x-0 opacity-100'
                : 'translate-x-[120%] opacity-0'
                }`}
        >
            <div className="rounded-2xl p-5 border relative overflow-hidden"
                style={{
                    background: 'rgba(11, 15, 25, 0.92)',
                    backdropFilter: 'blur(30px)',
                    borderColor: 'rgba(212, 175, 55, 0.3)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(212, 175, 55, 0.1)',
                }}>

                {/* Gold glow background */}
                <div className="absolute top-0 left-0 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)' }} />

                {/* Dismiss button */}
                <button onClick={handleDismiss}
                    className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                    style={{ color: 'rgba(245,246,250,0.5)' }}>
                    <X size={14} />
                </button>

                {/* Content */}
                <div className="flex gap-4 items-start">
                    {/* AI Icon */}
                    <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border"
                        style={{
                            background: 'rgba(212, 175, 55, 0.1)',
                            borderColor: 'rgba(212, 175, 55, 0.3)',
                            boxShadow: '0 0 20px rgba(212, 175, 55, 0.15)',
                        }}>
                        <Sparkles size={22} color="#D4AF37" className="animate-pulse" />
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Title with match score */}
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-[15px] text-white">{toast.title}</h4>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md border"
                                style={{
                                    color: scoreColor,
                                    background: `${scoreColor}15`,
                                    borderColor: `${scoreColor}40`,
                                }}>
                                {toast.matchScore}%
                            </span>
                        </div>

                        {/* Message */}
                        <p className="text-xs leading-relaxed font-medium mb-3 line-clamp-2"
                            style={{ color: 'rgba(245, 246, 250, 0.6)' }}>
                            {toast.message}
                        </p>

                        {/* View Match button */}
                        <Link
                            href={toast.foundItemId?._id ? `/found-items/${toast.foundItemId._id}` : `/found-items/${toast.foundItemId}`}
                            onClick={handleDismiss}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                background: 'linear-gradient(135deg, #F06414 0%, #D4AF37 100%)',
                                boxShadow: '0 4px 15px rgba(240, 100, 20, 0.3)',
                            }}>
                            View Match <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
