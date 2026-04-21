'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CategoryFields from '@/components/forms/CategoryFields'
import { useAuth } from '@/context/AuthContext'
import { Send, ArrowLeft, Sparkles, AlertCircle, Wand2, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import ImageUpload from '@/components/forms/ImageUpload'
import { REPORT_LOCATIONS, LOCATION_SUB_LOCATIONS, composeReportLocation } from '@/lib/reportLocations'

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Keys', 'ID Card', 'Bag', 'Jewelry', 'Sports', 'Other']
const TIME_RANGES = ['Morning (6AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-9PM)', 'Night (9PM-6AM)', 'Not Sure']

export default function NewLostItemPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [smartMode, setSmartMode] = useState(false)
    const [analyzingImage, setAnalyzingImage] = useState(false)
    const [editingImage, setEditingImage] = useState(false)
    const [aiSuggestion, setAiSuggestion] = useState(null)
    const [touched, setTouched] = useState({})
    const [form, setForm] = useState({
        title: '', category: '', description: '', keywords: '',
        color: '', brand: '', uniqueIdentifier: '',
        dateLost: '', timeRange: '', possibleLocation: '',
        imageUrl: '', contactPreference: 'platform',
    })
    const [categoryFields, setCategoryFields] = useState({})
    const [location, setLocation] = useState('')
    const [subLocation, setSubLocation] = useState('')
    const [otherLocation, setOtherLocation] = useState('')
    const [originalImageUrl, setOriginalImageUrl] = useState('')
    const [editedImageUrl, setEditedImageUrl] = useState('')
    const [isImageEdited, setIsImageEdited] = useState(false)

    // Reset category-specific fields when category changes
    useEffect(() => {
        setCategoryFields({})
    }, [form.category])

    useEffect(() => {
        setSubLocation('')
        setOtherLocation('')
    }, [location])

    useEffect(() => {
        const composedLocation = composeReportLocation({ location, subLocation, otherLocation })
        setForm(f => ({ ...f, possibleLocation: composedLocation }))
    }, [location, subLocation, otherLocation])

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
        if (form.dateLost === today && val > getCurrentTime()) {
            setError('⏱ Cannot select a future time for today.')
            setForm(f => ({ ...f, timeRange: '' }))
            return
        }
        setError('')
        setForm(f => ({ ...f, timeRange: val }))
    }

    const applyAiSuggestion = (ai) => {
        if (!ai) return
        setAiSuggestion(ai)

        setForm((prev) => {
            const next = { ...prev }
            const suggestedKeywords = Array.isArray(ai.keywords)
                ? ai.keywords
                : Array.isArray(ai.labels)
                    ? ai.labels
                    : []
            if (!touched.title && !next.title) next.title = ai.title || ''
            if (!touched.description && !next.description) next.description = ai.description || ''
            if (!touched.category && !next.category) next.category = ai.category || ''
            if (!touched.color && !next.color) next.color = ai.color || ''
            if (!touched.brand && !next.brand) next.brand = ai.brand || ''
            if (!touched.uniqueIdentifier && !next.uniqueIdentifier) next.uniqueIdentifier = ai.uniqueIdentifier || ''
            if (!touched.keywords && !next.keywords) next.keywords = suggestedKeywords.join(', ')
            if (smartMode && !next.dateLost) next.dateLost = today
            if (smartMode && !next.possibleLocation) next.possibleLocation = 'Not specified'
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
                body: JSON.stringify({ imageUrl: url, itemType: 'lost' }),
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
        if (smartMode && !form.imageUrl) {
            setError('Please upload an image when Smart Mode is ON.')
            return
        }
        if (form.dateLost && form.dateLost > today) {
            setError('Date Lost cannot be a future date.')
            return
        }
        setLoading(true)
        try {
            const finalImageUrl = editedImageUrl || form.imageUrl
            const resolvedLocation = composeReportLocation({ location, subLocation, otherLocation }) || form.possibleLocation

            const res = await fetch('/api/lost-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    imageUrl: finalImageUrl,
                    possibleLocation: resolvedLocation,
                    categoryFields,
                    ai: aiSuggestion,
                    smartMode,
                }),
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

    const handleEditImage = async () => {
        if (!form.imageUrl && !editedImageUrl) {
            setError('Please upload an image first.')
            return
        }

        setError('')
        setEditingImage(true)

        try {
            const sourceImageUrl = originalImageUrl || form.imageUrl || editedImageUrl
            if (!sourceImageUrl) throw new Error('Image source is missing')

            const res = await fetch('/api/ai/edit-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ imageUrl: sourceImageUrl }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Image edit failed')

            if (!originalImageUrl) {
                setOriginalImageUrl(sourceImageUrl)
            }

            setEditedImageUrl(data.editedImageUrl)
            setIsImageEdited(true)
            setForm(f => ({ ...f, imageUrl: data.editedImageUrl }))
            analyzeImage(data.editedImageUrl)
        } catch (err) {
            setError(err.message || 'Unable to edit image')
        } finally {
            setEditingImage(false)
        }
    }

    const handleRevertImage = () => {
        if (!originalImageUrl) return
        setForm(f => ({ ...f, imageUrl: originalImageUrl }))
        setEditedImageUrl('')
        setIsImageEdited(false)
        analyzeImage(originalImageUrl)
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
                        <p className="text-[#3E4A56] text-sm mb-6">You must be logged in to report a lost item.</p>
                        <Link href="/login" className="inline-block px-6 py-2.5 bg-[#1C2A59] text-white font-bold rounded hover:bg-[#1a254d] transition-colors">Sign In</Link>
                    </div>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#F4F5F7] font-sans pb-20 pt-20">
                <Navbar />
                <div className="max-w-md mx-auto pt-32 px-4 text-center">
                    <div className="bg-white p-12 rounded border border-gray-200 shadow-sm">
                        <div className="text-5xl mb-4 text-[#008489]">✅</div>
                        <h2 className="text-[#1C2A59] font-bold text-xl mb-2">Report Submitted!</h2>
                        <p className="text-[#3E4A56] text-sm">Your lost item has been reported. Our AI will start looking for matches.</p>
                    </div>
                </div>
            </div>
        )
    }

    const inputClass = "w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors"
    const labelClass = "text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1 block"
    const currentSubLocationOptions = LOCATION_SUB_LOCATIONS[location] || []

    return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans pb-20 pt-20">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                    <Link href="/lost-items" className="p-2 border border-gray-200 rounded text-gray-500 hover:text-[#1C2A59] hover:bg-white transition-colors"><ArrowLeft size={18} /></Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#1C2A59]">Report Lost Item</h1>
                        <p className="text-[#3E4A56] font-medium text-sm mt-0.5">Fill in details to help us find your item</p>
                    </div>
                </div>

                <div className="mb-4 p-4 bg-[#f8fafc] border border-gray-200 rounded flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-[#1C2A59]">AI Smart Mode (Image only)</p>
                        <p className="text-xs text-gray-500">Upload an image and let AI auto-fill title, description, category, and color.</p>
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

                        {/* ===== SECTION 1: Basic Information ===== */}
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-6 h-6 rounded bg-[#F0A500] flex items-center justify-center text-xs font-bold text-[#1C2A59]">1</div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Basic Information</span>
                        </div>

                        {/* Title & Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Item Title {!smartMode && <span className="text-red-500">*</span>}</label>
                                <input className={inputClass} placeholder="e.g. Blue iPhone 14 Pro" value={form.title} onChange={change('title')} required={!smartMode} />
                            </div>
                            <div>
                                <label className={labelClass}>Category {!smartMode && <span className="text-red-500">*</span>}</label>
                                <select className={inputClass} value={form.category} onChange={change('category')} required={!smartMode}>
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className={labelClass}>Description {!smartMode && <span className="text-red-500">*</span>}</label>
                            <textarea className={`${inputClass} min-h-[100px] resize-y`} placeholder="Describe your item in detail — color, brand, distinguishing marks, contents..." value={form.description} onChange={change('description')} required={!smartMode} />
                            <p className="text-[10px] flex items-center gap-1 text-gray-400 mt-1.5 font-medium">
                                <Sparkles size={12} className="text-[#F0A500]" /> Detailed descriptions help our AI find better matches
                            </p>
                            {analyzingImage && <p className="text-[10px] text-[#1C2A59] mt-1.5 font-semibold">Analyzing image with Groq Vision AI...</p>}
                        </div>

                        {/* Keywords */}
                        <div>
                            <label className={labelClass}>Keywords (comma separated)</label>
                            <input className={inputClass} placeholder="e.g. phone, blue, iphone, case" value={form.keywords} onChange={change('keywords')} />
                        </div>

                        {/* Color, Brand, Unique Identifier */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                                <label className={labelClass}>Color</label>
                                <input className={inputClass} placeholder="e.g. Blue" value={form.color} onChange={change('color')} />
                            </div>
                            <div>
                                <label className={labelClass}>Brand</label>
                                <input className={inputClass} placeholder="e.g. Apple" value={form.brand} onChange={change('brand')} />
                            </div>
                            <div>
                                <label className={labelClass}>Unique ID</label>
                                <input className={inputClass} placeholder="e.g. Serial #" value={form.uniqueIdentifier} onChange={change('uniqueIdentifier')} />
                            </div>
                        </div>

                        {/* ===== SECTION 2: Category-Specific Fields (Dynamic) ===== */}
                        {form.category && form.category !== 'Other' && (
                            <div className="pt-2">
                                <div className="flex items-center gap-3 pb-2 mb-4 border-b border-gray-100">
                                    <div className="w-6 h-6 rounded bg-[#F0A500] flex items-center justify-center text-xs font-bold text-[#1C2A59]">2</div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{form.category} Specific Details</span>
                                </div>
                                <CategoryFields
                                    category={form.category}
                                    values={categoryFields}
                                    onChange={setCategoryFields}
                                />
                            </div>
                        )}

                        {/* ===== SECTION 3: Where & When ===== */}
                        <div className="pt-2">
                            <div className="flex items-center gap-3 pb-2 mb-4 border-b border-gray-100">
                                <div className="w-6 h-6 rounded bg-[#F0A500] flex items-center justify-center text-xs font-bold text-[#1C2A59]">{form.category && form.category !== 'Other' ? '3' : '2'}</div>
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Location & Time</span>
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Date Lost {!smartMode && <span className="text-red-500">*</span>}</label>
                                    <input type="date" className={inputClass} value={form.dateLost} onChange={change('dateLost')} max={today} required={!smartMode} />
                                </div>
                                <div>
                                    <label className={labelClass}>Approximate Time Lost</label>
                                    <input type="time" className={inputClass} value={form.timeRange} onChange={handleTimeChange} />
                                    {form.dateLost === today && <p className="text-[10px] text-[#F0A500] mt-1 font-bold">⏱ Only past & current time allowed for today</p>}
                                </div>
                            </div>


                            {/* Location */}
                            <div className="mt-5">
                                <label className={labelClass}>Possible Location {!smartMode && <span className="text-red-500">*</span>}</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <select
                                        className={inputClass}
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        required={!smartMode}
                                    >
                                        <option value="">Select location</option>
                                        {REPORT_LOCATIONS.map((loc) => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>

                                    {location === 'Other' && (
                                        <input
                                            className={inputClass}
                                            placeholder="Type custom location"
                                            value={otherLocation}
                                            onChange={(e) => setOtherLocation(e.target.value)}
                                            required={!smartMode}
                                        />
                                    )}

                                    {currentSubLocationOptions.length > 0 && location !== 'Other' && (
                                        <select
                                            className={inputClass}
                                            value={subLocation}
                                            onChange={(e) => setSubLocation(e.target.value)}
                                            required={!smartMode}
                                        >
                                            <option value="">Select sub-location</option>
                                            {currentSubLocationOptions.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ===== SECTION 4: Additional Info ===== */}
                        <div className="pt-2">
                            <div className="flex items-center gap-3 pb-2 mb-4 border-b border-gray-100">
                                <div className="w-6 h-6 rounded bg-[#F0A500] flex items-center justify-center text-xs font-bold text-[#1C2A59]">{form.category && form.category !== 'Other' ? '4' : '3'}</div>
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Additional Information</span>
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className={labelClass}>Actual Photo {smartMode && <span className="text-red-500">*</span>}</label>
                                <div className="bg-[#F4F5F7] p-4 rounded border border-gray-200">
                                    <ImageUpload
                                        value={form.imageUrl}
                                        onChange={(url) => {
                                            setForm(f => ({ ...f, imageUrl: url }))
                                            setOriginalImageUrl('')
                                            setEditedImageUrl('')
                                            setIsImageEdited(false)
                                            analyzeImage(url)
                                        }}
                                    />
                                </div>
                                {form.imageUrl && (
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <button
                                            type="button"
                                            onClick={handleEditImage}
                                            disabled={editingImage}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded border border-[#F0A500] text-[#1C2A59] bg-[#fffbeb] text-xs font-bold hover:bg-[#fef3c7] disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <Wand2 size={14} /> {editingImage ? 'Editing...' : 'Edit Image'}
                                        </button>

                                        {isImageEdited && (
                                            <button
                                                type="button"
                                                onClick={handleRevertImage}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-300 text-[#1C2A59] bg-white text-xs font-bold hover:bg-gray-50"
                                            >
                                                <RotateCcw size={14} /> Revert
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {aiSuggestion && (
                                <div className="mt-5 p-4 rounded border border-[#fde68a] bg-[#fffbeb]">
                                    <p className="text-xs font-black uppercase tracking-wider text-[#92400e] mb-1">AI Suggestions</p>
                                    <p className="text-sm text-[#1C2A59] font-semibold">{aiSuggestion.description}</p>
                                    <p className="text-xs text-[#92400e] mt-2">Labels: {(aiSuggestion.labels || aiSuggestion.aiLabels || []).slice(0, 8).join(', ') || 'N/A'}</p>
                                    <p className="text-xs text-[#92400e] mt-1">Brand: {aiSuggestion.brand || 'N/A'} | Confidence: {aiSuggestion.confidence ?? aiSuggestion.aiConfidence ?? 'N/A'}%</p>
                                </div>
                            )}

                            {/* Contact Preference */}
                            <div className="mt-5">
                                <label className={labelClass}>Contact Preference</label>
                                <select className={inputClass} value={form.contactPreference} onChange={change('contactPreference')}>
                                    <option value="platform">Platform Messaging</option>
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                </select>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-4 rounded border flex items-center gap-3 bg-red-50 border-red-200 text-red-600 text-sm font-semibold">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded text-sm font-extrabold uppercase tracking-wide transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#F0A500', color: '#1C2A59' }}>
                            <Send size={18} />
                            {loading ? 'Submitting Report...' : 'Submit Lost Item Report'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
