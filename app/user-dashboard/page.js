'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import WelcomeBanner from '@/components/user-dashboard/WelcomeBanner';
import StatusStepper from '@/components/user-dashboard/StatusStepper';
import MatchCard from '@/components/user-dashboard/MatchCard';
import UpdatesPanel from '@/components/user-dashboard/UpdatesPanel';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // We will keep the data fetching logic but adapt it for our new UI
    const [myLost, setMyLost] = useState([]);
    const [myClaims, setMyClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data for potential matches based on design
    const dummyMatches = [
        { id: 1, title: 'MacBook Pro 14"', location: 'Library, 3rd Floor', category: 'Electronics', matchScore: 98, timeAgo: '2 hours ago', imageUrl: null },
        { id: 2, title: 'Blue Hydro Flask', location: 'Gym Locker Room', category: 'Personal', matchScore: 85, timeAgo: 'Yesterday', imageUrl: null },
        { id: 3, title: 'Sony Headphones', location: 'Student Center', category: 'Electronics', matchScore: 72, timeAgo: '2 days ago', imageUrl: null },
    ];

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        Promise.all([
            fetch('/api/lost-items', { credentials: 'include' }).then(r => r.json()),
            fetch('/api/claims', { credentials: 'include' }).then(r => r.json()),
        ]).then(([lost, claims]) => {
            setMyLost((lost.items || []).filter(i => i.postedBy === user.id));
            setMyClaims(claims.claims || []);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [user]);

    if (authLoading) return <div className="min-h-screen bg-campus-background" />;
    if (!user) { router.push('/login'); return null; }

    const activeClaimsCount = myClaims.filter(c => c.status !== 'rejected').length;

    // Pick the most recent active claim for the stepper, or a dummy if none
    const latestClaim = myClaims[0];
    const claimStatus = latestClaim?.status || 'ai_matched'; // Just an example

    return (
        <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">

                {/* Left/Main Column */}
                <div className="flex flex-col gap-8 min-w-0">

                    <WelcomeBanner
                        userName={user.name?.split(' ')[0] || 'Student'}
                        activeClaims={activeClaimsCount || 1}
                        historyCount={myLost.length || 4}
                        studentId={user.studentId || '24901234'}
                    />

                    {/* Active Claim Status Section */}
                    <section>
                        <StatusStepper
                            currentStatus={claimStatus}
                            claimId={latestClaim?._id?.substring(0, 8) || '8823-XJ'}
                            itemName={latestClaim?.lostItemId?.title || 'Black North Face Backpack'}
                            lastSeen={latestClaim?.lostItemId?.location || 'University Library, 3rd Floor'}
                            statusDates={{
                                submitted: 'Oct 24, 10:30 AM',
                                ai_matched: 'Oct 24, 10:32 AM'
                            }}
                        />
                    </section>

                    {/* Potential Matches Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-campus-text">Potential Matches</h2>
                            <Link href="/matches" className="text-sm font-semibold text-campus-muted hover:text-campus-text flex items-center gap-1 transition-colors">
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(user.matches || dummyMatches).map((match, i) => (
                                <MatchCard
                                    key={match.id || i}
                                    id={match.id}
                                    title={match.title}
                                    location={match.location}
                                    category={match.category}
                                    matchScore={match.matchScore}
                                    timeAgo={match.timeAgo}
                                    imageUrl={match.imageUrl}
                                />
                            ))}
                        </div>
                    </section>

                </div>

                {/* Right Column / Updates Panel */}
                <aside className="relative">
                    <div className="sticky top-8">
                        <UpdatesPanel />
                    </div>
                </aside>

            </div>
        </div>
    );
}
