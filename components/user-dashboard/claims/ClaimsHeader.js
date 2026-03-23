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
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F0A500]/10 border border-[#F0A500]/30 shadow-sm">
                    <Search size={20} className="text-[#F0A500]" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-[#1C2A59] tracking-tight">My Claims</h1>
                    <p className="text-xs mt-0.5 text-[#3E4A56] font-medium">
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
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#3E4A56] hover:text-[#1C2A59] hover:bg-gray-50 transition-all bg-white border border-gray-200 shadow-sm">
                        <Filter size={14} />
                        {activeFilter.label}
                        <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {filterOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl py-1 shadow-lg z-50 bg-white border border-gray-200">
                            {FILTER_OPTIONS.map(opt => (
                                <button key={opt.value}
                                    onClick={() => { onFilterChange(opt.value); setFilterOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filter === opt.value ? 'text-[#008489] bg-[#E0F2FE]' : 'text-[#3E4A56] hover:text-[#1C2A59] hover:bg-gray-100'}`}>
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
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#3E4A56] hover:text-[#1C2A59] hover:bg-gray-50 transition-all bg-white border border-gray-200 shadow-sm">
                        <ArrowUpDown size={14} />
                        {activeSort.label}
                        <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {sortOpen && (
                        <div className="absolute right-0 mt-2 w-44 rounded-xl py-1 shadow-lg z-50 bg-white border border-gray-200">
                            {SORT_OPTIONS.map(opt => (
                                <button key={opt.value}
                                    onClick={() => { onSortChange(opt.value); setSortOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${sort === opt.value ? 'text-[#008489] bg-[#E0F2FE]' : 'text-[#3E4A56] hover:text-[#1C2A59] hover:bg-gray-100'}`}>
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
