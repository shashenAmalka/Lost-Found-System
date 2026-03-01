'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ImageUpload from '@/components/forms/ImageUpload'

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Keys', 'ID Card', 'Bag', 'Jewelry', 'Sports', 'Other']
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor']

export default function NewFoundItemPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        title: '', category: '', description: '', keywords: '',
        color: '', brand: '', condition: 'Good',
        dateFound: '', locationFound: '', photoUrl: '',
    })

    const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/found-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to create report')
            router.push('/found-items')
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
                        <p className="text-white/50 text-sm mb-6">You must be logged in to report a found item.</p>
                        <Link href="/login" className="btn-glass-primary">Sign In</Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-bg min-h-screen">
            <Navbar />
            <div className="orb w-72 h-72 top-0 right-0 opacity-10" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.5) 0%, transparent 70%)' }} />

            <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/found-items" className="btn-glass px-3 py-2"><ArrowLeft size={16} /></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Report Found Item</h1>
                        <p className="text-white/50 text-sm mt-0.5">Help return this item to its owner</p>
                    </div>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Item Title *</label>
                                <input className="glass-input" placeholder="e.g. Black Wallet" value={form.title} onChange={change('title')} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Category *</label>
                                <select className="glass-select" value={form.category} onChange={change('category')} required>
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Description *</label>
                            <textarea className="glass-input min-h-[100px] resize-y" placeholder="Describe the item in detail..." value={form.description} onChange={change('description')} required />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Keywords (comma separated)</label>
                            <input className="glass-input" placeholder="e.g. wallet, black, leather" value={form.keywords} onChange={change('keywords')} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Color</label>
                                <input className="glass-input" placeholder="e.g. Black" value={form.color} onChange={change('color')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Brand</label>
                                <input className="glass-input" placeholder="e.g. Nike" value={form.brand} onChange={change('brand')} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Condition</label>
                                <select className="glass-select" value={form.condition} onChange={change('condition')}>
                                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Date Found *</label>
                                <input type="date" className="glass-input" value={form.dateFound} onChange={change('dateFound')} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/60 uppercase tracking-wide">Location Found *</label>
                                <input className="glass-input" placeholder="e.g. Cafeteria B" value={form.locationFound} onChange={change('locationFound')} required />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/60 uppercase tracking-wide">Actual Photo (optional)</label>
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

                        <button type="submit" disabled={loading} className="btn-glass-success w-full justify-center py-3 text-sm font-semibold">
                            <Send size={16} />
                            {loading ? 'Submitting Report...' : 'Submit Found Item Report'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
