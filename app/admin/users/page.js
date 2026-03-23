'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard, FileText, ShieldAlert, Activity,
    Users, ChevronRight, LogOut
} from 'lucide-react'
import UserModerationPanel from '@/components/admin/UserModerationPanel'

export default function AdminUsersPage() {
    const { user, loading: authLoading, isAdmin, logout } = useAuth()
    const router = useRouter()

    if (authLoading) return <div className="min-h-screen bg-[#F4F5F7]" />
    if (!user || !isAdmin) { router.push('/login'); return null }

    const navItems = [
        { name: 'Overview', icon: LayoutDashboard, href: '/admin/dashboard' },
        { name: 'Claim Management', icon: FileText, href: '/admin/claims' },
        { name: 'User Moderation', icon: ShieldAlert, href: '/admin/users', active: true },
        { name: 'Analytics Data', icon: Activity, href: '/admin/audit' },
    ]

    return (
        <div className="min-h-screen flex bg-[#F4F5F7] text-[#1C2A59] relative overflow-hidden">

            {/* Sidebar */}
            <aside className="w-64 h-screen hidden lg:flex flex-col justify-between border-r sticky top-0 z-50 shrink-0 bg-white border-gray-200">
                <div>
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-200">
                                <ShieldAlert size={20} className="text-[#1C2A59]" />
                            </div>
                            <h1 className="font-bold text-[#1C2A59] tracking-wide">Command<br />Center</h1>
                        </div>
                    </div>
                    <nav className="p-4 space-y-2">
                        {navItems.map((item, i) => (
                            <Link key={i} href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${item.active ? 'bg-amber-50 border border-amber-200' : 'hover:bg-gray-50 border border-transparent'}`}>
                                <item.icon size={18} className={`transition-colors ${item.active ? 'text-[#F0A500]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                <span className={`text-sm font-semibold transition-colors ${item.active ? 'text-[#1C2A59]' : 'text-gray-500 group-hover:text-gray-700'}`}>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1C2A59] to-[#3E4A56] flex items-center justify-center font-bold text-xs text-white">A</div>
                        <div className="text-sm">
                            <p className="font-bold text-[#1C2A59] leading-tight">Admin System</p>
                            <p className="text-[10px] text-[#F0A500] uppercase tracking-wider font-bold">Authorized</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-gray-50 text-gray-500 hover:text-gray-700">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen relative z-10 p-6 md:p-8 overflow-y-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 text-gray-400">
                        <Link href="/admin/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
                        <ChevronRight size={12} />
                        <span className="text-[#F0A500]">User Moderation</span>
                    </div>
                    <h2 className="text-2xl font-black text-[#1C2A59] flex items-center gap-3 tracking-wide">
                        <Users size={24} className="text-[#F0A500]" />
                        User Moderation
                    </h2>
                    <p className="text-sm mt-1 font-medium text-gray-500">
                        Monitor, warn, and moderate student accounts · Issue warnings · Review appeals
                    </p>
                </div>

                {/* Enhanced Moderation Panel */}
                <UserModerationPanel />
            </main>
        </div>
    )
}
