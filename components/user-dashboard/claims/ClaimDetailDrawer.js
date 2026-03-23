'use client';
import { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import ClaimTimeline from './ClaimTimeline';
import ClaimInfoSection from './ClaimInfoSection';
import AdminMessagePanel from './AdminMessagePanel';
import PickupScheduler from './PickupScheduler';
import { STATUS_MAP } from './ClaimCard';

export default function ClaimDetailDrawer({ claim, onClose, onClaimUpdate }) {
    const [withdrawing, setWithdrawing] = useState(false);

    if (!claim) return null;

    const status = STATUS_MAP[claim.status] || STATUS_MAP.under_review;
    const claimId = claim._id?.slice(-8)?.toUpperCase() || '—';
    const canWithdraw = ['under_review', 'ai_matched'].includes(claim.status);

    const handleWithdraw = async () => {
        if (!confirm('Are you sure you want to withdraw this claim? This action cannot be undone.')) return;
        setWithdrawing(true);
        try {
            const res = await fetch(`/api/claims/${claim._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'withdraw' }),
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (onClaimUpdate) onClaimUpdate(data.claim);
        } catch (err) {
            alert(err.message);
        } finally {
            setWithdrawing(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity" onClick={onClose} />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-2xl z-[70] overflow-y-auto bg-[#F4F5F7] shadow-[-20px_0_60px_rgba(0,0,0,0.1)]"
                style={{
                    animation: 'slideInRight 0.3s ease-out',
                }}>

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4 bg-white/90 backdrop-blur-md border-b border-gray-200">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-[#1C2A59]">Claim #{claimId}</h2>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                                style={{ background: status.bg, border: `1px solid ${status.border}`, color: status.color }}>
                                {status.label}
                            </span>
                        </div>
                        <p className="text-xs mt-1 text-[#3E4A56] font-medium">
                            {claim.foundItemId?.title || 'Unknown Item'} — Full Details
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all border border-gray-200">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Timeline */}
                    <ClaimTimeline claim={claim} />

                    {/* Admin Messages / Status Messages */}
                    <AdminMessagePanel claim={claim} />

                    {/* Pickup Scheduler (only if approved) */}
                    <PickupScheduler claim={claim} onScheduled={(updated) => { if (onClaimUpdate) onClaimUpdate(updated); }} />

                    {/* Claim Info */}
                    <ClaimInfoSection claim={claim} />

                    {/* Withdraw action */}
                    {canWithdraw && (
                        <div className="p-5 rounded-[16px] flex items-center justify-between bg-red-50 border border-red-200">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={16} className="text-red-500" />
                                <span className="text-sm text-red-700 font-medium">Want to cancel this claim?</span>
                            </div>
                            <button
                                onClick={handleWithdraw}
                                disabled={withdrawing}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50 text-red-600 bg-red-100 border border-red-300 hover:bg-red-200">
                                {withdrawing ? <Loader2 size={14} className="animate-spin" /> : null}
                                {withdrawing ? 'Withdrawing...' : 'Withdraw Claim'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Animation keyframe */}
            <style jsx global>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </>
    );
}
