'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2, MessageCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function ChatWindow({ claimId, isAdmin, recipientName }) {
    const { user } = useAuth()
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchMessages = useCallback(async () => {
        if (!claimId) return
        setLoading(true)
        try {
            const res = await fetch(`/api/messages?claimId=${claimId}`, {
                credentials: 'include',
            })
            const data = await res.json()
            if (res.ok) {
                setMessages(data.messages || [])
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err)
        } finally {
            setLoading(false)
        }
    }, [claimId])

    useEffect(() => {
        fetchMessages()
        // Poll for new messages every 3 seconds
        const interval = setInterval(fetchMessages, 3000)
        return () => clearInterval(interval)
    }, [fetchMessages])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || sending) return

        setSending(true)
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claimId, message: newMessage }),
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

    return (
        <div className="bg-white rounded border border-gray-200 shadow-sm flex flex-col h-96 max-h-96">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <MessageCircle size={18} className="text-[#F0A500]" />
                <h3 className="text-sm font-bold text-[#1C2A59]">
                    {isAdmin ? 'Contact User' : 'Chat with Admin'}
                </h3>
                <span className="text-[10px] text-gray-500 ml-auto">
                    {recipientName && `• ${recipientName}`}
                </span>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
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
                            const isCurrentUserMessage = msg.senderId._id === user?._id
                            return (
                                <div
                                    key={msg._id || idx}
                                    className={`flex ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs px-4 py-2 rounded-lg text-sm leading-relaxed ${
                                            isCurrentUserMessage
                                                ? 'bg-[#F0A500] text-white rounded-br-none'
                                                : 'bg-white border border-gray-200 text-[#1C2A59] rounded-bl-none'
                                        }`}
                                    >
                                        <p className="font-medium text-[10px] mb-1">
                                            {msg.senderName || 'Unknown'}
                                        </p>
                                        <p>{msg.message}</p>
                                        <p className={`text-[9px] mt-1 ${
                                            isCurrentUserMessage
                                                ? 'text-white/70'
                                                : 'text-gray-400'
                                        }`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <form
                onSubmit={handleSendMessage}
                className="px-6 py-4 border-t border-gray-100 flex gap-2"
            >
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500]/20 transition-colors"
                    disabled={sending}
                />
                <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2 bg-[#F0A500] text-white rounded font-bold text-sm hover:bg-[#d69300] disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                    {sending ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Send size={14} />
                    )}
                </button>
            </form>
        </div>
    )
}
