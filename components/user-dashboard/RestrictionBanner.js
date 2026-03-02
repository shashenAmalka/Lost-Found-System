'use client'
import { AlertTriangle, Shield, Send } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function RestrictionBanner({ onAppealClick }) {
    const { restrictionReason, user } = useAuth()
    const warningCount = user?.warningCount || 0

    return (
        <div className="mb-6 rounded-2xl overflow-hidden animate-slide-up"
            style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(239,68,68,0.06) 100%)',
                border: '1px solid rgba(245,158,11,0.2)',
            }}>
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(245,158,11,0.15)' }}>
                        <Shield size={20} className="text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-yellow-300 flex items-center gap-2">
                            <AlertTriangle size={14} /> Your Account Has Limited Access
                        </h3>
                        <p className="text-xs text-white/50 mt-1">
                            {restrictionReason || 'Your account has been restricted due to policy violations.'}
                        </p>

                        {/* Warning dots */}
                        <div className="flex items-center gap-2 mt-3">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">Warnings:</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-2.5 h-2.5 rounded-full transition-all"
                                        style={{
                                            background: i <= warningCount ? '#ef4444' : 'rgba(255,255,255,0.1)',
                                            boxShadow: i <= warningCount ? '0 0 6px rgba(239,68,68,0.5)' : 'none',
                                        }} />
                                ))}
                            </div>
                            <span className="text-[10px] text-white/30">{warningCount}/3</span>
                        </div>
                    </div>

                    {onAppealClick && (
                        <button onClick={onAppealClick}
                            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #D4AF37 0%, #b8941e 100%)',
                                color: '#0a0a1a',
                            }}>
                            <Send size={12} /> Submit Appeal
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
