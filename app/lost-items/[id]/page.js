'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft, MapPin, Calendar, Tag, Eye, Package, User as UserIcon, Clock, Sparkles, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default function LostItemDetailPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const [item, setItem] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/lost-items/${id}`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => setItem(d.item))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center pt-20">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse"
                        style={{ background: 'linear-gradient(135deg, rgba(240,165,0,0.15), rgba(28,42,89,0.1))' }}>
                        <Package size={24} className="text-[#1C2A59]/40" />
                    </div>
                    <p className="text-[#1C2A59] font-bold text-sm">Loading item details...</p>
                </div>
            </div>
        </div>
    )

    if (!item) return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center pt-20">
                <div className="text-center px-6 py-16 rounded-3xl bg-white border border-gray-100" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                    <div className="text-6xl mb-5">😕</div>
                    <h2 className="text-[#1C2A59] font-extrabold text-xl mb-2">Item Not Found</h2>
                    <p className="text-gray-400 text-sm mb-6">This item may have been removed or the link is incorrect.</p>
                    <Link href="/lost-items" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg, #F0A500, #D89200)', color: '#1C2A59', boxShadow: '0 4px 16px rgba(240,165,0,0.25)' }}>
                        <ArrowLeft size={16} /> Back to Lost Items
                    </Link>
                </div>
            </div>
        </div>
    )

    const metaItems = [
        { icon: MapPin, label: 'Possible Location', value: item.possibleLocation, color: '#1C2A59', bg: 'rgba(28,42,89,0.06)' },
        { icon: Calendar, label: 'Date Lost', value: item.dateLost ? new Date(item.dateLost).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—', color: '#F0A500', bg: 'rgba(240,165,0,0.06)' },
        { icon: Tag, label: 'Category', value: item.category, color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)' },
        { icon: Clock, label: 'Time Range', value: item.timeRange || 'Not specified', color: '#06b6d4', bg: 'rgba(6,182,212,0.06)' },
    ]

    return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans flex flex-col">
            <Navbar />

            {/* Premium header */}
            <div className="bg-[#1C2A59] pt-28 pb-20 px-4 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #F0A500, transparent)' }} />
                    <div className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
                </div>
                <div className="max-w-5xl mx-auto relative z-10">
                    <Link href="/lost-items" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-bold mb-6 transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Lost Items Directory
                    </Link>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                            style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', backdropFilter: 'blur(8px)' }}>
                            🔍 Lost Item
                        </div>
                        <StatusBadge status={item.status} />
                        <span className="text-white/40 font-bold text-xs flex items-center gap-1.5 ml-auto">
                            <Eye size={14} /> {item.views || 0} views
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight">{item.title}</h1>
                </div>
            </div>

            {/* Main content — overlapping cards */}
            <div className="max-w-5xl mx-auto px-4 lg:px-8 -mt-10 relative z-20 flex-1 w-full pb-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

                    {/* Image Card */}
                    <div className="md:col-span-2">
                        <div className="overflow-hidden h-72 md:h-80 flex items-center justify-center"
                            style={{
                                borderRadius: '1.5rem',
                                background: '#fff',
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)',
                            }}>
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" style={{ borderRadius: '1.5rem' }} />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#F4F5F7] to-[#e8eaed]">
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.08)' }}>
                                        <Package size={36} className="text-red-400/50" />
                                    </div>
                                    <span className="text-[#3E4A56]/40 text-xs font-bold uppercase tracking-[0.15em]">{item.category}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Column */}
                    <div className="md:col-span-3 space-y-5">

                        {/* Description Card */}
                        <div style={{
                            borderRadius: '1.25rem',
                            background: '#fff',
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                            padding: '1.5rem',
                        }}>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400 mb-3">Description</h3>
                            <p className="text-[#3E4A56] text-sm leading-relaxed font-medium">{item.description}</p>
                            {item.keywords?.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-gray-100">
                                    {item.keywords.map((kw, i) => (
                                        <span key={i} className="text-[11px] px-3 py-1.5 font-bold text-[#1C2A59]/60"
                                            style={{ borderRadius: '0.75rem', background: 'rgba(28,42,89,0.04)', border: '1px solid rgba(28,42,89,0.08)' }}>
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {metaItems.map(({ icon: Icon, label, value, color, bg }) => (
                                <div key={label}
                                    className="flex items-center gap-3.5 group/meta transition-all duration-300 hover:-translate-y-0.5"
                                    style={{
                                        borderRadius: '1rem',
                                        background: '#fff',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                                        padding: '1rem 1.25rem',
                                    }}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
                                        style={{ background: bg }}>
                                        <Icon size={18} style={{ color }} className="transition-transform duration-300 group-hover/meta:scale-110" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gray-400">{label}</div>
                                        <div className="text-[#1C2A59] font-bold text-sm mt-0.5">{value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Additional Specs */}
                        {(item.color || item.brand || item.uniqueIdentifier) && (
                            <div style={{
                                borderRadius: '1.25rem',
                                background: '#fff',
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                                padding: '1.5rem',
                            }}>
                                <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400 mb-4">Additional Specifications</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                                    style={{ borderRadius: '0.75rem', background: 'rgba(28,42,89,0.02)', border: '1px solid rgba(28,42,89,0.05)', padding: '1rem' }}>
                                    {item.color && (
                                        <div>
                                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Color</span>
                                            <span className="text-[#1C2A59] font-extrabold text-sm">{item.color}</span>
                                        </div>
                                    )}
                                    {item.brand && (
                                        <div>
                                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Brand</span>
                                            <span className="text-[#1C2A59] font-extrabold text-sm">{item.brand}</span>
                                        </div>
                                    )}
                                    {item.uniqueIdentifier && (
                                        <div>
                                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Identifier</span>
                                            <span className="text-[#1C2A59] font-extrabold text-sm">{item.uniqueIdentifier}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reporter Card — premium glassmorphism */}
                        <div className="flex items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-0.5"
                            style={{
                                borderRadius: '1.25rem',
                                background: 'linear-gradient(135deg, #1C2A59, #253470)',
                                padding: '1.25rem 1.5rem',
                                boxShadow: '0 8px 32px rgba(28,42,89,0.2)',
                            }}>
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center"
                                    style={{ backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <UserIcon size={18} className="text-white/80" />
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">{item.postedByName || 'Anonymous User'}</div>
                                    <div className="text-white/40 text-xs font-medium mt-0.5">
                                        Reported on {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                            <Link href="/found-items/new"
                                className="text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 flex items-center gap-1.5 shrink-0"
                                style={{ background: 'linear-gradient(135deg, #F0A500, #D89200)', color: '#1C2A59', boxShadow: '0 4px 12px rgba(240,165,0,0.3)' }}>
                                <Sparkles size={12} /> Found this?
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
