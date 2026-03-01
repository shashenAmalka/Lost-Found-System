'use client';
import { Search, Filter, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const FILTER_OPTIONS = [
    { value: 'all', label: 'All Claims' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'ai_matched', label: 'AI Screening' },
    { value: 'admin_review', label: 'Admin Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'status', label: 'By Status' },
];

export default function ClaimsHeader({ totalCount, filter, onFilterChange, sort, onSortChange }) {
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);

    const activeFilter = FILTER_OPTIONS.find(f => f.value === filter) || FILTER_OPTIONS[0];
    const activeSort = SORT_OPTIONS.find(s => s.value === sort) || SORT_OPTIONS[0];

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            {/* Title */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(240, 100, 20, 0.15)', border: '1px solid rgba(240, 100, 20, 0.3)' }}>
                    <Search size={20} style={{ color: '#F06414' }} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">My Claims</h1>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(245, 246, 250, 0.5)' }}>
                        {totalCount} claim{totalCount !== 1 ? 's' : ''} total
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
                {/* Filter Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Filter size={14} />
                        {activeFilter.label}
                        <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {filterOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl py-1 shadow-lg z-50"
                            style={{ background: '#13162B', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {FILTER_OPTIONS.map(opt => (
                                <button key={opt.value}
                                    onClick={() => { onFilterChange(opt.value); setFilterOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${filter === opt.value ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <ArrowUpDown size={14} />
                        {activeSort.label}
                        <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {sortOpen && (
                        <div className="absolute right-0 mt-2 w-44 rounded-xl py-1 shadow-lg z-50"
                            style={{ background: '#13162B', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {SORT_OPTIONS.map(opt => (
                                <button key={opt.value}
                                    onClick={() => { onSortChange(opt.value); setSortOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === opt.value ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
