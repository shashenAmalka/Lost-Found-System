'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }) {
    const { user, loading: authLoading, isAdmin, logout } = useAuth()
    const router = useRouter()

    if (authLoading) return <div className="min-h-screen bg-[#F4F5F7]" />
    if (!user || !isAdmin) { router.push('/login'); return null }

    return (
        <div className="h-screen w-full flex bg-[#F4F5F7] text-[#1C2A59] overflow-hidden">
            <AdminSidebar logout={logout} />

            {/* Main Area Wrapper */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="lg:hidden flex shrink-0 items-center justify-between p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                        <ShieldAlert size={24} className="text-[#F0A500]" />
                        <span className="font-bold text-lg text-[#1C2A59]">Admin Panel</span>
                    </div>
                </div>

                <main className="flex-1 w-full relative z-10 p-6 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
