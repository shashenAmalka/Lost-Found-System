'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import useDashboardData from '@/components/user-dashboard/useDashboardData';
import WelcomeBanner from '@/components/user-dashboard/WelcomeBanner';
import ActiveClaimSection from '@/components/user-dashboard/ActiveClaimSection';
import PotentialMatchesSection from '@/components/user-dashboard/PotentialMatchesSection';
import UpdatesPanel from '@/components/user-dashboard/UpdatesPanel';

export default function UserDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { myLost, myClaims, notifications, matches, loading } = useDashboardData(user);

    if (authLoading) return <div className="min-h-screen" style={{ backgroundColor: '#0B0F19' }} />;
    if (!user) { router.push('/login'); return null; }

    const activeClaimsCount = myClaims.filter(c => c.status !== 'rejected').length;
    const latestClaim = myClaims[0] || null;

    return (
        <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full relative z-10">
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
                </div>

                {/* Right Column / Updates Panel */}
                <aside className="relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <div className="sticky top-10">
                        <UpdatesPanel updates={notifications} />
                    </div>
                </aside>

            </div>
        </div>
    );
}
