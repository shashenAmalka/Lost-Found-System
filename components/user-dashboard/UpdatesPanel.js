'use client';
import { Bell, CheckCircle2, Sparkles, AlertCircle, Clock, AlertTriangle, ShieldAlert, ShieldOff, XCircle, Unlock } from 'lucide-react';
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
    if (type === 'ai_match') return { icon: Sparkles, color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.08)', border: 'rgba(212, 175, 55, 0.2)' };
    if (type === 'claim_update') return { icon: CheckCircle2, color: '#4ade80', bg: 'rgba(26, 26, 100, 0.2)', border: 'rgba(26, 26, 100, 0.5)' };
    if (type === 'warning') return { icon: AlertTriangle, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' };
    if (type === 'restriction') return { icon: ShieldAlert, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' };
    if (type === 'appeal_approved') return { icon: CheckCircle2, color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)', border: 'rgba(74, 222, 128, 0.3)' };
    if (type === 'appeal_rejected') return { icon: XCircle, color: '#f87171', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)' };
    if (type === 'unrestricted') return { icon: Unlock, color: '#4ade80', bg: 'rgba(74, 222, 128, 0.08)', border: 'rgba(74, 222, 128, 0.25)' };
    return { icon: AlertCircle, color: '#F06414', bg: 'rgba(240, 100, 20, 0.1)', border: 'rgba(240, 100, 20, 0.4)' };
}

export default function UpdatesPanel({ updates = [] }) {
    const unreadCount = updates.filter(u => !u.read).length;

    return (
        <div className="flex flex-col gap-6">
            {/* Updates Card */}
            <div className="rounded-3xl p-6 shadow-xl border relative overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(30px)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                <div className="flex items-center justify-between mb-8 pb-4 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                    <h3 className="text-xl font-black flex items-center gap-3 tracking-wide text-white">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                            <Bell size={16} style={{ color: '#D4AF37' }} />
                        </div>
                        Updates
                    </h3>
                    {unreadCount > 0 && (
                        <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full"
                            style={{ background: 'rgba(240, 100, 20, 0.1)', color: '#F06414', border: '1px solid rgba(240, 100, 20, 0.3)' }}>
                            {unreadCount} New
                        </span>
                    )}
                </div>

                <div className="space-y-6">
                    {updates.length > 0 ? (
                        updates.slice(0, 8).map((update) => {
                            const { icon: Icon, color, bg, border } = getUpdateIcon(update.type);
                            const foundId = update.foundItemId?._id || update.foundItemId;
                            const isNavigable = !!foundId;

                            const content = (
                                <>
                                    <div className="mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 border"
                                        style={{ background: bg, borderColor: border, color, boxShadow: `0 0 15px ${bg}` }}>
                                        <Icon size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className={`font-bold text-sm tracking-wide ${update.read ? 'text-white/70' : 'text-white'}`}>
                                                {update.title}
                                                {update.matchScore > 0 && (
                                                    <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                                                        style={{
                                                            color: update.matchScore >= 70 ? '#4ade80' : update.matchScore >= 50 ? '#D4AF37' : '#F06414',
                                                            background: update.matchScore >= 70 ? 'rgba(74,222,128,0.1)' : update.matchScore >= 50 ? 'rgba(212,175,55,0.1)' : 'rgba(240,100,20,0.1)',
                                                        }}>
                                                        {update.matchScore}%
                                                    </span>
                                                )}
                                            </h4>
                                            <span className="text-[10px] font-bold tracking-wider uppercase shrink-0" style={{ color: 'rgba(245, 246, 250, 0.4)' }}>
                                                {timeAgo(update.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-xs mt-1 leading-relaxed font-medium line-clamp-2" style={{ color: 'rgba(245, 246, 250, 0.6)' }}>
                                            {update.message}
                                        </p>
                                    </div>
                                    {/* Unread dot */}
                                    {!update.read && (
                                        <div className="shrink-0 w-2 h-2 rounded-full mt-2"
                                            style={{ background: '#F06414', boxShadow: '0 0 8px rgba(240, 100, 20, 0.5)' }} />
                                    )}
                                </>
                            );

                            return isNavigable ? (
                                <Link key={update._id} href={`/found-items/${foundId}`}
                                    className="flex gap-4 group cursor-pointer p-3 -mx-3 rounded-2xl hover:bg-white/5 transition-colors">
                                    {content}
                                </Link>
                            ) : (
                                <div key={update._id}
                                    className="flex gap-4 group p-3 -mx-3 rounded-2xl hover:bg-white/5 transition-colors">
                                    {content}
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center border"
                                style={{ background: 'rgba(212, 175, 55, 0.05)', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                                <Sparkles size={24} color="#D4AF37" className="animate-pulse" />
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1">No updates yet</h4>
                            <p className="text-xs font-medium" style={{ color: 'rgba(245, 246, 250, 0.4)' }}>
                                AI is monitoring for potential matches. You&apos;ll be notified here instantly.
                            </p>
                        </div>
                    )}
                </div>

                {updates.length > 5 && (
                    <div className="mt-6 text-center pt-5 border-t" style={{ borderTopColor: 'rgba(255,255,255,0.05)' }}>
                        <Link href="/user-dashboard" className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-white" style={{ color: 'rgba(245, 246, 250, 0.5)' }}>
                            View all updates
                        </Link>
                    </div>
                )}
            </div>

            {/* Need Help Card */}
            <div className="rounded-3xl p-6 border relative overflow-hidden"
                style={{ background: 'rgba(26, 26, 100, 0.2)', borderColor: 'rgba(26, 26, 100, 0.6)', backdropFilter: 'blur(20px)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F06414]/10 blur-3xl rounded-full" />
                <h3 className="font-black text-xl mb-3 tracking-wide text-white relative z-10">Security Help</h3>
                <p className="text-sm font-medium mb-6 leading-relaxed relative z-10" style={{ color: 'rgba(245, 246, 250, 0.7)' }}>
                    Visit the main security office or contact support for advanced claim inquiries.
                </p>
                <button className="w-full relative group overflow-hidden border rounded-xl py-3 text-sm font-bold uppercase tracking-wider text-white z-10 transition-shadow hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Open Support Desk
                </button>
            </div>
        </div>
    );
}
