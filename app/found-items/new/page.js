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
    const [smartMode, setSmartMode] = useState(false)
    const [analyzingImage, setAnalyzingImage] = useState(false)
    const [aiSuggestion, setAiSuggestion] = useState(null)
    const [touched, setTouched] = useState({})
    const [form, setForm] = useState({
        title: '', category: '', description: '', keywords: '',
        color: '', brand: '', condition: 'Good',
        dateFound: '', timeFound: '', locationFound: '', photoUrl: '',
    })

    const change = (k) => (e) => {
        const value = e.target.value
        setTouched(prev => ({ ...prev, [k]: true }))
        setForm(f => ({ ...f, [k]: value }))
    }

    const today = new Date().toISOString().split('T')[0]

    const getCurrentTime = () => {
        const n = new Date()
        return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`
    }

    const handleTimeChange = (e) => {
        const val = e.target.value
        if (form.dateFound === today && val > getCurrentTime()) {
            setError('⏱ Cannot select a future time for today.')
            setForm(f => ({ ...f, timeFound: '' }))
            return
        }
        setError('')
        setForm(f => ({ ...f, timeFound: val }))
    }

    const applyAiSuggestion = (ai) => {
        if (!ai) return
        setAiSuggestion(ai)

        setForm((prev) => {
            const next = { ...prev }
            if (!touched.title && !next.title) next.title = ai.title || ''
            if (!touched.description && !next.description) next.description = ai.description || ''
            if (!touched.category && !next.category) next.category = ai.category || ''
            if (!touched.color && !next.color) next.color = ai.color || ''
            if (!touched.keywords && !next.keywords) next.keywords = (ai.keywords || []).join(', ')
            if (smartMode && !next.dateFound) next.dateFound = today
            if (smartMode && !next.locationFound) next.locationFound = 'Not specified'
            return next
        })
    }

    const analyzeImage = async (url) => {
        if (!url) {
            setAiSuggestion(null)
            return
        }

        setAnalyzingImage(true)
        try {
            const res = await fetch('/api/ai/describe-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ imageUrl: url, itemType: 'found' }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Image analysis failed')
            applyAiSuggestion(data.ai)
        } catch (err) {
            setError(err.message || 'Unable to analyze the uploaded image')
        } finally {
            setAnalyzingImage(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!form.photoUrl) {
            setError('Please upload an image.')
            return
        }
        const now = new Date()
        const todayStr = now.toISOString().split('T')[0]
        const currentTimeStr = now.toTimeString().slice(0, 5)
        if (form.dateFound && form.dateFound > todayStr) {
            setError('Date Found cannot be a future date.')
            return
        }
        if (form.dateFound === todayStr && form.timeFound && form.timeFound > currentTimeStr) {
            setError('Time Found cannot be in the future.')
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/found-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, ai: aiSuggestion, smartMode }),
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

    if (authLoading) return <div className="min-h-screen bg-[#F4F5F7] font-sans pb-20 pt-20"><Navbar /></div>
    if (!user) {
        return (
            <div className="min-h-screen bg-[#F4F5F7] font-sans pb-20 pt-20">
                <Navbar />
                <div className="max-w-md mx-auto pt-32 px-4 text-center">
                    <div className="bg-white p-12 rounded border border-gray-200 shadow-sm">
                        <div className="text-5xl mb-4 text-[#F0A500]">🔒</div>
                        <h2 className="text-[#1C2A59] font-bold text-xl mb-2">Login Required</h2>
                        <p className="text-[#3E4A56] text-sm mb-6">You must be logged in to report a found item.</p>
                        <Link href="/login" className="inline-block px-6 py-2.5 bg-[#1C2A59] text-white font-bold rounded hover:bg-[#1a254d] transition-colors">Sign In</Link>
                    </div>
                </div>
            </div>
        )
    }

    const inputClass = "w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors"
    const labelClass = "text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1 block"

    return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans pb-20 pt-20">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                    <Link href="/found-items" className="p-2 border border-gray-200 rounded text-gray-500 hover:text-[#1C2A59] hover:bg-white transition-colors"><ArrowLeft size={18} /></Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#1C2A59]">Report Found Item</h1>
                        <p className="text-[#3E4A56] font-medium text-sm mt-0.5">Help return this item to its rightful owner</p>
                    </div>
                </div>

                <div className="mb-4 p-4 bg-[#f8fafc] border border-gray-200 rounded flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-[#1C2A59]">AI Smart Mode (Image only)</p>
                        <p className="text-xs text-gray-500">Upload an image and let AI auto-fill key fields before submit.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSmartMode(v => !v)}
                        className={`px-3 py-2 text-xs font-bold rounded border ${smartMode ? 'bg-[#1C2A59] text-white border-[#1C2A59]' : 'bg-white text-[#1C2A59] border-gray-300'}`}
                    >
                        {smartMode ? 'Smart Mode ON' : 'Smart Mode OFF'}
                    </button>
                </div>

                <div className="bg-white rounded border border-gray-200 p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Item Title {!smartMode && <span className="text-red-500">*</span>}</label>
                                <input className={inputClass} placeholder="e.g. Black Wallet" value={form.title} onChange={change('title')} required={!smartMode} />
                            </div>
                            <div>
                                <label className={labelClass}>Category {!smartMode && <span className="text-red-500">*</span>}</label>
                                <select className={inputClass} value={form.category} onChange={change('category')} required={!smartMode}>
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Description {!smartMode && <span className="text-red-500">*</span>}</label>
                            <textarea className={`${inputClass} min-h-[100px] resize-y`} placeholder="Describe the item in detail..." value={form.description} onChange={change('description')} required={!smartMode} />
                            {analyzingImage && <p className="text-[10px] text-[#1C2A59] mt-1.5 font-semibold">Analyzing image with Hugging Face AI...</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Keywords (comma separated)</label>
                            <input className={inputClass} placeholder="e.g. wallet, black, leather" value={form.keywords} onChange={change('keywords')} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                                <label className={labelClass}>Color</label>
                                <input className={inputClass} placeholder="e.g. Black" value={form.color} onChange={change('color')} />
                            </div>
                            <div>
                                <label className={labelClass}>Brand</label>
                                <input className={inputClass} placeholder="e.g. Nike" value={form.brand} onChange={change('brand')} />
                            </div>
                            <div>
                                <label className={labelClass}>Condition</label>
                                <select className={inputClass} value={form.condition} onChange={change('condition')}>
                                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                                <label className={labelClass}>Date Found {!smartMode && <span className="text-red-500">*</span>}</label>
                                <input type="date" className={inputClass} value={form.dateFound} onChange={change('dateFound')} max={today} required={!smartMode} />
                            </div>
                            <div>
                                <label className={labelClass}>Time Found</label>
                                <input type="time" className={inputClass} value={form.timeFound} onChange={handleTimeChange} />
                                {form.dateFound === today && <p className="text-[10px] text-[#F0A500] mt-1 font-bold">⏱ Only past & current time allowed for today</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Location Found {!smartMode && <span className="text-red-500">*</span>}</label>
                                <input className={inputClass} placeholder="e.g. Cafeteria B" value={form.locationFound} onChange={change('locationFound')} required={!smartMode} />
                            </div>
                        </div>


                        <div>
                            <label className={labelClass}>Actual Photo <span className="text-red-500">*</span></label>
                            <div className="bg-[#F4F5F7] p-4 rounded border border-gray-200">
                                <ImageUpload
                                    value={form.photoUrl}
                                    onChange={(url) => {
                                        setForm(f => ({ ...f, photoUrl: url }))
                                        analyzeImage(url)
                                    }}
                                />
                            </div>
                        </div>

                        {aiSuggestion && (
                            <div className="p-4 rounded border border-[#bfdbfe] bg-[#eff6ff]">
                                <p className="text-xs font-black uppercase tracking-wider text-[#1d4ed8] mb-1">AI Suggestions</p>
                                <p className="text-sm text-[#1C2A59] font-semibold">{aiSuggestion.description}</p>
                                <p className="text-xs text-[#1d4ed8] mt-2">Labels: {(aiSuggestion.labels || []).slice(0, 8).join(', ') || 'N/A'}</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 rounded border bg-red-50 border-red-200 text-red-600 text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 py-4 rounded text-sm font-extrabold uppercase tracking-wide transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#1C2A59', color: '#FFFFFF' }}>
                            <Send size={18} />
                            {loading ? 'Submitting Report...' : 'Submit Found Item Report'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
