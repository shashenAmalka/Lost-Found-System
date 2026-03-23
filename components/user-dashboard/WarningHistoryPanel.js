'use client'
import { useState, useEffect } from 'react'
import { AlertCircle, Clock, ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react'

const SEVERITY_STYLES = {
    LOW: { bg: '#E0F2FE', border: '#BAE6FD', color: '#0369A1', label: 'Low' },
    MEDIUM: { bg: '#FEF3C7', border: '#FDE68A', color: '#D97706', label: 'Medium' },
    HIGH: { bg: '#FEE2E2', border: '#FECACA', color: '#DC2626', label: 'High' },
}

const STATUS_STYLES = {
    ACTIVE: { bg: '#FEE2E2', color: '#DC2626', label: 'Active' },
    EXPIRED: { bg: '#F3F4F6', color: '#9CA3AF', label: 'Expired' },
    REVOKED: { bg: '#DCFCE7', color: '#16A34A', label: 'Revoked' },
}

export default function WarningHistoryPanel({ warnings = [] }) {
    if (warnings.length === 0) return null

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-200 animate-slide-up">
            <h3 className="text-sm font-extrabold text-[#1C2A59] flex items-center gap-2 mb-4">
                <ShieldAlert size={16} className="text-[#F0A500]" /> Your Warnings
            </h3>
            <div className="space-y-3 relative">
                {/* Timeline connector */}
                <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200" />

                {warnings.map((w, i) => {
                    const sev = SEVERITY_STYLES[w.severity] || SEVERITY_STYLES.MEDIUM
                    const stat = STATUS_STYLES[w.status] || STATUS_STYLES.ACTIVE

                    return (
                        <div key={w._id || i} className="relative pl-10">
                            {/* Timeline dot */}
                            <div className="absolute left-3 top-4 w-2.5 h-2.5 rounded-full z-10"
                                style={{ background: stat.color, boxShadow: `0 0 6px ${stat.color}40` }} />

                            <div className="p-3.5 rounded-xl transition-all hover:scale-[1.01] bg-[#F4F5F7] border border-gray-200">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-2">
                                        {/* Severity badge */}
                                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                                            style={{ background: sev.bg, border: `1px solid ${sev.border}`, color: sev.color }}>
                                            {sev.label}
                                        </span>
                                        {/* Status pill */}
                                        <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full"
                                            style={{ background: stat.bg, color: stat.color }}>
                                            {stat.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold">
                                        <Clock size={9} />
                                        {new Date(w.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                                <p className="text-xs text-[#3E4A56] font-medium leading-relaxed">{w.reason}</p>
                                {w.shortAutoSummary && (
                                    <p className="text-[10px] text-gray-500 mt-1">{w.shortAutoSummary}</p>
                                )}
                                <p className="text-[9px] text-gray-400 mt-1.5 font-bold uppercase tracking-wider">Issued by: {w.issuedByName || 'Admin'}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
