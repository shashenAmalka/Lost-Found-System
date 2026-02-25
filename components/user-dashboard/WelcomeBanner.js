import { ShieldCheck } from 'lucide-react';

export default function WelcomeBanner({ userName, activeClaims, historyCount, studentId }) {
    return (
        <div className="bg-gradient-to-r from-campus-primary to-campus-soft rounded-[20px] p-6 md:p-8 text-white shadow-sm relative overflow-hidden flex flex-col md:flex-row items-stretch justify-between gap-6">
            {/* Left Content Area */}
            <div className="z-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                        Student
                    </span>
                    {studentId && (
                        <span className="flex items-center gap-1 text-white/90 text-sm font-medium">
                            <ShieldCheck size={16} /> Verified ID: {studentId}
                        </span>
                    )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                    Welcome back, {userName}!
                </h1>

                <p className="text-white/80 max-w-xl text-sm md:text-base leading-relaxed">
                    You have <strong className="text-white bg-white/10 px-1 py-0.5 rounded">{activeClaims} active claim{activeClaims !== 1 ? 's' : ''}</strong> being processed. We've found potential matches for your lost items.
                </p>
            </div>

            {/* Right Metrics Area */}
            <div className="z-10 flex items-center gap-4 shrink-0">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl w-24 h-24 flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-default shadow-sm">
                    <span className="font-bold text-3xl mb-1">{activeClaims}</span>
                    <span className="text-[10px] font-bold tracking-wider text-white/70 uppercase">Active</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl w-24 h-24 flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-default shadow-sm">
                    <span className="font-bold text-3xl mb-1">{historyCount}</span>
                    <span className="text-[10px] font-bold tracking-wider text-white/70 uppercase">History</span>
                </div>
            </div>

            {/* Decorative BG pattern (optional) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-black/10 rounded-full blur-3xl -mb-24 pointer-events-none" />
        </div>
    );
}
