'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
    Search, Bell, Menu, X, LogOut, User, LayoutDashboard,
    Package, Shield, GraduationCap, ChevronDown, Mail, PlusCircle,
    Sparkles, ClipboardList, Info
} from 'lucide-react'
import NotificationBell from '@/components/NotificationBell'
import NotificationToast from '@/components/NotificationToast'

export default function Navbar() {
    const { user, loading, logout, isAdmin } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const userLinks = [
        { href: '/', label: 'Home', icon: GraduationCap },
        { href: '/lost-items', label: 'Lost Items', icon: Search },
        { href: '/found-items', label: 'Found Items', icon: Package },
        { href: '/matches', label: 'AI Potential Matches', icon: Sparkles, authOnly: true },
       // { href: '/user-dashboard/claims', label: 'Active Claims', icon: ClipboardList, authOnly: true },
        { href: '/about', label: 'About Us', icon: Info },
    ]

    const adminLinks = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/claims', label: 'Claims', icon: Shield },
        { href: '/admin/users', label: 'Users', icon: User },
    ]

    const getNavLinks = () => {
        if (isAdmin) return adminLinks;
        if (user) return userLinks;
        return userLinks.filter(link => !link.authOnly);
    }
    const navLinks = getNavLinks()

    return (
        <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-3 px-4 md:px-8 pointer-events-none">
            <nav className={`pointer-events-auto w-full max-w-7xl rounded-2xl transition-all duration-400 border border-white/10 ${
                scrolled 
                ? 'shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-[#1C2A59]/85 backdrop-blur-xl translate-y-0' 
                : 'shadow-lg bg-[#3E4A56]/90 backdrop-blur-md translate-y-1'
                }`}
                style={{
                    borderTop: '3px solid #F0A500'
                }}
            >
                <div className="px-3 sm:px-6">
                    <div className="flex items-center justify-between h-[68px]">
                        {/* Logo Area */}
                        <Link href={isAdmin ? '/admin/dashboard' : '/'} className="flex items-center gap-2 group mr-2">
                            <div className="bg-white px-3 py-2 rounded-xl shadow-sm transition-transform group-hover:scale-105">
                                <div className="font-bold tracking-tight flex items-center">
                                    <span style={{ color: '#1C2A59' }} className="text-lg">SLIIT</span>
                                    <span style={{ color: '#F0A500' }} className="mx-0.5 text-lg">UNI</span>
                                </div>
                            </div>
                            <div className="hidden sm:flex flex-col ml-1">
                                <span className="text-white text-sm font-bold tracking-wide leading-tight">Lost & Found</span>
                                
                            </div>
                        </Link>

                        {/* Desktop Nav Links (Centered) */}
                        <div className="hidden lg:flex items-center justify-center gap-1 flex-1 px-4">
                            {navLinks.map(({ href, label, icon: Icon }) => {
                                const active = pathname === href
                                return (
                                    <Link key={href} href={href}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs xl:text-sm font-extrabold transition-all duration-300 whitespace-nowrap ${active
                                            ? 'bg-white/10 text-white shadow-inner border border-white/5'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {label}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Right side Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            
                            {/* Premium Quick Action Button for Users (non-admin) */}
                            {!isAdmin && (
                                <Link 
                                    href="/lost-items/new" 
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
                                    style={{ background: 'linear-gradient(135deg, #F0A500 0%, #D89200 100%)', color: '#1C2A59' }}
                                >
                                    <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                                    <span>Report Item</span>
                                </Link>
                            )}

                            {/* Auth Controls */}
                            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                                {!loading && !user && (
                                    <>
                                        <Link href="/login" className="text-sm font-bold text-gray-200 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">Login</Link>
                                        <Link href="/register" className="text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors hover:opacity-90 bg-white text-[#1C2A59]">
                                            Register
                                        </Link>
                                    </>
                                )}
                                {!loading && user && (
                                    <>
                                        {!isAdmin && (
                                            <div className="flex items-center gap-2">
                                                <NotificationBell />
                                                <NotificationToast />
                                            </div>
                                        )}
                                        {/* User dropdown profile */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 transition-all group"
                                            >
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shadow-sm bg-white text-[#1C2A59] group-hover:scale-105 transition-transform">
                                                    {user.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex flex-col items-start ml-1 hidden lg:flex">
                                                    <span className="max-w-[100px] truncate text-white font-bold text-xs">{user.name}</span>
                                                </div>
                                                <ChevronDown size={14} className={`text-white transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            
                                            {dropdownOpen && (
                                                <div className="absolute right-0 mt-3 w-64 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden transform origin-top-right transition-all"
                                                    style={{ zIndex: 100, backgroundColor: '#FFFFFF' }}>
                                                    <div className="px-5 py-4 bg-[#F4F5F7] border-b border-gray-100 flex items-center gap-3">
                                                       <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center text-xl font-bold shadow-inner bg-[#1C2A59] text-white">
                                                            {user.name?.[0]?.toUpperCase()}
                                                       </div>
                                                       <div className="flex flex-col">
                                                           <span className="font-extrabold text-[#1C2A59] text-sm truncate w-[140px]">{user.name}</span>
                                                           <span className="text-[#008489] text-[11px] font-bold tracking-wide mt-0.5">{user.email || 'user@my.sliit.lk'}</span>
                                                       </div>
                                                    </div>

                                                    <div className="p-2 space-y-1">
                                                        {!isAdmin && (
                                                            <Link href="/user-dashboard" onClick={() => setDropdownOpen(false)}
                                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#3E4A56] hover:bg-[#F0A500]/10 hover:text-[#1C2A59] transition-colors">
                                                                <LayoutDashboard size={18} className="text-[#F0A500]" /> My Dashboard
                                                            </Link>
                                                        )}
                                                        {!isAdmin && (
                                                            <Link href="/messages" onClick={() => setDropdownOpen(false)}
                                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#3E4A56] hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                                                <Mail size={18} className="text-blue-500" /> Messages
                                                            </Link>
                                                        )}
                                                        {isAdmin && (
                                                            <Link href="/admin/messages" onClick={() => setDropdownOpen(false)}
                                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#3E4A56] hover:bg-purple-50 hover:text-purple-700 transition-colors">
                                                                <Mail size={18} className="text-purple-500" /> Conversations
                                                            </Link>
                                                        )}
                                                        <div className="border-t border-gray-100 my-1 mx-2" />
                                                        <button onClick={() => { logout(); setDropdownOpen(false) }}
                                                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                                                            <LogOut size={18} className="text-red-500" /> Sign Out
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile hamburger & Action */}
                        <div className="md:hidden flex items-center gap-3">
                            {user && !isAdmin && (
                                <Link href="/lost-items/new" className="p-2 rounded-full bg-[#F0A500] text-[#1C2A59] shadow-sm">
                                    <PlusCircle size={18} />
                                </Link>
                            )}
                            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors">
                                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu dropdown */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-white/10 bg-[#1C2A59]/95 backdrop-blur-xl rounded-b-2xl overflow-hidden shadow-2xl">
                        <div className="p-3 space-y-1">
                            {navLinks.map(({ href, label }) => (
                                <Link key={href} href={href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`block px-5 py-3.5 rounded-xl text-sm font-bold transition-colors ${pathname === href ? 'text-[#1C2A59] bg-[#F0A500]' : 'text-gray-200 hover:bg-white/10'}`}>
                                    {label}
                                </Link>
                            ))}
                        </div>
                        
                        <div className="p-4 bg-black/20 m-3 rounded-xl space-y-3 border border-white/5">
                            {!user ? (
                                <>
                                    <Link href="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center py-3 text-white border border-white/20 rounded-xl font-bold hover:bg-white/5 transition-colors">Login</Link>
                                    <Link href="/register" onClick={() => setMobileOpen(false)} className="block w-full text-center py-3 text-[#1C2A59] rounded-xl font-bold transform hover:scale-[1.02] transition-all" style={{ backgroundColor: '#F0A500' }}>Register</Link>
                                </>
                            ) : (
                                <>
                                    {!isAdmin && <Link href="/user-dashboard" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 text-white border border-white/20 hover:bg-white/10 rounded-xl font-bold transition-colors"><LayoutDashboard size={18} /> Dashboard</Link>}
                                    {!isAdmin && <Link href="/messages" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 text-white border border-white/20 hover:bg-white/10 rounded-xl font-bold transition-colors"><Mail size={18} /> Messages</Link>}
                                    {isAdmin && <Link href="/admin/messages" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 text-white border border-white/20 hover:bg-white/10 rounded-xl font-bold transition-colors"><Mail size={18} /> Conversations</Link>}
                                    <button onClick={() => { logout(); setMobileOpen(false) }} className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/20 text-red-400 rounded-xl font-bold border border-red-500/30 hover:bg-red-500/30 transition-colors"><LogOut size={18} /> Sign Out</button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </div>
    )
}
