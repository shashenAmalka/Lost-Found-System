'use client'
import { useState } from 'react'
import { CheckCircle, XCircle, Loader2, FileText, Clock, User as UserIcon } from 'lucide-react'

export default function AppealReviewCard({ appeal, onDecision }) {
    const [loading, setLoading] = useState(false)
    const [adminResponse, setAdminResponse] = useState('')

    const handleDecision = async (decision) => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/appeals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appealId: appeal._id, decision, adminResponse }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            onDecision?.(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const user = appeal.userId || {}

    return (
        <div className="p-4 rounded-xl transition-all hover:scale-[1.005]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #E5E7EB' }}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(99,102,241,0.15)' }}>
                        <UserIcon size={14} className="text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-[#1C2A59]">{user.name || 'Unknown'}</p>
                        <p className="text-[9px] text-[#1C2A59]/30">{user.campusId || user.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-[#1C2A59]/30">
                    <Clock size={9} />
                    {new Date(appeal.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
            </div>

            {/* Appeal message */}
            <div className="p-3 rounded-lg mb-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-1 mb-1">
                    <FileText size={9} className="text-indigo-400" />
                    <span className="text-[9px] font-bold uppercase text-indigo-400">Appeal Message</span>
                </div>
                <p className="text-xs text-gray-400 font-bold tracking-wider">{appeal.appealMessage}</p>
                {appeal.supportingExplanation && (
                    <p className="text-[10px] text-[#1C2A59]/40 mt-1.5">{appeal.supportingExplanation}</p>
                )}
                {appeal.evidenceUrl && (
                    <a href={appeal.evidenceUrl} target="_blank" rel="noopener"
                        className="text-[10px] text-indigo-400 hover:underline mt-1 inline-block">View Evidence →</a>
                )}
            </div>

            {/* Admin response */}
            <textarea className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors"
                placeholder="Admin response (required for rejection)..."
                value={adminResponse} onChange={e => setAdminResponse(e.target.value)} />

            <div className="flex gap-2">
                <button onClick={() => handleDecision('approve')} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80' }}>
                    {loading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />} Approve
                </button>
                <button onClick={() => handleDecision('reject')} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                    {loading ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />} Reject
                </button>
            </div>
        </div>
    )
}
