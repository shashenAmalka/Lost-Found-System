'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, FileText, ShieldAlert, Activity,
    LogOut, MessageCircle
} from 'lucide-react'

const NAV_ITEMS = [
    { name: 'Overview', icon: LayoutDashboard, href: '/admin/dashboard' },
    { name: 'Claim Management', icon: FileText, href: '/admin/claims' },
    { name: 'Conversations', icon: MessageCircle, href: '/admin/messages' },
    { name: 'User Moderation', icon: ShieldAlert, href: '/admin/users' },
    { name: 'Analytics Data', icon: Activity, href: '/admin/audit' },
]

export default function AdminSidebar({ logout }) {
    const pathname = usePathname()

    const isActive = (href) => {
        if (href === '/admin/dashboard') return pathname === '/admin/dashboard' || pathname === '/admin'
        return pathname.startsWith(href)
    }

    return (
        <aside className="w-64 h-full hidden lg:flex flex-col justify-between border-r shrink-0 bg-white border-gray-200">
            <div>
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-200">
                            <ShieldAlert size={20} className="text-[#1C2A59]" />
                        </div>
                        <div>
                            <h1 className="font-bold text-[#1C2A59] tracking-wide">Command<br />Center</h1>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link key={item.name} href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                                    active
                                        ? 'bg-amber-50 border border-amber-200'
                                        : 'hover:bg-gray-50 border border-transparent'
                                }`}>
                                <item.icon size={18} className={`transition-colors ${
                                    active ? 'text-[#F0A500]' : 'text-gray-400 group-hover:text-gray-600'
                                }`} />
                                <span className={`text-sm font-semibold transition-colors ${
                                    active ? 'text-[#1C2A59]' : 'text-gray-500 group-hover:text-gray-700'
                                }`}>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1C2A59] to-[#3E4A56] flex items-center justify-center font-bold text-xs text-white">
                        A
                    </div>
                    <div className="text-sm">
                        <p className="font-bold text-[#1C2A59] leading-tight">Admin System</p>
                        <p className="text-[10px] text-[#F0A500] uppercase tracking-wider font-bold">Authorized</p>
                    </div>
                </div>
                <button onClick={logout}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-gray-50 text-gray-500 hover:text-gray-700">
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </aside>
    )
}
