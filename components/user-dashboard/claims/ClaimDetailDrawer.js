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
            <div className="fixed top-0 right-0 h-full w-full max-w-2xl z-[70] overflow-y-auto"
                style={{
                    background: '#0B0F19',
                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
                    animation: 'slideInRight 0.3s ease-out',
                }}>

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4"
                    style={{ background: 'rgba(11,15,25,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-white">Claim #{claimId}</h2>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                                style={{ background: status.bg, border: `1px solid ${status.border}`, color: status.color }}>
                                {status.label}
                            </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: 'rgba(245,246,250,0.4)' }}>
                            {claim.foundItemId?.title || 'Unknown Item'} — Full Details
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
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
                        <div className="p-5 rounded-[16px] flex items-center justify-between"
                            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={16} style={{ color: '#f87171' }} />
                                <span className="text-sm" style={{ color: 'rgba(245,246,250,0.6)' }}>Want to cancel this claim?</span>
                            </div>
                            <button
                                onClick={handleWithdraw}
                                disabled={withdrawing}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
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
