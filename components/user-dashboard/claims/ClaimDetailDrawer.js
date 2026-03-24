'use client';
import { useState } from 'react';
import {
    X, Loader2, AlertTriangle, Pencil, Check, RotateCcw,
    Trash2, ChevronDown, Shield, FileText, MapPin, Clock, Tag
} from 'lucide-react';
import ClaimTimeline from './ClaimTimeline';
import ClaimInfoSection from './ClaimInfoSection';
import AdminMessagePanel from './AdminMessagePanel';
import PickupScheduler from './PickupScheduler';
import { STATUS_MAP } from './ClaimCard';

const WITHDRAW_REASONS = [
    'Found it elsewhere',
    'Made a mistake — wrong item',
    'No longer need to claim',
    'Resolved it privately',
    'Other',
];

// ─── Inline Edit Form ────────────────────────────────────────────────────────
function InlineEditForm({ claim, onSave, onCancel }) {
    const [form, setForm] = useState({
        ownershipExplanation: claim.ownershipExplanation || '',
        hiddenDetails: claim.hiddenDetails || '',
        exactColorBrand: claim.exactColorBrand || '',
        dateLost: claim.dateLost ? claim.dateLost.slice(0, 10) : '',
        timeLost: claim.timeLost || '',
        locationLost: claim.locationLost || '',
        proofUrl: claim.proofUrl || '',
        pickupPreference: claim.pickupPreference || 'Campus Lost & Found Office',
    });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSave = async () => {
        if (!form.ownershipExplanation.trim()) {
            setErr('Ownership explanation is required.');
            return;
        }
        setSaving(true);
        setErr('');
        try {
            const res = await fetch(`/api/claims/${claim._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update', ...form }),
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update');
            onSave(data.claim);
        } catch (e) {
            setErr(e.message);
        } finally {
            setSaving(false);
        }
    };

    const input = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#F4F5F7] text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-2 focus:ring-[#F0A500]/20 transition-all';
    const label = 'text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5';

    return (
        <div className="p-5 rounded-[20px] border border-[#F0A500]/40 bg-[#FFFBEB] space-y-5 shadow-md"
            style={{ animation: 'fadeSlideIn 0.25s ease-out' }}>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#F0A500] flex items-center justify-center">
                        <Pencil size={13} className="text-white" />
                    </div>
                    <span className="text-sm font-extrabold text-[#1C2A59]">Edit Claim Details</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                    Editing Mode
                </span>
            </div>

            <div>
                <label className={label}><FileText size={10} /> Ownership Explanation <span className="text-red-400">*</span></label>
                <textarea rows={4} className={`${input} resize-y`}
                    placeholder="Describe how this item is yours in detail..."
                    value={form.ownershipExplanation} onChange={change('ownershipExplanation')} />
            </div>

            <div>
                <label className={label}>Identifying Marks / Hidden Details</label>
                <textarea rows={2} className={`${input} resize-y`}
                    placeholder="Scratches, stickers, marks not visible in photos..."
                    value={form.hiddenDetails} onChange={change('hiddenDetails')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={label}><Tag size={10} /> Exact Color / Brand</label>
                    <input className={input} placeholder="e.g. Matte Black, Apple iPhone"
                        value={form.exactColorBrand} onChange={change('exactColorBrand')} />
                </div>
                <div>
                    <label className={label}><MapPin size={10} /> Where did you lose it?</label>
                    <input className={input} placeholder="e.g. Library 2nd Floor"
                        value={form.locationLost} onChange={change('locationLost')} />
                </div>
                <div>
                    <label className={label}><Clock size={10} /> Date Lost</label>
                    <input type="date" className={input} max={new Date().toISOString().split('T')[0]}
                        value={form.dateLost} onChange={change('dateLost')} />
                </div>
                <div>
                    <label className={label}>Time Lost</label>
                    <input type="time" className={input}
                        value={form.timeLost} onChange={change('timeLost')} />
                </div>
            </div>

            <div>
                <label className={label}>Proof URL (optional)</label>
                <input className={input} placeholder="Link to photo, receipt, etc."
                    value={form.proofUrl} onChange={change('proofUrl')} />
            </div>

            <div>
                <label className={label}>Pickup Preference</label>
                <select className={input} value={form.pickupPreference} onChange={change('pickupPreference')}>
                    <option>Campus Lost &amp; Found Office</option>
                    <option>Security Office</option>
                    <option>Department Office</option>
                    <option>Other (mention in explanation)</option>
                </select>
            </div>

            {err && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle size={13} /> {err}
                </div>
            )}

            <div className="flex items-center gap-3 pt-1">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.03] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #1C2A59, #2d4080)' }}>
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={onCancel} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#3E4A56] bg-white border border-gray-200 transition-all hover:bg-gray-50 hover:scale-[1.02]">
                    <RotateCcw size={14} /> Discard
                </button>
            </div>
        </div>
    );
}

// ─── Smart Withdraw Modal ─────────────────────────────────────────────────────
function WithdrawModal({ claimId, onClose, onWithdrawn }) {
    const [reason, setReason] = useState('');
    const [custom, setCustom] = useState('');
    const [step, setStep] = useState(1); // 1 = choose reason, 2 = confirm
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const finalReason = reason === 'Other' ? custom.trim() : reason;

    const handleWithdraw = async () => {
        setLoading(true);
        setErr('');
        try {
            const res = await fetch(`/api/claims/${claimId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'withdraw', withdrawReason: finalReason }),
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            onWithdrawn(data.claim);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Scrim */}
            <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm" onClick={onClose}
                style={{ animation: 'fadeIn 0.2s ease-out' }} />

            {/* Modal */}
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden"
                    style={{ animation: 'scaleUp 0.25s ease-out' }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                <Trash2 size={18} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-[#1C2A59]">Withdraw Claim</h3>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">This cannot be undone</p>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="px-6 py-5">
                        {step === 1 && (
                            <div style={{ animation: 'fadeSlideIn 0.2s ease-out' }}>
                                <p className="text-sm font-semibold text-[#3E4A56] mb-4">
                                    Why are you withdrawing this claim?
                                </p>
                                <div className="space-y-2">
                                    {WITHDRAW_REASONS.map(r => (
                                        <button key={r} onClick={() => setReason(r)}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${reason === r
                                                ? 'bg-[#1C2A59] text-white border-[#1C2A59] shadow-sm'
                                                : 'bg-[#F4F5F7] text-[#3E4A56] border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                                }`}>
                                            {r}
                                        </button>
                                    ))}
                                </div>

                                {reason === 'Other' && (
                                    <textarea rows={3} className="mt-3 w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#F4F5F7] text-sm font-medium text-[#1C2A59] focus:outline-none focus:border-[#F0A500] focus:ring-2 focus:ring-[#F0A500]/20 transition-all resize-none"
                                        placeholder="Briefly describe your reason..."
                                        value={custom} onChange={e => setCustom(e.target.value)} />
                                )}

                                <div className="flex items-center gap-3 mt-5">
                                    <button onClick={() => { if (reason) setStep(2); }}
                                        disabled={!reason || (reason === 'Other' && !custom.trim())}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                                        style={{ background: 'linear-gradient(135deg, #DC2626, #b91c1c)' }}>
                                        Continue <ChevronDown size={13} className="inline -rotate-90 ml-1" />
                                    </button>
                                    <button onClick={onClose}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#3E4A56] bg-[#F4F5F7] border border-gray-200 hover:bg-gray-100 transition-all">
                                        Keep Claim
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div style={{ animation: 'fadeSlideIn 0.2s ease-out' }}>
                                {/* Summary */}
                                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 mb-5 space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-red-500">Confirm Withdrawal</p>
                                    <p className="text-sm text-[#1C2A59] font-semibold">Reason: <span className="font-medium text-[#3E4A56]">{finalReason}</span></p>
                                    <p className="text-xs text-gray-500 font-medium">
                                        Your claim will be marked as <strong className="text-gray-700">Withdrawn</strong> and cannot be reversed. You may submit a new claim if needed.
                                    </p>
                                </div>

                                {err && (
                                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2 mb-4">
                                        <AlertTriangle size={13} /> {err}
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <button onClick={handleWithdraw} disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-md disabled:opacity-60"
                                        style={{ background: 'linear-gradient(135deg, #DC2626, #b91c1c)' }}>
                                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        {loading ? 'Withdrawing...' : 'Yes, Withdraw'}
                                    </button>
                                    <button onClick={() => setStep(1)} disabled={loading}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#3E4A56] bg-[#F4F5F7] border border-gray-200 hover:bg-gray-100 transition-all">
                                        Go Back
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────
export default function ClaimDetailDrawer({ claim, onClose, onClaimUpdate, initialEditMode = false, autoWithdraw = false }) {
    const [isEditing, setIsEditing] = useState(initialEditMode);
    const [showWithdrawModal, setShowWithdrawModal] = useState(autoWithdraw);
    const [localClaim, setLocalClaim] = useState(claim);

    if (!localClaim) return null;

    const status = STATUS_MAP[localClaim.status] || STATUS_MAP.under_review;
    const claimId = localClaim._id?.slice(-8)?.toUpperCase() || '—';
    const canEdit = ['under_review', 'ai_matched'].includes(localClaim.status);
    const canWithdraw = ['under_review', 'ai_matched'].includes(localClaim.status);

    const handleSaveEdit = (updated) => {
        setLocalClaim(updated);
        setIsEditing(false);
        if (onClaimUpdate) onClaimUpdate(updated);
    };

    const handleWithdrawn = (updated) => {
        setLocalClaim(updated);
        setShowWithdrawModal(false);
        if (onClaimUpdate) onClaimUpdate(updated);
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity" onClick={() => { if (!showWithdrawModal) onClose(); }} />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-2xl z-[70] overflow-y-auto"
                style={{
                    background: '#F4F5F7',
                    boxShadow: '-20px 0 60px rgba(0,0,0,0.12)',
                    animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)',
                }}>

                {/* ── Header ── */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-gray-200">
                    <div>
                        <div className="flex items-center gap-3">
                            <Shield size={16} className="text-[#1C2A59]" />
                            <h2 className="text-base font-extrabold text-[#1C2A59]">Claim #{claimId}</h2>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                                style={{ background: status.bg, border: `1px solid ${status.border}`, color: status.color }}>
                                {status.label}
                            </span>
                        </div>
                        <p className="text-xs mt-1 text-[#3E4A56] font-medium pl-6">
                            {localClaim.foundItemId?.title || 'Unknown Item'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Edit Toggle */}
                        {canEdit && !isEditing && (
                            <button onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-[1.04] hover:shadow-sm"
                                style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                                <Pencil size={12} /> Edit
                            </button>
                        )}
                        {isEditing && (
                            <button onClick={() => setIsEditing(false)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-[1.04]"
                                style={{ background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' }}>
                                <RotateCcw size={12} /> Cancel Edit
                            </button>
                        )}
                        <button onClick={onClose}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all border border-gray-200">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="p-6 space-y-6">
                    <ClaimTimeline claim={localClaim} />
                    <AdminMessagePanel claim={localClaim} />
                    <PickupScheduler claim={localClaim} onScheduled={(u) => { setLocalClaim(u); if (onClaimUpdate) onClaimUpdate(u); }} />

                    {/* Inline Edit Form OR Info Section */}
                    {isEditing ? (
                        <InlineEditForm
                            claim={localClaim}
                            onSave={handleSaveEdit}
                            onCancel={() => setIsEditing(false)}
                        />
                    ) : (
                        <ClaimInfoSection claim={localClaim} />
                    )}

                    {/* Withdraw Action */}
                    {canWithdraw && !isEditing && (
                        <div className="p-5 rounded-[20px] flex items-center justify-between border"
                            style={{ background: '#FFF7F7', borderColor: '#FECACA' }}>
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={16} className="text-red-400" />
                                <div>
                                    <p className="text-sm font-bold text-red-700">Want to cancel this claim?</p>
                                    <p className="text-xs text-red-400 font-medium mt-0.5">You can still resubmit a new one if needed.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowWithdrawModal(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.04] hover:shadow-md"
                                style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
                                <Trash2 size={14} /> Withdraw
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <WithdrawModal
                    claimId={localClaim._id}
                    onClose={() => setShowWithdrawModal(false)}
                    onWithdrawn={handleWithdrawn}
                />
            )}

            <style jsx global>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeSlideIn {
                    from { transform: translateY(8px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleUp {
                    from { transform: scale(0.93); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </>
    );
}
