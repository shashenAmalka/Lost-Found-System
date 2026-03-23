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

    const inputClass = "w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded text-sm font-medium text-[#1C2A59] placeholder-gray-400 focus:outline-none focus:border-[#F0A500] focus:ring-1 focus:ring-[#F0A500] transition-colors"
    const labelClass = "text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1 block"

    return (
        <div className="space-y-4 pt-2">
            {/* Section Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Sparkles size={14} className="text-[#F0A500]" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {category} Details
                </span>
            </div>

            {/* Dynamic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((field) => (
                    <div key={field.key} className={`space-y-1.5 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                        <label className={labelClass}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === 'select' ? (
                            <select
                                className={inputClass}
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
                                className={`${inputClass} min-h-[80px] resize-y`}
                                placeholder={field.placeholder}
                                value={values[field.key] || ''}
                                onChange={handleChange(field.key)}
                                required={field.required}
                            />
                        ) : (
                            <input
                                type={field.type}
                                className={inputClass}
                                placeholder={field.placeholder}
                                value={values[field.key] || ''}
                                onChange={handleChange(field.key)}
                                required={field.required}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
