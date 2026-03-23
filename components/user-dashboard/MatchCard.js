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
            <div className="rounded-[20px] overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer group relative hover:-translate-y-2 bg-white border-gray-200 shadow-sm hover:shadow-md">

                {/* Image Area */}
                <div className="h-44 w-full relative overflow-hidden bg-gray-100">
                    {imageUrl ? (
                        <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#F4F5F7] to-gray-200 flex items-center justify-center text-gray-400 font-bold tracking-widest uppercase text-xs">
                            No Image
                        </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 to-transparent" />

                    {/* AI Match Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg text-sm font-black tracking-wider border shadow-sm transform group-hover:scale-105 transition-transform bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]">
                        ✨ AI Match
                    </div>

                    {/* Time Ago */}
                    <div className="absolute bottom-4 left-4 text-xs font-bold tracking-wide flex items-center gap-1.5 text-white drop-shadow-md">
                        <CalendarClock size={14} /> {timeAgo}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-1 relative z-10">
                    <h3 className="font-bold text-xl mb-3 line-clamp-1 text-[#1C2A59] group-hover:text-[#F0A500] transition-colors">{title}</h3>

                    <div className="flex items-start gap-2 text-sm mb-4 font-medium text-[#3E4A56]">
                        <MapPin size={16} className="shrink-0 mt-0.5 opacity-70" />
                        <span className="line-clamp-2 leading-relaxed">{location}</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-[#F4F5F7] border-gray-200 text-[#3E4A56]">
                            <Tag size={12} className="opacity-60" /> {category}
                        </span>

                        <button
                            onClick={(e) => { e.stopPropagation(); setShowClaim(true) }}
                            className="px-5 py-2 rounded-xl text-sm font-bold transition-all relative overflow-hidden border group/btn flex items-center justify-center gap-2 shrink-0 hover:scale-105 active:scale-95 bg-[#F0A500]/10 text-[#F0A500] border-[#F0A500]/30 hover:bg-[#F0A500] hover:text-white"
                        >
                            <FileText size={14} /> Claim Now
                        </button>
                    </div>
                </div>
            </div>

            {/* ========== CLAIM MODAL ========== */}
            {showClaim && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                    onClick={() => !submitting && setShowClaim(false)}>
                    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 p-6 space-y-5 bg-white shadow-xl"
                        onClick={e => e.stopPropagation()}>

                        {success ? (
                            <div className="text-center py-8 space-y-4">
                                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-green-50 border-2 border-green-200">
                                    <ShieldCheck size={32} className="text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-[#1C2A59]">Claim Submitted!</h3>
                                <p className="text-sm text-[#3E4A56] max-w-xs mx-auto">Your claim has been sent to admin for review. You'll be notified once it's processed.</p>
                                <button onClick={() => { setShowClaim(false); setSuccess(false) }}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all bg-green-50 text-green-600 border border-green-200 hover:bg-green-100">
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#1C2A59] flex items-center gap-2">
                                            <Sparkles size={18} className="text-[#F0A500]" /> Claim This Item
                                        </h3>
                                        <p className="text-xs text-[#3E4A56] mt-1">Prove this <strong className="text-[#1C2A59]">{title}</strong> belongs to you</p>
                                    </div>
                                    <button onClick={() => setShowClaim(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                                        <X size={18} className="text-gray-500" />
                                    </button>
                                </div>

                                {/* Form */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-[#1C2A59] uppercase tracking-wide font-bold">
                                            Why does this item belong to you? <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm text-[#1C2A59] focus:outline-none focus:ring-2 focus:ring-[#008489]/50 focus:border-[#008489] transition-all min-h-[100px] resize-y"
                                            placeholder="Describe specific details that prove ownership — marks, contents, damage, receipts..."
                                            value={form.ownershipExplanation}
                                            onChange={e => setForm(f => ({ ...f, ownershipExplanation: e.target.value }))}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs text-[#1C2A59] uppercase tracking-wide font-bold">Hidden Identifying Details</label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm text-[#1C2A59] focus:outline-none focus:ring-2 focus:ring-[#008489]/50 focus:border-[#008489] transition-all min-h-[60px] resize-y"
                                            placeholder="Marks, scratches, engravings not visible in public listing..."
                                            value={form.hiddenDetails}
                                            onChange={e => setForm(f => ({ ...f, hiddenDetails: e.target.value }))}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-xs text-[#1C2A59] uppercase tracking-wide font-bold">Exact Color / Brand</label>
                                            <input className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm text-[#1C2A59] focus:outline-none focus:ring-2 focus:ring-[#008489]/50 focus:border-[#008489] transition-all" placeholder="e.g. Midnight Blue, Dell"
                                                value={form.exactColorBrand}
                                                onChange={e => setForm(f => ({ ...f, exactColorBrand: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs text-[#1C2A59] uppercase tracking-wide font-bold">Date You Lost It</label>
                                            <input type="date" className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm text-[#1C2A59] focus:outline-none focus:ring-2 focus:ring-[#008489]/50 focus:border-[#008489] transition-all"
                                                value={form.dateLost}
                                                onChange={e => setForm(f => ({ ...f, dateLost: e.target.value }))} />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs text-[#1C2A59] uppercase tracking-wide font-bold">Proof of Ownership (optional)</label>
                                        <ImageUpload
                                            value={form.proofUrl}
                                            onChange={(url) => setForm(f => ({ ...f, proofUrl: url }))}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs text-[#1C2A59] uppercase tracking-wide font-bold">Pickup Preference</label>
                                        <select className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm text-[#1C2A59] focus:outline-none focus:ring-2 focus:ring-[#008489]/50 focus:border-[#008489] transition-all" value={form.pickupPreference}
                                            onChange={e => setForm(f => ({ ...f, pickupPreference: e.target.value }))}>
                                            <option>Campus Lost & Found Office</option>
                                            <option>Student Center</option>
                                            <option>Library Front Desk</option>
                                            <option>Security Office</option>
                                        </select>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-xl text-sm flex items-center gap-2 bg-red-50 border border-red-200 text-red-600">
                                        {error}
                                    </div>
                                )}

                                <button onClick={handleClaim} disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed bg-[#1C2A59] hover:bg-[#1a254d] shadow-md">
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
