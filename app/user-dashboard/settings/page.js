'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import ProfileHeader from '@/components/user-dashboard/settings/ProfileHeader';
import ProfileForm from '@/components/user-dashboard/settings/ProfileForm';

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) return <div className="min-h-screen" style={{ backgroundColor: '#0B0F19' }} />;
    if (!user) { router.push('/login'); return null; }

    return (
        <div className="p-4 md:p-8 lg:p-10 max-w-4xl mx-auto w-full relative z-10">
            {/* Page Title */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(240, 100, 20, 0.15)', border: '1px solid rgba(240, 100, 20, 0.3)' }}>
                    <Settings size={20} style={{ color: '#F06414' }} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Profile Settings</h1>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(245, 246, 250, 0.5)' }}>Manage your account details</p>
                </div>
            </div>

            {/* Profile Header */}
            <div className="mb-8">
                <ProfileHeader user={user} />
            </div>

            {/* Profile Form */}
            <ProfileForm user={user} />
        </div>
    );
}
