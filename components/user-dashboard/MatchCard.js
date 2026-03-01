'use client'
import { MapPin, CalendarClock, Tag, FileText, X, Send, Loader2, Sparkles, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import ImageUpload from '@/components/forms/ImageUpload'
import { useAuth } from '@/context/AuthContext'

export default function MatchCard({ id, imageUrl, matchScore, timeAgo, title, location, category, lostItemId, submittedBy }) {
    const { user } = useAuth()
    const [showClaim, setShowClaim] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        ownershipExplanation: '',
        hiddenDetails: '',
        exactColorBrand: '',
        dateLost: '',
        proofUrl: '',
        pickupPreference: 'Campus Lost & Found Office',
    })

    // Prevent the person who posted the found item from claiming it
    const isFoundItemPoster = user && submittedBy && user.id === submittedBy?.toString()
    const canClaim = !!lostItemId && !isFoundItemPoster

    const handleClaim = async () => {
        if (!form.ownershipExplanation.trim()) {
            setError('Please explain why this item belongs to you.')
            return
        }
        setError('')
        setSubmitting(true)
        try {
            const res = await fetch('/api/claims', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lostItemId, foundItemId: id, ...form }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to submit claim')
            setSuccess(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <div className="rounded-[20px] overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer group relative hover:-translate-y-2"
                style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(30px)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}>

                {/* Image Area */}
                <div className="h-44 w-full relative overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1A1A64]/30 to-black flex items-center justify-center text-white/30 font-semibold tracking-widest uppercase text-xs">
                            No Image
                        </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(11, 15, 25, 1) 0%, transparent 60%)' }} />

                    {/* AI Match Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg text-sm font-black tracking-wider border backdrop-blur-xl shadow-lg transform group-hover:scale-105 transition-transform"
                        style={{
                            background: 'rgba(212, 175, 55, 0.1)',
                            color: '#D4AF37',
                            borderColor: 'rgba(212, 175, 55, 0.4)',
                            boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
                        }}>
                        ✨ AI Match
                    </div>

                    {/* Time Ago */}
                    <div className="absolute bottom-4 left-4 text-xs font-bold tracking-wide flex items-center gap-1.5 drop-shadow-md" style={{ color: 'rgba(245, 246, 250, 0.8)' }}>
                        <CalendarClock size={14} /> {timeAgo}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-1 relative z-10">
                    <h3 className="font-bold text-xl mb-3 line-clamp-1 drop-shadow-sm text-white group-hover:text-[#F06414] transition-colors">{title}</h3>

                    <div className="flex items-start gap-2 text-sm mb-4 font-medium" style={{ color: 'rgba(245, 246, 250, 0.6)' }}>
                        <MapPin size={16} className="shrink-0 mt-0.5 opacity-70" />
                        <span className="line-clamp-2 leading-relaxed">{location}</span>
                    </div>

                    <div className="mt-auto pt-4 border-t flex items-center justify-between gap-3" style={{ borderTopColor: 'rgba(255,255,255,0.06)' }}>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(245, 246, 250, 0.7)' }}>
                            <Tag size={12} className="opacity-60" /> {category}
                        </span>

                        <button
                            onClick={(e) => { e.stopPropagation(); setShowClaim(true) }}
                            className="px-5 py-2 rounded-xl text-sm font-bold transition-all relative overflow-hidden border group/btn flex items-center justify-center gap-2 shrink-0 hover:scale-105 active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, rgba(240,100,20,0.2) 0%, rgba(212,175,55,0.2) 100%)',
                                color: '#F06414',
                                borderColor: 'rgba(240,100,20,0.4)',
                                boxShadow: '0 4px 15px rgba(240,100,20,0.15)',
                            }}>
                            <FileText size={14} /> Claim Now
                        </button>
                    </div>
                </div>
            </div>

            {/* ========== CLAIM MODAL ========== */}
            {showClaim && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
                    onClick={() => !submitting && setShowClaim(false)}>
                    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border p-6 space-y-5"
                        style={{ background: 'linear-gradient(145deg, #0d1117 0%, #161b22 100%)', borderColor: 'rgba(255,255,255,0.08)' }}
                        onClick={e => e.stopPropagation()}>

                        {success ? (
                            <div className="text-center py-8 space-y-4">
                                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.1)', border: '2px solid rgba(74,222,128,0.3)' }}>
                                    <ShieldCheck size={32} style={{ color: '#4ade80' }} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Claim Submitted!</h3>
                                <p className="text-sm text-white/50 max-w-xs mx-auto">Your claim has been sent to admin for review. You'll be notified once it's processed.</p>
                                <button onClick={() => { setShowClaim(false); setSuccess(false) }}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
                                    style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Sparkles size={18} style={{ color: '#D4AF37' }} /> Claim This Item
                                        </h3>
                                        <p className="text-xs text-white/40 mt-1">Prove this <strong className="text-white/60">{title}</strong> belongs to you</p>
                                    </div>
                                    <button onClick={() => setShowClaim(false)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                                        <X size={18} className="text-white/50" />
                                    </button>
                                </div>

                                {/* Form */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-white/60 uppercase tracking-wide font-bold">
                                            Why does this item belong to you? <span style={{ color: '#F06414' }}>*</span>
                                        </label>
                                        <textarea
                                            className="glass-input min-h-[100px] resize-y text-sm"
                                            placeholder="Describe specific details that prove ownership — marks, contents, damage, receipts..."
                                            value={form.ownershipExplanation}
                                            onChange={e => setForm(f => ({ ...f, ownershipExplanation: e.target.value }))}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs text-white/60 uppercase tracking-wide font-bold">Hidden Identifying Details</label>
                                        <textarea
                                            className="glass-input min-h-[60px] resize-y text-sm"
                                            placeholder="Marks, scratches, engravings not visible in public listing..."
                                            value={form.hiddenDetails}
                                            onChange={e => setForm(f => ({ ...f, hiddenDetails: e.target.value }))}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-xs text-white/60 uppercase tracking-wide font-bold">Exact Color / Brand</label>
                                            <input className="glass-input text-sm" placeholder="e.g. Midnight Blue, Dell"
                                                value={form.exactColorBrand}
                                                onChange={e => setForm(f => ({ ...f, exactColorBrand: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs text-white/60 uppercase tracking-wide font-bold">Date You Lost It</label>
                                            <input type="date" className="glass-input text-sm" style={{ colorScheme: 'dark' }}
                                                value={form.dateLost}
                                                onChange={e => setForm(f => ({ ...f, dateLost: e.target.value }))} />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs text-white/60 uppercase tracking-wide font-bold">Proof of Ownership (optional)</label>
                                        <ImageUpload
                                            value={form.proofUrl}
                                            onChange={(url) => setForm(f => ({ ...f, proofUrl: url }))}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs text-white/60 uppercase tracking-wide font-bold">Pickup Preference</label>
                                        <select className="glass-select text-sm" value={form.pickupPreference}
                                            onChange={e => setForm(f => ({ ...f, pickupPreference: e.target.value }))}>
                                            <option>Campus Lost & Found Office</option>
                                            <option>Student Center</option>
                                            <option>Library Front Desk</option>
                                            <option>Security Office</option>
                                        </select>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-xl text-sm flex items-center gap-2"
                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                                        {error}
                                    </div>
                                )}

                                <button onClick={handleClaim} disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: 'linear-gradient(135deg, #F06414 0%, #D4AF37 100%)',
                                        boxShadow: '0 8px 24px rgba(240, 100, 20, 0.3)',
                                    }}>
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    {submitting ? 'Submitting Claim...' : 'Submit Claim Request'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
