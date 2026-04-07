'use client'
import Link from 'next/link'
import StatusBadge from './StatusBadge'
import { MapPin, Calendar, Tag, Eye, Package, Lock, Pencil, Trash2, Clock, ArrowUpRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

// ─── 10-Minute Edit Countdown ────────────────────────────────────────────────
function EditCountdown({ createdAt, onExpire }) {
    const WINDOW_MS = 10 * 60 * 1000
    const calc = () => {
        const elapsed = Date.now() - new Date(createdAt).getTime()
        return Math.max(0, Math.ceil((WINDOW_MS - elapsed) / 1000))
    }
    const [seconds, setSeconds] = useState(calc)

    useEffect(() => {
        if (seconds <= 0) { onExpire?.(); return }
        const t = setInterval(() => {
            const s = calc()
            setSeconds(s)
            if (s <= 0) { clearInterval(t); onExpire?.() }
        }, 1000)
        return () => clearInterval(t)
    }, [])

    if (seconds <= 0) return null
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    const pct = (seconds / (WINDOW_MS / 1000)) * 100
    const urgent = seconds < 60

    return (
        <div className="flex items-center gap-2 text-[10px] font-bold px-2.5 py-1 rounded-full border"
            style={{
                background: urgent ? 'rgba(239,68,68,0.12)' : 'rgba(212,175,55,0.1)',
                borderColor: urgent ? 'rgba(239,68,68,0.3)' : 'rgba(212,175,55,0.25)',
                color: urgent ? '#fca5a5' : '#D4AF37',
            }}>
            <Clock size={10} className={urgent ? 'animate-pulse' : ''} />
            <span>{m}:{String(s).padStart(2, '0')}</span>
            <div className="w-10 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                    style={{
                        width: `${pct}%`,
                        background: urgent ? '#ef4444' : '#D4AF37',
                    }} />
            </div>
        </div>
    )
}

