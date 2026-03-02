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

    if (authLoading) return <div className="min-h-screen" style={{ backgroundColor: '#0B0F19' }} />
    if (!user || !isAdmin) { router.push('/login'); return null }

    const navItems = [
        { name: 'Overview', icon: LayoutDashboard, href: '/admin/dashboard' },
        { name: 'Claim Management', icon: FileText, href: '/admin/claims' },
        { name: 'User Moderation', icon: ShieldAlert, href: '/admin/users', active: true },
        { name: 'Analytics Data', icon: Activity, href: '/admin/audit' },
    ]

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: '#0B0F19', color: '#F5F6FA', position: 'relative', overflow: 'hidden' }}>

            {/* Ambient Orbs */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[150px] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, #1A1A64 0%, transparent 70%)' }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-15 blur-[120px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #F06414 0%, transparent 70%)' }} />

            {/* Sidebar */}
            <aside className="w-64 h-screen hidden lg:flex flex-col justify-between border-r sticky top-0 z-50 shrink-0"
                style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(40px)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div>
                    <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                                style={{ background: 'rgba(26,26,100,0.4)', borderColor: 'rgba(26,26,100,0.8)' }}>
                                <ShieldAlert size={20} className="text-white" />
                            </div>
                            <h1 className="font-bold text-white tracking-wide">Command<br />Center</h1>
                        </div>
                    </div>
                    <nav className="p-4 space-y-2">
                        {navItems.map((item, i) => (
                            <Link key={i} href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${item.active ? '' : 'hover:bg-white/5'}`}
                                style={item.active ? { background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' } : { border: '1px solid transparent' }}>
                                <item.icon size={18} style={{ color: item.active ? '#D4AF37' : 'rgba(245,246,250,0.5)' }} />
                                <span className={`text-sm font-semibold ${item.active ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1A1A64] to-[#F06414] flex items-center justify-center font-bold text-xs">A</div>
                        <div className="text-sm">
                            <p className="font-bold text-white leading-tight">Admin System</p>
                            <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-bold">Authorized</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-white/5 text-white/50 hover:text-white">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen relative z-10 p-6 md:p-8 overflow-y-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(245,246,250,0.4)' }}>
                        <Link href="/admin/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                        <ChevronRight size={12} />
                        <span style={{ color: '#D4AF37' }}>User Moderation</span>
                    </div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-wide">
                        <Users size={24} style={{ color: '#D4AF37' }} />
                        User Moderation
                    </h2>
                    <p className="text-sm mt-1 font-medium" style={{ color: 'rgba(245,246,250,0.5)' }}>
                        Monitor, warn, and moderate student accounts · Issue warnings · Review appeals
                    </p>
                </div>

                {/* Enhanced Moderation Panel */}
                <UserModerationPanel />
            </main>
        </div>
    )
}
