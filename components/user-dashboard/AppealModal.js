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
        PENDING: { bg: '#FEF3C7', color: '#D97706', label: 'Pending Review' },
        APPROVED: { bg: '#DCFCE7', color: '#16A34A', label: 'Approved' },
        REJECTED: { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' },
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl overflow-hidden animate-slide-up bg-white shadow-xl border border-gray-200">

                {/* Header */}
                <div className="p-5 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <FileText size={18} className="text-[#F0A500]" />
                        <h2 className="text-[#1C2A59] font-extrabold text-sm">Submit Account Appeal</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                        <X size={16} />
                    </button>
                </div>

                {/* If existing appeal exists, show its status */}
                {existingAppeal ? (
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-transparent"
                                style={{
                                    ...STATUS_PILL[existingAppeal.status] && {
                                        background: STATUS_PILL[existingAppeal.status].bg,
                                        color: STATUS_PILL[existingAppeal.status].color,
                                    }
                                }}>
                                {STATUS_PILL[existingAppeal.status]?.label || existingAppeal.status}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold">
                                Submitted {new Date(existingAppeal.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#F4F5F7] border border-gray-200">
                            <p className="text-xs text-[#3E4A56] leading-relaxed font-medium">{existingAppeal.appealMessage}</p>
                        </div>
                        {existingAppeal.adminResponse && (
                            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                                <p className="text-[10px] font-extrabold text-indigo-600 uppercase mb-1 tracking-wider">Admin Response</p>
                                <p className="text-xs text-[#3E4A56] font-medium">{existingAppeal.adminResponse}</p>
                            </div>
                        )}
                    </div>
                ) : success ? (
                    <div className="p-8 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-green-50 border border-green-200">
                            <CheckCircle2 size={32} className="text-green-500" />
                        </div>
                        <h3 className="text-[#1C2A59] font-extrabold text-lg">Appeal Submitted!</h3>
                        <p className="text-sm text-gray-500 font-medium">Admin will review your appeal. Check back later.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-[#1C2A59] uppercase font-bold tracking-wider">Reason for Appeal <span className="text-red-500">*</span></label>
                            <textarea className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-[#1C2A59] focus:outline-none focus:ring-2 focus:ring-[#008489]/50 focus:border-[#008489] transition-all min-h-[100px] resize-y"
                                placeholder="Explain why you believe your restriction should be lifted..."
                                value={form.appealMessage} onChange={change('appealMessage')} required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-[#1C2A59] uppercase font-bold tracking-wider">Supporting Explanation</label>
                            <textarea className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-[#1C2A59] focus:outline-none focus:ring-2 focus:ring-[#008489]/50 focus:border-[#008489] transition-all min-h-[70px] resize-y"
                                placeholder="Any additional context or clarification..."
                                value={form.supportingExplanation} onChange={change('supportingExplanation')} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-[#1C2A59] uppercase font-bold tracking-wider">Evidence (URL)</label>
                            <input className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-[#1C2A59] focus:outline-none focus:ring-2 focus:ring-[#008489]/50 focus:border-[#008489] transition-all"
                                placeholder="Link to supporting evidence (receipt, screenshot, etc.)"
                                value={form.evidenceUrl} onChange={change('evidenceUrl')} />
                        </div>

                        {/* Policy checkbox */}
                        <label className="flex items-start gap-2.5 cursor-pointer group">
                            <input type="checkbox" checked={form.acknowledgedPolicy} onChange={change('acknowledgedPolicy')}
                                className="mt-0.5 accent-[#008489]" />
                            <span className="text-[10px] text-gray-500 font-medium leading-relaxed group-hover:text-gray-700 transition-colors">
                                I acknowledge that I have read and agree to the platform usage policy, and understand that further violations may result in permanent restriction.
                            </span>
                        </label>

                        {error && (
                            <div className="p-2.5 rounded-lg text-xs text-red-600 bg-red-50 border border-red-200 flex items-center gap-2">
                                <AlertTriangle size={12} /> {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose}
                                className="flex-1 justify-center py-2.5 text-xs font-bold text-[#3E4A56] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                            <button type="submit" disabled={loading}
                                className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] bg-[#1C2A59] hover:bg-[#1a254d] shadow-sm disabled:opacity-50"
                            >
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
