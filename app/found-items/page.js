'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import ItemCard from '@/components/ui/ItemCard'
import { Search, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Keys', 'ID Card', 'Bag', 'Jewelry', 'Sports', 'Other']

export default function FoundItemsPage() {
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
            const res = await fetch(`/api/found-items?${p}`, { credentials: 'include' })
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
        <div className="page-bg min-h-screen">
            <Navbar />
            <div className="orb w-72 h-72 top-0 right-0 opacity-15" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.5) 0%, transparent 70%)' }} />

            <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Found Items</h1>
                        <p className="text-white/50 text-sm mt-1">{total} item{total !== 1 ? 's' : ''} turned in</p>
                    </div>
                    {user && (
                        <Link href="/found-items/new" className="btn-glass-success">
                            <Plus size={16} /> Report Found Item
                        </Link>
                    )}
                </div>

                <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input className="glass-input pl-9" placeholder="Search by keyword..." value={filters.q} onChange={setFilter('q')} />
                    </div>
                    <select className="glass-select sm:w-44" value={filters.category} onChange={setFilter('category')}>
                        <option value="">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input className="glass-input sm:w-44" placeholder="Location..." value={filters.location} onChange={setFilter('location')} />
                    {(filters.q || filters.category || filters.location) && (
                        <button onClick={clearFilters} className="btn-glass text-xs px-4 py-2 flex items-center gap-1.5 shrink-0">
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => <div key={i} className="glass-card h-72 animate-pulse" style={{ opacity: 0.5 }} />)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="glass-card p-16 text-center">
                        <div className="text-5xl mb-4">📦</div>
                        <h3 className="text-white font-semibold mb-2">No found items yet</h3>
                        <p className="text-white/50 text-sm">Be the first to report a found item!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {items.map(item => <ItemCard key={item._id} item={item} type="found" onDeleted={handleDeleted} />)}
                    </div>
                )}

                {pages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-10">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-glass px-3 py-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
                        <span className="text-white/60 text-sm">Page {page} of {pages}</span>
                        <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-glass px-3 py-2 disabled:opacity-40"><ChevronRight size={16} /></button>
                    </div>
                )}
            </div>
        </div>
    )
}
