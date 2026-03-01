'use client';
import { ShieldCheck } from 'lucide-react';

export default function ProfileHeader({ user }) {
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const roleBadge = {
        student: { label: 'Student', color: '#D4AF37' },
        staff: { label: 'Staff', color: '#6366f1' },
        admin: { label: 'Admin', color: '#ef4444' },
    }[user?.role] || { label: 'Student', color: '#D4AF37' };

    return (
        <div className="flex items-center gap-6 p-8 rounded-[24px] relative overflow-hidden"
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}>
            {/* Ambient glow */}
            <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[150%] rounded-full opacity-15 blur-[80px] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, #1A1A64 0%, transparent 70%)' }} />

            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0 relative z-10 shadow-lg"
                style={{
                    background: 'linear-gradient(135deg, #1A1A64 0%, #F06414 100%)',
                    boxShadow: '0 8px 24px rgba(240, 100, 20, 0.35)',
                }}>
                {initials}
            </div>

            {/* Info */}
            <div className="relative z-10 flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">{user?.name || 'User'}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
                        style={{
                            background: `${roleBadge.color}20`,
                            border: `1px solid ${roleBadge.color}60`,
                            color: roleBadge.color,
                        }}>
                        {roleBadge.label}
                    </span>
                    {user?.campusId && (
                        <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'rgba(245, 246, 250, 0.6)' }}>
                            <ShieldCheck size={14} color="#4ade80" /> {user.campusId}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
