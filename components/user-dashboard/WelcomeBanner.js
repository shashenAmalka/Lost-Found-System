import { ShieldCheck } from 'lucide-react';

export default function WelcomeBanner({ userName, activeClaims, historyCount, studentId }) {
    return (
        <div className="rounded-[24px] p-8 md:p-10 text-white relative flex flex-col md:flex-row items-stretch justify-between gap-8 transform transition-transform duration-500 hover:scale-[1.01] bg-[#1C2A59] shadow-md border border-[#1a254d]">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-50%] left-[-10%] w-[80%] h-[150%] rounded-full opacity-10 blur-[80px] pointer-events-none bg-white" />

            {/* Left Content Area */}
            <div className="z-10 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-[#1C2A59] bg-[#F0A500] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                        Student
                    </span>
                    {studentId && (
                        <span className="flex items-center gap-2 text-sm font-medium text-white/80">
                            <ShieldCheck size={16} className="text-[#F0A500]" /> Verified ID: {studentId}
                        </span>
                    )}
                </div>

                <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-sm text-white">
                    Welcome back, {userName}!
                </h1>

                <p className="max-w-xl text-base md:text-lg leading-relaxed text-white/80">
                    You have <strong className="text-[#1C2A59] bg-[#F0A500] px-2 py-0.5 rounded-md mx-1 font-extrabold">{activeClaims} active claim{activeClaims !== 1 ? 's' : ''}</strong> being processed. AI is heavily monitoring for new potential matches.
                </p>
            </div>

            {/* Right Metrics Area */}
            <div className="z-10 flex items-center gap-5 shrink-0">
                <div className="rounded-2xl w-28 h-28 flex flex-col items-center justify-center transition-transform hover:-translate-y-2 cursor-default bg-white shadow-lg border border-gray-100">
                    <span className="font-black text-4xl mb-1 text-[#1C2A59]">{activeClaims}</span>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Active</span>
                </div>
                <div className="rounded-2xl w-28 h-28 flex flex-col items-center justify-center transition-transform hover:-translate-y-2 cursor-default bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
                    <span className="font-black text-4xl mb-1 text-white">{historyCount}</span>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/70">History</span>
                </div>
            </div>
        </div>
    );
}
