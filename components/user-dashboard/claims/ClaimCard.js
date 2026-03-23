'use client';
import { Clock, MapPin, Eye, X, Package } from 'lucide-react';

const STATUS_MAP = {
    under_review: { label: 'Under Review', color: '#0369A1', bg: '#E0F2FE', border: '#BAE6FD' },
    ai_matched: { label: 'AI Screening', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
    admin_review: { label: 'Admin Review', color: '#4338CA', bg: '#E0E7FF', border: '#C7D2FE' },
    approved: { label: 'Approved', color: '#15803D', bg: '#DCFCE7', border: '#BBF7D0' },
    rejected: { label: 'Rejected', color: '#DC2626', bg: '#FEE2E2', border: '#FECACA' },
    withdrawn: { label: 'Withdrawn', color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB' },
    pickup_scheduled: { label: 'Pickup Scheduled', color: '#0F766E', bg: '#CCFBF1', border: '#99F6E4' },
    completed: { label: 'Completed', color: '#047857', bg: '#D1FAE5', border: '#A7F3D0' },
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
        <div className="rounded-[20px] p-6 transition-all duration-300 hover:translate-y-[-2px] group cursor-pointer bg-white border border-gray-200 shadow-sm hover:shadow-md"
            onClick={() => onViewDetails(claim)}>
            {/* Top Row */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 min-w-0">
                    {/* Item Thumbnail */}
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-gray-100 border border-gray-200">
                        {foundItem?.photoUrl ? (
                            <img src={foundItem.photoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <Package size={22} className="text-gray-400" />
                        )}
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-[#1C2A59] font-bold text-base truncate group-hover:text-[#F0A500] transition-colors">
                            {foundItem?.title || 'Unknown Item'}
                        </h3>
                        <p className="text-xs mt-0.5 truncate text-[#3E4A56] font-medium">
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
            <div className="flex items-center gap-5 text-xs flex-wrap text-gray-500 font-medium">
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
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                <button
                    onClick={(e) => { e.stopPropagation(); onViewDetails(claim); }}
                    className="flex items-center gap-2 text-sm font-bold transition-colors px-4 py-2 rounded-xl text-[#F0A500] bg-[#F0A500]/10 border border-[#F0A500]/30 hover:bg-[#F0A500] hover:text-white">
                    <Eye size={14} /> View Details
                </button>

                {claim.foundItemId?.category && (
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-[#F4F5F7] text-[#3E4A56] border border-gray-200 tracking-widest">
                        {foundItem.category}
                    </span>
                )}
            </div>
        </div>
    );
}

export { STATUS_MAP };
