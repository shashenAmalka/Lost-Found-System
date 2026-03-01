'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Star, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SidebarNav() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', href: '/user-dashboard', icon: Home },
        { name: 'My Claims', href: '/user-dashboard/claims', icon: Search },
        { name: 'Potential Matches', href: '/matches', icon: Star },
        { name: 'Settings', href: '/user-dashboard/settings', icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col justify-between hidden md:flex z-50"
            style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(30px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '10px 0 30px rgba(0,0,0,0.2)'
            }}>
            {/* Top Section */}
            <div>
                {/* Logo Area */}
                <div className="p-6 pb-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center text-2xl shrink-0 shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #F06414 0%, #D4AF37 100%)', boxShadow: '0 8px 16px rgba(240, 100, 20, 0.4)' }}>
                        🎓
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-white font-bold text-lg tracking-tight">Smart Campus</span>
                        <span className="text-white/70 text-xs font-medium tracking-wider mt-1">LOST & FOUND</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="px-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                    ? ''
                                    : 'hover:bg-white/5'
                                    }`}
                                style={isActive ? {
                                    background: 'rgba(26, 26, 100, 0.4)',
                                    border: '1px solid rgba(26, 26, 100, 0.8)',
                                    boxShadow: 'inset 0 0 10px rgba(26, 26, 100, 0.5)'
                                } : { border: '1px solid transparent' }}
                            >
                                <div className="flex items-center gap-4 relative">
                                    <Icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        style={{ color: isActive ? '#F5F6FA' : 'rgba(245, 246, 250, 0.5)' }}
                                        className="transition-colors group-hover:text-white"
                                    />
                                    <span style={{ color: isActive ? '#F5F6FA' : 'rgba(245, 246, 250, 0.6)' }} className="font-medium group-hover:text-white transition-colors">{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section - User Profile */}
            <div className="p-4 mb-4">
                <div className="p-4 rounded-2xl flex flex-col gap-4 transition-all duration-300"
                    style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2" style={{ borderColor: '#D4AF37' }}>
                            {/* Placeholder Avatar */}
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold"
                                    style={{ background: 'linear-gradient(135deg, #1A1A64 0%, #312e81 100%)' }}>
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-semibold text-sm text-white truncate">{user?.name || 'User'}</p>
                            <p className="text-[11px] text-white/50 truncate">ID: {user?.studentId || 'N/A'}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 w-full py-2.5 text-sm rounded-xl transition-colors hover:bg-white/10"
                        style={{ color: 'rgba(245, 246, 250, 0.6)' }}
                    >
                        <LogOut size={16} />
                        <span className="font-medium hover:text-white">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
