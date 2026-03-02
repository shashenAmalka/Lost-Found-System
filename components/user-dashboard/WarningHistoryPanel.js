'use client'
import { useState, useEffect } from 'react'
import { AlertCircle, Clock, ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react'

const SEVERITY_STYLES = {
    LOW: { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', color: '#818cf8', label: 'Low' },
    MEDIUM: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', color: '#fbbf24', label: 'Medium' },
    HIGH: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', color: '#f87171', label: 'High' },
}

const STATUS_STYLES = {
    ACTIVE: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: 'Active' },
    EXPIRED: { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', label: 'Expired' },
    REVOKED: { bg: 'rgba(74,222,128,0.1)', color: '#4ade80', label: 'Revoked' },
}

export default function WarningHistoryPanel({ warnings = [] }) {
    if (warnings.length === 0) return null

    return (
        <div className="glass-card p-6 animate-slide-up">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <ShieldAlert size={16} className="text-yellow-400" /> Your Warnings
            </h3>
            <div className="space-y-3 relative">
                {/* Timeline connector */}
                <div className="absolute left-4 top-2 bottom-2 w-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

                {warnings.map((w, i) => {
                    const sev = SEVERITY_STYLES[w.severity] || SEVERITY_STYLES.MEDIUM
                    const stat = STATUS_STYLES[w.status] || STATUS_STYLES.ACTIVE

                    return (
                        <div key={w._id || i} className="relative pl-10">
                            {/* Timeline dot */}
                            <div className="absolute left-3 top-4 w-2.5 h-2.5 rounded-full z-10"
                                style={{ background: stat.color, boxShadow: `0 0 6px ${stat.color}40` }} />

                            <div className="p-3.5 rounded-xl transition-all hover:scale-[1.01]"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
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
                                    <div className="flex items-center gap-1 text-[9px] text-white/30">
                                        <Clock size={9} />
                                        {new Date(w.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                                <p className="text-xs text-white/70 font-medium">{w.reason}</p>
                                {w.shortAutoSummary && (
                                    <p className="text-[10px] text-white/40 mt-1">{w.shortAutoSummary}</p>
                                )}
                                <p className="text-[9px] text-white/25 mt-1.5">Issued by: {w.issuedByName || 'Admin'}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
