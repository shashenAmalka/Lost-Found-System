'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CategoryFields from '@/components/forms/CategoryFields'
import { useAuth } from '@/context/AuthContext'
import { Send, ArrowLeft, ImagePlus, Sparkles, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Keys', 'ID Card', 'Bag', 'Jewelry', 'Sports', 'Other']
const TIME_RANGES = ['Morning (6AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-9PM)', 'Night (9PM-6AM)', 'Not Sure']

export default function NewLostItemPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [form, setForm] = useState({
        title: '', category: '', description: '', keywords: '',
        color: '', brand: '', uniqueIdentifier: '',
        dateLost: '', timeRange: '', possibleLocation: '',
        imageUrl: '', contactPreference: 'platform',
    })
    const [categoryFields, setCategoryFields] = useState({})

    // Reset category-specific fields when category changes
    useEffect(() => {
        setCategoryFields({})
    }, [form.category])

    const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/lost-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, categoryFields }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to create report')
            setSuccess(true)
            setTimeout(() => router.push('/lost-items'), 1500)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) return <div className="page-bg min-h-screen"><Navbar /></div>
    if (!user) {
        return (
            <div className="page-bg min-h-screen">
                <Navbar />
                <div className="max-w-md mx-auto pt-32 px-4 text-center">
                    <div className="glass-card p-12">
                        <div className="text-5xl mb-4">🔒</div>
                        <h2 className="text-white font-bold text-lg mb-2">Login Required</h2>
                        <p className="text-white/50 text-sm mb-6">You must be logged in to report a lost item.</p>
                        <Link href="/login" className="btn-glass-primary">Sign In</Link>
                    </div>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="page-bg min-h-screen">
                <Navbar />
                <div className="max-w-md mx-auto pt-32 px-4 text-center">
                    <div className="glass-card p-12">
                        <div className="text-5xl mb-4">✅</div>
                        <h2 className="text-white font-bold text-lg mb-2">Report Submitted!</h2>
                        <p className="text-white/50 text-sm">Your lost item has been reported. Our AI will start looking for matches.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-bg min-h-screen">
            <Navbar />
            <div className="orb w-72 h-72 top-0 left-0 opacity-10" style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.5) 0%, transparent 70%)' }} />

            <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/lost-items" className="btn-glass px-3 py-2"><ArrowLeft size={16} /></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Report Lost Item</h1>
                        <p className="text-white/50 text-sm mt-0.5">Fill in details to help us find your item</p>
                    </div>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* ===== SECTION 1: Basic Information ===== */}
                        <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                                style={{ background: 'rgba(240,100,20,0.15)', color: '#F06414', border: '1px solid rgba(240,100,20,0.3)' }}>1</div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(245,246,250,0.5)' }}>
                                Basic Information
                            </span>
                        </div>

                        {/* Title & Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Item Title <span style={{ color: '#F06414' }}>*</span></label>
                                <input className="glass-input" placeholder="e.g. Blue iPhone 14 Pro" value={form.title} onChange={change('title')} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Category <span style={{ color: '#F06414' }}>*</span></label>
                                <select className="glass-select" value={form.category} onChange={change('category')} required>
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Description <span style={{ color: '#F06414' }}>*</span></label>
                            <textarea className="glass-input min-h-[100px] resize-y" placeholder="Describe your item in detail — color, brand, distinguishing marks, contents..." value={form.description} onChange={change('description')} required />
                            <p className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(245,246,250,0.3)' }}>
                                <Sparkles size={10} /> Detailed descriptions help our AI find better matches
                            </p>
                        </div>

                        {/* Keywords */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Keywords (comma separated)</label>
                            <input className="glass-input" placeholder="e.g. phone, blue, iphone, case" value={form.keywords} onChange={change('keywords')} />
                        </div>

                        {/* Color, Brand, Unique Identifier */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Color</label>
                                <input className="glass-input" placeholder="e.g. Blue" value={form.color} onChange={change('color')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Brand</label>
                                <input className="glass-input" placeholder="e.g. Apple" value={form.brand} onChange={change('brand')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Unique ID</label>
                                <input className="glass-input" placeholder="e.g. Serial #" value={form.uniqueIdentifier} onChange={change('uniqueIdentifier')} />
                            </div>
                        </div>

                        {/* ===== SECTION 2: Category-Specific Fields (Dynamic) ===== */}
                        {form.category && form.category !== 'Other' && (
                            <div className="pt-3">
                                <div className="flex items-center gap-2 pb-2 mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                                        style={{ background: 'rgba(240,100,20,0.15)', color: '#F06414', border: '1px solid rgba(240,100,20,0.3)' }}>2</div>
                                    <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(245,246,250,0.5)' }}>
                                        {form.category} Specific Details
                                    </span>
                                </div>
                                <CategoryFields
                                    category={form.category}
                                    values={categoryFields}
                                    onChange={setCategoryFields}
                                />
                            </div>
                        )}

                        {/* ===== SECTION 3: Where & When ===== */}
                        <div className="pt-3">
                            <div className="flex items-center gap-2 pb-2 mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                                    style={{ background: 'rgba(240,100,20,0.15)', color: '#F06414', border: '1px solid rgba(240,100,20,0.3)' }}>
                                    {form.category && form.category !== 'Other' ? '3' : '2'}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(245,246,250,0.5)' }}>
                                    Location & Time
                                </span>
                            </div>

                            {/* Date & Time Range */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-white/60 uppercase tracking-wide">Date Lost <span style={{ color: '#F06414' }}>*</span></label>
                                    <input type="date" className="glass-input" value={form.dateLost} onChange={change('dateLost')} required style={{ colorScheme: 'dark' }} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-white/60 uppercase tracking-wide">Approximate Time</label>
                                    <select className="glass-select" value={form.timeRange} onChange={change('timeRange')}>
                                        <option value="">Select time range</option>
                                        {TIME_RANGES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-1.5 mt-4">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Possible Location <span style={{ color: '#F06414' }}>*</span></label>
                                <input className="glass-input" placeholder="e.g. Library 2nd floor, Building A Lecture Hall" value={form.possibleLocation} onChange={change('possibleLocation')} required />
                            </div>
                        </div>

                        {/* ===== SECTION 4: Additional Info ===== */}
                        <div className="pt-3">
                            <div className="flex items-center gap-2 pb-2 mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                                    style={{ background: 'rgba(240,100,20,0.15)', color: '#F06414', border: '1px solid rgba(240,100,20,0.3)' }}>
                                    {form.category && form.category !== 'Other' ? '4' : '3'}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(245,246,250,0.5)' }}>
                                    Additional Information
                                </span>
                            </div>

                            {/* Image URL */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Image URL (optional)</label>
                                <div className="flex gap-3">
                                    <input className="glass-input flex-1" placeholder="Paste image URL..." value={form.imageUrl} onChange={change('imageUrl')} />
                                    <div className="btn-glass px-3 py-2 shrink-0"><ImagePlus size={16} /></div>
                                </div>
                            </div>

                            {/* Contact Preference */}
                            <div className="space-y-1.5 mt-4">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Contact Preference</label>
                                <select className="glass-select" value={form.contactPreference} onChange={change('contactPreference')}>
                                    <option value="platform">Platform Messaging</option>
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                </select>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-xl text-sm flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(135deg, #F06414 0%, #D4AF37 100%)',
                                boxShadow: '0 8px 24px rgba(240, 100, 20, 0.3)',
                            }}>
                            <Send size={16} />
                            {loading ? 'Submitting Report...' : 'Submit Lost Item Report'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
