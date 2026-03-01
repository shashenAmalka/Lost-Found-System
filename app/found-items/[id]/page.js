'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft, MapPin, Calendar, Tag, Eye, Package, User as UserIcon, Shield } from 'lucide-react'
import Link from 'next/link'

export default function FoundItemDetailPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const router = useRouter()
    const [item, setItem] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/found-items/${id}`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => setItem(d.item))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <div className="page-bg min-h-screen"><Navbar /><div className="pt-32 text-center text-white/50">Loading...</div></div>

    if (!item) return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="max-w-md mx-auto pt-32 px-4 text-center">
                <div className="glass-card p-12"><div className="text-5xl mb-4">😕</div><h2 className="text-white font-bold mb-2">Item Not Found</h2>
                    <Link href="/found-items" className="btn-glass-primary mt-4">Back to Found Items</Link>
                </div>
            </div>
        </div>
    )

    return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
                <Link href="/found-items" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
                    <ArrowLeft size={16} /> Back to Found Items
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="md:col-span-2">
                        <div className="glass-card overflow-hidden rounded-2xl h-64 md:h-80"
                            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.08) 100%)' }}>
                            {item.photoUrl ? (
                                <img src={item.photoUrl} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                    <Package size={48} className="text-white/15" />
                                    <span className="text-white/25 text-sm">{item.category}</span>
                                </div>
                            )}
                        </div>

                        {/* Claim button — only visible to other users, not the poster */}
                        {user && item.status === 'unclaimed' && (
                            item.submittedBy?.toString() === user.id ? (
                                <div className="mt-4 p-3 rounded-xl text-xs text-center font-medium"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(245,246,250,0.4)' }}>
                                    You reported this item — you cannot claim it.
                                </div>
                            ) : (
                                <Link href={`/claims/new?foundItemId=${item._id}`}
                                    className="btn-glass-primary w-full justify-center py-3 mt-4 text-sm font-semibold">
                                    <Shield size={16} /> Claim This Item
                                </Link>
                            )
                        )}
                    </div>

                    <div className="md:col-span-3 space-y-5">
                        <div className="flex flex-wrap items-start gap-3 justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">{item.title}</h1>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <StatusBadge status={item.status} />
                                    <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>📦 Found</span>
                                </div>
                            </div>
                            <div className="text-white/30 text-xs flex items-center gap-1"><Eye size={12} /> {item.views || 0} views</div>
                        </div>

                        <div className="glass-card p-5 space-y-3">
                            <p className="text-white/80 text-sm leading-relaxed">{item.description}</p>
                            {item.keywords?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {item.keywords.map((kw, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }}>
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: MapPin, label: 'Location Found', value: item.locationFound },
                                { icon: Calendar, label: 'Date Found', value: item.dateFound ? new Date(item.dateFound).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                                { icon: Tag, label: 'Category', value: item.category },
                                { icon: Shield, label: 'Condition', value: item.condition || '[Hidden]' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="glass-card p-3 flex items-center gap-3">
                                    <Icon size={14} className="text-emerald-400 shrink-0" />
                                    <div><div className="text-white/40 text-xs">{label}</div><div className={`text-sm ${value?.includes('[Hidden]') ? 'text-white/50 italic' : 'text-white'}`}>{value}</div></div>
                                </div>
                            ))}
                        </div>

                        {(item.color || item.brand) && (
                            <div className="glass-card p-4 space-y-2">
                                <span className="text-xs text-white/40 uppercase tracking-wide">Additional Details</span>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {item.color && <div><span className="text-white/50 text-xs">Color:</span><br /><span className="text-white">{item.color}</span></div>}
                                    {item.brand && <div><span className="text-white/50 text-xs">Brand:</span><br /><span className="text-white">{item.brand}</span></div>}
                                </div>
                            </div>
                        )}

                        <div className="glass-card p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.6) 0%, rgba(6,182,212,0.6) 100%)' }}>
                                <UserIcon size={14} className="text-white" />
                            </div>
                            <div>
                                <div className="text-white text-sm font-medium">{item.submittedByName || 'Anonymous'}</div>
                                <div className="text-white/40 text-xs">Submitted {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
