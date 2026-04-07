'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, MessageCircle, CheckCircle2, Ban } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import ChatWindow from '@/components/ChatWindow'

export default function AdminMessagesPage() {
    const { user } = useAuth()
    const [claims, setClaims] = useState([])
    const [contacts, setContacts] = useState([])
    const [selectedType, setSelectedType] = useState('')
    const [selectedId, setSelectedId] = useState('')
    const [loading, setLoading] = useState(true)
    const [updatingStatus, setUpdatingStatus] = useState(false)

    const fetchData = async () => {
        try {
            setLoading(true)
            const [claimsRes, contactsRes] = await Promise.all([
                fetch('/api/claims', { credentials: 'include' }),
                fetch('/api/admin-contacts', { credentials: 'include' }),
            ])
            const claimsData = await claimsRes.json()
            const contactsData = await contactsRes.json()

            const activeClaimChats = claimsRes.ok
                ? (claimsData.claims || []).filter((c) => !['rejected', 'withdrawn', 'completed'].includes(c.status))
                : []
            const supportContacts = contactsRes.ok ? (contactsData.contacts || []) : []

            setClaims(activeClaimChats)
            setContacts(supportContacts)

            if (!selectedId) {
                if (supportContacts.length > 0) {
                    setSelectedType('contact')
                    setSelectedId(supportContacts[0]._id)
                } else if (activeClaimChats.length > 0) {
                    setSelectedType('claim')
                    setSelectedId(activeClaimChats[0]._id)
                }
            }
        } catch (err) {
            console.error('Failed to load admin conversations:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleContactStatus = async (contactId, status) => {
        if (!contactId || updatingStatus) return
        setUpdatingStatus(true)
        try {
            const res = await fetch('/api/admin-contacts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    contactId,
                    status,
                    ...(status === 'in_progress' ? { assignedTo: user?._id } : {}),
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                alert(data.error || 'Failed to update status')
                return
            }

            setContacts((prev) => prev.map((c) => (c._id === contactId ? data.contact : c)))
        } catch (err) {
            console.error('Failed to update contact status:', err)
            alert('Failed to update contact status')
        } finally {
            setUpdatingStatus(false)
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
        ? 'Accept this request to start chat with the user.'
        : 'This support chat has been stopped.'

    return (
        <div className="min-h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <MessageCircle size={18} className="text-[#F0A500]" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-[#1C2A59]">Conversations</h1>
                    <p className="text-sm text-gray-500">Manage claim chats and support requests</p>
                </div>
            </div>

            {loading ? (
                <div className="h-64 rounded-2xl bg-white border border-gray-200 flex items-center justify-center">
                    <Loader2 className="animate-spin text-gray-300" size={28} />
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-5">
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Conversations</p>
                        </div>
                        <div className="max-h-[28rem] overflow-y-auto">
                            {contacts.length > 0 && (
                                <>
                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
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
                                                <p className="text-xs text-gray-500 mt-0.5">{contact.userName} ({contact.userEmail})</p>
                                            </button>
                                        )
                                    })}
                                </>
                            )}

                            {claims.length > 0 && (
                                <>
                                    <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Claim Chats</p>
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
                                                    {claim.claimantName || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {claim.foundItemId?.title || 'Claim'} · {String(claim.status || 'under_review').replace('_', ' ')}
                                                </p>
                                            </button>
                                        )
                                    })}
                                </>
                            )}

                            {contacts.length === 0 && claims.length === 0 && (
                                <div className="px-4 py-4 text-xs text-gray-500">No conversations yet.</div>
                            )}
                        </div>
                    </div>

                    <div>
                        {selectedType === 'contact' && selectedContact && (
                            <div className="mb-3 p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-2">
                                <div>
                                    <p className="text-sm font-bold text-[#1C2A59]">{selectedContact.subject}</p>
                                    <p className="text-xs text-gray-500">{selectedContact.userName} ({selectedContact.userEmail})</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedContact.status === 'open' && (
                                        <button
                                            onClick={() => handleContactStatus(selectedContact._id, 'in_progress')}
                                            disabled={updatingStatus}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                                        >
                                            <CheckCircle2 size={14} /> Accept
                                        </button>
                                    )}
                                    {selectedContact.status !== 'closed' && (
                                        <button
                                            onClick={() => handleContactStatus(selectedContact._id, 'closed')}
                                            disabled={updatingStatus}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                                        >
                                            <Ban size={14} /> Stop Chat
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedType === 'claim' && selectedClaim && (
                            <ChatWindow
                                claimId={selectedClaim._id}
                                isAdmin={true}
                                recipientName={selectedClaim.claimantName || 'User'}
                            />
                        )}

                        {selectedType === 'contact' && selectedContact && (
                            <ChatWindow
                                contactId={selectedContact._id}
                                isAdmin={true}
                                recipientName={selectedContact.userName || 'User'}
                                disabled={!isAcceptedContact}
                                disabledMessage={contactDisabledMessage}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
