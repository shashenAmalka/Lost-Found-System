'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ItemCard from '@/components/ui/ItemCard'
import { Search, X, Plus, ChevronLeft, ChevronRight, Send, AlertTriangle, MapPin, HelpCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Keys', 'ID Card', 'Bag', 'Jewelry', 'Sports', 'Other']

export default function LostItemsPage() {
    const { user } = useAuth()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({ q: '', category: '', location: '' })
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [total, setTotal] = useState(0)

    const handleDeleted = (deletedId) => setItems(prev => prev.filter(i => i._id !== deletedId))

    const fetchItems = useCallback(async () => {
        setLoading(true)
        const p = new URLSearchParams({ page, ...filters })
        try {
            const res = await fetch(`/api/lost-items?${p}`, { credentials: 'include' })
            const data = await res.json()
            setItems(data.items || [])
            setPages(data.pages || 1)
            setTotal(data.total || 0)
        } catch { }
        setLoading(false)
    }, [page, filters])

    useEffect(() => { fetchItems() }, [fetchItems])

    const setFilter = (k) => (e) => { setFilters(f => ({ ...f, [k]: e.target.value })); setPage(1) }
    const clearFilters = () => { setFilters({ q: '', category: '', location: '' }); setPage(1) }

    return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans flex flex-col">
            <Navbar />

            {/* Page Header Banner */}
            <div className="bg-[#1C2A59] pt-28 pb-16 px-4 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #F0A500, transparent)' }} />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #008489, transparent)' }} />
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
                                <AlertTriangle size={12} className="text-red-400" />
                                <span className="text-red-300 text-xs font-bold uppercase tracking-wider">Missing Items</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                                Lost Items Directory
                            </h1>
                            <p className="text-gray-300 font-medium">
                                {total} item{total !== 1 ? 's' : ''} currently reported missing across the campus
                            </p>
                        </div>
                        {user && (
                            <Link href="/lost-items/new" className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl shrink-0"
                                style={{ backgroundColor: '#F0A500', color: '#1C2A59' }}>
                                <Plus size={18} /> Report Lost Item
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-6 relative z-20 flex-1 w-full">
                {/* Filters */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-lg mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative flex">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input className="flex-1 pl-10 pr-12 py-3 bg-[#F4F5F7] border border-gray-200 rounded-l-xl text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors"
                            placeholder="Search by keyword..." value={filters.q} onChange={setFilter('q')} />
                        <button
                            onClick={() => { }}
                            className="px-4 py-3 bg-[#F0A500] text-white rounded-r-xl font-bold text-sm hover:bg-[#d69300] transition-colors flex items-center justify-center shrink-0"
                            title="Search for lost items"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <select className="w-full md:w-56 px-4 py-3 bg-[#F4F5F7] border border-gray-200 rounded-xl text-sm font-medium text-[#1C2A59] focus:outline-none focus:border-[#F0A500] transition-colors appearance-none"
                        value={filters.category} onChange={setFilter('category')}>
                        <option value="">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="relative w-full md:w-56">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input className="w-full pl-9 pr-4 py-3 bg-[#F4F5F7] border border-gray-200 rounded-xl text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors"
                            placeholder="Filter by location..." value={filters.location} onChange={setFilter('location')} />
                    </div>
                    {(filters.q || filters.category || filters.location) && (
                        <button onClick={clearFilters} className="text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors border border-transparent hover:border-red-200">
                            <X size={16} /> Clear
                        </button>
                    )}
                </div>

                {/* Quick Tips */}
                {!loading && items.length === 0 && !filters.q && !filters.category && !filters.location && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
                        <div className="flex items-start gap-3">
                            <HelpCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-blue-800 font-bold text-sm mb-1">No lost items reported yet</h3>
                                <p className="text-blue-600 text-sm leading-relaxed">
                                    Lost something? Be the first to report it! Click the "Report Lost Item" button above to submit your report. Our AI matching system will work around the clock to find potential matches.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-80 animate-pulse shadow-sm" />
                        ))}
                    </div>
                ) : items.length === 0 && (filters.q || filters.category || filters.location) ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
                        <div className="text-5xl mb-4 text-[#008489]">🔍</div>
                        <h3 className="text-[#1C2A59] font-bold text-xl mb-2">No items match your filters</h3>
                        <p className="text-gray-500 text-sm mb-4">Try adjusting your search criteria or clear the filters to see all items.</p>
                        <button onClick={clearFilters} className="text-sm font-bold text-[#008489] hover:underline">Clear all filters</button>
                    </div>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map(item => <ItemCard key={item._id} item={item} type="lost" onDeleted={handleDeleted} />)}
                    </div>
                ) : null}

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-12 mb-8">
                        <div className="bg-white inline-flex items-center p-1.5 rounded-2xl shadow-sm border border-gray-200">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-2.5 rounded-xl hover:bg-[#F4F5F7] text-[#1C2A59] disabled:opacity-30 transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-[#3E4A56] font-bold text-sm px-5">Page {page} of {pages}</span>
                            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                                className="p-2.5 rounded-xl hover:bg-[#F4F5F7] text-[#1C2A59] disabled:opacity-30 transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Helpful Info Box */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm my-8">
                    <h3 className="text-[#1C2A59] font-bold mb-3 flex items-center gap-2">
                        <HelpCircle size={18} className="text-[#F0A500]" />
                        Found something that's yours?
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                        If you see your lost item in the Found Items directory, you can submit a claim with proof of ownership. Our admin team will review and approve verified claims.
                    </p>
                    <Link href="/found-items" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#008489] hover:text-[#1C2A59] transition-colors group">
                        Browse Found Items
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    )
}
