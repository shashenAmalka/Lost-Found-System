'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2, MessageCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const EDIT_WINDOW_MS = 60 * 1000

export default function ChatWindow({
    claimId,
    contactId,
    isAdmin,
    recipientName,
    messageType = 'chat',
    disabled = false,
    disabledMessage = 'Chat is currently unavailable.',
}) {
    const { user } = useAuth()
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const [editingMessageId, setEditingMessageId] = useState('')
    const [editingValue, setEditingValue] = useState('')
    const [editingSaving, setEditingSaving] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchMessages = useCallback(async (silent = false) => {
        if (!claimId && !contactId) return
        if (!silent) setLoading(true)
        try {
            const query = claimId ? `claimId=${claimId}` : `contactId=${contactId}`
            const res = await fetch(`/api/messages?${query}`, {
                credentials: 'include',
            })
            const data = await res.json()
            if (res.ok) {
                setMessages(data.messages || [])
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err)
        } finally {
            if (!silent) setLoading(false)
        }
    }, [claimId, contactId])

    useEffect(() => {
        fetchMessages(false)
        // Poll for new messages every 2 seconds for a smoother chat feel.
        const interval = setInterval(() => fetchMessages(true), 2000)
        return () => clearInterval(interval)
    }, [fetchMessages])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (disabled || !newMessage.trim() || sending) return

        setSending(true)
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(claimId && { claimId }),
                    ...(contactId && { contactId }),
                    ...(claimId && { messageType }),
                    message: newMessage,
                }),
                credentials: 'include',
            })
            const data = await res.json()
            if (res.ok) {
                setMessages(prev => [...prev, data.message])
                setNewMessage('')
                scrollToBottom()
            } else {
                alert(data.error || 'Failed to send message')
            }
        } catch (err) {
            console.error('Failed to send message:', err)
            alert('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    const getSenderId = (senderId) => {
        if (!senderId) return ''
        if (typeof senderId === 'string') return senderId
        return senderId._id?.toString?.() || senderId.toString?.() || ''
    }

    const canEditMessage = (msg, isCurrentUserMessage) => {
        if (!isCurrentUserMessage) return false
        if (!msg?.createdAt) return false
        const createdAtMs = new Date(msg.createdAt).getTime()
        if (!Number.isFinite(createdAtMs)) return false
        return Date.now() - createdAtMs <= EDIT_WINDOW_MS
    }

    const startEdit = (msg) => {
        setEditingMessageId(msg._id)
        setEditingValue(msg.message || '')
    }

    const cancelEdit = () => {
        setEditingMessageId('')
        setEditingValue('')
    }

    const saveEdit = async () => {
        if (!editingMessageId || !editingValue.trim() || editingSaving) return

        setEditingSaving(true)
        try {
            const res = await fetch('/api/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    messageId: editingMessageId,
                    message: editingValue,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                alert(data.error || 'Failed to edit message')
                return
            }

            setMessages((prev) => prev.map((m) => (m._id === editingMessageId ? data.message : m)))
            cancelEdit()
        } catch (err) {
            console.error('Failed to edit message:', err)
            alert('Failed to edit message')
        } finally {
            setEditingSaving(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[28rem] max-h-[28rem] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2 bg-white">
                <MessageCircle size={18} className="text-[#F0A500]" />
                <h3 className="text-sm font-bold text-[#1C2A59]">
                    {isAdmin ? 'Contact User' : 'Chat with Admin'}
                </h3>
                <span className="text-[10px] text-gray-500 ml-auto font-semibold">
                    {recipientName && `• ${recipientName}`}
                </span>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#f5f7fb]">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin text-gray-300" size={24} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                        <div>
                            <MessageCircle size={32} className="text-gray-200 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">No messages yet</p>
                            <p className="text-[10px] text-gray-300 mt-1">
                                {isAdmin ? 'Send a message to the user' : 'Send a message to admin'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => {
                            const senderId = getSenderId(msg.senderId)
                            const currentUserId = user?._id?.toString?.() || ''
                            const isCurrentUserById = senderId && currentUserId && senderId === currentUserId
                            const isCurrentUserByRole = msg.senderRole
                                ? (isAdmin ? msg.senderRole === 'admin' : msg.senderRole === 'user')
                                : false
                            const isCurrentUserMessage = isCurrentUserById || isCurrentUserByRole
                            const isEditingThis = editingMessageId === msg._id
                            const canEdit = canEditMessage(msg, isCurrentUserMessage)

                            return (
                                <div
                                    key={msg._id || idx}
                                    className={`flex ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            isCurrentUserMessage
                                                ? 'bg-[#F0A500] text-white rounded-br-md'
                                                : 'bg-white border border-gray-200 text-[#1C2A59] rounded-bl-md'
                                        }`}
                                    >
                                        <p className="font-medium text-[10px] mb-1">
                                            {msg.senderName || 'Unknown'}
                                        </p>
                                        {isEditingThis ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    value={editingValue}
                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                    className={`w-full text-sm rounded border px-2 py-1 resize-none min-h-16 ${
                                                        isCurrentUserMessage
                                                            ? 'bg-white/10 border-white/30 text-white placeholder:text-white/70'
                                                            : 'bg-white border-gray-300 text-[#1C2A59]'
                                                    }`}
                                                    disabled={editingSaving}
                                                />
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={cancelEdit}
                                                        disabled={editingSaving}
                                                        className={`text-[10px] font-bold px-2 py-1 rounded ${
                                                            isCurrentUserMessage
                                                                ? 'bg-white/15 text-white'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={saveEdit}
                                                        disabled={editingSaving || !editingValue.trim()}
                                                        className={`text-[10px] font-bold px-2 py-1 rounded ${
                                                            isCurrentUserMessage
                                                                ? 'bg-white text-[#1C2A59]'
                                                                : 'bg-[#1C2A59] text-white'
                                                        } disabled:opacity-50`}
                                                    >
                                                        {editingSaving ? 'Saving...' : 'Save'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p>{msg.message}</p>
                                        )}
                                        <p className={`text-[9px] mt-1 ${
                                            isCurrentUserMessage
                                                ? 'text-white/70'
                                                : 'text-gray-400'
                                        }`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                            {msg.edited ? ' · edited' : ''}
                                        </p>
                                        {!isEditingThis && canEdit && (
                                            <div className="mt-1 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(msg)}
                                                    className={`text-[10px] font-bold underline ${
                                                        isCurrentUserMessage ? 'text-white/85' : 'text-[#1C2A59]'
                                                    }`}
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="px-4 py-3 border-t border-gray-100 bg-white">
                {disabled && (
                    <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
                        {disabledMessage}
                    </p>
                )}
                <div className="flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500]/20 transition-colors"
                    disabled={disabled || sending}
                />
                <button
                    type="submit"
                    disabled={disabled || sending || !newMessage.trim()}
                    className="px-4 py-2 bg-[#F0A500] text-white rounded font-bold text-sm hover:bg-[#d69300] disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                    {sending ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Send size={14} />
                    )}
                </button>
                </div>
            </form>
        </div>
    )
}
