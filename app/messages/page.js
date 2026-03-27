'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Loader2, PlusCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import ChatWindow from '@/components/ChatWindow'

export default function UserMessagesPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [claims, setClaims] = useState([])
    const [contacts, setContacts] = useState([])
    const [selectedType, setSelectedType] = useState('')
    const [selectedId, setSelectedId] = useState('')
    const [loading, setLoading] = useState(true)
    const [creatingRequest, setCreatingRequest] = useState(false)
    const [subject, setSubject] = useState('')
    const [initialMessage, setInitialMessage] = useState('')

    const fetchData = async () => {
        try {
            setLoading(true)
            const [claimsRes, contactsRes] = await Promise.all([
                fetch('/api/claims', { credentials: 'include' }),
                fetch('/api/admin-contacts', { credentials: 'include' }),
            ])

            const claimsData = await claimsRes.json()
            const contactsData = await contactsRes.json()

            const approvedClaims = claimsRes.ok
                ? (claimsData.claims || []).filter((c) => c.status === 'approved')
                : []
            const supportContacts = contactsRes.ok ? (contactsData.contacts || []) : []

            setClaims(approvedClaims)
            setContacts(supportContacts)

            if (!selectedId) {
                if (approvedClaims.length > 0) {
                    setSelectedType('claim')
                    setSelectedId(approvedClaims[0]._id)
                } else if (supportContacts.length > 0) {
                    setSelectedType('contact')
                    setSelectedId(supportContacts[0]._id)
                }
            }
        } catch (err) {
            console.error('Failed to load messages data:', err)
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

        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user, router])

    const handleCreateRequest = async (e) => {
        e.preventDefault()
        if (!subject.trim() || !initialMessage.trim() || creatingRequest) return

        setCreatingRequest(true)
        try {
            const res = await fetch('/api/admin-contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    subject: subject.trim(),
                    initialMessage: initialMessage.trim(),
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                alert(data.error || 'Failed to create support request')
                return
            }

            setSubject('')
            setInitialMessage('')
            await fetchData()

            if (data.contact?._id) {
                setSelectedType('contact')
                setSelectedId(data.contact._id)
            }
        } catch (err) {
            console.error('Failed to create support request:', err)
            alert('Failed to create support request')
        } finally {
            setCreatingRequest(false)
        }
    }

    const selectedClaim = useMemo(
        () => claims.find((c) => c._id === selectedId) || null,
        [claims, selectedId]
    )

    const selectedContact = useMemo(
        () => contacts.find((c) => c._id === selectedId) || null,
        [contacts, selectedId]
    )

    const isAcceptedContact = selectedContact?.status === 'in_progress'
    const contactDisabledMessage = selectedContact?.status === 'open'
        ? 'Your request is pending admin acceptance. You can chat once accepted.'
        : 'This support chat was stopped by admin.'

    if (authLoading) return <div className="min-h-screen bg-[#F4F5F7]" />
    if (!user) return null

    return (
        <div className="min-h-screen bg-[#F4F5F7]">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 pt-24 pb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                        <MessageCircle size={18} className="text-[#F0A500]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#1C2A59]">Messages</h1>
                        <p className="text-sm text-gray-500">Approved claim chats and support requests</p>
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 rounded-2xl bg-white border border-gray-200 flex items-center justify-center">
                        <Loader2 className="animate-spin text-gray-300" size={28} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Conversations</p>
                            </div>
                            <div className="max-h-[28rem] overflow-y-auto">
                                {claims.length > 0 && (
                                    <>
                                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Approved Claims</p>
                                        </div>
                                        {claims.map((claim) => {
                                            const active = selectedType === 'claim' && claim._id === selectedId
                                            return (
                                                <button
                                                    key={claim._id}
                                                    onClick={() => { setSelectedType('claim'); setSelectedId(claim._id) }}
                                                    className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                                                        active ? 'bg-amber-50' : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <p className="text-sm font-bold text-[#1C2A59]">
                                                        {claim.foundItemId?.title || 'Approved Claim'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Claim #{claim._id?.toString().slice(-6).toUpperCase()}
                                                    </p>
                                                </button>
                                            )
                                        })}
                                    </>
                                )}

                                <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Support Requests</p>
                                </div>
                                {contacts.map((contact) => {
                                    const active = selectedType === 'contact' && contact._id === selectedId
                                    return (
                                        <button
                                            key={contact._id}
                                            onClick={() => { setSelectedType('contact'); setSelectedId(contact._id) }}
                                            className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                                                active ? 'bg-amber-50' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-bold text-[#1C2A59] truncate">{contact.subject}</p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                    contact.status === 'in_progress'
                                                        ? 'bg-green-100 text-green-700'
                                                        : contact.status === 'open'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                    {contact.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Request #{contact._id?.toString().slice(-6).toUpperCase()}</p>
                                        </button>
                                    )
                                })}
                                {contacts.length === 0 && (
                                    <div className="px-4 py-4 text-xs text-gray-500">No support requests yet.</div>
                                )}
                            </div>
                        </div>

                        <div>
                            {selectedType === 'claim' && selectedClaim && (
                                <ChatWindow
                                    claimId={selectedClaim._id}
                                    isAdmin={false}
                                    recipientName="Support Team"
                                />
                            )}

                            {selectedType === 'contact' && selectedContact && (
                                <ChatWindow
                                    contactId={selectedContact._id}
                                    isAdmin={false}
                                    recipientName={selectedContact.assignedTo?.name || 'Support Team'}
                                    disabled={!isAcceptedContact}
                                    disabledMessage={contactDisabledMessage}
                                />
                            )}

                            {!selectedId && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <PlusCircle size={18} className="text-[#F0A500]" />
                                        <h2 className="font-bold text-[#1C2A59]">Request Admin Contact</h2>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">
                                        You have no approved claims yet. Send a support request and wait for admin acceptance.
                                    </p>
                                    <form onSubmit={handleCreateRequest} className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Subject"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F0A500]"
                                        />
                                        <textarea
                                            placeholder="Describe why you need admin contact"
                                            value={initialMessage}
                                            onChange={(e) => setInitialMessage(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-24 outline-none focus:border-[#F0A500]"
                                        />
                                        <button
                                            type="submit"
                                            disabled={creatingRequest || !subject.trim() || !initialMessage.trim()}
                                            className="px-4 py-2 bg-[#1C2A59] text-white rounded-lg text-sm font-bold disabled:opacity-50"
                                        >
                                            {creatingRequest ? 'Sending...' : 'Send Request'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
