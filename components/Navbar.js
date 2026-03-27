'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
    Search, Bell, Menu, X, LogOut, User, LayoutDashboard,
    Package, Shield, GraduationCap, ChevronDown, Mail
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
    ]

    const adminLinks = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/claims', label: 'Claims', icon: Shield },
        { href: '/admin/users', label: 'Users', icon: User },
    ]

    const getNavLinks = () => {
        if (isAdmin) return adminLinks;
        if (user) return userLinks;
        return userLinks.filter(link => link.href !== '/user-dashboard');
    }
    const navLinks = getNavLinks()

    return (
        <>
            {/* Top Gold Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-[#F0A500] z-[60]" />

            <nav className={`fixed top-1 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}
                style={{ backgroundColor: '#3E4A56' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-[60px]">
                        {/* Logo Area */}
                        <Link href={isAdmin ? '/admin/dashboard' : '/'} className="flex items-center gap-3 bg-white px-3 py-1.5 rounded shadow-sm mr-4" style={{ height: '80%' }}>
                            <div className="font-bold text-xl tracking-tight flex items-center h-full">
                                <span style={{ color: '#1C2A59' }}>SLIIT</span>
                                <span style={{ color: '#F0A500' }} className="mx-1">UNI</span>
                                <span className="text-gray-300 mx-2 text-xl font-light">|</span>
                                <span style={{ color: '#1C2A59' }} className="text-lg">Lost & Found</span>
                            </div>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex items-center flex-1">
                            {navLinks.map(({ href, label, icon: Icon }) => {
                                const active = pathname === href
                                return (
                                    <Link key={href} href={href}
                                        className={`flex items-center gap-2 px-4 h-[60px] text-sm font-semibold transition-all duration-200 border-b-4 hover:bg-white/10 ${active
                                            ? 'text-white border-[#F0A500]'
                                            : 'text-gray-200 border-transparent hover:border-gray-400'
                                            }`}
                                    >
                                        {label}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Right side */}
                        <div className="hidden md:flex items-center gap-4">
                            {!loading && !user && (
                                <>
                                    <Link href="/login" className="text-sm font-semibold text-white hover:text-[#F0A500] transition-colors">Login</Link>
                                    <Link href="/register" className="text-sm font-semibold px-4 py-2 rounded shadow-sm transition-colors" style={{ backgroundColor: '#F0A500', color: '#1C2A59' }}>
                                        Register
                                    </Link>
                                </>
                            )}
                            {!loading && user && (
                                <>
                                    {!isAdmin && (
                                        <div className="flex items-center gap-3 mr-2">
                                            <NotificationBell />
                                            <NotificationToast />
                                        </div>
                                    )}
                                    {/* User dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className="flex items-center gap-2 text-sm px-2 py-1.5 rounded hover:bg-white/10 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
                                                style={{ backgroundColor: '#1C2A59' }}>
                                                {user.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex flex-col items-start ml-1 hidden lg:flex">
                                                <span className="text-xs text-gray-300 font-medium">Logged in user</span>
                                                <span className="max-w-[120px] truncate text-white font-semibold text-[13px]">{user.name}</span>
                                            </div>
                                            <ChevronDown size={14} className={`text-white transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        {dropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-64 rounded-md py-1 shadow-lg border border-gray-200"
                                                style={{ zIndex: 100, backgroundColor: '#FFFFFF' }}>
                                                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                                                   <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm"
                                                        style={{ backgroundColor: '#1C2A59' }}>
                                                        {user.name?.[0]?.toUpperCase()}
                                                   </div>
                                                   <div className="flex flex-col">
                                                       <span className="font-bold text-[#1C2A59] text-sm">{user.name}</span>
                                                       <span className="text-[#F0A500] text-xs font-semibold">{user.email || 'user@my.sliit.lk'}</span>
                                                   </div>
                                                </div>

                                                {!isAdmin && (
                                                    <Link href="/user-dashboard" onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#3E4A56] hover:bg-gray-50 transition-colors">
                                                        <LayoutDashboard size={16} /> Dashboard
                                                    </Link>
                                                )}
                                                {!isAdmin && (
                                                    <Link href="/messages" onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#3E4A56] hover:bg-gray-50 transition-colors">
                                                        <Mail size={16} /> Messages
                                                    </Link>
                                                )}
                                                {isAdmin && (
                                                    <Link href="/admin/messages" onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#3E4A56] hover:bg-gray-50 transition-colors">
                                                        <Mail size={16} /> Conversations
                                                    </Link>
                                                )}
                                                <div className="border-t border-gray-100 my-1" />
                                                <button onClick={() => { logout(); setDropdownOpen(false) }}
                                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                                    <LogOut size={16} /> Log Out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white hover:bg-white/10 rounded transition-colors">
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-gray-600 shadow-lg"
                        style={{ backgroundColor: '#3E4A56' }}>
                        {navLinks.map(({ href, label }) => (
                            <Link key={href} href={href}
                                onClick={() => setMobileOpen(false)}
                                className={`block px-4 py-4 text-sm font-semibold border-b border-gray-600 ${pathname === href ? 'text-[#F0A500] bg-white/5' : 'text-gray-200'}`}>
                                {label}
                            </Link>
                        ))}
                        <div className="p-4 space-y-3">
                            {!user ? (
                                <>
                                    <Link href="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2 text-white border border-white/20 rounded font-semibold">Login</Link>
                                    <Link href="/register" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2 text-[#1C2A59] rounded font-semibold" style={{ backgroundColor: '#F0A500' }}>Register</Link>
                                </>
                            ) : (
                                <>
                                    {!isAdmin && <Link href="/user-dashboard" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2 text-white border border-white/20 rounded font-semibold">Dashboard</Link>}
                                    {!isAdmin && <Link href="/messages" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2 text-white border border-white/20 rounded font-semibold">Messages</Link>}
                                    {isAdmin && <Link href="/admin/messages" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2 text-white border border-white/20 rounded font-semibold">Conversations</Link>}
                                    <button onClick={() => { logout(); setMobileOpen(false) }} className="block w-full py-2 bg-red-500/10 text-red-400 rounded font-semibold border border-red-500/20 text-center">Logout</button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    )
}
