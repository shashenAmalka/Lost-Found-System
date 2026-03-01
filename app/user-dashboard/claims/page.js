'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ClaimsHeader from '@/components/user-dashboard/claims/ClaimsHeader';
import ClaimCard from '@/components/user-dashboard/claims/ClaimCard';
import ClaimDetailDrawer from '@/components/user-dashboard/claims/ClaimDetailDrawer';
import { Search, Loader2 } from 'lucide-react';

const STATUS_ORDER = ['under_review', 'ai_matched', 'admin_review', 'approved', 'pickup_scheduled', 'rejected', 'withdrawn', 'completed'];

export default function MyClaimsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('newest');
    const [selectedClaim, setSelectedClaim] = useState(null);

    useEffect(() => {
        if (!user && !authLoading) { router.push('/login'); return; }
        if (!user) return;

        fetch('/api/claims', { credentials: 'include' })
            .then(r => r.json())
            .then(d => setClaims(d.claims || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [user, authLoading, router]);

    // Filter + Sort
    const filtered = useMemo(() => {
        let result = [...claims];

        // Filter
        if (filter !== 'all') {
            result = result.filter(c => c.status === filter);
        }

        // Sort
        if (sort === 'newest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sort === 'oldest') {
            result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sort === 'status') {
            result.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
        }

        return result;
    }, [claims, filter, sort]);

    const handleClaimUpdate = (updatedClaim) => {
        setClaims(prev => prev.map(c => c._id === updatedClaim._id ? { ...c, ...updatedClaim } : c));
        setSelectedClaim(prev => prev?._id === updatedClaim._id ? { ...prev, ...updatedClaim } : prev);
    };

    if (authLoading) return <div className="min-h-screen" style={{ backgroundColor: '#0B0F19' }} />;
    if (!user) return null;

    return (
        <div className="p-4 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full relative z-10">
            <ClaimsHeader
                totalCount={claims.length}
                filter={filter}
                onFilterChange={setFilter}
                sort={sort}
                onSortChange={setSort}
            />

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin mb-4" style={{ color: '#F06414' }} />
                    <p className="text-sm" style={{ color: 'rgba(245,246,250,0.4)' }}>Loading your claims...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Search size={28} style={{ color: 'rgba(245,246,250,0.15)' }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white/70 mb-1">
                        {filter !== 'all' ? 'No claims match this filter' : 'No claims yet'}
                    </h3>
                    <p className="text-sm" style={{ color: 'rgba(245,246,250,0.35)' }}>
                        {filter !== 'all'
                            ? 'Try changing the filter to see other claims'
                            : 'When you submit a claim for a found item, it will appear here'}
                    </p>
                </div>
            )}

            {/* Claims Grid */}
            {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filtered.map(claim => (
                        <ClaimCard
                            key={claim._id}
                            claim={claim}
                            onViewDetails={(c) => setSelectedClaim(c)}
                        />
                    ))}
                </div>
            )}

            {/* Detail Drawer */}
            {selectedClaim && (
                <ClaimDetailDrawer
                    claim={selectedClaim}
                    onClose={() => setSelectedClaim(null)}
                    onClaimUpdate={handleClaimUpdate}
                />
            )}
        </div>
    );
}
