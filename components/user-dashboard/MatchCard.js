import { MapPin, CalendarClock, Tag } from 'lucide-react';
import Link from 'next/link';

export default function MatchCard({ id, imageUrl, matchScore, timeAgo, title, location, category }) {
    return (
        <div className="rounded-[20px] overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer group relative hover:-translate-y-2"
            style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(30px)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}>

            {/* Image Area */}
            <div className="h-44 w-full relative overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                {imageUrl ? (
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1A1A64]/30 to-black flex items-center justify-center text-white/30 font-semibold tracking-widest uppercase text-xs">
                        No Image
                    </div>
                )}

                {/* Gradient Overlay for Readability */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(11, 15, 25, 1) 0%, transparent 60%)' }} />

                {/* AI Match Badge — no percentage shown to users */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg text-sm font-black tracking-wider border backdrop-blur-xl shadow-lg transform group-hover:scale-105 transition-transform"
                    style={{
                        background: 'rgba(212, 175, 55, 0.1)',
                        color: '#D4AF37',
                        borderColor: 'rgba(212, 175, 55, 0.4)',
                        boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
                    }}>
                    ✨ AI Match
                </div>

                {/* Time Ago Label */}
                <div className="absolute bottom-4 left-4 text-xs font-bold tracking-wide flex items-center gap-1.5 drop-shadow-md" style={{ color: 'rgba(245, 246, 250, 0.8)' }}>
                    <CalendarClock size={14} /> {timeAgo}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-1 relative z-10">
                <h3 className="font-bold text-xl mb-3 line-clamp-1 drop-shadow-sm text-white group-hover:text-[#F06414] transition-colors">{title}</h3>

                <div className="flex items-start gap-2 text-sm mb-4 font-medium" style={{ color: 'rgba(245, 246, 250, 0.6)' }}>
                    <MapPin size={16} className="shrink-0 mt-0.5 opacity-70" />
                    <span className="line-clamp-2 leading-relaxed">{location}</span>
                </div>

                <div className="mt-auto pt-4 border-t flex items-center justify-between gap-3" style={{ borderTopColor: 'rgba(255,255,255,0.06)' }}>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(245, 246, 250, 0.7)' }}>
                        <Tag size={12} className="opacity-60" /> {category}
                    </span>

                    <Link
                        href={`/found-items/${id}`}
                        className="px-5 py-2 rounded-xl text-sm font-bold transition-all relative overflow-hidden border group/btn flex items-center justify-center shrink-0"
                        style={{
                            background: 'rgba(26, 26, 100, 0.2)',
                            color: 'white',
                            borderColor: 'rgba(26, 26, 100, 0.6)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute inset-0 bg-[#1A1A64] opacity-0 group-hover/btn:opacity-100 transition-opacity z-0" />
                        <span className="relative z-10 drop-shadow-md">Review Matrix</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
