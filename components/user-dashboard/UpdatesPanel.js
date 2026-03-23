'use client';
import { Bell, CheckCircle2, Sparkles, AlertCircle, AlertTriangle, ShieldAlert, XCircle, Unlock, MailQuestion, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function getUpdateIcon(type) {
    const map = {
        ai_match: { icon: Sparkles, color: '#F0A500', bg: '#FFFBEB', border: '#FDE68A' },
        claim_update: { icon: CheckCircle2, color: '#008489', bg: '#E0F2FE', border: '#BAE6FD' },
        claim_approved: { icon: CheckCircle2, color: '#16A34A', bg: '#DCFCE7', border: '#BBF7D0' },
        claim_rejected: { icon: XCircle, color: '#DC2626', bg: '#FEE2E2', border: '#FECACA' },
        claim_info_requested: { icon: MailQuestion, color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
        warning: { icon: AlertTriangle, color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
        restriction: { icon: ShieldAlert, color: '#DC2626', bg: '#FEE2E2', border: '#FECACA' },
        appeal_approved: { icon: CheckCircle2, color: '#16A34A', bg: '#DCFCE7', border: '#BBF7D0' },
        appeal_rejected: { icon: XCircle, color: '#DC2626', bg: '#FEE2E2', border: '#FECACA' },
        unrestricted: { icon: Unlock, color: '#16A34A', bg: '#DCFCE7', border: '#BBF7D0' },
        system: { icon: Info, color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
    };
    return map[type] || { icon: AlertCircle, color: '#1C2A59', bg: '#F4F5F7', border: '#E5E7EB' };
}

export default function UpdatesPanel({ updates = [] }) {
    const unreadCount = updates.filter(u => !u.read).length;

    return (
        <div className="flex flex-col gap-6">
            {/* Updates Card — Mini Summary */}
            <div className="rounded-3xl p-6 shadow-sm border border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <h3 className="text-xl font-extrabold flex items-center gap-3 tracking-wide text-[#1C2A59]">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F4F5F7] border border-gray-200">
                            <Bell size={16} className="text-[#F0A500]" />
                        </div>
                        Updates
                    </h3>
                    {unreadCount > 0 && (
                        <span className="text-[10px] uppercase font-extrabold tracking-widest px-3 py-1.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                            {unreadCount} New
                        </span>
                    )}
                </div>

                <div className="space-y-4">
                    {updates.length > 0 ? (
                        updates.slice(0, 4).map((update) => {
                            const { icon: Icon, color, bg, border } = getUpdateIcon(update.type);
                            const foundId = update.foundItemId?._id || update.foundItemId;
                            const isNavigable = !!foundId;

                            const content = (
                                <>
                                    <div className="mt-0.5 shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 border"
                                        style={{ background: bg, borderColor: border, color }}>
                                        <Icon size={15} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className={`font-bold text-xs tracking-wide ${update.read ? 'text-gray-500' : 'text-[#1C2A59]'}`}>
                                                {update.title}
                                                {update.matchScore > 0 && (
                                                    <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded"
                                                        style={{
                                                            color: update.matchScore >= 70 ? '#16A34A' : update.matchScore >= 50 ? '#D97706' : '#DC2626',
                                                            background: update.matchScore >= 70 ? '#DCFCE7' : update.matchScore >= 50 ? '#FEF3C7' : '#FEE2E2',
                                                        }}>
                                                        {update.matchScore}%
                                                    </span>
                                                )}
                                            </h4>
                                            <span className="text-[9px] font-bold tracking-wider uppercase shrink-0 text-gray-400">
                                                {timeAgo(update.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-[11px] mt-0.5 leading-relaxed font-medium line-clamp-2 text-[#3E4A56]">
                                            {update.message}
                                        </p>
                                    </div>
                                    {!update.read && (
                                        <div className="shrink-0 w-2 h-2 rounded-full mt-2 bg-[#F0A500]" />
                                    )}
                                </>
                            );

                            return isNavigable ? (
                                <Link key={update._id} href={`/found-items/${foundId}`}
                                    className="flex gap-3 group cursor-pointer p-2.5 -mx-2.5 rounded-xl hover:bg-[#F4F5F7] transition-colors">
                                    {content}
                                </Link>
                            ) : (
                                <div key={update._id}
                                    className="flex gap-3 group p-2.5 -mx-2.5 rounded-xl hover:bg-[#F4F5F7] transition-colors">
                                    {content}
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-6 text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center border bg-[#F4F5F7] border-gray-200">
                                <Sparkles size={20} color="#008489" className="animate-pulse" />
                            </div>
                            <h4 className="text-xs font-bold text-[#1C2A59] mb-1">No updates yet</h4>
                            <p className="text-[10px] font-medium text-gray-500">
                                AI is monitoring for potential matches.
                            </p>
                        </div>
                    )}
                </div>

                {/* View All → link */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                    <Link href="/notifications"
                        className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest py-2.5 rounded-xl transition-all hover:bg-[#F4F5F7] group text-gray-500 hover:text-[#1C2A59]">
                        View All Notifications
                        <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Need Help Card */}
            <div className="rounded-3xl p-6 border relative overflow-hidden bg-white border-gray-200 shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4F5F7] rounded-full blur-3xl -z-10" />
                <h3 className="font-extrabold text-xl mb-3 tracking-wide text-[#1C2A59]">Security Help</h3>
                <p className="text-sm font-medium mb-6 leading-relaxed text-[#3E4A56]">
                    Visit the main security office or contact support for advanced claim inquiries.
                </p>
                <button className="w-full flex items-center justify-center rounded-xl py-3 text-sm font-bold uppercase tracking-wider text-[#1C2A59] bg-[#F4F5F7] hover:bg-gray-200 transition-colors border border-gray-200">
                    Open Support Desk
                </button>
            </div>
        </div>
    );
}