// ─── Main ItemCard ────────────────────────────────────────────────────────────
export default function ItemCard({ item, type = 'lost', onDeleted }) {
    const { user } = useAuth()
    const href = `/${type === 'lost' ? 'lost-items' : 'found-items'}/${item._id}`
    const editHref = `/${type === 'lost' ? 'lost-items' : 'found-items'}/${item._id}/edit`
    const dateLabel = type === 'lost' ? 'Date Lost' : 'Date Found'
    const dateVal = type === 'lost' ? item.dateLost : item.dateFound
    const locationVal = type === 'lost' ? item.possibleLocation : item.locationFound
    const imageUrl = type === 'lost' ? item.imageUrl : item.photoUrl
    const apiBase = type === 'lost' ? '/api/lost-items' : '/api/found-items'

    const ownerId = item.submittedBy?.toString() || item.postedBy?.toString()
    const isOwner = user && ownerId === user.id
    const withinWindow = isOwner && item.createdAt
        ? (Date.now() - new Date(item.createdAt).getTime()) < 10 * 60 * 1000
        : false
    const [canEdit, setCanEdit] = useState(withinWindow)
    const [deleting, setDeleting] = useState(false)
    const [confirmDel, setConfirmDel] = useState(false)
    const [pendingClaimCount, setPendingClaimCount] = useState(0)

    useEffect(() => {
        if (type === 'found' && item._id) {
            fetch(`/api/found-items/${item._id}/claim-count`)
                .then(r => r.json())
                .then(d => setPendingClaimCount(d.pendingClaimCount || 0))
                .catch(() => { })
        }
    }, [type, item._id])

    const handleDelete = async (e) => {
        e.preventDefault(); e.stopPropagation()
        if (!confirmDel) { setConfirmDel(true); return }
        setDeleting(true)
        try {
            await fetch(`${apiBase}/${item._id}`, { method: 'DELETE', credentials: 'include' })
            onDeleted?.(item._id)
        } catch { }
        setDeleting(false)
    }

    // Accent color based on type
    const accent = type === 'lost' ? '#ef4444' : '#10b981'
    const accentLight = type === 'lost' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)'
    const typeLabel = type === 'lost' ? '🔍 Lost' : '📦 Found'

    return (
        <div
            className="group relative h-full flex flex-col overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2"
            style={{
                borderRadius: '1.25rem',
                background: isOwner
                    ? 'linear-gradient(145deg, rgba(240,165,0,0.04), #ffffff)'
                    : '#ffffff',
                border: isOwner ? '1.5px solid rgba(240,165,0,0.35)' : '1px solid rgba(0,0,0,0.06)',
                boxShadow: isOwner
                    ? '0 4px 24px rgba(240,165,0,0.08), 0 1px 3px rgba(0,0,0,0.04)'
                    : '0 2px 16px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                transition: 'transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s cubic-bezier(0.23,1,0.32,1)',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = isOwner
                    ? '0 20px 60px rgba(240,165,0,0.12), 0 8px 24px rgba(0,0,0,0.06)'
                    : '0 20px 60px rgba(28,42,89,0.08), 0 8px 24px rgba(0,0,0,0.05)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = isOwner
                    ? '0 4px 24px rgba(240,165,0,0.08), 0 1px 3px rgba(0,0,0,0.04)'
                    : '0 2px 16px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)'
            }}
        >
            {/* Owner badge */}
            {isOwner && (
                <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full"
                    style={{
                        background: 'linear-gradient(135deg, #F0A500, #D89200)',
                        color: '#1C2A59',
                        boxShadow: '0 4px 12px rgba(240,165,0,0.3)',
                    }}>
                    ★ Your Post
                </div>
            )}

            {/* Image Container */}
            <Link href={href} className="block relative overflow-hidden" style={{ borderRadius: '1.25rem 1.25rem 0 0' }}>
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#F4F5F7] to-[#e8eaed]">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" 
                                style={{ background: accentLight }}>
                                <Package size={28} style={{ color: accent, opacity: 0.6 }} />
                            </div>
                            <span className="text-[#3E4A56]/40 text-[10px] font-bold uppercase tracking-[0.15em]">{item.category || 'No Image'}</span>
                        </div>
                    )}

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Type badge — glassmorphism */}
                    <div className="absolute top-3.5 left-3.5 z-20">
                        <span className="text-[10px] px-3 py-1.5 rounded-full font-extrabold uppercase tracking-wider flex items-center gap-1"
                            style={{
                                background: type === 'lost'
                                    ? 'rgba(239,68,68,0.85)'
                                    : 'rgba(16,185,129,0.85)',
                                color: '#fff',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                boxShadow: `0 4px 16px ${type === 'lost' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
                            }}>
                            {typeLabel}
                        </span>
                    </div>

                    {/* Status badge — glassmorphism floating */}
                    <div className={isOwner ? "absolute bottom-3.5 right-3.5 z-20" : "absolute top-3.5 right-3.5 z-20"}>
                        <StatusBadge status={item.status} />
                    </div>

                    {/* Claim count badge */}
                    {type === 'found' && pendingClaimCount > 0 && (
                        <div className="absolute bottom-3.5 left-3.5 z-20 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full"
                            style={{
                                background: 'rgba(239,68,68,0.9)',
                                color: 'white',
                                backdropFilter: 'blur(12px)',
                                boxShadow: '0 4px 16px rgba(239,68,68,0.25)',
                            }}>
                            🎯 {pendingClaimCount} Pending
                        </div>
                    )}

                    {/* Privacy lock */}
                    {item.isPrivate && type === 'found' && (
                        <div className="absolute bottom-3.5 right-3.5 z-20 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-full"
                            style={{
                                background: 'rgba(28,42,89,0.85)',
                                color: 'white',
                                backdropFilter: 'blur(12px)',
                                boxShadow: '0 4px 12px rgba(28,42,89,0.2)',
                            }}>
                            <Lock size={10} /> Hidden
                        </div>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="p-5 flex flex-col gap-3 flex-1">
                {/* 10-min edit bar */}
                {canEdit && isOwner && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border"
                        style={{
                            background: 'linear-gradient(135deg, rgba(240,165,0,0.06), rgba(240,165,0,0.02))',
                            borderColor: 'rgba(240,165,0,0.2)',
                        }}>
                        <EditCountdown createdAt={item.createdAt} onExpire={() => setCanEdit(false)} />
                        <div className="flex items-center gap-1.5">
                            <Link href={editHref} onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all hover:bg-blue-50 text-blue-600 border border-blue-200 bg-white">
                                <Pencil size={10} /> Edit
                            </Link>
                            <button onClick={handleDelete} disabled={deleting}
                                className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all hover:bg-red-50 text-red-600 border border-red-200 bg-white disabled:opacity-50 ${confirmDel ? 'bg-red-50' : ''}`}>
                                <Trash2 size={10} /> {deleting ? '...' : confirmDel ? 'Confirm?' : 'Delete'}
                            </button>
                        </div>
                    </div>
                )}

                <Link href={href} className="flex flex-col gap-3 flex-1">
                    {/* Title & Description */}
                    <div>
                        <h3 className="text-[#1C2A59] font-extrabold text-[15px] leading-snug mb-1.5 line-clamp-1 group-hover:text-[#F0A500] transition-colors duration-300">
                            {item.title}
                        </h3>
                        {item.isPrivate && type === 'found' ? (
                            <p className="text-gray-400 text-xs italic flex items-center gap-1.5">
                                <Lock size={10} /> Description hidden for security
                            </p>
                        ) : (
                            item.description && (
                                <p className="text-[#3E4A56]/60 text-[13px] line-clamp-2 leading-relaxed font-medium">{item.description}</p>
                            )
                        )}
                    </div>

                    {/* Metadata — Condensed premium row layout */}
                    <div className="flex-1 mt-1 space-y-2.5">
                        {/* Location */}
                        {item.isPrivate && type === 'found' ? (
                            <div className="flex items-center gap-2.5 text-xs text-gray-400">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gray-50">
                                    <MapPin size={12} />
                                </div>
                                <span className="italic text-xs">Location hidden</span>
                            </div>
                        ) : (
                            locationVal && (
                                <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-[#1C2A59]/10"
                                        style={{ backgroundColor: 'rgba(28,42,89,0.05)' }}>
                                        <MapPin size={12} className="text-[#1C2A59]/50 group-hover:text-[#1C2A59] transition-colors duration-300" />
                                    </div>
                                    <span className="text-[#3E4A56]/70 text-xs font-semibold truncate">{locationVal}</span>
                                </div>
                            )
                        )}

                        {/* Date */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-[#F0A500]/10"
                                style={{ backgroundColor: 'rgba(240,165,0,0.05)' }}>
                                <Calendar size={12} className="text-[#F0A500]/60 group-hover:text-[#F0A500] transition-colors duration-300" />
                            </div>
                            <span className="text-[#3E4A56]/70 text-xs font-semibold">
                                {dateVal ? new Date(dateVal).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </span>
                        </div>

                        {/* Category */}
                        {item.category && (
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-[#8b5cf6]/10"
                                    style={{ backgroundColor: 'rgba(139,92,246,0.05)' }}>
                                    <Tag size={12} className="text-[#8b5cf6]/50 group-hover:text-[#8b5cf6] transition-colors duration-300" />
                                </div>
                                <span className="text-[#3E4A56]/70 text-xs font-semibold">{item.category}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer — Views & CTA */}
                    <div className="flex items-center justify-between pt-3.5 mt-auto"
                        style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                        <span className="text-gray-400/80 font-bold text-[11px] flex items-center gap-1.5">
                            <Eye size={12} /> {item.views || 0} views
                        </span>
                        <span className="text-[#1C2A59] text-[11px] font-extrabold flex items-center gap-1 group-hover:text-[#F0A500] transition-colors duration-300 group-hover:gap-2">
                            View Details
                            <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                    </div>
                </Link>
            </div>
        </div>
    )
}
