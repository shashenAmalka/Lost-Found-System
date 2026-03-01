'use client';
import { Clock, MapPin, Eye, X, Package } from 'lucide-react';

const STATUS_MAP = {
    under_review: { label: 'Under Review', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)' },
    ai_matched: { label: 'AI Screening', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
    admin_review: { label: 'Admin Review', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.35)' },
    approved: { label: 'Approved', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' },
    rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)' },
    withdrawn: { label: 'Withdrawn', color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.35)' },
    pickup_scheduled: { label: 'Pickup Scheduled', color: '#14b8a6', bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.35)' },
    completed: { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)' },
};

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ClaimCard({ claim, onViewDetails }) {
    const status = STATUS_MAP[claim.status] || STATUS_MAP.under_review;
    const claimId = claim._id?.slice(-8)?.toUpperCase() || '—';
    const foundItem = claim.foundItemId;
    const lostItem = claim.lostItemId;

    return (
        <div className="rounded-[20px] p-6 transition-all duration-300 hover:translate-y-[-2px] group cursor-pointer"
            onClick={() => onViewDetails(claim)}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}>
            {/* Top Row */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 min-w-0">
                    {/* Item Thumbnail */}
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {foundItem?.photoUrl ? (
                            <img src={foundItem.photoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <Package size={22} style={{ color: 'rgba(245,246,250,0.3)' }} />
                        )}
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-white font-semibold text-base truncate group-hover:text-white/90 transition-colors">
                            {foundItem?.title || 'Unknown Item'}
                        </h3>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(245,246,250,0.4)' }}>
                            Claiming: {lostItem?.title || '—'} · ID: #{claimId}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <span className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap"
                    style={{ background: status.bg, border: `1px solid ${status.border}`, color: status.color }}>
                    {status.label}
                </span>
            </div>

            {/* Meta Row */}
            <div className="flex items-center gap-5 text-xs flex-wrap" style={{ color: 'rgba(245,246,250,0.45)' }}>
                {foundItem?.locationFound && (
                    <span className="flex items-center gap-1.5">
                        <MapPin size={12} /> {foundItem.locationFound}
                    </span>
                )}
                <span className="flex items-center gap-1.5">
                    <Clock size={12} /> Submitted {formatDate(claim.createdAt)}
                </span>
                {claim.updatedAt && claim.updatedAt !== claim.createdAt && (
                    <span className="flex items-center gap-1.5">
                        Updated {formatDate(claim.updatedAt)}
                    </span>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                    onClick={(e) => { e.stopPropagation(); onViewDetails(claim); }}
                    className="flex items-center gap-2 text-sm font-medium transition-colors px-4 py-2 rounded-xl"
                    style={{ color: '#F06414', background: 'rgba(240,100,20,0.1)', border: '1px solid rgba(240,100,20,0.25)' }}>
                    <Eye size={14} /> View Details
                </button>

                {claim.foundItemId?.category && (
                    <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(245,246,250,0.4)' }}>
                        {foundItem.category}
                    </span>
                )}
            </div>
        </div>
    );
}

export { STATUS_MAP };
