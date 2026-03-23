'use client'
import Link from 'next/link'
import StatusBadge from './StatusBadge'
import { MapPin, Calendar, Tag, Eye, Package, Lock, Pencil, Trash2, Clock } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

// ─── 10-Minute Edit Countdown ────────────────────────────────────────────────
function EditCountdown({ createdAt, onExpire }) {
    const WINDOW_MS = 10 * 60 * 1000 // 10 minutes
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
    const router = useRouter()
    const href = `/${type === 'lost' ? 'lost-items' : 'found-items'}/${item._id}`
    const editHref = `/${type === 'lost' ? 'lost-items' : 'found-items'}/${item._id}/edit`
    const dateLabel = type === 'lost' ? 'Date Lost' : 'Date Found'
    const dateVal = type === 'lost' ? item.dateLost : item.dateFound
    const locationVal = type === 'lost' ? item.possibleLocation : item.locationFound
    const imageUrl = type === 'lost' ? item.imageUrl : item.photoUrl
    const apiBase = type === 'lost' ? '/api/lost-items' : '/api/found-items'

    // 10-minute ownership check
    const ownerId = item.submittedBy?.toString() || item.postedBy?.toString()
    const isOwner = user && ownerId === user.id
    const withinWindow = isOwner && item.createdAt
        ? (Date.now() - new Date(item.createdAt).getTime()) < 10 * 60 * 1000
        : false
    const [canEdit, setCanEdit] = useState(withinWindow)
    const [deleting, setDeleting] = useState(false)
    const [confirmDel, setConfirmDel] = useState(false)
    const [pendingClaimCount, setPendingClaimCount] = useState(0)

    // For found items: fetch pending claim count for badge
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

    return (
        <div className={`bg-white rounded border border-gray-200 shadow-sm hover:shadow-md overflow-hidden group h-full flex flex-col relative transition-shadow duration-200`}
            style={isOwner ? {
                border: '1px solid #F0A500',
                boxShadow: '0 0 0 1px rgba(240,165,0,0.1)',
            } : {}}>

            {/* "Your Post" badge for owner */}
            {isOwner && (
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded"
                    style={{
                        backgroundColor: '#F0A500',
                        color: '#1C2A59',
                    }}>
                    ★ Your Post
                </div>
            )}

            {/* Image */}
            <Link href={href}>
                <div className="relative h-44 overflow-hidden bg-[#F4F5F7] border-b border-gray-100">
                    {imageUrl ? (
                        <img src={imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <Package size={40} className="text-[#3E4A56]/30" />
                            <span className="text-[#3E4A56]/50 text-xs font-semibold uppercase">{item.category}</span>
                        </div>
                    )}
                    {/* Badges */}
                    <div className={isOwner ? "absolute bottom-3 right-3" : "absolute top-3 right-3"}><StatusBadge status={item.status} /></div>
                    {/* Claim count badge for found items */}
                    {type === 'found' && pendingClaimCount > 0 && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded"
                            style={{ backgroundColor: '#ef4444', color: 'white', border: '1px solid #dc2626' }}>
                            🎯 {pendingClaimCount} Pending
                        </div>
                    )}
                    <div className="absolute top-3 left-3 shadow-sm">
                        <span className="text-xs px-2 py-1 rounded font-bold"
                            style={{
                                backgroundColor: type === 'lost' ? '#fee2e2' : '#d1fae5',
                                color: type === 'lost' ? '#ef4444' : '#10b981',
                                border: `1px solid ${type === 'lost' ? '#fca5a5' : '#6ee7b7'}`
                            }}>
                            {type === 'lost' ? '🔍 Lost' : '📦 Found'}
                        </span>
                    </div>

                    {/* Privacy lock overlay for found items */}
                    {item.isPrivate && type === 'found' && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-[#1C2A59] text-white shadow-sm">
                            <Lock size={10} /> Hidden
                        </div>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3 flex-1">
                {/* 10-min edit bar — only for owner within window */}
                {canEdit && isOwner && (
                    <div className="flex items-center justify-between gap-2 p-2 rounded border bg-[#F0A500]/10 border-[#F0A500]/30 shadow-sm">
                        <EditCountdown createdAt={item.createdAt} onExpire={() => setCanEdit(false)} />
                        <div className="flex items-center gap-1.5">
                            <Link href={editHref} onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1 text-[10px] font-bold px-2 py-1.5 rounded transition-all hover:bg-blue-50 text-blue-600 border border-blue-200 bg-white">
                                <Pencil size={10} /> Edit
                            </Link>
                            <button onClick={handleDelete} disabled={deleting}
                                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1.5 rounded transition-all hover:bg-red-50 text-red-600 border border-red-200 bg-white disabled:opacity-50 ${confirmDel ? 'bg-red-100' : ''}`}>
                                <Trash2 size={10} /> {deleting ? '...' : confirmDel ? 'Confirm?' : 'Delete'}
                            </button>
                        </div>
                    </div>
                )}

                <Link href={href} className="flex flex-col gap-3 flex-1">
                    <div>
                        <h3 className="text-[#1C2A59] font-bold text-base mb-1 line-clamp-1 group-hover:text-[#008489] transition-colors">{item.title}</h3>
                        {/* Description: hide for private found items */}
                        {item.isPrivate && type === 'found' ? (
                            <p className="text-gray-400 text-xs mt-1 italic flex items-center gap-1">
                                <Lock size={10} /> Description hidden for security
                            </p>
                        ) : (
                            item.description && (
                                <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                            )
                        )}
                    </div>

                    <div className="space-y-2 flex-1 mt-1">
                        {/* Location: hide for private found items */}
                        {item.isPrivate && type === 'found' ? (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <MapPin size={12} className="shrink-0" />
                                <span className="italic">Location hidden</span>
                            </div>
                        ) : (
                            locationVal && (
                                <div className="flex items-center gap-2 text-xs font-medium text-[#3E4A56]">
                                    <MapPin size={12} className="shrink-0 text-[#008489]" />
                                    <span className="truncate">{locationVal}</span>
                                </div>
                            )
                        )}
                        <div className="flex items-center gap-2 text-xs font-medium text-[#3E4A56]">
                            <Calendar size={12} className="shrink-0 text-[#008489]" />
                            <span>{dateVal ? new Date(dateVal).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                        </div>
                        {item.category && (
                            <div className="flex items-center gap-2 text-xs font-medium text-[#3E4A56]">
                                <Tag size={12} className="shrink-0 text-[#008489]" />
                                <span>{item.category}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
                        <span className="text-gray-400 font-semibold text-xs flex items-center gap-1.5">
                            <Eye size={12} /> {item.views || 0}
                        </span>
                        <span className="text-[#008489] text-xs font-bold group-hover:text-[#1C2A59] transition-colors">
                            View Details &rarr;
                        </span>
                    </div>
                </Link>
            </div>
        </div>
    )
}
