'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, ShieldCheck, Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function ValuableItemPublicPage() {
    const { qrCode } = useParams()
    const [loading, setLoading] = useState(true)
    const [item, setItem] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!qrCode) return

        const load = async () => {
            try {
                setLoading(true)
                const res = await fetch(`/api/valuable-items/public/${qrCode}`)
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Item not found')
                setItem(data.item)
            } catch (err) {
                setError(err.message || 'Item not found')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [qrCode])

    const contactHref = useMemo(() => {
        if (!item?.ownerEmail) return '#'
        const subject = encodeURIComponent(`Found your item: ${item.name}`)
        const body = encodeURIComponent(
            `Hi ${item.ownerName || 'Owner'}, I found an item that matches this QR label (${item.qrCode}). Please let me know how we can return it safely.`
        )
        return `mailto:${item.ownerEmail}?subject=${subject}&body=${body}`
    }, [item])

    return (
        <div className="min-h-screen bg-[#F4F5F7]">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
                    {loading ? (
                        <div className="py-14 flex flex-col items-center justify-center gap-3">
                            <Loader2 size={30} className="animate-spin text-gray-400" />
                            <p className="text-sm text-gray-500 font-medium">Loading item details...</p>
                        </div>
                    ) : error ? (
                        <div className="py-10 text-center">
                            <h1 className="text-xl font-extrabold text-[#1C2A59] mb-2">Item Not Found</h1>
                            <p className="text-sm text-gray-500">{error}</p>
                        </div>
                    ) : (
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <ShieldCheck size={12} /> QR Verified Item
                            </div>

                            <h1 className="text-2xl font-extrabold text-[#1C2A59] mb-2">{item.name}</h1>
                            <p className="text-xs text-gray-500 mb-5">Item Code: {item.qrCode}</p>

                            {item.imageUrl && (
                                <div className="mb-5 rounded-xl overflow-hidden border border-gray-200 bg-[#F8FAFC]">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-64 object-contain" />
                                </div>
                            )}

                            <div className="space-y-3 text-sm">
                                {item.description && (
                                    <div>
                                        <p className="font-bold text-[#1C2A59]">Description</p>
                                        <p className="text-gray-600 mt-0.5">{item.description}</p>
                                    </div>
                                )}
                                {item.category && (
                                    <div>
                                        <p className="font-bold text-[#1C2A59]">Category</p>
                                        <p className="text-gray-600 mt-0.5">{item.category}</p>
                                    </div>
                                )}
                                {item.uniqueIdentifier && (
                                    <div>
                                        <p className="font-bold text-[#1C2A59]">Unique Identifier</p>
                                        <p className="text-gray-600 mt-0.5">{item.uniqueIdentifier}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-5 border-t border-gray-200">
                                <p className="text-sm text-gray-600 mb-3">
                                    If you found this item, contact the owner to return it safely.
                                </p>
                                <a
                                    href={contactHref}
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wide"
                                    style={{ backgroundColor: '#1C2A59', color: '#fff' }}
                                >
                                    <Mail size={16} /> Contact Owner
                                </a>
                                <p className="text-xs text-gray-400 mt-3">
                                    This opens your email app to contact the owner directly.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center mt-4">
                    <Link href="/" className="text-sm font-bold text-[#1C2A59] hover:text-[#F0A500]">Go to Smart Campus Lost & Found</Link>
                </div>
            </div>
        </div>
    )
}