'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import AIScoreDisplay from '@/components/ui/AIScoreDisplay'
import { Send, ArrowLeft, Shield, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function NewClaimPage() {
    const { user, loading: authLoading, isRestricted } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const foundItemId = searchParams.get('foundItemId') || ''

    const [lostItems, setLostItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [aiResult, setAiResult] = useState(null)
    const [form, setForm] = useState({
        lostItemId: '', foundItemId,
        ownershipExplanation: '', hiddenDetails: '',
        exactColorBrand: '', dateLost: '', proofUrl: '',
        pickupPreference: 'Campus Lost & Found Office',
    })

    const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    // Fetch user's lost items for selection
    useEffect(() => {
        if (!user) return
        fetch('/api/lost-items?page=1', { credentials: 'include' })
            .then(r => r.json())
            .then(d => {
                const myItems = (d.items || []).filter(i => i.postedBy === user.id)
                setLostItems(d.items || [])
            }).catch(() => { })
    }, [user])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/claims', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to submit claim')
            setAiResult(data.aiResult)
            setTimeout(() => router.push('/user-dashboard'), 3000)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) return <div className="page-bg min-h-screen"><Navbar /></div>
    if (!user) return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="max-w-md mx-auto pt-32 px-4 text-center">
                <div className="glass-card p-12"><div className="text-5xl mb-4">🔒</div><h2 className="text-white font-bold mb-2">Login Required</h2>
                    <Link href="/login" className="btn-glass-primary mt-4">Sign In</Link>
                </div>
            </div>
        </div>
    )

    if (isRestricted) return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="max-w-md mx-auto pt-32 px-4 text-center">
                <div className="glass-card p-12"><div className="text-5xl mb-4">⛔</div>
                    <h2 className="text-red-400 font-bold mb-2">Account Restricted</h2>
                    <p className="text-white/50 text-sm">Your account has been restricted. Contact admin for help.</p>
                </div>
            </div>
        </div>
    )

    // Show success with AI score
    if (aiResult) return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="max-w-lg mx-auto pt-32 px-4 animate-slide-up">
                <div className="glass-card p-8 text-center space-y-6">
                    <div className="text-5xl">✅</div>
                    <h2 className="text-white font-bold text-xl">Claim Submitted Successfully!</h2>
                    <p className="text-white/50 text-sm">AI has analyzed your claim. Admin will review it shortly.</p>
                    <AIScoreDisplay matchScore={aiResult.matchScore} riskScore={aiResult.riskScore} breakdown={aiResult.breakdown} suggestion={aiResult.suggestedDecision} />
                    <p className="text-white/40 text-xs">Redirecting to dashboard in 3 seconds...</p>
                </div>
            </div>
        </div>
    )

    return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="orb w-64 h-64 top-0 left-0 opacity-10" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)' }} />

            <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Link href={foundItemId ? `/found-items/${foundItemId}` : '/found-items'} className="btn-glass px-3 py-2"><ArrowLeft size={16} /></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Submit Claim</h1>
                        <p className="text-white/50 text-sm mt-0.5">Prove ownership to reclaim your item</p>
                    </div>
                </div>

                {/* Warning about fake claims */}
                <div className="mb-6 p-4 rounded-xl flex items-start gap-3"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <AlertTriangle size={18} className="text-yellow-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-semibold text-yellow-300">⚠️ Fair Warning</p>
                        <p className="text-xs text-white/50 mt-0.5">False claims will increase your warning count. 3 warnings = account restriction.</p>
                    </div>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Select lost item */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Select Your Lost Item Report *</label>
                            <select className="glass-select" value={form.lostItemId} onChange={change('lostItemId')} required>
                                <option value="">Choose your lost item report</option>
                                {lostItems.map(i => <option key={i._id} value={i._id}>{i.title} ({i.category})</option>)}
                            </select>
                        </div>

                        {foundItemId && (
                            <input type="hidden" value={foundItemId} />
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Ownership Explanation *</label>
                            <textarea className="glass-input min-h-[120px] resize-y"
                                placeholder="Explain how you can prove this item is yours. Be as detailed as possible..."
                                value={form.ownershipExplanation} onChange={change('ownershipExplanation')} required />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Hidden Identifying Details</label>
                            <textarea className="glass-input min-h-[80px] resize-y"
                                placeholder="Describe hidden marks, scratches, stickers, or other details not visible in photos..."
                                value={form.hiddenDetails} onChange={change('hiddenDetails')} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Exact Color / Brand</label>
                                <input className="glass-input" placeholder="e.g. Deep Blue, Apple iPhone 14 Pro" value={form.exactColorBrand} onChange={change('exactColorBrand')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Date Lost</label>
                                <input type="date" className="glass-input" value={form.dateLost} onChange={change('dateLost')} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Additional Proof (URL)</label>
                            <input className="glass-input" placeholder="Link to receipt, photo of purchase, etc." value={form.proofUrl} onChange={change('proofUrl')} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Pickup Preference</label>
                            <select className="glass-select" value={form.pickupPreference} onChange={change('pickupPreference')}>
                                <option value="Campus Lost & Found Office">Campus Lost & Found Office</option>
                                <option value="Security Office">Security Office</option>
                                <option value="Department Office">Department Office</option>
                                <option value="Other">Other (mention in explanation)</option>
                            </select>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-glass-primary w-full justify-center py-3 text-sm font-semibold">
                            <Shield size={16} />
                            {loading ? 'Submitting & Running AI Analysis...' : 'Submit Claim for AI Verification'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
