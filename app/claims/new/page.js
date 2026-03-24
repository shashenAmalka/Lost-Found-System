'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { validateOwnershipExplanation, validateClaimEvidence, CLAIM_LIMITS } from '@/lib/validations'
import { Send, ArrowLeft, Shield, AlertTriangle, Package, MapPin, Tag, Calendar, Loader2, CheckCircle2, Link as LinkIcon, Info } from 'lucide-react'
import Link from 'next/link'

function ClaimFormContent() {
    const { user, loading: authLoading, isRestricted } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const foundItemId = searchParams.get('foundItemId') || ''

    const [foundItem, setFoundItem] = useState(null)
    const [lostItems, setLostItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [success, setSuccess] = useState(false)
    const [form, setForm] = useState({
        lostItemId: '', foundItemId,
        ownershipExplanation: '', hiddenDetails: '',
        exactColorBrand: '', dateLost: '', timeLost: '', locationLost: '', proofUrl: '',
        pickupPreference: 'Campus Lost & Found Office',
    })

    const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    // Fetch the found item details for preview
    useEffect(() => {
        if (!foundItemId) { setFetching(false); return }
        fetch(`/api/found-items/${foundItemId}`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => setFoundItem(d.item || null))
            .catch(() => { })
            .finally(() => setFetching(false))
    }, [foundItemId])

    // Fetch user's lost items for optional linking
    useEffect(() => {
        if (!user) return
        fetch('/api/lost-items?page=1&limit=50', { credentials: 'include' })
            .then(r => r.json())
            .then(d => {
                const myItems = (d.items || []).filter(i => i.postedBy?.toString() === user.id || i.submittedBy?.toString() === user.id)
                setLostItems(myItems)
            }).catch(() => { })
    }, [user])

    const today = new Date().toISOString().split('T')[0]

    const getCurrentTime = () => {
        const n = new Date()
        return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`
    }

    const handleTimeChange = (e) => {
        const val = e.target.value
        if (form.dateLost === today && val > getCurrentTime()) {
            setError('⏱ Cannot select a future time for today.')
            setForm(f => ({ ...f, timeLost: '' }))
            return
        }
        setError('')
        setForm(f => ({ ...f, timeLost: val }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setFieldErrors({})

        // ── Validation ──
        const newFieldErrors = {}

        const ownershipResult = validateOwnershipExplanation(form.ownershipExplanation)
        if (!ownershipResult.valid) newFieldErrors.ownershipExplanation = ownershipResult.error

        const evidenceResult = validateClaimEvidence(form)
        if (!evidenceResult.valid) newFieldErrors.evidence = evidenceResult.error

        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors)
            setError('Please fix the highlighted errors before submitting.')
            return
        }

        const now = new Date()
        const todayStr = now.toISOString().split('T')[0]
        const currentTimeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
        if (form.dateLost && form.dateLost > todayStr) {
            setError('Date Lost cannot be a future date.')
            return
        }
        if (form.dateLost === todayStr && form.timeLost && form.timeLost > currentTimeStr) {
            setError('Time Lost cannot be in the future.')
            return
        }
        setLoading(true)
        try {
            const payload = { ...form }
            if (!payload.lostItemId) delete payload.lostItemId // Don't send empty string
            const res = await fetch('/api/claims', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to submit claim')
            setSuccess(true)
            setTimeout(() => router.push('/user-dashboard'), 2500)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || fetching) return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans pb-20 pt-20"><Navbar />
            <div className="flex items-center justify-center pt-40">
                <Loader2 className="animate-spin text-[#1C2A59]/30" size={36} />
            </div>
        </div>
    )
    if (!user) return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans pb-20 pt-20"><Navbar />
            <div className="max-w-md mx-auto pt-32 px-4 text-center">
                <div className="bg-white p-12 rounded border border-gray-200 shadow-sm"><div className="text-5xl mb-4 text-[#F0A500]">🔒</div><h2 className="text-[#1C2A59] font-bold text-xl mb-2">Login Required</h2>
                    <Link href="/login" className="inline-block px-6 py-2.5 bg-[#1C2A59] text-white font-bold rounded hover:bg-[#1a254d] transition-colors mt-4">Sign In</Link>
                </div>
            </div>
        </div>
    )

    if (isRestricted) return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans pb-20 pt-20"><Navbar />
            <div className="max-w-md mx-auto pt-32 px-4 text-center">
                <div className="bg-white p-12 rounded border border-gray-200 shadow-sm"><div className="text-5xl mb-4">⛔</div>
                    <h2 className="text-red-600 font-bold mb-2">Account Restricted</h2>
                    <p className="text-[#3E4A56] text-sm">Your account has been restricted. Contact admin for help.</p>
                </div>
            </div>
        </div>
    )

    if (success) return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans pb-20 pt-20"><Navbar />
            <div className="max-w-lg mx-auto pt-32 px-4 animate-slide-up">
                <div className="bg-white p-12 rounded border border-gray-200 shadow-sm text-center space-y-4">
                    <CheckCircle2 size={48} className="mx-auto" style={{ color: '#008489' }} />
                    <h2 className="text-[#1C2A59] font-bold text-xl">Claim Submitted!</h2>
                    <p className="text-[#3E4A56] text-sm">Your claim has been submitted for admin review. You'll be notified of the result.</p>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-wider pt-4">Redirecting to dashboard...</p>
                </div>
            </div>
        </div>
    )

    const inputClass = "w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors"
    const labelClass = "text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1 block flex items-center gap-1.5"

    return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans pb-20 pt-20"><Navbar />

            <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                    <Link href={foundItemId ? `/found-items/${foundItemId}` : '/found-items'} className="p-2 border border-gray-200 rounded text-gray-500 hover:text-[#1C2A59] hover:bg-white transition-colors"><ArrowLeft size={18} /></Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#1C2A59]">Submit Claim</h1>
                        <p className="text-[#3E4A56] font-medium text-sm mt-0.5">Prove ownership to reclaim your item</p>
                    </div>
                </div>

                {/* Warning */}
                <div className="mb-6 p-4 rounded flex items-start gap-4"
                    style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                    <AlertTriangle size={20} className="text-[#D97706] mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-[#92400E]">⚠️ Fair Warning</p>
                        <p className="text-xs text-[#92400E]/80 mt-1">False claims will increase your warning count. 3 warnings = account restriction.</p>
                    </div>
                </div>

                {/* Found Item Preview Card */}
                {foundItem && (
                    <div className="mb-6 p-4 rounded flex items-center gap-5 bg-white border border-gray-200 shadow-sm">
                        <div className="w-20 h-20 rounded border border-gray-100 overflow-hidden shrink-0 bg-[#F4F5F7]">
                            {foundItem.photoUrl ? (
                                <img src={foundItem.photoUrl} alt={foundItem.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package size={24} className="text-gray-300" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#008489] mb-1">Claiming This Item</p>
                            <h3 className="text-[#1C2A59] font-extrabold text-base truncate">{foundItem.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                {foundItem.category && (
                                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                        <Tag size={12} /> {foundItem.category}
                                    </span>
                                )}
                                {foundItem.dateFound && (
                                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                        <Calendar size={12} /> Found {new Date(foundItem.dateFound).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded border border-gray-200 p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Optional: Link a Lost Item */}
                        {lostItems.length > 0 && (
                            <div>
                                <label className={labelClass}>
                                    <LinkIcon size={12} /> Link a Lost Report (optional)
                                </label>
                                <select className={inputClass} value={form.lostItemId} onChange={change('lostItemId')}>
                                    <option value="">Skip — I haven't posted a lost report</option>
                                    {lostItems.map(i => <option key={i._id} value={i._id}>{i.title} ({i.category})</option>)}
                                </select>
                                <p className="text-[10px] text-gray-400 mt-1.5 font-medium">Linking a lost report helps AI verify your claim faster, but is not required.</p>
                            </div>
                        )}

                        {foundItemId && (
                            <input type="hidden" value={foundItemId} />
                        )}

                        <div>
                            <label className={labelClass}>Ownership Explanation <span className="text-red-500">*</span></label>
                            <textarea className={`${inputClass} min-h-[120px] resize-y ${fieldErrors.ownershipExplanation ? 'border-red-400 focus:border-red-500 focus:ring-red-400' : ''}`}
                                placeholder="Explain how you can prove this item is yours. Be as detailed as possible — describe unique marks, contents, purchase details..."
                                value={form.ownershipExplanation} onChange={change('ownershipExplanation')}
                                maxLength={CLAIM_LIMITS.OWNERSHIP_MAX} required />
                            <div className="flex items-center justify-between mt-1.5">
                                {fieldErrors.ownershipExplanation ? (
                                    <p className="text-xs text-red-500 font-semibold">{fieldErrors.ownershipExplanation}</p>
                                ) : (
                                    <p className="text-[10px] text-gray-400 font-medium">Minimum {CLAIM_LIMITS.OWNERSHIP_MIN} characters required</p>
                                )}
                                <span className={`text-[10px] font-bold tabular-nums ${
                                    form.ownershipExplanation.trim().length < CLAIM_LIMITS.OWNERSHIP_MIN
                                        ? 'text-red-400'
                                        : form.ownershipExplanation.trim().length > CLAIM_LIMITS.OWNERSHIP_MAX * 0.9
                                            ? 'text-[#D97706]'
                                            : 'text-gray-400'
                                }`}>{form.ownershipExplanation.trim().length} / {CLAIM_LIMITS.OWNERSHIP_MAX}</span>
                            </div>
                        </div>

                        {/* Strong Evidence Notice */}
                        <div className={`p-3 rounded flex items-start gap-3 ${fieldErrors.evidence ? 'bg-red-50 border border-red-200' : 'bg-blue-50/60 border border-blue-100'}`}>
                            <Info size={16} className={`mt-0.5 shrink-0 ${fieldErrors.evidence ? 'text-red-500' : 'text-blue-400'}`} />
                            <div>
                                <p className={`text-xs font-bold ${fieldErrors.evidence ? 'text-red-600' : 'text-blue-600'}`}>
                                    {fieldErrors.evidence ? fieldErrors.evidence : 'At least one strong evidence is required below'}
                                </p>
                                {!fieldErrors.evidence && (
                                    <p className="text-[10px] text-blue-500/70 mt-0.5">Provide hidden identifying details, link a lost report, or add a proof URL.</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Hidden Identifying Details</label>
                            <textarea className={`${inputClass} min-h-[80px] resize-y`}
                                placeholder="Describe hidden marks, scratches, stickers, or other details not visible in photos..."
                                value={form.hiddenDetails} onChange={change('hiddenDetails')} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                                <label className={labelClass}>Exact Color / Brand</label>
                                <input className={inputClass} placeholder="e.g. Deep Blue, Apple iPhone 14 Pro" value={form.exactColorBrand} onChange={change('exactColorBrand')} />
                            </div>
                            <div>
                                <label className={labelClass}>Date Lost</label>
                                <input type="date" className={inputClass} value={form.dateLost} onChange={change('dateLost')} max={today} />
                            </div>
                            <div>
                                <label className={labelClass}>Time Lost</label>
                                <input type="time" className={inputClass} value={form.timeLost} onChange={handleTimeChange} />
                                {form.dateLost === today && <p className="text-[10px] text-[#F0A500] mt-1 font-bold">⏱ Only past & current time allowed for today</p>}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>
                                <MapPin size={12} /> Where did you lose it?
                            </label>
                            <input className={inputClass} placeholder="e.g. Library Block C, 2nd floor reading area" value={form.locationLost} onChange={change('locationLost')} />
                        </div>

                        <div>
                            <label className={labelClass}>Additional Proof (URL)</label>
                            <input className={inputClass} placeholder="Link to receipt, photo of purchase, etc." value={form.proofUrl} onChange={change('proofUrl')} />
                        </div>

                        <div>
                            <label className={labelClass}>Pickup Preference</label>
                            <select className={inputClass} value={form.pickupPreference} onChange={change('pickupPreference')}>
                                <option value="Campus Lost & Found Office">Campus Lost & Found Office</option>
                                <option value="Security Office">Security Office</option>
                                <option value="Department Office">Department Office</option>
                                <option value="Other">Other (mention in explanation)</option>
                            </select>
                        </div>

                        {error && (
                            <div className="p-4 rounded border bg-red-50 border-red-200 text-red-600 text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 py-4 rounded text-sm font-extrabold uppercase tracking-wide transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#1C2A59', color: '#FFFFFF' }}>
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                            {loading ? 'Submitting Claim...' : 'Submit Claim for Review'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

import { Suspense } from 'react'

export default function NewClaimPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center text-[#1C2A59]">Loading...</div>}>
            <ClaimFormContent />
        </Suspense>
    )
}
