'use client'

export default function StatusBadge({ status }) {
    const map = {
        // Lost item statuses
        pending: { label: 'Pending', bg: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.10))', color: '#f59e0b', border: 'rgba(245,158,11,0.35)', glow: '0 0 12px rgba(245,158,11,0.15)' },
        matched: { label: 'Matched', bg: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(6,182,212,0.10))', color: '#06b6d4', border: 'rgba(6,182,212,0.35)', glow: '0 0 12px rgba(6,182,212,0.15)' },
        resolved: { label: 'Resolved', bg: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.10))', color: '#10b981', border: 'rgba(16,185,129,0.35)', glow: '0 0 12px rgba(16,185,129,0.15)' },
        archived: { label: 'Archived', bg: 'linear-gradient(135deg, rgba(100,116,139,0.25), rgba(100,116,139,0.10))', color: '#94a3b8', border: 'rgba(100,116,139,0.35)', glow: 'none' },
        // Found item
        unclaimed: { label: 'Unclaimed', bg: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(99,102,241,0.10))', color: '#818cf8', border: 'rgba(99,102,241,0.35)', glow: '0 0 12px rgba(99,102,241,0.15)' },
        under_review: { label: 'Under Review', bg: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.10))', color: '#f59e0b', border: 'rgba(245,158,11,0.35)', glow: '0 0 12px rgba(245,158,11,0.15)' },
        claimed: { label: 'Claimed', bg: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.10))', color: '#10b981', border: 'rgba(16,185,129,0.35)', glow: '0 0 12px rgba(16,185,129,0.15)' },
        // Claims
        ai_matched: { label: 'AI Matched', bg: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(6,182,212,0.15))', color: '#8b5cf6', border: 'rgba(139,92,246,0.35)', glow: '0 0 12px rgba(139,92,246,0.15)' },
        admin_review: { label: 'Admin Review', bg: 'linear-gradient(135deg, rgba(167,139,250,0.25), rgba(167,139,250,0.10))', color: '#a78bfa', border: 'rgba(167,139,250,0.35)', glow: '0 0 12px rgba(167,139,250,0.15)' },
        approved: { label: 'Approved', bg: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.10))', color: '#10b981', border: 'rgba(16,185,129,0.35)', glow: '0 0 12px rgba(16,185,129,0.15)' },
        rejected: { label: 'Rejected', bg: 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.10))', color: '#ef4444', border: 'rgba(239,68,68,0.35)', glow: '0 0 12px rgba(239,68,68,0.15)' },
        withdrawn: { label: 'Withdrawn', bg: 'linear-gradient(135deg, rgba(100,116,139,0.25), rgba(100,116,139,0.10))', color: '#94a3b8', border: 'rgba(100,116,139,0.35)', glow: 'none' },
        completed: { label: 'Completed', bg: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.10))', color: '#10b981', border: 'rgba(16,185,129,0.35)', glow: '0 0 12px rgba(16,185,129,0.15)' },
        // User
        active: { label: 'Active', bg: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.10))', color: '#10b981', border: 'rgba(16,185,129,0.35)', glow: '0 0 12px rgba(16,185,129,0.15)' },
        restricted: { label: 'Restricted', bg: 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.10))', color: '#ef4444', border: 'rgba(239,68,68,0.35)', glow: '0 0 12px rgba(239,68,68,0.15)' },
    }

    const s = map[status] || { label: status, bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)', glow: 'none' }

    return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider"
            style={{
                background: s.bg,
                color: s.color,
                border: `1px solid ${s.border}`,
                boxShadow: s.glow,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                letterSpacing: '0.06em',
            }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}` }} />
            {s.label}
        </span>
    )
}
