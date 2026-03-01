import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import MatchCard from '@/components/user-dashboard/MatchCard';

/**
 * Standalone section displaying AI-found potential matches.
 * Renders either a grid of MatchCards or a glassmorphism empty state.
 * @param {{ matches: Array }} props
 */
export default function PotentialMatchesSection({ matches = [] }) {
    return (
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                <h2 className="text-2xl font-black text-white flex items-center gap-3 drop-shadow-sm">
                    <Sparkles className="text-[#D4AF37]" size={24} /> AI Found Matches
                </h2>
                <Link href="/matches" className="text-xs uppercase tracking-widest font-bold transition-colors flex items-center gap-2 group" style={{ color: 'rgba(245, 246, 250, 0.6)' }}>
                    <span className="group-hover:text-white transition-colors">View All Matrix</span> <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform group-hover:text-[#F06414]" />
                </Link>
            </div>

            {matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map((match, i) => (
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
                            submittedBy={match.submittedBy}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl p-12 text-center border relative overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,26,100,0.1)] to-transparent pointer-events-none" />
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center border" style={{ background: 'rgba(212, 175, 55, 0.05)', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                        <Sparkles size={28} color="#D4AF37" className="animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No active matches yet</h3>
                    <p className="text-sm font-medium leading-relaxed max-w-sm mx-auto" style={{ color: 'rgba(245, 246, 250, 0.5)' }}>
                        Our AI grid is constantly analyzing incoming database streams. We will alert you immediately if a probabilistic match occurs.
                    </p>
                </div>
            )}
        </section>
    );
}
