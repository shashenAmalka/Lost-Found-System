import { Bell, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';

export default function UpdatesPanel({ updates = [] }) {
    return (
        <div className="flex flex-col gap-6">
            {/* Updates Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-campus-border">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-campus-text flex items-center gap-2">
                        <Bell size={18} className="text-campus-muted" /> Updates
                    </h3>
                    <span className="bg-campus-soft/10 text-campus-primary text-xs font-bold px-2.5 py-1 rounded-full">
                        3 New
                    </span>
                </div>

                <div className="space-y-6">
                    {/* Placeholder Updates - ideally mapped from props */}

                    {/* Item Found Update */}
                    <div className="flex gap-4 group cursor-pointer">
                        <div className="mt-1 shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={16} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-sm text-campus-text">Item Found!</h4>
                                <span className="text-[11px] text-campus-muted whitespace-nowrap">10 min ago</span>
                            </div>
                            <p className="text-xs text-campus-muted mt-1 leading-relaxed">
                                A match was found for your "Black Backpack".
                            </p>
                        </div>
                    </div>

                    {/* New Message Update */}
                    <div className="flex gap-4 group cursor-pointer">
                        <div className="mt-1 shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <MessageCircle size={16} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-sm text-campus-text">New Message</h4>
                                <span className="text-[11px] text-campus-muted whitespace-nowrap">1 hour ago</span>
                            </div>
                            <p className="text-xs text-campus-muted mt-1 leading-relaxed">
                                Admin: "Can you confirm the serial number?"
                            </p>
                        </div>
                    </div>

                    {/* Claim Expiring Update */}
                    <div className="flex gap-4 group cursor-pointer">
                        <div className="mt-1 shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                            <AlertCircle size={16} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-sm text-campus-text">Claim Expiring</h4>
                                <span className="text-[11px] text-campus-muted whitespace-nowrap">5 hours ago</span>
                            </div>
                            <p className="text-xs text-campus-muted mt-1 leading-relaxed">
                                Please pick up your ID card by tomorrow.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center border-t border-campus-border pt-4">
                    <button className="text-xs font-semibold text-campus-muted hover:text-campus-text transition-colors">
                        Mark all as read
                    </button>
                </div>
            </div>

            {/* Need Help Card */}
            <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#EAE3DA]">
                <h3 className="font-bold text-[#8A5A44] mb-2 text-lg">Need Help?</h3>
                <p className="text-[#A27B62] text-sm mb-4 leading-relaxed">
                    Can't find what you're looking for? Visit the main security office or call the hotline.
                </p>
                <button className="w-full bg-white border border-[#EAE3DA] text-[#8A5A44] font-semibold text-sm py-2.5 rounded-xl hover:bg-[#FDFBF9] hover:shadow-sm transition-all shadow-sm">
                    Contact Support
                </button>
            </div>
        </div>
    );
}
