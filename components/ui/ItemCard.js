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
    const isOwner = user && item.submittedBy?.toString() === user.id
    const withinWindow = isOwner && item.createdAt
        ? (Date.now() - new Date(item.createdAt).getTime()) < 10 * 60 * 1000
        : false
    const [canEdit, setCanEdit] = useState(withinWindow)
    const [deleting, setDeleting] = useState(false)
    const [confirmDel, setConfirmDel] = useState(false)

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
        <div className="glass-card-hover rounded-2xl overflow-hidden group h-full flex flex-col relative">
            {/* Image */}
            <Link href={href}>
                <div className="relative h-44 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.1) 100%)' }}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <Package size={40} className="text-white/20" />
                            <span className="text-white/30 text-xs">{item.category}</span>
                        </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-3 right-3"><StatusBadge status={item.status} /></div>
                    <div className="absolute top-3 left-3">
                        <span className="badge text-xs"
                            style={{
                                background: type === 'lost' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                                color: type === 'lost' ? '#fca5a5' : '#6ee7b7',
                                border: `1px solid ${type === 'lost' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`
                            }}>
                            {type === 'lost' ? '🔍 Lost' : '📦 Found'}
                        </span>
                    </div>

                    {/* Privacy lock overlay for found items */}
                    {item.isPrivate && type === 'found' && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(245,246,250,0.5)', backdropFilter: 'blur(4px)' }}>
                            <Lock size={9} /> Details Hidden
                        </div>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3 flex-1">
                {/* 10-min edit bar — only for owner within window */}
                {canEdit && isOwner && (
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl border"
                        style={{ background: 'rgba(212,175,55,0.05)', borderColor: 'rgba(212,175,55,0.15)' }}>
                        <EditCountdown createdAt={item.createdAt} onExpire={() => setCanEdit(false)} />
                        <div className="flex items-center gap-1.5">
                            <Link href={editHref} onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all hover:scale-105"
                                style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)' }}>
                                <Pencil size={10} /> Edit
                            </Link>
                            <button onClick={handleDelete} disabled={deleting}
                                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                                style={{
                                    background: confirmDel ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.1)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239,68,68,0.25)'
                                }}>
                                <Trash2 size={10} /> {deleting ? '...' : confirmDel ? 'Confirm?' : 'Delete'}
                            </button>
                        </div>
                    </div>
                )}

                <Link href={href} className="flex flex-col gap-3 flex-1">
                    <div>
                        <h3 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                        {/* Description: hide for private found items */}
                        {item.isPrivate && type === 'found' ? (
                            <p className="text-white/25 text-xs mt-1 italic flex items-center gap-1">
                                <Lock size={9} /> Description hidden for security
                            </p>
                        ) : (
                            item.description && (
                                <p className="text-white/50 text-xs mt-1 line-clamp-2">{item.description}</p>
                            )
                        )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                        {/* Location: hide for private found items */}
                        {item.isPrivate && type === 'found' ? (
                            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(245,246,250,0.25)' }}>
                                <MapPin size={11} className="shrink-0" />
                                <span className="italic">Location hidden</span>
                            </div>
                        ) : (
                            locationVal && (
                                <div className="flex items-center gap-2 text-xs text-white/50">
                                    <MapPin size={11} className="shrink-0" />
                                    <span className="truncate">{locationVal}</span>
                                </div>
                            )
                        )}
                        <div className="flex items-center gap-2 text-xs text-white/50">
                            <Calendar size={11} className="shrink-0" />
                            <span>{dateVal ? new Date(dateVal).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                        </div>
                        {item.category && (
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <Tag size={11} className="shrink-0" />
                                <span>{item.category}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-white/30 text-xs flex items-center gap-1">
                            <Eye size={10} /> {item.views || 0}
                        </span>
                        <span className="text-indigo-400 text-xs font-medium group-hover:text-indigo-300 transition-colors">
                            View Details →
                        </span>
                    </div>
                </Link>
            </div>
        </div>
    )
}
