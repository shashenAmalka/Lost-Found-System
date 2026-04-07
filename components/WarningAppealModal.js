'use client'
import { useState } from 'react'
import { X, Send, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function WarningAppealModal({ warning, onClose, onSuccess }) {
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
        if (!form.appealMessage.trim()) {
            setError('Please provide a reason for your appeal.')
            return
        }
        if (!form.acknowledgedPolicy) {
            setError('You must acknowledge that you have read the platform usage policy.')
            return
        }
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/appeals/warning', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    warningId: warning._id,
                    appealMessage: form.appealMessage.trim(),
                    supportingExplanation: form.supportingExplanation.trim(),
                    evidenceUrl: form.evidenceUrl || '',
                    acknowledgedPolicy: form.acknowledgedPolicy,
                }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to submit appeal')
            setSuccess(true)
            setTimeout(() => {
                onSuccess?.()
                onClose()
            }, 2000)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const SEVERITY_COLOR = {
        LOW: { bg: '#dcfce7', color: '#16a34a', label: 'Low' },
        MEDIUM: { bg: '#fef3c7', color: '#b45309', label: 'Medium' },
        HIGH: { bg: '#fee2e2', color: '#dc2626', label: 'High' },
    }

    const severityStyle = SEVERITY_COLOR[warning.severity] || SEVERITY_COLOR.MEDIUM

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl overflow-hidden animate-slide-up bg-white shadow-xl border border-gray-200">

                {/* Header */}
                <div className="p-5 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={18} style={{ color: severityStyle.color }} />
                        <h2 className="text-[#1C2A59] font-extrabold text-sm">Request Warning Removal</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                        <X size={16} />
                    </button>
                </div>

                {success ? (
                    <div className="p-8 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-green-50 border border-green-200">
                            <CheckCircle2 size={32} className="text-green-500" />
                        </div>
                        <h3 className="text-[#1C2A59] font-extrabold text-lg">Appeal Submitted!</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Your request to remove this warning has been submitted. The admin team will review your appeal and respond within 48 hours.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">

                        {/* Warning Info */}
                        <div className="p-4 rounded-xl border" style={{ background: severityStyle.bg + '20', borderColor: severityStyle.bg }}>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: severityStyle.bg }}>
                                    <AlertTriangle size={18} style={{ color: severityStyle.color }} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: severityStyle.color }}>
                                        {severityStyle.label} Severity Warning
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">{warning.reason}</p>
                                    {warning.shortAutoSummary && (
                                        <p className="text-xs text-gray-600 mt-2">{warning.shortAutoSummary}</p>
                                    )}
                                    <p className="text-[10px] text-gray-500 mt-2">
                                        Issued on {new Date(warning.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                                <p className="text-xs text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Appeal Message */}
                        <div>
                            <label className="block text-xs font-bold text-[#1C2A59] mb-2 uppercase tracking-wider">
                                Why should this warning be removed? *
                            </label>
                            <textarea
                                value={form.appealMessage}
                                onChange={change('appealMessage')}
                                placeholder="Explain your reasoning in detail..."
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#F0A500] focus:outline-none focus:ring-1 focus:ring-[#F0A500]/20 bg-white text-sm"
                                rows={4}
                            />
                        </div>

                        {/* Supporting Explanation */}
                        <div>
                            <label className="block text-xs font-bold text-[#1C2A59] mb-2 uppercase tracking-wider">
                                Additional explanation (optional)
                            </label>
                            <textarea
                                value={form.supportingExplanation}
                                onChange={change('supportingExplanation')}
                                placeholder="Provide any additional context..."
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#F0A500] focus:outline-none focus:ring-1 focus:ring-[#F0A500]/20 bg-white text-sm"
                                rows={3}
                            />
                        </div>

                        {/* Evidence URL */}
                        <div>
                            <label className="block text-xs font-bold text-[#1C2A59] mb-2 uppercase tracking-wider">
                                Evidence link (optional)
                            </label>
                            <input
                                type="url"
                                value={form.evidenceUrl}
                                onChange={change('evidenceUrl')}
                                placeholder="https://example.com/evidence"
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#F0A500] focus:outline-none focus:ring-1 focus:ring-[#F0A500]/20 bg-white text-sm"
                            />
                        </div>

                        {/* Policy Acknowledgement */}
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <input
                                type="checkbox"
                                id="policy"
                                checked={form.acknowledgedPolicy}
                                onChange={change('acknowledgedPolicy')}
                                className="w-4 h-4 mt-1 rounded cursor-pointer accent-[#F0A500]"
                            />
                            <label htmlFor="policy" className="text-xs text-gray-600 cursor-pointer flex-1">
                                I acknowledge that I have read and understand the <span className="font-bold text-[#1C2A59]">platform usage policy</span> and provide truthful information in this appeal.
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F0A500] text-white font-bold text-sm hover:shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={14} />
                                        Submit Appeal
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
