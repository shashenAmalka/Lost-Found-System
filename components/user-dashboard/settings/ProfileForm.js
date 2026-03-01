'use client';
import { useState } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfileForm({ user }) {
    const { fetchMe } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        department: user?.department || '',
        studentId: user?.studentId || '',
        phone: user?.phone || '',
    });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

    const change = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setToast(null);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update profile');
            showToast('success', 'Profile updated successfully!');
            await fetchMe(); // Refresh auth context with new data
        } catch (err) {
            showToast('error', err.message);
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all duration-300 focus:ring-2";

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Toast Notification */}
            {toast && (
                <div className={`flex items-center gap-3 p-4 rounded-xl text-sm animate-slide-up ${toast.type === 'success' ? 'text-green-300' : 'text-red-300'}`}
                    style={{
                        background: toast.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${toast.type === 'success' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    }}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toast.message}
                </div>
            )}

            {/* Personal Information */}
            <fieldset className="p-6 rounded-[20px] space-y-5"
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                <legend className="text-xs font-bold uppercase tracking-[0.2em] px-2" style={{ color: 'rgba(245, 246, 250, 0.5)' }}>
                    Personal Information
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-xs text-white/60 uppercase tracking-wide font-medium">Full Name *</label>
                        <input
                            className={inputClass}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', focusRing: '#F06414' }}
                            placeholder="John Doe"
                            value={form.name}
                            onChange={change('name')}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-white/60 uppercase tracking-wide font-medium">Email *</label>
                        <input
                            type="email"
                            className={inputClass}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                            placeholder="you@uni.edu"
                            value={form.email}
                            onChange={change('email')}
                            required
                        />
                    </div>
                </div>
            </fieldset>

            {/* Academic Information */}
            <fieldset className="p-6 rounded-[20px] space-y-5"
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                <legend className="text-xs font-bold uppercase tracking-[0.2em] px-2" style={{ color: 'rgba(245, 246, 250, 0.5)' }}>
                    Academic Information
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-xs text-white/60 uppercase tracking-wide font-medium">Department</label>
                        <input
                            className={inputClass}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                            placeholder="e.g. Computer Science"
                            value={form.department}
                            onChange={change('department')}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-white/60 uppercase tracking-wide font-medium">Student / Staff ID</label>
                        <input
                            className={inputClass}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                            placeholder="e.g. 2021IT0123"
                            value={form.studentId}
                            onChange={change('studentId')}
                        />
                    </div>
                </div>
            </fieldset>

            {/* Contact Information */}
            <fieldset className="p-6 rounded-[20px] space-y-5"
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                <legend className="text-xs font-bold uppercase tracking-[0.2em] px-2" style={{ color: 'rgba(245, 246, 250, 0.5)' }}>
                    Contact Information
                </legend>
                <div className="max-w-md space-y-2">
                    <label className="text-xs text-white/60 uppercase tracking-wide font-medium">Phone Number</label>
                    <input
                        className={inputClass}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                        placeholder="+94 7X XXX XXXX"
                        value={form.phone}
                        onChange={change('phone')}
                    />
                </div>
            </fieldset>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    style={{
                        background: 'linear-gradient(135deg, #F06414 0%, #D4AF37 100%)',
                        boxShadow: '0 8px 20px rgba(240, 100, 20, 0.35)',
                    }}>
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}
