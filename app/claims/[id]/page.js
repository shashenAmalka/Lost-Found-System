'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import StatusBadge from '@/components/ui/StatusBadge'
import AIScoreDisplay from '@/components/ui/AIScoreDisplay'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft, Shield, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function ClaimDetailPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const [claim, setClaim] = useState(null)
    const [loading, setLoading] = useState(true)
    const [withdrawing, setWithdrawing] = useState(false)

    useEffect(() => {
        fetch(`/api/claims/${id}`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => setClaim(d.claim))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [id])

    const handleWithdraw = async () => {
        if (!confirm('Are you sure you want to withdraw this claim?')) return
        setWithdrawing(true)
        try {
            const res = await fetch(`/api/claims/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'withdraw' }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setClaim(data.claim)
        } catch (err) {
            alert(err.message)
        } finally {
            setWithdrawing(false)
        }
    }

    if (loading) return <div className="page-bg min-h-screen"><Navbar /><div className="pt-32 text-center text-white/50">Loading...</div></div>

    if (!claim) return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="max-w-md mx-auto pt-32 px-4 text-center">
                <div className="glass-card p-12"><div className="text-5xl mb-4">😕</div><h2 className="text-white font-bold mb-2">Claim Not Found</h2>
                    <Link href="/user-dashboard" className="btn-glass-primary mt-4">Back to Dashboard</Link>
                </div>
            </div>
        </div>
    )

    return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
                <Link href="/user-dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <Shield size={22} className="text-indigo-400" />
                    <h1 className="text-2xl font-bold text-white">Claim Details</h1>
                </div>

                <div className="space-y-6">
                    {/* Status & Summary */}
                    <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1"><StatusBadge status={claim.status} /></div>
                            <p className="text-white/50 text-xs mt-1">Submitted {new Date(claim.createdAt).toLocaleString()}</p>
                        </div>
                        {!['approved', 'rejected', 'withdrawn', 'completed'].includes(claim.status) && (
                            <button onClick={handleWithdraw} disabled={withdrawing}
                                className="btn-glass-danger text-sm">
                                {withdrawing ? 'Withdrawing...' : 'Withdraw Claim'}
                            </button>
                        )}
                    </div>

                    {/* Items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="glass-card p-5 space-y-2">
                            <span className="text-xs text-white/40 uppercase tracking-wide">Lost Item</span>
                            <h3 className="text-white font-semibold">{claim.lostItemId?.title || '—'}</h3>
                            <p className="text-white/50 text-sm">{claim.lostItemId?.description?.slice(0, 100)}...</p>
                        </div>
                        <div className="glass-card p-5 space-y-2">
                            <span className="text-xs text-white/40 uppercase tracking-wide">Found Item</span>
                            <h3 className="text-white font-semibold">{claim.foundItemId?.title || '—'}</h3>
                            <p className="text-white/50 text-sm">{claim.foundItemId?.description?.slice(0, 100)}...</p>
                        </div>
                    </div>

                    {/* AI Score */}
                    <div className="glass-card p-6">
                        <h3 className="text-white font-semibold mb-4 text-sm">AI Analysis</h3>
                        <AIScoreDisplay matchScore={claim.aiMatchScore} riskScore={claim.aiRiskScore}
                            breakdown={claim.aiBreakdown} suggestion={claim.aiSuggestedDecision} />
                    </div>

                    {/* Ownership Proof */}
                    <div className="glass-card p-6 space-y-4">
                        <h3 className="text-white font-semibold text-sm">Ownership Proof Submitted</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-xs text-white/40">Ownership Explanation</span>
                                <p className="text-white/80 text-sm mt-1">{claim.ownershipExplanation || 'Not provided'}</p>
                            </div>
                            {claim.hiddenDetails && <div>
                                <span className="text-xs text-white/40">Hidden Details</span>
                                <p className="text-white/80 text-sm mt-1">{claim.hiddenDetails}</p>
                            </div>}
                            {claim.exactColorBrand && <div>
                                <span className="text-xs text-white/40">Exact Color/Brand</span>
                                <p className="text-white/80 text-sm mt-1">{claim.exactColorBrand}</p>
                            </div>}
                        </div>
                    </div>

                    {/* Admin notes */}
                    {claim.adminNote && (
                        <div className="glass-card p-5 flex items-start gap-3"
                            style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
                            <AlertTriangle size={16} className="text-purple-400 mt-0.5 shrink-0" />
                            <div>
                                <span className="text-xs text-purple-300 font-semibold">Admin Note</span>
                                <p className="text-white/70 text-sm mt-1">{claim.adminNote}</p>
                            </div>
                        </div>
                    )}

                    {/* Tracking History */}
                    {claim.trackingHistory?.length > 0 && (
                        <div className="glass-card p-6 space-y-4">
                            <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Clock size={14} className="text-indigo-400" /> Tracking History</h3>
                            <div className="space-y-3">
                                {claim.trackingHistory.map((event, i) => (
                                    <div key={i} className="relative flex gap-4 pl-4">
                                        <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-indigo-400" />
                                        {i !== claim.trackingHistory.length - 1 && (
                                            <div className="absolute left-[3px] top-4 w-0.5 h-full bg-white/10" />
                                        )}
                                        <div className="flex-1 pb-4">
                                            <div className="text-white text-sm font-medium">{event.event}</div>
                                            <div className="text-white/40 text-xs mt-0.5">{new Date(event.timestamp).toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
