'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SidebarNav() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', href: '/user-dashboard', icon: Home },
        { name: 'Browse Items', href: '/browse', icon: Search },
        { name: 'Report Lost', href: '/report-lost', icon: PlusCircle },
        { name: 'Notifications', href: '/notifications', icon: Bell, badge: 3 },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-campus-background border-r border-campus-border flex flex-col justify-between hidden md:flex z-50">
            {/* Top Section */}
            <div>
                {/* Logo Area */}
                <div className="p-6 pb-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-campus-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                        <Search size={20} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-lg leading-tight text-campus-text">
                        Campus<br />Find
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="px-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group ${isActive
                                        ? 'bg-campus-soft/10 text-campus-primary font-medium'
                                        : 'text-campus-muted hover:bg-white hover:text-campus-text hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-3 relative">
                                    <Icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={isActive ? 'text-campus-primary' : 'group-hover:text-campus-text'}
                                    />
                                    <span>{item.name}</span>
                                </div>

                                {item.badge && (
                                    <span className="bg-campus-warning text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section - User Profile */}
            <div className="p-4 mb-4">
                <div className="p-4 rounded-2xl bg-white border border-campus-border/50 shadow-sm flex flex-col gap-4 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                            {/* Placeholder Avatar */}
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-campus-soft to-campus-primary flex items-center justify-center text-white font-bold">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-semibold text-sm text-campus-text truncate">{user?.name || 'User'}</p>
                            <p className="text-[11px] text-campus-muted truncate">ID: {user?.studentId || 'N/A'}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 w-full py-2 text-sm text-campus-muted hover:text-campus-text hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
