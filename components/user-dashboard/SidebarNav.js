'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Star, Settings, LogOut, Mail, Globe, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SidebarNav() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', href: '/user-dashboard', icon: Home },
        { name: 'My Claims', href: '/user-dashboard/claims', icon: Search },
        { name: 'Potential Matches', href: '/matches', icon: Star },
        { name: 'Messages', href: '/messages', icon: Mail },
        { name: 'Settings', href: '/user-dashboard/settings', icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col justify-between hidden md:flex z-50 bg-white border-r border-gray-200 shadow-[2px_0_8px_rgba(0,0,0,0.05)]">
            {/* Top Section */}
            <div>
                {/* Clickable Logo Area - Standard intuitive way to go home */}
                <Link href="/" className="p-6 pb-8 flex items-center gap-4 group cursor-pointer hover:bg-gray-50/50 transition-colors">
                    <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center text-2xl shrink-0 shadow-sm border border-gray-100 bg-white group-hover:scale-105 transition-transform duration-300 group-hover:border-gray-200">
                        🎓
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[#1C2A59] font-extrabold text-lg tracking-tight group-hover:text-[#F0A500] transition-colors">Smart Campus</span>
                        <span className="text-[#008489] text-xs font-bold tracking-wider mt-1">LOST & FOUND</span>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="px-4 space-y-2 mt-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                    ? 'bg-[#1C2A59] text-white shadow-md'
                                    : 'text-[#3E4A56] hover:bg-[#F4F5F7] hover:text-[#1C2A59]'
                                    }`}
                            >
                                <div className="flex items-center gap-4 relative">
                                    <Icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={`transition-colors ${isActive ? 'text-[#F0A500]' : 'text-gray-400 group-hover:text-[#1C2A59]'}`}
                                    />
                                    <span className="font-bold transition-colors">{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section - Exit & User Profile */}
            <div className="px-4 mb-4 space-y-3">
                {/* Elegant escape hatch to the main site */}
                <Link 
                    href="/" 
                    className="flex items-center justify-between w-full px-4 py-3 rounded-2xl border border-gray-200 border-dashed text-gray-500 hover:text-[#1C2A59] hover:bg-gray-50 hover:border-gray-300 transition-all group"
                >
                    <div className="flex items-center gap-2.5">
                        <Globe size={16} className="text-gray-400 group-hover:text-[#008489] transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-wider">Public Website</span>
                    </div>
                    <ArrowUpRight size={14} className="opacity-50 group-hover:opacity-100 group-hover:text-[#008489] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </Link>

                <div className="p-4 rounded-2xl flex flex-col gap-4 transition-all duration-300 bg-[#F4F5F7] border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-[#1C2A59]">
                            {/* Placeholder Avatar */}
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold bg-[#1C2A59]">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-extrabold text-sm text-[#1C2A59] truncate">{user?.name || 'User'}</p>
                            <p className="text-[11px] text-[#3E4A56] font-medium truncate">ID: {user?.studentId || 'N/A'}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 w-full py-2.5 text-sm rounded-xl transition-colors hover:bg-gray-200 text-[#3E4A56] font-bold"
                    >
                        <LogOut size={16} />
                        <span className="hover:text-[#1C2A59]">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
