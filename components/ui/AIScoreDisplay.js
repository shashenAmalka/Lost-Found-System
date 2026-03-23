'use client'

export default function AIScoreDisplay({ matchScore = 0, riskScore = 0, breakdown = {}, suggestion = 'pending' }) {
    const getMatchColor = (score) => {
        if (score >= 70) return { bar: 'rgba(16,185,129,0.8)', glow: 'rgba(16,185,129,0.4)', text: '#6ee7b7' }
        if (score >= 40) return { bar: 'rgba(245,158,11,0.8)', glow: 'rgba(245,158,11,0.4)', text: '#fcd34d' }
        return { bar: 'rgba(239,68,68,0.8)', glow: 'rgba(239,68,68,0.4)', text: '#fca5a5' }
    }

    const matchColor = getMatchColor(matchScore)
    const riskColor = riskScore > 60 ? { text: '#fca5a5' } : riskScore > 30 ? { text: '#fcd34d' } : { text: '#6ee7b7' }

    const suggestionStyle = {
        approve: { label: '✅ Approve', bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
        review: { label: '⚠️ Review', bg: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: 'rgba(245,158,11,0.3)' },
        reject: { label: '❌ Reject', bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
        pending: { label: '⏳ Pending', bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
    }
    const sug = suggestionStyle[suggestion] || suggestionStyle.pending

    return (
        <div className="bg-white rounded border border-gray-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: matchColor.bar }} />
                <span className="text-xs font-semibold text-gray-400 font-bold tracking-wider uppercase tracking-wider">AI Match Analysis</span>
            </div>

            {/* Main scores */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-bold tracking-wider">Match Confidence</span>
                        <span className="font-bold" style={{ color: matchColor.text }}>{matchScore}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${matchScore}%`, background: matchColor.bar, boxShadow: `0 0 8px ${matchColor.glow}` }} />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-bold tracking-wider">Risk Score</span>
                        <span className="font-bold" style={{ color: riskColor.text }}>{riskScore}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${riskScore}%`, background: riskScore > 60 ? 'rgba(239,68,68,0.8)' : riskScore > 30 ? 'rgba(245,158,11,0.8)' : 'rgba(16,185,129,0.8)' }} />
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            {Object.keys(breakdown).length > 0 && (
                <div className="space-y-1.5">
                    <span className="text-xs text-[#1C2A59]/40 uppercase tracking-wide">Score Breakdown</span>
                    {Object.entries(breakdown).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 w-28 capitalize">{key.replace('Score', '')}</span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <div className="h-full rounded-full" style={{ width: `${val}%`, background: 'rgba(99,102,241,0.7)' }} />
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">{val}%</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Suggestion */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-xs text-gray-500">AI Suggestion</span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: sug.bg, color: sug.color, border: `1px solid ${sug.border}` }}>
                    {sug.label}
                </span>
            </div>
        </div>
    )
}
