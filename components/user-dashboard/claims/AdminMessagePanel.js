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
                <div className="p-5 rounded-[16px] flex items-start gap-4 bg-red-50 border border-red-200">
                    <XCircle size={20} className="shrink-0 mt-0.5 text-red-500" />
                    <div>
                        <h4 className="text-sm font-bold text-red-700">Claim Rejected</h4>
                        {claim.adminNote && (
                            <p className="text-sm mt-2 text-[#3E4A56] font-medium">
                                <span className="font-bold text-[#1C2A59]">Reason: </span>{claim.adminNote}
                            </p>
                        )}
                        {claim.reviewedAt && (
                            <p className="text-xs mt-2 flex items-center gap-1 text-gray-500 font-medium">
                                <Calendar size={11} /> Decision made on {formatDate(claim.reviewedAt)}
                            </p>
                        )}
                        <div className="mt-3 p-3 rounded-lg text-xs bg-white/50 text-red-600 font-medium border border-red-200/50">
                            If you believe this is an error, please contact the Lost & Found office or submit a new claim with additional evidence.
                        </div>
                    </div>
                </div>
            )}

            {/* Completed Report */}
            {isCompleted && (
                <div className="p-5 rounded-[16px] flex items-start gap-4 bg-emerald-50 border border-emerald-200">
                    <CheckCircle size={20} className="shrink-0 mt-0.5 text-emerald-500" />
                    <div>
                        <h4 className="text-sm font-bold text-emerald-700">Claim Completed</h4>
                        <p className="text-sm mt-2 text-[#3E4A56] font-medium">
                            Your item has been successfully returned. Thank you for using Smart Campus Lost & Found!
                        </p>
                        {claim.completedAt && (
                            <p className="text-xs mt-2 flex items-center gap-1 text-gray-500 font-medium">
                                <Calendar size={11} /> Completed on {formatDate(claim.completedAt)}
                            </p>
                        )}
                        {claim.adminNote && (
                            <p className="text-sm mt-2 text-[#3E4A56] font-medium">
                                <span className="font-bold text-[#1C2A59]">Admin note: </span>{claim.adminNote}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Admin Note (general — for non-rejected, non-completed) */}
            {!isRejected && !isCompleted && claim.adminNote && (
                <div className="p-5 rounded-[16px] flex items-start gap-4 bg-indigo-50 border border-indigo-200">
                    <MessageCircle size={18} className="shrink-0 mt-0.5 text-indigo-500" />
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Message from Admin</h4>
                        <p className="text-sm mt-2 text-[#1C2A59] font-medium">{claim.adminNote}</p>
                        {claim.reviewedAt && (
                            <p className="text-xs mt-2 text-gray-500 font-medium">{formatDate(claim.reviewedAt)}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Approval Confirmation */}
            {isApproved && !claim.adminNote && (
                <div className="p-5 rounded-[16px] flex items-start gap-4 bg-green-50 border border-green-200">
                    <CheckCircle size={18} className="shrink-0 mt-0.5 text-green-500" />
                    <div>
                        <h4 className="text-sm font-bold text-green-700">Claim Approved!</h4>
                        <p className="text-sm mt-1 text-[#3E4A56] font-medium">
                            Your claim has been approved. Please schedule a pickup below.
                        </p>
                    </div>
                </div>
            )}

            {/* No messages state */}
            {!claim.adminNote && !isRejected && !isCompleted && !isApproved && (
                <div className="p-5 rounded-[16px] text-center bg-gray-50 border border-gray-100">
                    <MessageCircle size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-xs text-gray-400 font-medium">No messages from admin yet</p>
                </div>
            )}
        </div>
    );
}
