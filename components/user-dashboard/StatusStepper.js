import { Clock, Search, UserCheck, CheckCircle2, Package } from 'lucide-react';

const STEPS = [
    { id: 'submitted', label: 'Submitted', icon: Clock },
    { id: 'ai_matched', label: 'AI Matched', icon: Search },
    { id: 'admin_review', label: 'Admin Review', icon: UserCheck },
    { id: 'approved', label: 'Approved', icon: CheckCircle2 },
    { id: 'pickup', label: 'Pickup', icon: Package }
];

export default function StatusStepper({ currentStatus, claimId, itemName, lastSeen, statusDates = {} }) {
    // Basic logic to determine active step index based on a status string
    const getActiveIndex = () => {
        const statuses = STEPS.map(s => s.id);
        const index = statuses.indexOf(currentStatus);
        return index !== -1 ? index : 0;
    };

    const activeIndex = getActiveIndex();

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-campus-border relative">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-bold text-campus-text mb-1">Active Claim Status</h2>
                    <p className="font-semibold text-campus-text">{itemName}</p>
                    <p className="text-sm text-campus-muted">Last seen at {lastSeen}</p>
                </div>
                <div className="text-sm font-medium text-campus-muted">
                    Claim #{claimId}
                </div>
            </div>

            {/* Stepper Container */}
            <div className="mt-8 relative">
                <div className="flex flex-col md:flex-row justify-between relative z-10">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index < activeIndex;
                        const isActive = index === activeIndex;
                        const isPending = index > activeIndex;

                        return (
                            <div key={step.id} className="flex flex-col items-center flex-1 relative mb-6 md:mb-0 group">
                                {/* Connecting Line (Desktop) */}
                                {index !== STEPS.length - 1 && (
                                    <div className={`hidden md:block absolute top-[20px] left-[50%] w-full h-[2px] z-[-1] transition-colors duration-300 ${isCompleted ? 'bg-campus-soft' : 'bg-gray-200'}`} />
                                )}

                                {/* Connecting Line (Mobile) */}
                                {index !== STEPS.length - 1 && (
                                    <div className={`md:hidden absolute top-[40px] left-[20px] w-[2px] h-full z-[-1] transition-colors duration-300 ${isCompleted ? 'bg-campus-soft' : 'bg-gray-200'}`} />
                                )}

                                {/* Icon Circle */}
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-300 ${isCompleted
                                            ? 'border-campus-soft text-campus-soft'
                                            : isActive
                                                ? 'border-campus-primary text-campus-primary ring-4 ring-campus-primary/10'
                                                : 'border-gray-200 text-gray-400'
                                        }`}
                                    title={step.label}
                                >
                                    <Icon size={18} strokeWidth={isActive || isCompleted ? 2.5 : 2} />
                                </div>

                                {/* Labels */}
                                <div className="mt-3 text-center md:px-2">
                                    <p className={`text-sm font-semibold ${isActive ? 'text-campus-text' : isPending ? 'text-gray-400' : 'text-campus-muted'}`}>
                                        {step.label}
                                    </p>

                                    <p className="text-[11px] text-gray-400 mt-0.5 min-h-[16px]">
                                        {statusDates[step.id] ? statusDates[step.id] : (isPending ? 'Pending' : '')}
                                    </p>
                                    {isActive && (
                                        <p className="text-[11px] font-medium text-campus-primary mt-0.5">
                                            In Progress
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
