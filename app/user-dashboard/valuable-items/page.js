'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, QrCode, Download, ExternalLink, Copy, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import ImageUpload from '@/components/forms/ImageUpload'

const CATEGORIES = ['Electronics', 'Jewelry', 'Documents', 'Bags', 'Accessories', 'Other']

export default function ValuableItemsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [items, setItems] = useState([])
    const [qrDataUrl, setQrDataUrl] = useState('')
    const [createdItem, setCreatedItem] = useState(null)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: '',
        uniqueIdentifier: '',
        imageUrl: '',
    })

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/valuable-items', { credentials: 'include' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to load valuable items')
            setItems(data.items || [])
        } catch (err) {
            setError(err.message || 'Failed to load valuable items')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (authLoading) return
        if (!user) {
            router.push('/login')
            return
        }
        fetchItems()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user, router])

    const change = (key) => (event) => {
        const value = event.target.value
        setForm(prev => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            const res = await fetch('/api/valuable-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to register item')

            const item = data.item
            const qr = await QRCode.toDataURL(item.publicUrl, {
                width: 360,
                margin: 2,
                color: {
                    dark: '#1C2A59',
                    light: '#FFFFFF',
                },
            })

            setCreatedItem(item)
            setQrDataUrl(qr)
            setForm({
                name: '',
                description: '',
                category: '',
                uniqueIdentifier: '',
                imageUrl: '',
            })

            await fetchItems()
        } catch (err) {
            setError(err.message || 'Failed to register item')
        } finally {
            setSubmitting(false)
        }
    }

    const downloadQr = () => {
        if (!qrDataUrl || !createdItem) return
        const a = document.createElement('a')
        a.href = qrDataUrl
        a.download = `${createdItem.name.replace(/\s+/g, '_')}_qr.png`
        a.click()
    }

    const copyPublicUrl = async (url) => {
        try {
            await navigator.clipboard.writeText(url)
        } catch {
            setError('Unable to copy URL')
        }
    }

    if (authLoading) return <div className="min-h-screen bg-[#F4F5F7]" />
    if (!user) return null

    return (
        <div className="p-4 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <Shield size={18} className="text-[#F0A500]" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-[#1C2A59]">Register Valuable Item</h1>
                    <p className="text-sm text-gray-500">Generate a QR label so finders can contact you quickly.</p>
                </div>
            </div>

            {error && (
                <div className="mb-5 p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-5">
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <h2 className="text-sm font-black uppercase tracking-wider text-[#1C2A59] mb-4">Item Details</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Item Name *</label>
                            <input
                                value={form.name}
                                onChange={change('name')}
                                required
                                className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59]"
                                placeholder="e.g. MacBook Pro 13"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Category</label>
                                <select
                                    value={form.category}
                                    onChange={change('category')}
                                    className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59]"
                                >
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Unique ID</label>
                                <input
                                    value={form.uniqueIdentifier}
                                    onChange={change('uniqueIdentifier')}
                                    className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59]"
                                    placeholder="Serial / IMEI / Mark"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Description</label>
                            <textarea
                                value={form.description}
                                onChange={change('description')}
                                className="w-full px-4 py-2.5 min-h-[96px] resize-y bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59]"
                                placeholder="Add identifying details of your valuable item..."
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Item Photo (optional)</label>
                            <ImageUpload
                                value={form.imageUrl}
                                onChange={(url) => setForm(prev => ({ ...prev, imageUrl: url }))}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wide transition-colors disabled:opacity-50"
                            style={{ backgroundColor: '#1C2A59', color: '#fff' }}
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
                            {submitting ? 'Generating QR...' : 'Register & Generate QR'}
                        </button>
                    </form>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <h2 className="text-sm font-black uppercase tracking-wider text-[#1C2A59] mb-4">QR Output</h2>

                    {!createdItem || !qrDataUrl ? (
                        <div className="h-[420px] rounded-xl border border-dashed border-gray-300 bg-[#F8FAFC] flex items-center justify-center text-center px-6">
                            <p className="text-sm text-gray-500 font-medium">Submit the form to generate your item QR code and download it.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-xl border border-gray-200 bg-[#F8FAFC] p-4 text-center">
                                <img src={qrDataUrl} alt="Generated QR" className="mx-auto w-[250px] h-[250px]" />
                            </div>

                            <div>
                                <p className="text-sm font-bold text-[#1C2A59]">{createdItem.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">QR Code: {createdItem.qrCode}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={downloadQr}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-[#1C2A59] text-[#1C2A59] bg-white hover:bg-[#F4F5F7]"
                                >
                                    <Download size={14} /> Download QR
                                </button>
                                <Link
                                    href={createdItem.publicUrl}
                                    target="_blank"
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                >
                                    <ExternalLink size={14} /> Open Item Page
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5">
                <h2 className="text-sm font-black uppercase tracking-wider text-[#1C2A59] mb-4">My Registered Valuable Items</h2>

                {loading ? (
                    <div className="py-8 flex items-center justify-center">
                        <Loader2 size={20} className="animate-spin text-gray-400" />
                    </div>
                ) : items.length === 0 ? (
                    <p className="text-sm text-gray-500">No valuable items registered yet.</p>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item._id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <p className="font-bold text-[#1C2A59] text-sm">{item.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{item.qrCode} • {item.category || 'Uncategorized'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => copyPublicUrl(item.publicUrl)}
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 text-[#1C2A59] hover:bg-gray-50"
                                    >
                                        <Copy size={12} /> Copy Link
                                    </button>
                                    <Link
                                        href={item.publicUrl}
                                        target="_blank"
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 text-[#1C2A59] hover:bg-gray-50"
                                    >
                                        <ExternalLink size={12} /> View
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}