'use client'
import { useState } from 'react'
import { X, Send, Loader2, AlertTriangle, Zap } from 'lucide-react'

const WARNING_TYPES = [
    'Fake claim attempt',
    'Mismatched serial number',
    'Spam submissions',
    'Inappropriate content',
    'Suspicious activity',
    'False information',
]

const AUTO_SUMMARIES = {
    'Fake claim attempt': 'Submitted a claim with fabricated or inconsistent ownership details.',
    'Mismatched serial number': 'Provided serial number does not match the item records.',
    'Spam submissions': 'Multiple low-quality or duplicate submissions detected.',
    'Inappropriate content': 'Posted content that violates platform community guidelines.',
    'Suspicious activity': 'Account flagged for unusual or suspicious behavior patterns.',
    'False information': 'Intentionally provided misleading information in reports.',
}

export default function IssueWarningModal({ user: targetUser, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        reason: '',
        severity: 'MEDIUM',
        adminNotes: '',
    })
    const [autoSummary, setAutoSummary] = useState('')

    const handleReasonChange = (e) => {
        const reason = e.target.value
        setForm(f => ({ ...f, reason }))
        setAutoSummary(AUTO_SUMMARIES[reason] || '')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/admin/warnings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: targetUser._id,
                    reason: form.reason,
                    severity: form.severity,
                    adminNotes: form.adminNotes || autoSummary,
                }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to issue warning')
            onSuccess?.(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden animate-slide-up"
                style={{ background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}>

                <div className="p-5 flex items-center justify-between"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                        <h2 className="text-white font-bold text-sm flex items-center gap-2">
                            <AlertTriangle size={16} className="text-yellow-400" /> Issue Warning
                        </h2>
                        <p className="text-[10px] text-white/40 mt-0.5">To: {targetUser?.name} ({targetUser?.campusId})</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X size={16} className="text-white/40" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Warning type */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-white/50 uppercase tracking-wider">Warning Type *</label>
                        <select className="glass-select text-xs" value={form.reason} onChange={handleReasonChange} required>
                            <option value="">Select warning type...</option>
                            {WARNING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Auto-generated summary */}
                    {autoSummary && (
                        <div className="p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                            <div className="flex items-center gap-1.5 mb-1">
                                <Zap size={10} className="text-indigo-400" />
                                <span className="text-[9px] font-bold text-indigo-400 uppercase">Auto-Generated Summary</span>
                            </div>
                            <p className="text-[11px] text-white/60">{autoSummary}</p>
                        </div>
                    )}

                    {/* Severity selector */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-white/50 uppercase tracking-wider">Severity</label>
                        <div className="flex gap-2">
                            {['LOW', 'MEDIUM', 'HIGH'].map(s => {
                                const colors = {
                                    LOW: { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', color: '#818cf8' },
                                    MEDIUM: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24' },
                                    HIGH: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', color: '#f87171' },
                                }
                                const active = form.severity === s
                                const c = colors[s]
                                return (
                                    <button key={s} type="button"
                                        onClick={() => setForm(f => ({ ...f, severity: s }))}
                                        className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all text-center"
                                        style={{
                                            background: active ? c.bg : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${active ? c.border : 'rgba(255,255,255,0.06)'}`,
                                            color: active ? c.color : 'rgba(255,255,255,0.3)',
                                        }}>
                                        {s}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Admin notes */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-white/50 uppercase tracking-wider">Admin Notes</label>
                        <textarea className="glass-input min-h-[60px] resize-y text-xs"
                            placeholder="Additional notes (optional)..."
                            value={form.adminNotes} onChange={e => setForm(f => ({ ...f, adminNotes: e.target.value }))} />
                    </div>

                    {error && (
                        <div className="p-2.5 rounded-lg text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.08)' }}>
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="btn-glass flex-1 justify-center py-2.5 text-xs">Cancel</button>
                        <button type="submit" disabled={loading}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                            style={{
                                background: 'linear-gradient(135deg, #D4AF37 0%, #b8941e 100%)',
                                color: '#0a0a1a', opacity: loading ? 0.6 : 1,
                            }}>
                            {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                            {loading ? 'Issuing...' : 'Issue Warning'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
