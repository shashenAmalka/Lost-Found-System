'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { Save, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import ImageUpload from '@/components/forms/ImageUpload'

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Keys', 'ID Card', 'Bag', 'Jewelry', 'Sports', 'Other']
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor']

export default function EditFoundItemPage() {
    const { id } = useParams()
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [fetching, setFetching] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [forbidden, setForbidden] = useState(false)
    const [form, setForm] = useState({
        title: '', category: '', description: '', keywords: '',
        color: '', brand: '', condition: 'Good',
        dateFound: '', locationFound: '', photoUrl: '',
    })

    useEffect(() => {
        if (!id) return
        fetch(`/api/found-items/${id}`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (!data.item) { setForbidden(true); return }
                const item = data.item
                // Only owner can edit — check isPrivate flag (non-owners get stripped data)
                if (item.isPrivate) { setForbidden(true); return }
                setForm({
                    title: item.title || '',
                    category: item.category || '',
                    description: item.description || '',
                    keywords: Array.isArray(item.keywords) ? item.keywords.join(', ') : (item.keywords || ''),
                    color: item.color || '',
                    brand: item.brand || '',
                    condition: item.condition || 'Good',
                    dateFound: item.dateFound ? new Date(item.dateFound).toISOString().split('T')[0] : '',
                    locationFound: item.locationFound || '',
                    photoUrl: item.photoUrl || '',
                })
            })
            .catch(() => setForbidden(true))
            .finally(() => setFetching(false))
    }, [id])

    const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch(`/api/found-items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to update')
            setSuccess(true)
            setTimeout(() => router.push('/found-items'), 1500)
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
                    <Link href="/found-items" className="inline-block px-6 py-2.5 bg-[#1C2A59] text-[#1C2A59] font-bold rounded hover:bg-[#1a254d] transition-colors">Back to Found Items</Link>
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
                    <p className="text-gray-500 text-sm">Redirecting back to Found Items...</p>
                </div>
            </div>
        </div>
    )

    return (
        <div className="bg-[#F4F5F7] min-h-screen">
            <Navbar />
            <div className="orb w-72 h-72 top-0 right-0 opacity-10" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.5) 0%, transparent 70%)' }} />

            <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/found-items" className="inline-block px-4 py-2 bg-white border border-gray-200 text-[#1C2A59] font-bold rounded hover:bg-gray-50 transition-colors px-3 py-2"><ArrowLeft size={16} /></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1C2A59]">Edit Found Item</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Update your found item report</p>
                    </div>
                </div>

                <div className="bg-white rounded border border-gray-200 shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Item Title *</label>
                                <input className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" placeholder="e.g. Black Wallet" value={form.title} onChange={change('title')} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Category *</label>
                                <select className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" value={form.category} onChange={change('category')} required>
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Description *</label>
                            <textarea className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" placeholder="Describe the item in detail..." value={form.description} onChange={change('description')} required />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Keywords (comma separated)</label>
                            <input className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" placeholder="e.g. wallet, black, leather" value={form.keywords} onChange={change('keywords')} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Color</label>
                                <input className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" placeholder="e.g. Black" value={form.color} onChange={change('color')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Brand</label>
                                <input className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" placeholder="e.g. Nike" value={form.brand} onChange={change('brand')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Condition</label>
                                <select className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" value={form.condition} onChange={change('condition')}>
                                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Date Found *</label>
                                <input type="date" className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" style={{ colorScheme: 'light' }} value={form.dateFound} onChange={change('dateFound')} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Location Found *</label>
                                <input className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors" placeholder="e.g. Cafeteria B" value={form.locationFound} onChange={change('locationFound')} required />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-bold tracking-wider uppercase tracking-wide">Photo (optional)</label>
                            <ImageUpload
                                value={form.photoUrl}
                                onChange={(url) => setForm(f => ({ ...f, photoUrl: url }))}
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="inline-block px-4 py-2 bg-white border border-gray-200 text-[#1C2A59] font-bold rounded hover:bg-gray-50 transition-colors-success w-full justify-center py-3 text-sm font-semibold">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {loading ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
