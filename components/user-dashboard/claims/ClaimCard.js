'use client';
import { Clock, MapPin, Eye, Package, Pencil, Trash2 } from 'lucide-react';

const STATUS_MAP = {
    under_review:      { label: 'Under Review',      color: '#0369A1', bg: '#E0F2FE', border: '#BAE6FD' },
    ai_matched:        { label: 'AI Screening',       color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
    admin_review:      { label: 'Admin Review',       color: '#4338CA', bg: '#E0E7FF', border: '#C7D2FE' },
    approved:          { label: 'Approved',            color: '#15803D', bg: '#DCFCE7', border: '#BBF7D0' },
    rejected:          { label: 'Rejected',            color: '#DC2626', bg: '#FEE2E2', border: '#FECACA' },
    withdrawn:         { label: 'Withdrawn',           color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB' },
    pickup_scheduled:  { label: 'Pickup Scheduled',   color: '#0F766E', bg: '#CCFBF1', border: '#99F6E4' },
    completed:         { label: 'Completed',           color: '#047857', bg: '#D1FAE5', border: '#A7F3D0' },
};

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ClaimCard({ claim, onViewDetails, onEditRequest, onWithdrawRequest }) {
    const status = STATUS_MAP[claim.status] || STATUS_MAP.under_review;
    const claimId = claim._id?.slice(-8)?.toUpperCase() || '—';
    const foundItem = claim.foundItemId;
    const lostItem = claim.lostItemId;
    const canAct = ['under_review', 'ai_matched'].includes(claim.status);

    return (
        <div
            className="relative rounded-[20px] p-6 transition-all duration-300 hover:translate-y-[-3px] group cursor-pointer bg-white border border-gray-200 shadow-sm hover:shadow-lg overflow-hidden"
            onClick={() => onViewDetails(claim)}>

            {/* Subtle left accent based on status */}
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px] transition-all duration-300"
                style={{ background: status.color, opacity: 0.7 }} />

            {/* Top Row */}
            <div className="flex items-start justify-between gap-4 mb-4 pl-2">
                <div className="flex items-center gap-4 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-gray-100 border border-gray-200 transition-transform duration-300 group-hover:scale-105">
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
                            Linked: {lostItem?.title || '—'} · <span className="text-gray-400">ID #{claimId}</span>
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
            <div className="flex items-center gap-5 text-xs flex-wrap text-gray-500 font-medium pl-2">
                {foundItem?.locationFound && (
                    <span className="flex items-center gap-1.5">
                        <MapPin size={12} /> {foundItem.locationFound}
                    </span>
                )}
                <span className="flex items-center gap-1.5">
                    <Clock size={12} /> Submitted {formatDate(claim.createdAt)}
                </span>
                {claim.updatedAt && claim.updatedAt !== claim.createdAt && (
                    <span className="flex items-center gap-1.5 text-[#D97706]">
                        ✏ Updated {formatDate(claim.updatedAt)}
                    </span>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 pl-2">
                <div className="flex items-center gap-2">
                    {/* View Details */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewDetails(claim); }}
                        className="flex items-center gap-2 text-sm font-bold transition-all px-3 py-1.5 rounded-xl text-[#F0A500] bg-[#F0A500]/10 border border-[#F0A500]/30 hover:bg-[#F0A500] hover:text-white hover:shadow-sm">
                        <Eye size={13} /> View Details
                    </button>

                    {/* Edit — only visible when claim can be edited */}
                    {canAct && onEditRequest && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEditRequest(claim); }}
                            className="flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-xl hover:shadow-sm"
                            style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
                            title="Edit this claim">
                            <Pencil size={12} /> Edit
                        </button>
                    )}

                    {/* Withdraw — only visible when claim can be withdrawn */}
                    {canAct && onWithdrawRequest && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onWithdrawRequest(claim); }}
                            className="flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-xl hover:shadow-sm"
                            style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
                            title="Withdraw this claim">
                            <Trash2 size={12} /> Withdraw
                        </button>
                    )}
                </div>

                {foundItem?.category && (
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-[#F4F5F7] text-[#3E4A56] border border-gray-200 tracking-widest">
                        {foundItem.category}
                    </span>
                )}
            </div>
        </div>
    );
}

export { STATUS_MAP };
