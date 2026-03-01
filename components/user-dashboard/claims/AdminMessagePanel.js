'use client';
import { MessageCircle, AlertTriangle, CheckCircle, XCircle, Phone, Calendar } from 'lucide-react';

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminMessagePanel({ claim }) {
    const isRejected = claim.status === 'rejected';
    const isCompleted = claim.status === 'completed';
    const isApproved = claim.status === 'approved' || claim.status === 'pickup_scheduled';

    return (
        <div className="space-y-4">
            {/* Rejection Reason */}
            {isRejected && (
                <div className="p-5 rounded-[16px] flex items-start gap-4"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <XCircle size={20} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                    <div>
                        <h4 className="text-sm font-bold" style={{ color: '#fca5a5' }}>Claim Rejected</h4>
                        {claim.adminNote && (
                            <p className="text-sm mt-2" style={{ color: 'rgba(245,246,250,0.6)' }}>
                                <span className="font-semibold text-white/70">Reason: </span>{claim.adminNote}
                            </p>
                        )}
                        {claim.reviewedAt && (
                            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'rgba(245,246,250,0.35)' }}>
                                <Calendar size={11} /> Decision made on {formatDate(claim.reviewedAt)}
                            </p>
                        )}
                        <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(245,246,250,0.4)' }}>
                            If you believe this is an error, please contact the Lost & Found office or submit a new claim with additional evidence.
                        </div>
                    </div>
                </div>
            )}

            {/* Completed Report */}
            {isCompleted && (
                <div className="p-5 rounded-[16px] flex items-start gap-4"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <CheckCircle size={20} className="shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                    <div>
                        <h4 className="text-sm font-bold" style={{ color: '#6ee7b7' }}>Claim Completed</h4>
                        <p className="text-sm mt-2" style={{ color: 'rgba(245,246,250,0.6)' }}>
                            Your item has been successfully returned. Thank you for using Smart Campus Lost & Found!
                        </p>
                        {claim.completedAt && (
                            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'rgba(245,246,250,0.35)' }}>
                                <Calendar size={11} /> Completed on {formatDate(claim.completedAt)}
                            </p>
                        )}
                        {claim.adminNote && (
                            <p className="text-sm mt-2" style={{ color: 'rgba(245,246,250,0.5)' }}>
                                <span className="font-semibold text-white/70">Admin note: </span>{claim.adminNote}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Admin Note (general — for non-rejected, non-completed) */}
            {!isRejected && !isCompleted && claim.adminNote && (
                <div className="p-5 rounded-[16px] flex items-start gap-4"
                    style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <MessageCircle size={18} className="shrink-0 mt-0.5" style={{ color: '#818cf8' }} />
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#a5b4fc' }}>Message from Admin</h4>
                        <p className="text-sm mt-2" style={{ color: 'rgba(245,246,250,0.7)' }}>{claim.adminNote}</p>
                        {claim.reviewedAt && (
                            <p className="text-xs mt-2" style={{ color: 'rgba(245,246,250,0.35)' }}>{formatDate(claim.reviewedAt)}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Approval Confirmation */}
            {isApproved && !claim.adminNote && (
                <div className="p-5 rounded-[16px] flex items-start gap-4"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <CheckCircle size={18} className="shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                    <div>
                        <h4 className="text-sm font-bold" style={{ color: '#86efac' }}>Claim Approved!</h4>
                        <p className="text-sm mt-1" style={{ color: 'rgba(245,246,250,0.6)' }}>
                            Your claim has been approved. Please schedule a pickup below.
                        </p>
                    </div>
                </div>
            )}

            {/* No messages state */}
            {!claim.adminNote && !isRejected && !isCompleted && !isApproved && (
                <div className="p-5 rounded-[16px] text-center"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <MessageCircle size={24} className="mx-auto mb-2" style={{ color: 'rgba(245,246,250,0.15)' }} />
                    <p className="text-xs" style={{ color: 'rgba(245,246,250,0.3)' }}>No messages from admin yet</p>
                </div>
            )}
        </div>
    );
}
