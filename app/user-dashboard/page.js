'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import useDashboardData from '@/components/user-dashboard/useDashboardData';
import WelcomeBanner from '@/components/user-dashboard/WelcomeBanner';
import ActiveClaimSection from '@/components/user-dashboard/ActiveClaimSection';
import PotentialMatchesSection from '@/components/user-dashboard/PotentialMatchesSection';
import UpdatesPanel from '@/components/user-dashboard/UpdatesPanel';
import RestrictionBanner from '@/components/user-dashboard/RestrictionBanner';
import WarningHistoryPanel from '@/components/user-dashboard/WarningHistoryPanel';
import AppealModal from '@/components/user-dashboard/AppealModal';

export default function UserDashboard() {
    const { user, loading: authLoading, isRestricted, isLimited } = useAuth();
    const router = useRouter();
    const { myLost, myClaims, notifications, matches, loading } = useDashboardData(user);
    const [showAppealModal, setShowAppealModal] = useState(false);
    const [warnings, setWarnings] = useState([]);
    const [existingAppeal, setExistingAppeal] = useState(null);

    // Fetch warnings + appeals for restricted users
    useEffect(() => {
        if (!user || !isRestricted) return;
        fetch('/api/appeals', { credentials: 'include' })
            .then(r => r.json())
            .then(d => {
                setWarnings(d.warnings || []);
                const pending = (d.appeals || []).find(a => a.status === 'PENDING');
                setExistingAppeal(pending || null);
            })
            .catch(() => { });
    }, [user, isRestricted]);

    if (authLoading) return <div className="min-h-screen" style={{ backgroundColor: '#F4F5F7' }} />;
    if (!user) { router.push('/login'); return null; }

    const activeClaimsCount = myClaims.filter(c => c.status !== 'rejected').length;
    const latestClaim = myClaims[0] || null;

    return (
        <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full relative z-10">

            {/* Restriction Banner for limited/restricted users */}
            {isRestricted && (
                <RestrictionBanner onAppealClick={() => setShowAppealModal(true)} />
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 lg:gap-12">

                {/* Left/Main Column */}
                <div className="flex flex-col gap-10 min-w-0">
                    <WelcomeBanner
                        userName={user.name?.split(' ')[0] || 'Student'}
                        activeClaims={activeClaimsCount}
                        historyCount={myLost.length}
                        studentId={user.studentId || 'N/A'}
                    />

                    <ActiveClaimSection latestClaim={latestClaim} />

                    <PotentialMatchesSection matches={matches} />

                    {/* Warning History for restricted users */}
                    {isRestricted && warnings.length > 0 && (
                        <WarningHistoryPanel warnings={warnings} />
                    )}
                </div>

                {/* Right Column / Updates Panel */}
                <aside className="relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <div className="sticky top-10">
                        <UpdatesPanel updates={notifications} />
                    </div>
                </aside>

            </div>

            {/* Appeal Modal */}
            {showAppealModal && (
                <AppealModal
                    onClose={() => setShowAppealModal(false)}
                    existingAppeal={existingAppeal}
                    onSuccess={() => {
                        setShowAppealModal(false);
                        // Refetch appeals
                        fetch('/api/appeals', { credentials: 'include' })
                            .then(r => r.json())
                            .then(d => {
                                const pending = (d.appeals || []).find(a => a.status === 'PENDING');
                                setExistingAppeal(pending || null);
                            });
                    }}
                />
            )}
        </div>
    );
}
