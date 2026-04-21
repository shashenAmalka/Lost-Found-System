'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CategoryFields from '@/components/forms/CategoryFields'
import { useAuth } from '@/context/AuthContext'
import { Save, ArrowLeft, Sparkles, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import ImageUpload from '@/components/forms/ImageUpload'

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Keys', 'ID Card', 'Bag', 'Jewelry', 'Sports', 'Other']
const TIME_RANGES = ['Morning (6AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-9PM)', 'Night (9PM-6AM)', 'Not Sure']

export default function EditLostItemPage() {
    const { id } = useParams()
    const searchParams = useSearchParams()
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const returnTo = searchParams.get('returnTo') || '/lost-items'
    const [fetching, setFetching] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [forbidden, setForbidden] = useState(false)
    const [form, setForm] = useState({
        title: '', category: '', description: '', keywords: '',
        color: '', brand: '', uniqueIdentifier: '',
        dateLost: '', timeRange: '', possibleLocation: '',
        imageUrl: '', contactPreference: 'platform',
    })
    const [categoryFields, setCategoryFields] = useState({})

    useEffect(() => {
        if (!id) return
        fetch(`/api/lost-items/${id}`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (!data.item) { setForbidden(true); return }
                const item = data.item
                // Check ownership — if user doesn't own it the API still returns it, so verify manually
                if (user && item.postedBy?.toString() !== user.id) { setForbidden(true); return }
                setForm({
                    title: item.title || '',
                    category: item.category || '',
                    description: item.description || '',
                    keywords: Array.isArray(item.keywords) ? item.keywords.join(', ') : (item.keywords || ''),
                    color: item.color || '',
                    brand: item.brand || '',
                    uniqueIdentifier: item.uniqueIdentifier || '',
                    dateLost: item.dateLost ? new Date(item.dateLost).toISOString().split('T')[0] : '',
                    timeRange: item.timeRange || '',
                    possibleLocation: item.possibleLocation || '',
                    imageUrl: item.imageUrl || '',
                    contactPreference: item.contactPreference || 'platform',
                })
                setCategoryFields(item.categoryFields || {})
            })
            .catch(() => setForbidden(true))
            .finally(() => setFetching(false))
    }, [id, user])

    const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch(`/api/lost-items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, categoryFields }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to update')
            setSuccess(true)
            setTimeout(() => router.push(returnTo), 1500)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || fetching) return (
        <div className="bg-[#F4F5F7] min-h-screen"><Navbar />
            <div className="flex items-center justify-center pt-40">
                <Loader2 className="animate-spin text-[#1C2A59]/30" size={36} />
            </div>
        </div>
    )

    if (!user) return (
        <div className="bg-[#F4F5F7] min-h-screen"><Navbar />
            <div className="max-w-md mx-auto pt-32 px-4 text-center">
                <div className="bg-white rounded border border-gray-200 shadow-sm p-12">
                    <div className="text-5xl mb-4">🔒</div>
                    <h2 className="text-[#1C2A59] font-bold text-lg mb-2">Login Required</h2>
                    <Link href="/login" className="inline-block px-6 py-2.5 bg-[#1C2A59] text-[#1C2A59] font-bold rounded hover:bg-[#1a254d] transition-colors">Sign In</Link>
                </div>
            </div>
        </div>
    )

    if (forbidden) return (
        <div className="bg-[#F4F5F7] min-h-screen"><Navbar />
            <div className="max-w-md mx-auto pt-32 px-4 text-center">
                <div className="bg-white rounded border border-gray-200 shadow-sm p-12">
                    <div className="text-5xl mb-4">⛔</div>
                    <h2 className="text-[#1C2A59] font-bold text-lg mb-2">Access Denied</h2>
                    <p className="text-gray-500 text-sm mb-6">You can only edit your own posts within the 10-minute window.</p>
                    <Link href="/lost-items" className="inline-block px-6 py-2.5 bg-[#1C2A59] text-[#1C2A59] font-bold rounded hover:bg-[#1a254d] transition-colors">Back to Lost Items</Link>
                </div>
            </div>
        </div>
    )

    if (success) return (
        <div className="bg-[#F4F5F7] min-h-screen"><Navbar />
            <div className="max-w-md mx-auto pt-32 px-4 text-center">
                <div className="bg-white rounded border border-gray-200 shadow-sm p-12">
                    <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: '#4ade80' }} />
                    <h2 className="text-[#1C2A59] font-bold text-lg mb-2">Updated Successfully!</h2>
                    <p className="text-gray-500 text-sm">Redirecting back to Lost Items...</p>
                </div>
            </div>
        </div>
    )

    return (
        <div className="bg-[#F4F5F7] min-h-screen">
            <Navbar />
            <div className="orb w-72 h-72 top-0 left-0 opacity-10" style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.5) 0%, transparent 70%)' }} />

            <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/lost-items" className="inline-block px-4 py-2 bg-white border border-gray-200 text-[#1C2A59] font-bold rounded hover:bg-gray-50 transition-colors px-3 py-2"><ArrowLeft size={16} /></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1C2A59]">Edit Lost Item</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Update your lost item report</p>
                    </div>
                </div>

                <div className="bg-white rounded border border-gray-200 shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Section 1: Basic Information */}
                        <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid #E5E7EB' }}>
                            <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                                style={{ background: 'rgba(240,100,20,0.15)', color: '#F06414', border: '1px solid rgba(240,100,20,0.3)' }}>1</div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#9CA3AF' }}>Basic Information</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Item Title <span style={{ color: '#F06414' }}>*</span></label>
                                <input className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" placeholder="e.g. Blue iPhone 14 Pro" value={form.title} onChange={change('title')} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Category <span style={{ color: '#F06414' }}>*</span></label>
                                <select className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" value={form.category} onChange={change('category')} required>
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Description <span style={{ color: '#F06414' }}>*</span></label>
                            <textarea className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" placeholder="Describe your item in detail..." value={form.description} onChange={change('description')} required />
                            <p className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(245,246,250,0.3)' }}>
                                <Sparkles size={10} /> Detailed descriptions help our AI find better matches
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Keywords (comma separated)</label>
                            <input className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" placeholder="e.g. phone, blue, iphone, case" value={form.keywords} onChange={change('keywords')} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Color</label>
                                <input className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" placeholder="e.g. Blue" value={form.color} onChange={change('color')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Brand</label>
                                <input className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" placeholder="e.g. Apple" value={form.brand} onChange={change('brand')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Unique ID</label>
                                <input className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" placeholder="e.g. Serial #" value={form.uniqueIdentifier} onChange={change('uniqueIdentifier')} />
                            </div>
                        </div>

                        {/* Section 2: Category-Specific Fields */}
                        {form.category && form.category !== 'Other' && (
                            <div className="pt-3">
                                <div className="flex items-center gap-2 pb-2 mb-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                                        style={{ background: 'rgba(240,100,20,0.15)', color: '#F06414', border: '1px solid rgba(240,100,20,0.3)' }}>2</div>
                                    <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#9CA3AF' }}>
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

                        {/* Section 3: Location & Time */}
                        <div className="pt-3">
                            <div className="flex items-center gap-2 pb-2 mb-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                                    style={{ background: 'rgba(240,100,20,0.15)', color: '#F06414', border: '1px solid rgba(240,100,20,0.3)' }}>
                                    {form.category && form.category !== 'Other' ? '3' : '2'}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#9CA3AF' }}>Location & Time</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Date Lost <span style={{ color: '#F06414' }}>*</span></label>
                                    <input type="date" className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" value={form.dateLost} onChange={change('dateLost')} required style={{ colorScheme: 'light' }} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Approximate Time</label>
                                    <select className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" value={form.timeRange} onChange={change('timeRange')}>
                                        <option value="">Select time range</option>
                                        {TIME_RANGES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5 mt-4">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Possible Location <span style={{ color: '#F06414' }}>*</span></label>
                                <input className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" placeholder="e.g. Library 2nd floor, Building A Lecture Hall" value={form.possibleLocation} onChange={change('possibleLocation')} required />
                            </div>
                        </div>

                        {/* Section 4: Additional Info */}
                        <div className="pt-3">
                            <div className="flex items-center gap-2 pb-2 mb-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                                    style={{ background: 'rgba(240,100,20,0.15)', color: '#F06414', border: '1px solid rgba(240,100,20,0.3)' }}>
                                    {form.category && form.category !== 'Other' ? '4' : '3'}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#9CA3AF' }}>Additional Information</span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Photo (optional)</label>
                                <ImageUpload
                                    value={form.imageUrl}
                                    onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
                                />
                            </div>

                            <div className="space-y-1.5 mt-4">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Contact Preference</label>
                                <select className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" value={form.contactPreference} onChange={change('contactPreference')}>
                                    <option value="platform">Platform Messaging</option>
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl text-sm flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-[#1C2A59] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(135deg, #F06414 0%, #D4AF37 100%)',
                                boxShadow: '0 8px 24px rgba(240, 100, 20, 0.3)',
                            }}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {loading ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
