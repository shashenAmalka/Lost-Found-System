'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ItemCard from '@/components/ui/ItemCard'
import { useAuth } from '@/context/AuthContext'
import { Loader2, ArrowLeft, Search, Pencil, Trash2, X, MapPin, Send } from 'lucide-react'

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Keys', 'ID Card', 'Bag', 'Jewelry', 'Sports', 'Other']

export default function MyFoundItemsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState('')
    const [filters, setFilters] = useState({ q: '', category: '', location: '' })
    const [actionError, setActionError] = useState('')

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
            return
        }

        if (!user) return

        const fetchItems = async () => {
            try {
                const res = await fetch('/api/found-items?page=1&limit=1000', { credentials: 'include' })
                const data = await res.json()
                const myItems = (data.items || []).filter(item => item.submittedBy?.toString() === user.id)
                setItems(myItems)
            } catch {
                setItems([])
            } finally {
                setLoading(false)
            }
        }

        fetchItems()
    }, [authLoading, router, user])

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }, [items])

    const filteredItems = useMemo(() => {
        const query = filters.q.trim().toLowerCase()
        return sortedItems.filter((item) => {
            const matchesQuery = !query || [item.title, item.description, item.locationFound, item.category, item.keywords]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query))

            const matchesCategory = !filters.category || item.category === filters.category

            const itemLocation = String(item.locationFound || '').toLowerCase()
            const matchesLocation = !filters.location || itemLocation.includes(filters.location.trim().toLowerCase())

            return matchesQuery && matchesCategory && matchesLocation
        })
    }, [sortedItems, filters])

    const handleDelete = async (itemId) => {
        const targetItem = items.find(item => item._id === itemId)
        if (!targetItem || targetItem.status !== 'pending') {
            setActionError('This item is not in the pending status to edit or delete.')
            return
        }

        const confirmed = window.confirm('Delete this found item report?')
        if (!confirmed) return

        setDeletingId(itemId)
        try {
            const res = await fetch(`/api/found-items/${itemId}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            if (!res.ok) throw new Error('Delete failed')
            setItems(prev => prev.filter(item => item._id !== itemId))
        } finally {
            setDeletingId('')
        }
    }

    const handleEdit = (item) => {
        if (item.status !== 'pending') {
            setActionError('This item is not in the pending status to edit or delete.')
            return
        }
        setActionError('')
        router.push(`/found-items/${item._id}/edit?returnTo=/my-found-items`)
    }

    const setFilter = (key) => (event) => {
        const value = event.target.value
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters({ q: '', category: '', location: '' })
    }

    if (authLoading) return <div className="min-h-screen bg-[#F4F5F7]" />
    if (!user) return null

    return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans flex flex-col">
            <Navbar />

            <div className="bg-[#1C2A59] pt-28 pb-14 px-4 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-4 text-white/80 text-sm font-medium">
                        <Link href="/user-dashboard" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                            <ArrowLeft size={16} /> Back to dashboard
                        </Link>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">My Found Items</h1>
                    <p className="text-gray-300 font-medium">Reports you created for found items.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex-1 w-full">
                <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-lg mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative flex">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            className="flex-1 pl-10 pr-12 py-3 bg-[#F4F5F7] border border-gray-200 rounded-l-xl text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors"
                            placeholder="Search by keyword..."
                            value={filters.q}
                            onChange={setFilter('q')}
                        />
                        <button
                            type="button"
                            className="px-4 py-3 bg-[#F0A500] text-white rounded-r-xl font-bold text-sm hover:bg-[#d69300] transition-colors flex items-center justify-center shrink-0"
                            title="Search found items"
                        >
                            <Send size={16} />
                        </button>
                    </div>

                    <select
                        className="w-full md:w-56 px-4 py-3 bg-[#F4F5F7] border border-gray-200 rounded-xl text-sm font-medium text-[#1C2A59] focus:outline-none focus:border-[#F0A500] transition-colors appearance-none"
                        value={filters.category}
                        onChange={setFilter('category')}
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                    </select>

                    <div className="relative w-full md:w-56">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            className="w-full pl-9 pr-4 py-3 bg-[#F4F5F7] border border-gray-200 rounded-xl text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors"
                            placeholder="Filter by location..."
                            value={filters.location}
                            onChange={setFilter('location')}
                        />
                    </div>

                    {(filters.q || filters.category || filters.location) && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors border border-transparent hover:border-red-200"
                        >
                            <X size={16} /> Clear
                        </button>
                    )}
                </div>

                {actionError && (
                    <div className="mb-6 p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold">
                        {actionError}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 size={32} className="animate-spin mb-4 text-[#F0A500]" />
                        <p className="text-sm text-[#3E4A56] font-medium">Loading your found item reports...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto bg-gray-50 border border-gray-200">
                            <Search size={28} className="text-gray-300" />
                        </div>
                        <h3 className="text-[#1C2A59] font-bold text-xl mb-2">
                            {items.length === 0 ? 'No found item reports yet' : 'No items match your filters'}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            {items.length === 0 ? 'Create a found item report to see it here.' : 'Try adjusting your search criteria or clear the filters to see all your reports.'}
                        </p>
                        {items.length === 0 ? (
                            <Link href="/found-items/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold" style={{ backgroundColor: '#F0A500', color: '#1C2A59' }}>
                                Report Found Item
                            </Link>
                        ) : (
                            <button type="button" onClick={clearFilters} className="text-sm font-bold text-[#008489] hover:underline">
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map(item => (
                            <div key={item._id} className="flex flex-col gap-3">
                                <ItemCard item={item} type="found" showEditCountdown={false} />
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(item)}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                        <Pencil size={14} /> Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item._id)}
                                        disabled={deletingId === item._id}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 size={14} />
                                        {deletingId === item._id ? 'Deleting' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}