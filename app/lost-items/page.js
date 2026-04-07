'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import ItemCard from '@/components/ui/ItemCard'
import { Search, Filter, X, Plus, ChevronLeft, ChevronRight, Send } from 'lucide-react'
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
        <div className="min-h-screen bg-[#F4F5F7] font-sans pb-20 pt-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b-2 border-gray-200 pb-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#1C2A59] flex items-center gap-3">
                            <span className="w-2 h-8 bg-[#F0A500] inline-block rounded-sm"></span>
                            Lost Items Directory
                        </h1>
                        <p className="text-[#3E4A56] font-medium mt-2">{total} item{total !== 1 ? 's' : ''} currently reported missing</p>
                    </div>
                    {user && (
                        <Link href="/lost-items/new" className="flex items-center gap-2 px-6 py-3 rounded text-sm font-bold shadow-sm transition-all hover:bg-[#d69300]"
                            style={{ backgroundColor: '#F0A500', color: '#1C2A59' }}>
                            <Plus size={18} /> Report Lost Item
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white p-5 rounded border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative flex">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input className="flex-1 pl-10 pr-12 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-l text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" 
                            placeholder="Search by keyword..." value={filters.q} onChange={setFilter('q')} />
                        <button 
                            onClick={() => { /* Search is already triggered by onChange */ }}
                            className="px-4 py-2.5 bg-[#F0A500] text-white rounded-r font-bold text-sm hover:bg-[#d69300] transition-colors flex items-center justify-center shrink-0"
                            title="Search for lost items"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <select className="w-full md:w-56 px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] focus:outline-none focus:border-[#F0A500] transition-colors appearance-none" 
                        value={filters.category} onChange={setFilter('category')}>
                        <option value="">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="relative w-full md:w-56">
                        <input className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" 
                            placeholder="Location..." value={filters.location} onChange={setFilter('location')} />
                    </div>
                    {(filters.q || filters.category || filters.location) && (
                        <button onClick={clearFilters} className="text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded flex items-center gap-1.5 shrink-0 transition-colors border border-transparent hover:border-red-200">
                            <X size={16} /> Clear Filters
                        </button>
                    )}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded border border-gray-100 h-80 animate-pulse shadow-sm" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="bg-white rounded border border-gray-200 p-16 text-center shadow-sm">
                        <div className="text-5xl mb-4 text-[#008489]">🔍</div>
                        <h3 className="text-[#1C2A59] font-bold text-xl mb-2">No items found</h3>
                        <p className="text-gray-500 text-sm">Try adjusting your search filters to see more results.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map(item => <ItemCard key={item._id} item={item} type="lost" onDeleted={handleDeleted} />)}
                    </div>
                )}

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-12 bg-white inline-flex mx-auto p-2 rounded shadow-sm border border-gray-200">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="p-2 rounded hover:bg-[#F4F5F7] text-[#1C2A59] disabled:opacity-30 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-[#3E4A56] font-bold text-sm px-4">Page {page} of {pages}</span>
                        <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                            className="p-2 rounded hover:bg-[#F4F5F7] text-[#1C2A59] disabled:opacity-30 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
