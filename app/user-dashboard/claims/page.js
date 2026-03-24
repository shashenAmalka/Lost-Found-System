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

    // Drawer state
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [drawerEditMode, setDrawerEditMode] = useState(false);

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
        if (filter !== 'all') result = result.filter(c => c.status === filter);
        if (sort === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        else if (sort === 'oldest') result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        else if (sort === 'status') result.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
        return result;
    }, [claims, filter, sort]);

    const handleClaimUpdate = (updatedClaim) => {
        if (updatedClaim._deleted) {
            // Hard deleted — remove from list
            setClaims(prev => prev.filter(c => c._id !== updatedClaim._id));
            setSelectedClaim(null);
            return;
        }
        setClaims(prev => prev.map(c => c._id === updatedClaim._id ? { ...c, ...updatedClaim } : c));
        setSelectedClaim(prev => prev?._id === updatedClaim._id ? { ...prev, ...updatedClaim } : prev);
    };

    // Open drawer normally (view mode)
    const openDrawer = (claim) => {
        setDrawerEditMode(false);
        setSelectedClaim(claim);
    };

    // Open drawer directly in edit mode
    const openDrawerEdit = (claim) => {
        setDrawerEditMode(true);
        setSelectedClaim(claim);
    };

    // Open drawer directly in withdraw mode
    const openDrawerWithdraw = (claim) => {
        setDrawerEditMode(false);
        setSelectedClaim({ ...claim, _autoWithdraw: true });
    };

    const closeDrawer = () => {
        setSelectedClaim(null);
        setDrawerEditMode(false);
    };

    if (authLoading) return <div className="min-h-screen bg-[#F4F5F7]" />;
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
                    <Loader2 size={32} className="animate-spin mb-4 text-[#F0A500]" />
                    <p className="text-sm text-[#3E4A56] font-medium">Loading your claims...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gray-50 border border-gray-200">
                        <Search size={28} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1C2A59] mb-1">
                        {filter !== 'all' ? 'No claims match this filter' : 'No claims yet'}
                    </h3>
                    <p className="text-sm text-[#3E4A56] font-medium">
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
                            onViewDetails={openDrawer}
                            onEditRequest={openDrawerEdit}
                            onWithdrawRequest={openDrawerWithdraw}
                        />
                    ))}
                </div>
            )}

            {/* Detail Drawer */}
            {selectedClaim && (
                <ClaimDetailDrawer
                    claim={selectedClaim}
                    initialEditMode={drawerEditMode}
                    autoWithdraw={selectedClaim._autoWithdraw || false}
                    onClose={closeDrawer}
                    onClaimUpdate={handleClaimUpdate}
                />
            )}
        </div>
    );
}
