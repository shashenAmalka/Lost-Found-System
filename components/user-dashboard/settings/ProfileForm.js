'use client';
import { useState } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validatePhone, validateName, validateEmail, formatPhoneNumber, stripPhoneNumber } from '@/lib/validations';

export default function ProfileForm({ user }) {
    const { fetchMe } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        faculty: user?.faculty || user?.department || '', // Fallback to department for backward compat
        studentId: user?.studentId || '',
        phone: user?.phone || '',
    });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const change = (key) => (e) => {
        const value = e.target.value;
        setForm(f => ({ ...f, [key]: value }));
        
        if (fieldErrors[key]) {
            setFieldErrors(err => {
                const newErrors = { ...err };
                delete newErrors[key];
                return newErrors;
            });
        }

        // Real-time validation
        if (key === 'phone') {
            const validation = validatePhone(value);
            if (!validation.valid && value) {
                setFieldErrors(err => ({ ...err, phone: validation.error }));
            }
        } else if (key === 'name') {
            const validation = validateName(value);
            if (!validation.valid && value) {
                setFieldErrors(err => ({ ...err, name: validation.error }));
            }
        } else if (key === 'email') {
            const validation = validateEmail(value);
            if (!validation.valid && value) {
                setFieldErrors(err => ({ ...err, email: validation.error }));
            }
        }
    };

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate fields
        const errors = {};
        
        const nameValidation = validateName(form.name);
        if (!nameValidation.valid) errors.name = nameValidation.error;
        
        const emailValidation = validateEmail(form.email);
        if (!emailValidation.valid) errors.email = emailValidation.error;
        
        if (form.phone) {
            const phoneValidation = validatePhone(form.phone);
            if (!phoneValidation.valid) errors.phone = phoneValidation.error;
        }
        
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            showToast('error', 'Please fix the errors below');
            return;
        }

        setSaving(true);
        setToast(null);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    studentId: form.studentId.trim(),
                    phone: stripPhoneNumber(form.phone),
                    // Faculty is read-only, not sent to server
                }),
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update profile');
            showToast('success', 'Profile updated successfully!');
            await fetchMe();
        } catch (err) {
            showToast('error', err.message);
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 bg-[#F4F5F7] text-sm text-[#1C2A59] placeholder-gray-400 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-[#008489]/50 focus:border-[#008489]";
    const readOnlyClass = "w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-sm text-[#1C2A59] cursor-not-allowed";
    const errorInputClass = "w-full px-4 py-3 rounded-xl border border-red-300 bg-[#FFF5F5] text-sm text-[#1C2A59] outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Toast Notification */}
            {toast && (
                <div className={`flex items-center gap-3 p-4 rounded-xl text-sm animate-slide-up ${toast.type === 'success' ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-700 bg-red-50 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toast.message}
                </div>
            )}

            {/* Personal Information */}
            <fieldset className="p-6 rounded-[20px] space-y-5 bg-white border border-gray-200 shadow-sm">
                <legend className="text-xs font-bold uppercase tracking-[0.2em] px-2 text-[#3E4A56]">
                    Personal Information
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-xs text-[#1C2A59] uppercase tracking-wide font-bold">Full Name <span className="text-red-500">*</span></label>
                        <input
                            className={fieldErrors.name ? errorInputClass : inputClass}
                            placeholder="John Doe"
                            value={form.name}
                            onChange={change('name')}
                            required
                        />
                        {fieldErrors.name && <p className="text-red-500 text-xs font-semibold">{fieldErrors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-[#1C2A59] uppercase tracking-wide font-bold">Email <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            className={fieldErrors.email ? errorInputClass : inputClass}
                            placeholder="you@uni.edu"
                            value={form.email}
                            onChange={change('email')}
                            required
                        />
                        {fieldErrors.email && <p className="text-red-500 text-xs font-semibold">{fieldErrors.email}</p>}
                    </div>
                </div>
            </fieldset>

            {/* Academic Information */}
            <fieldset className="p-6 rounded-[20px] space-y-5 bg-white border border-gray-200 shadow-sm">
                <legend className="text-xs font-bold uppercase tracking-[0.2em] px-2 text-[#3E4A56]">
                    Academic Information
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-xs text-[#1C2A59] uppercase tracking-wide font-bold">Faculty</label>
                        <div className="relative">
                            <input
                                type="text"
                                className={readOnlyClass}
                                value={form.faculty}
                                readOnly
                                disabled
                            />
                            <div className="absolute top-0 right-0 h-full flex items-center pr-4 pointer-events-none">
                                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">READ-ONLY</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">Your faculty cannot be changed after registration. Contact admin if changes are needed.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-[#1C2A59] uppercase tracking-wide font-bold">Student / Staff ID</label>
                        <input
                            type="text"
                            className={readOnlyClass}
                            placeholder="e.g. IT23844292"
                            value={form.studentId}
                            readOnly
                            disabled
                        />
                        <p className="text-xs text-gray-500">Your student ID cannot be changed. Contact admin if changes are needed.</p>
                    </div>
                </div>
            </fieldset>

            {/* Contact Information */}
            <fieldset className="p-6 rounded-[20px] space-y-5 bg-white border border-gray-200 shadow-sm">
                <legend className="text-xs font-bold uppercase tracking-[0.2em] px-2 text-[#3E4A56]">
                    Contact Information
                </legend>
                <div className="max-w-md space-y-2">
                    <label className="text-xs text-[#1C2A59] uppercase tracking-wide font-bold">Phone Number</label>
                    <input
                        className={fieldErrors.phone ? errorInputClass : inputClass}
                        placeholder="0712345678"
                        value={form.phone}
                        onChange={change('phone')}
                        maxLength="13"
                    />
                    {fieldErrors.phone && <p className="text-red-500 text-xs font-semibold">{fieldErrors.phone}</p>}
                    {!fieldErrors.phone && form.phone && (
                        <p className="text-green-600 text-xs font-semibold flex items-center gap-1"><CheckCircle size={12} /> {formatPhoneNumber(form.phone)}</p>
                    )}
                </div>
            </fieldset>

            {/* Security Notice */}
            <fieldset className="p-6 rounded-[20px] space-y-4 bg-blue-50 border border-blue-200 shadow-sm">
                <legend className="text-xs font-bold uppercase tracking-[0.2em] px-2 text-blue-900">
                    ℹ️ Information
                </legend>
                <p className="text-xs text-blue-800 leading-relaxed">
                    <strong>Protected Fields:</strong> Your faculty and student ID are protected and cannot be changed after registration. This ensures data integrity and security. If you need to update these fields, please contact the administration office.
                </p>
            </fieldset>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={saving || Object.keys(fieldErrors).length > 0}
                    className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md bg-[#1C2A59] hover:bg-[#1a254d]"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}
