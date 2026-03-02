'use client'
import { useState } from 'react'
import { X, Send, Loader2, CheckCircle2, FileText, AlertTriangle } from 'lucide-react'

export default function AppealModal({ onClose, onSuccess, existingAppeal }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [form, setForm] = useState({
        appealMessage: '',
        supportingExplanation: '',
        evidenceUrl: '',
        acknowledgedPolicy: false,
    })

    const change = (k) => (e) => setForm(f => ({
        ...f,
        [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.acknowledgedPolicy) {
            setError('You must acknowledge the platform usage policy.')
            return
        }
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/appeals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to submit appeal')
            setSuccess(true)
            onSuccess?.()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const STATUS_PILL = {
        PENDING: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'Pending Review' },
        APPROVED: { bg: 'rgba(74,222,128,0.15)', color: '#4ade80', label: 'Approved' },
        REJECTED: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: 'Rejected' },
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-lg rounded-2xl overflow-hidden animate-slide-up"
                style={{ background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}>

                {/* Header */}
                <div className="p-5 flex items-center justify-between"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2">
                        <FileText size={18} className="text-yellow-400" />
                        <h2 className="text-white font-bold text-sm">Submit Account Appeal</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                        <X size={16} className="text-white/40" />
                    </button>
                </div>

                {/* If existing appeal exists, show its status */}
                {existingAppeal ? (
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
                                style={{
                                    ...STATUS_PILL[existingAppeal.status] && {
                                        background: STATUS_PILL[existingAppeal.status].bg,
                                        color: STATUS_PILL[existingAppeal.status].color,
                                    }
                                }}>
                                {STATUS_PILL[existingAppeal.status]?.label || existingAppeal.status}
                            </span>
                            <span className="text-[10px] text-white/30">
                                Submitted {new Date(existingAppeal.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <p className="text-xs text-white/60">{existingAppeal.appealMessage}</p>
                        </div>
                        {existingAppeal.adminResponse && (
                            <div className="p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                                <p className="text-[10px] font-bold text-indigo-300 uppercase mb-1">Admin Response</p>
                                <p className="text-xs text-white/60">{existingAppeal.adminResponse}</p>
                            </div>
                        )}
                    </div>
                ) : success ? (
                    <div className="p-8 text-center space-y-3">
                        <CheckCircle2 size={40} className="mx-auto" style={{ color: '#4ade80' }} />
                        <h3 className="text-white font-bold">Appeal Submitted!</h3>
                        <p className="text-xs text-white/50">Admin will review your appeal. Check back later.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-white/50 uppercase tracking-wider">Reason for Appeal *</label>
                            <textarea className="glass-input min-h-[100px] resize-y text-xs"
                                placeholder="Explain why you believe your restriction should be lifted..."
                                value={form.appealMessage} onChange={change('appealMessage')} required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-white/50 uppercase tracking-wider">Supporting Explanation</label>
                            <textarea className="glass-input min-h-[70px] resize-y text-xs"
                                placeholder="Any additional context or clarification..."
                                value={form.supportingExplanation} onChange={change('supportingExplanation')} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-white/50 uppercase tracking-wider">Evidence (URL)</label>
                            <input className="glass-input text-xs"
                                placeholder="Link to supporting evidence (receipt, screenshot, etc.)"
                                value={form.evidenceUrl} onChange={change('evidenceUrl')} />
                        </div>

                        {/* Policy checkbox */}
                        <label className="flex items-start gap-2.5 cursor-pointer group">
                            <input type="checkbox" checked={form.acknowledgedPolicy} onChange={change('acknowledgedPolicy')}
                                className="mt-0.5 accent-yellow-500" />
                            <span className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors">
                                I acknowledge that I have read and agree to the platform usage policy, and understand that further violations may result in permanent restriction.
                            </span>
                        </label>

                        {error && (
                            <div className="p-2.5 rounded-lg text-xs text-red-400 flex items-center gap-2"
                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                <AlertTriangle size={12} /> {error}
                            </div>
                        )}

                        <div className="flex gap-2 pt-1">
                            <button type="button" onClick={onClose}
                                className="btn-glass flex-1 justify-center py-2.5 text-xs">Cancel</button>
                            <button type="submit" disabled={loading}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
                                style={{
                                    background: 'linear-gradient(135deg, #D4AF37 0%, #b8941e 100%)',
                                    color: '#0a0a1a',
                                    opacity: loading ? 0.6 : 1,
                                }}>
                                {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                {loading ? 'Submitting...' : 'Submit Appeal'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
