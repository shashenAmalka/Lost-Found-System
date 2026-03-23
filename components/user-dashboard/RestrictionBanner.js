'use client'
import { AlertTriangle, Shield, Send } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function RestrictionBanner({ onAppealClick }) {
    const { restrictionReason, user } = useAuth()
    const warningCount = user?.warningCount || 0

    return (
        <div className="mb-6 rounded-2xl overflow-hidden animate-slide-up bg-[#FFFBEB] border border-[#FDE68A]">
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#FEF3C7]">
                        <Shield size={20} className="text-[#D97706]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-[#D97706] flex items-center gap-2">
                            <AlertTriangle size={14} /> Your Account Has Limited Access
                        </h3>
                        <p className="text-xs text-[#D97706]/80 mt-1">
                            {restrictionReason || 'Your account has been restricted due to policy violations.'}
                        </p>

                        {/* Warning dots */}
                        <div className="flex items-center gap-2 mt-3">
                            <span className="text-[10px] text-[#D97706]/60 uppercase tracking-wider font-bold">Warnings:</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i <= warningCount ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]' : 'bg-[#FDE68A]'}`} />
                                ))}
                            </div>
                            <span className="text-[10px] text-[#D97706]/60 font-bold">{warningCount}/3</span>
                        </div>
                    </div>

                    {onAppealClick && (
                        <button onClick={onAppealClick}
                            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 hover:bg-[#D97706] hover:text-white bg-white text-[#D97706] border border-[#FDE68A]">
                            <Send size={12} /> Submit Appeal
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
