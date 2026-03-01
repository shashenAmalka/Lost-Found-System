'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import { ClipboardCheck, Send, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function VerificationFormsPage() {
    const { user, loading: authLoading } = useAuth()
    const [forms, setForms] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(null)
    const [answers, setAnswers] = useState({})
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if (!user) return
        fetch('/api/admin/verification-forms', { credentials: 'include' })
            .then(r => r.json())
            .then(d => setForms(d.forms || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [user])

    const handleSubmit = async (formId, questions) => {
        setSubmitting(formId)
        try {
            const formAnswers = questions.map((_, i) => answers[`${formId}_${i}`] || '')
            if (formAnswers.some(a => !a.trim())) {
                alert('Please answer all questions before submitting.')
                setSubmitting(null)
                return
            }
            const res = await fetch('/api/admin/verification-forms', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formId, answers: formAnswers, action: 'submit' }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setForms(prev => prev.map(f => f._id === formId ? { ...f, status: 'submitted' } : f))
            setSuccess('Verification form submitted successfully! Admin will review your answers.')
            setTimeout(() => setSuccess(''), 5000)
        } catch (err) {
            alert(err.message)
        } finally {
            setSubmitting(null)
        }
    }

    if (authLoading) return <div className="page-bg min-h-screen"><Navbar /></div>
    if (!user) return (
        <div className="page-bg min-h-screen"><Navbar />
            <div className="max-w-md mx-auto pt-32 px-4 text-center">
                <div className="glass-card p-12">
                    <div className="text-5xl mb-4">🔒</div>
                    <h2 className="text-white font-bold text-lg mb-2">Login Required</h2>
                    <Link href="/login" className="btn-glass-primary">Sign In</Link>
                </div>
            </div>
        </div>
    )

    return (
        <div className="page-bg min-h-screen">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/user-dashboard" className="btn-glass px-3 py-2"><ArrowLeft size={16} /></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <ClipboardCheck size={22} style={{ color: '#a855f7' }} />
                            Verification Forms
                        </h1>
                        <p className="text-white/50 text-sm mt-0.5">Admin requires you to verify your identity for your claim</p>
                    </div>
                </div>

                {success && (
                    <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold"
                        style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
                        <CheckCircle2 size={16} /> {success}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white/30" size={32} /></div>
                ) : forms.length === 0 ? (
                    <div className="glass-card p-16 text-center">
                        <ClipboardCheck size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-white font-bold text-lg">No Verification Forms</h3>
                        <p className="text-white/50 text-sm mt-2">You have no pending verification forms at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {forms.map(form => (
                            <div key={form._id} className="glass-card p-6 space-y-5">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-white font-bold">
                                            Verification for: {form.foundItemId?.title || 'Unknown Item'}
                                        </h3>
                                        <p className="text-white/40 text-xs mt-1">
                                            {form.foundItemId?.category} · {form.foundItemId?.locationFound}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${form.status === 'pending' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
                                            form.status === 'submitted' ? 'text-blue-400 bg-blue-400/10 border-blue-400/30' :
                                                'text-green-400 bg-green-400/10 border-green-400/30'
                                        }`}>
                                        {form.status}
                                    </span>
                                </div>

                                {/* Questions */}
                                {form.status === 'pending' ? (
                                    <div className="space-y-4">
                                        {form.questions.map((q, i) => (
                                            <div key={i} className="space-y-2">
                                                <label className="text-sm text-white/70 font-semibold flex items-start gap-2">
                                                    <span className="text-purple-400 font-bold shrink-0">Q{i + 1}.</span>
                                                    {q.question}
                                                </label>
                                                <textarea
                                                    className="glass-input min-h-[80px] resize-y text-sm"
                                                    placeholder="Type your answer here..."
                                                    value={answers[`${form._id}_${i}`] || ''}
                                                    onChange={e => setAnswers(prev => ({ ...prev, [`${form._id}_${i}`]: e.target.value }))}
                                                />
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => handleSubmit(form._id, form.questions)}
                                            disabled={submitting === form._id}
                                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                                            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', color: 'white', boxShadow: '0 6px 20px rgba(168,85,247,0.3)' }}>
                                            {submitting === form._id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                            {submitting === form._id ? 'Submitting...' : 'Submit Verification'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {form.questions.map((q, i) => (
                                            <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                <p className="text-xs text-purple-400 font-bold mb-1">Q{i + 1}. {q.question}</p>
                                                <p className="text-sm text-white/80">{q.answer || 'No answer provided'}</p>
                                            </div>
                                        ))}
                                        {form.status === 'submitted' && (
                                            <p className="text-xs text-blue-400 font-semibold text-center pt-2">
                                                ✓ Your answers have been submitted. Waiting for admin review.
                                            </p>
                                        )}
                                        {form.status === 'reviewed' && form.adminNotes && (
                                            <div className="p-4 rounded-xl border" style={{ background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.2)' }}>
                                                <p className="text-xs text-green-400 font-bold mb-1">Admin Notes:</p>
                                                <p className="text-sm text-white/80">{form.adminNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
