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

    if (loading) return <div className="min-h-screen bg-[#F4F5F7] font-sans pb-20 pt-20"><Navbar /><div className="pt-32 text-center text-[#1C2A59] font-medium">Loading details...</div></div>

    if (!item) return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans pb-20 pt-20"><Navbar />
            <div className="max-w-md mx-auto pt-32 px-4 text-center">
                <div className="bg-white p-12 rounded border border-gray-200 shadow-sm"><div className="text-5xl mb-4 text-[#008489]">😕</div><h2 className="text-[#1C2A59] font-bold mb-2">Item Not Found</h2>
                    <Link href="/found-items" className="inline-block mt-4 px-6 py-2.5 bg-[#F0A500] text-[#1C2A59] font-bold rounded hover:bg-[#d69300] transition-colors">Back to Found Items</Link>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans pb-20 pt-20"><Navbar />
            <div className="max-w-4xl mx-auto px-4 pt-10 pb-16">
                <Link href="/found-items" className="inline-flex items-center gap-2 text-[#3E4A56] hover:text-[#1C2A59] text-sm font-semibold mb-6 transition-colors">
                    <ArrowLeft size={16} /> Back to Found Items Directory
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="md:col-span-2">
                        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden rounded h-64 md:h-80 flex items-center justify-center p-2">
                            {item.photoUrl ? (
                                <img src={item.photoUrl} alt={item.title} className="w-full h-full object-cover rounded" />
                            ) : (
                                <div className="w-full h-full bg-[#F4F5F7] rounded flex flex-col items-center justify-center gap-3">
                                    <Package size={48} className="text-[#3E4A56]/30" />
                                    <span className="text-[#3E4A56]/50 text-sm font-semibold uppercase">{item.category}</span>
                                </div>
                            )}
                        </div>

                        {/* Claim button — only visible to other users, not the poster */}
                        {user && ['unclaimed', 'under_review'].includes(item.status) && (
                            item.submittedBy?.toString() === user.id ? (
                                <div className="mt-4 p-4 rounded text-xs text-center font-bold uppercase tracking-wider"
                                    style={{ background: '#F4F5F7', border: '1px solid #E5E7EB', color: '#1C2A59' }}>
                                    You reported this item — you cannot claim it.
                                </div>
                            ) : (
                                <Link href={`/claims/new?foundItemId=${item._id}`}
                                    className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-sm font-bold rounded shadow-sm transition-all hover:bg-[#1a254d]"
                                    style={{ backgroundColor: '#1C2A59', color: '#FFFFFF' }}>
                                    <Shield size={18} /> Claim This Item
                                </Link>
                            )
                        )}
                    </div>

                    <div className="md:col-span-3 space-y-5">
                        <div className="flex flex-wrap items-start gap-3 justify-between pb-3 border-b border-gray-200">
                            <div>
                                <h1 className="text-3xl font-extrabold text-[#1C2A59]">{item.title}</h1>
                                <div className="flex flex-wrap gap-2 mt-3 block">
                                    <StatusBadge status={item.status} />
                                    <span className="text-xs px-2 py-1 rounded font-bold" style={{ backgroundColor: '#d1fae5', color: '#10b981', border: '1px solid #6ee7b7' }}>📦 Found</span>
                                </div>
                            </div>
                            <div className="text-gray-400 font-semibold text-xs flex items-center gap-1.5 mt-2"><Eye size={16} /> {item.views || 0} views</div>
                        </div>

                        <div className="bg-white rounded border border-gray-200 p-5 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Description</h3>
                            <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
                            {item.keywords?.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 mt-3 block pl-0">
                                    {item.keywords.map((kw, i) => (
                                        <span key={i} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium border border-gray-200">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: MapPin, label: 'Location Found', value: item.locationFound },
                                { icon: Calendar, label: 'Date Found', value: item.dateFound ? new Date(item.dateFound).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                                { icon: Tag, label: 'Category', value: item.category },
                                { icon: Shield, label: 'Condition', value: item.condition || '[Hidden]' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="bg-white rounded border border-gray-200 p-4 flex items-center gap-4 shadow-sm">
                                    <div className="p-2 rounded bg-indigo-50 shrink-0">
                                        <Icon size={18} className="text-[#1C2A59]" />
                                    </div>
                                    <div>
                                        <div className="text-gray-400 font-semibold text-[10px] uppercase tracking-wider">{label}</div>
                                        <div className={`text-sm font-bold mt-0.5 ${value?.includes('[Hidden]') ? 'text-gray-400 italic' : 'text-[#1C2A59]'}`}>{value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(item.color || item.brand) && (
                            <div className="bg-white rounded border border-gray-200 p-5 shadow-sm space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Additional Specifications</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded border border-gray-100">
                                    {item.color && <div><span className="text-gray-500 text-xs font-medium block mb-1">Color:</span><span className="text-[#1C2A59] font-bold">{item.color}</span></div>}
                                    {item.brand && <div><span className="text-gray-500 text-xs font-medium block mb-1">Brand:</span><span className="text-[#1C2A59] font-bold">{item.brand}</span></div>}
                                </div>
                            </div>
                        )}

                        <div className="bg-[#1C2A59] rounded p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                    <UserIcon size={18} className="text-[#1C2A59]" />
                                </div>
                                <div>
                                    <div className="text-white text-sm font-bold">{item.submittedByName || 'Anonymous Find'}</div>
                                    <div className="text-indigo-200 text-xs mt-0.5">Turned in on {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
