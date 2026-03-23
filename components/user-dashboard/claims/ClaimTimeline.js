'use client';
import { Send, FileText, ShieldCheck, Clock, Cpu, UserCheck, CheckCircle, XCircle, CalendarCheck, PartyPopper } from 'lucide-react';

const STEPS = [
    { key: 'submitted', label: 'Submitted', icon: Send },
    { key: 'ai_screening', label: 'AI Screening', icon: Cpu },
    { key: 'admin_review', label: 'Admin Review', icon: UserCheck },
    { key: 'decision', label: 'Decision', icon: ShieldCheck },
    { key: 'pickup', label: 'Pickup', icon: CalendarCheck },
    { key: 'completed', label: 'Completed', icon: PartyPopper },
];

// Map claim status to the step index that is currently active
function getActiveStep(status) {
    switch (status) {
        case 'under_review': return 0;
        case 'ai_matched': return 1;
        case 'admin_review': return 2;
        case 'approved': return 3;
        case 'rejected': return 3;
        case 'withdrawn': return 0;
        case 'pickup_scheduled': return 4;
        case 'completed': return 5;
        default: return 0;
    }
}

function isRejected(status) { return status === 'rejected'; }
function isWithdrawn(status) { return status === 'withdrawn'; }

function formatTimestamp(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ClaimTimeline({ claim }) {
    const activeIdx = getActiveStep(claim.status);
    const rejected = isRejected(claim.status);
    const withdrawn = isWithdrawn(claim.status);

    // Build timestamp map from trackingHistory
    const timestamps = {};
    (claim.trackingHistory || []).forEach(ev => {
        const key = ev.status?.toLowerCase().replace(/\s+/g, '_');
        if (key) timestamps[key] = ev.timestamp;
    });

    return (
        <div className="p-6 rounded-[20px] bg-white border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-[#3E4A56]">
                Claim Lifecycle
            </h3>

            <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
                {STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = idx < activeIdx;
                    const isCurrent = idx === activeIdx;
                    const isDecisionStep = idx === 3;

                    // Color logic
                    let dotColor = '#E5E7EB'; // gray-200
                    let lineColor = '#F3F4F6'; // gray-100
                    let textColor = '#9CA3AF'; // gray-400
                    let iconColor = '#D1D5DB'; // gray-300

                    if (isCompleted) {
                        dotColor = '#10B981'; // green-500
                        lineColor = '#10B981';
                        textColor = '#111827'; // gray-900
                        iconColor = '#10B981';
                    } else if (isCurrent) {
                        if (rejected && isDecisionStep) {
                            dotColor = '#EF4444'; // red-500
                            textColor = '#EF4444';
                            iconColor = '#EF4444';
                        } else if (withdrawn) {
                            dotColor = '#6B7280'; // gray-500
                            textColor = '#6B7280';
                            iconColor = '#6B7280';
                        } else {
                            dotColor = '#F0A500'; // SLIIT Gold
                            textColor = '#F0A500';
                            iconColor = '#F0A500';
                        }
                    }

                    // Decide which icon for decision step
                    let StepIcon = Icon;
                    if (isDecisionStep && rejected && (isCompleted || isCurrent)) StepIcon = XCircle;
                    if (isDecisionStep && !rejected && (isCompleted || isCurrent)) StepIcon = CheckCircle;

                    return (
                        <div key={step.key} className="flex flex-col items-center flex-1 min-w-[70px] relative">
                            {/* Connector line */}
                            {idx > 0 && (
                                <div className="absolute top-4 right-1/2 w-full h-0.5 -z-10"
                                    style={{ background: isCompleted ? lineColor : '#E5E7EB', left: '-50%' }} />
                            )}

                            {/* Circle */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${isCurrent ? 'ring-2 ring-offset-2 ring-white' : ''}`}
                                style={{
                                    background: isCompleted || isCurrent ? `${dotColor}20` : '#F9FAFB',
                                    border: `2px solid ${dotColor}`,
                                    boxShadow: isCurrent ? `0 0 16px ${dotColor}40` : 'none',
                                    ringColor: isCurrent ? `${dotColor}40` : 'transparent',
                                }}>
                                <StepIcon size={14} style={{ color: iconColor }} strokeWidth={isCompleted || isCurrent ? 2.5 : 1.5} />
                            </div>

                            {/* Label */}
                            <span className="text-[10px] font-bold tracking-wider text-center leading-tight uppercase" style={{ color: textColor }}>
                                {rejected && isDecisionStep ? 'Rejected' : withdrawn && idx === 0 ? 'Withdrawn' : step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
