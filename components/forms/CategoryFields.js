'use client';
import { Sparkles } from 'lucide-react';
import CATEGORY_FIELDS from '@/lib/categoryFieldsConfig';

/**
 * Dynamically renders category-specific form fields
 * based on the selected category from the config.
 */
export default function CategoryFields({ category, values, onChange }) {
    const fields = CATEGORY_FIELDS[category];
    if (!fields || fields.length === 0) return null;

    const handleChange = (key) => (e) => {
        onChange({ ...values, [key]: e.target.value });
    };

    return (
        <div className="space-y-4 pt-2">
            {/* Section Header */}
            <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Sparkles size={14} style={{ color: '#F06414' }} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(245,246,250,0.5)' }}>
                    {category} Details
                </span>
            </div>

            {/* Dynamic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((field) => (
                    <div key={field.key} className={`space-y-1.5 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                        <label className="text-xs text-white/60 uppercase tracking-wide">
                            {field.label} {field.required && <span style={{ color: '#F06414' }}>*</span>}
                        </label>

                        {field.type === 'select' ? (
                            <select
                                className="glass-select"
                                value={values[field.key] || ''}
                                onChange={handleChange(field.key)}
                                required={field.required}
                            >
                                <option value="">Select {field.label.toLowerCase()}</option>
                                {field.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : field.type === 'textarea' ? (
                            <textarea
                                className="glass-input min-h-[80px] resize-y"
                                placeholder={field.placeholder}
                                value={values[field.key] || ''}
                                onChange={handleChange(field.key)}
                                required={field.required}
                            />
                        ) : (
                            <input
                                type={field.type}
                                className="glass-input"
                                placeholder={field.placeholder}
                                value={values[field.key] || ''}
                                onChange={handleChange(field.key)}
                                required={field.required}
                                style={field.type === 'date' ? { colorScheme: 'dark' } : {}}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
