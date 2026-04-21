'use client'
import { useEffect, useState } from 'react'
import { X, Send, Loader2, CheckCircle2, AlertTriangle, Trash2, Lock } from 'lucide-react'

const EMPTY_FORM = {
    appealMessage: '',
    supportingExplanation: '',
    evidenceUrl: '',
    acknowledgedPolicy: false,
}

export default function WarningAppealModal({ warning, existingAppeal, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)

    useEffect(() => {
        if (existingAppeal) {
            setForm({
                appealMessage: existingAppeal.appealMessage || '',
                supportingExplanation: existingAppeal.supportingExplanation || '',
                evidenceUrl: existingAppeal.evidenceUrl || '',
                acknowledgedPolicy: !!existingAppeal.acknowledgedPolicy,
            })
        } else {
            setForm(EMPTY_FORM)
        }
        setError('')
        setSuccess(false)
    }, [existingAppeal, warning?._id])

    const isLocked = !!existingAppeal && (existingAppeal.status !== 'PENDING' || existingAppeal.openedAt)
    const isEditing = !!existingAppeal && !isLocked

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
            const res = await fetch(isEditing ? `/api/appeals/${existingAppeal._id}` : '/api/appeals/warning', {
                method: isEditing ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEditing ? {
                    appealMessage: form.appealMessage.trim(),
                    supportingExplanation: form.supportingExplanation.trim(),
                    evidenceUrl: form.evidenceUrl || '',
                    acknowledgedPolicy: form.acknowledgedPolicy,
                } : {
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
                onClose?.()
            }, 1200)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!existingAppeal || isLocked) return
        if (typeof window !== 'undefined' && !window.confirm('Delete this appeal? This cannot be undone.')) return

        setDeleting(true)
        setError('')
        try {
            const res = await fetch(`/api/appeals/${existingAppeal._id}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to delete appeal')
            onSuccess?.()
            onClose?.()
        } catch (err) {
            setError(err.message)
        } finally {
            setDeleting(false)
        }
    }

    const SEVERITY_COLOR = {
        LOW: { bg: '#dcfce7', color: '#16a34a', label: 'Low' },
        MEDIUM: { bg: '#fef3c7', color: '#b45309', label: 'Medium' },
        HIGH: { bg: '#fee2e2', color: '#dc2626', label: 'High' },
    }

    const severityStyle = SEVERITY_COLOR[warning?.severity] || SEVERITY_COLOR.MEDIUM

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl overflow-hidden animate-slide-up bg-white shadow-xl border border-gray-200">
                <div className="p-5 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={18} style={{ color: severityStyle.color }} />
                        <h2 className="text-[#1C2A59] font-extrabold text-sm">
                            {isEditing ? 'Edit Warning Appeal' : 'Request Warning Removal'}
                        </h2>
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
                        <h3 className="text-[#1C2A59] font-extrabold text-lg">
                            {isEditing ? 'Appeal Updated!' : 'Appeal Submitted!'}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Your warning appeal has been sent to admin review.
                        </p>
                    </div>
                ) : isLocked ? (
                    <div className="p-6 space-y-4">
                        <div className="p-4 rounded-xl border bg-gray-50 border-gray-200">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
                                    <Lock size={18} className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                                        Locked by Admin Review
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        This appeal has already been opened by admin. It can no longer be updated or deleted.
                                    </p>
                                </div>
                            </div>
                        </div>

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
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#F4F5F7] border border-gray-200">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Your Appeal</p>
                            <p className="text-sm text-[#1C2A59] font-medium whitespace-pre-wrap">{existingAppeal?.appealMessage}</p>
                            {existingAppeal?.supportingExplanation && (
                                <p className="text-xs text-gray-600 mt-3 whitespace-pre-wrap">{existingAppeal.supportingExplanation}</p>
                            )}
                            {existingAppeal?.adminResponse && (
                                <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                                    <p className="text-[10px] font-extrabold text-indigo-600 uppercase mb-1 tracking-wider">Admin Response</p>
                                    <p className="text-xs text-[#3E4A56] font-medium">{existingAppeal.adminResponse}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting || loading}
                                    className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    Delete
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading || deleting}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F0A500] text-white font-bold text-sm hover:shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Send size={14} />
                                        {isEditing ? 'Save Changes' : 'Submit Appeal'}
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
