'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import ProfileHeader from '@/components/user-dashboard/settings/ProfileHeader';
import ProfileForm from '@/components/user-dashboard/settings/ProfileForm';

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) return <div className="min-h-screen bg-[#F4F5F7]" />;
    if (!user) { router.push('/login'); return null; }

    return (
        <div className="p-4 md:p-8 lg:p-10 max-w-4xl mx-auto w-full relative z-10">
            {/* Page Title */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 border border-amber-200">
                    <Settings size={20} className="text-[#F0A500]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#1C2A59] tracking-tight">Profile Settings</h1>
                    <p className="text-xs mt-0.5 text-[#3E4A56] font-medium">Manage your account details</p>
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
