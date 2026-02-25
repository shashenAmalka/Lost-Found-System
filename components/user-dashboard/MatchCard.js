import { MapPin, CalendarClock, Tag } from 'lucide-react';
import Link from 'next/link';

export default function MatchCard({ id, imageUrl, matchScore, timeAgo, title, location, category }) {

    // Determine badge color based on score
    const getBadgeStyle = (score) => {
        if (score >= 90) return 'bg-campus-success.10 text-campus-success border-campus-success/30';
        if (score >= 70) return 'bg-campus-warning/10 text-campus-warning border-campus-warning/30';
        return 'bg-orange-100 text-orange-600 border-orange-200';
    };

    const badgeStyle = getBadgeStyle(matchScore);

    return (
        <div className="bg-white rounded-[16px] overflow-hidden border border-campus-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group relative">

            {/* Image Area */}
            <div className="h-40 w-full relative bg-slate-100 overflow-hidden">
                {imageUrl ? (
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-400">
                        No Image
                    </div>
                )}

                {/* Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Match Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-bold border backdrop-blur-md shadow-sm opacity-90 ${badgeStyle}`}>
                    {matchScore}% Match
                </div>

                {/* Time Ago Label */}
                <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1 drop-shadow-md">
                    <CalendarClock size={12} /> {timeAgo}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-campus-text text-lg mb-2 line-clamp-1">{title}</h3>

                <div className="flex items-start gap-2 text-campus-muted text-sm mb-3">
                    <MapPin size={16} className="shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{location}</span>
                </div>

                <div className="mt-auto pt-2 border-t border-campus-border border-dashed flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <Tag size={12} /> {category}
                    </span>

                    <Link
                        href={`/matches/${id}`}
                        className="px-4 py-1.5 bg-white border border-campus-border rounded-lg text-sm font-semibold text-campus-primary hover:bg-campus-primary hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Review Match
                    </Link>
                </div>
            </div>
        </div>
    );
}
