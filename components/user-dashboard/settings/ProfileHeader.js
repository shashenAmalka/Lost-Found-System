'use client';
import { ShieldCheck } from 'lucide-react';

export default function ProfileHeader({ user }) {
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const roleBadge = {
        student: { label: 'Student', color: '#F0A500' },
        staff: { label: 'Staff', color: '#008489' },
        admin: { label: 'Admin', color: '#dc2626' },
    }[user?.role] || { label: 'Student', color: '#F0A500' };

    return (
        <div className="flex items-center gap-6 p-8 rounded-[24px] relative overflow-hidden bg-white border border-gray-200 shadow-sm">
            {/* Ambient background accent */}
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />

            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0 relative z-10 shadow-sm"
                style={{
                    background: 'linear-gradient(135deg, #1C2A59 0%, #008489 100%)',
                }}>
                {initials}
            </div>

            {/* Info */}
            <div className="relative z-10 flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-[#1C2A59] tracking-tight">{user?.name || 'User'}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
                        style={{
                            background: `${roleBadge.color}15`,
                            border: `1px solid ${roleBadge.color}40`,
                            color: roleBadge.color,
                        }}>
                        {roleBadge.label}
                    </span>
                    {user?.campusId && (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-[#3E4A56]">
                            <ShieldCheck size={14} className="text-green-500" /> {user.campusId}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
