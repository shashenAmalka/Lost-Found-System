'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import useDashboardData from '@/components/user-dashboard/useDashboardData'
import SidebarNav from '@/components/user-dashboard/SidebarNav'
import MatchCard from '@/components/user-dashboard/MatchCard'
import { Sparkles, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function MatchesPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const { matches, loading } = useDashboardData(user)
    const [search, setSearch] = useState('')
    const [catFilter, setCatFilter] = useState('')

    if (authLoading) return <div className="min-h-screen bg-[#F4F5F7]" />
    if (!user) { router.push('/login'); return null }

    const categories = [...new Set(matches.map(m => m.category).filter(Boolean))]

    const filtered = matches.filter(m => {
        const matchSearch = !search || m.title?.toLowerCase().includes(search.toLowerCase()) || m.location?.toLowerCase().includes(search.toLowerCase())
        const matchCat = !catFilter || m.category === catFilter
        return matchSearch && matchCat
    })

    return (
        <div className="min-h-screen flex bg-[#F4F5F7] font-sans">
            <SidebarNav />

            <main className="flex-1 md:ml-64 min-h-screen p-6 md:p-8 overflow-y-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 text-gray-400">
                            <Link href="/user-dashboard" className="hover:text-[#1C2A59] transition-colors">Dashboard</Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-[#F0A500]">Potential Matches</span>
                        </div>
                        <h1 className="text-3xl font-black text-[#1C2A59] flex items-center gap-3 tracking-tight">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#fef3c7] border border-[#fde68a]">
                                <Sparkles size={20} className="text-[#F0A500]" />
                            </div>
                            AI Potential Matches
                        </h1>
                        <p className="text-sm mt-1 font-medium text-gray-500">
                            Items our AI engine has matched to your lost reports
                        </p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium border border-gray-200 bg-white outline-none transition-all focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] text-[#1C2A59] placeholder-gray-400"
                            placeholder="Search matches by title or location..."
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-gray-400 shrink-0" />
                        <select
                            className="px-4 py-3 rounded-xl text-sm font-semibold border border-gray-200 bg-white outline-none text-[#1C2A59] focus:border-[#F0A500]"
                            value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                        <p className="text-2xl font-black text-[#1C2A59]">{matches.length}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-1 text-gray-400">Total Matches</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border-l-4 shadow-sm" style={{ borderLeftColor: '#F0A500', borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                        <p className="text-2xl font-black text-[#F0A500]">{filtered.length}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-1 text-gray-400">Showing</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hidden sm:block">
                        <p className="text-2xl font-black text-[#008489]">{categories.length}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-1 text-gray-400">Categories</p>
                    </div>
                </div>

                {/* Matches Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-72 rounded-2xl animate-pulse bg-white border border-gray-100" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center shadow-sm">
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-[#fef3c7] border border-[#fde68a]">
                            <Sparkles size={28} className="text-[#F0A500] animate-pulse" />
                        </div>
                        <h3 className="text-xl font-black text-[#1C2A59] mb-2">
                            {matches.length === 0 ? 'No matches yet' : 'No results found'}
                        </h3>
                        <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto">
                            {matches.length === 0
                                ? "Our AI is continuously scanning. We'll alert you immediately when a strong match is found."
                                : 'Try adjusting your search or filter criteria.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((match, i) => (
                            <MatchCard
                                key={match.id || i}
                                id={match.id}
                                title={match.title}
                                location={match.location}
                                category={match.category}
                                matchScore={match.matchScore}
                                timeAgo={match.timeAgo || 'Recently'}
                                imageUrl={match.imageUrl}
                                lostItemId={match.lostItemId}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
