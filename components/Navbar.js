'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
    Search, Bell, Menu, X, LogOut, User, LayoutDashboard,
    MapPin, Package, Shield, GraduationCap, ChevronDown
} from 'lucide-react'

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
       // { href: '/user-dashboard', label: 'User Dashboard', icon: LayoutDashboard }, // Added dashboard link
        { href: '/lost-items', label: 'Lost Items', icon: Search },
        { href: '/found-items', label: 'Found Items', icon: Package },
    ]

    const adminLinks = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/claims', label: 'Claims', icon: Shield },
        { href: '/admin/users', label: 'Users', icon: User },
    ]

    // Only show userLinks with dashboard if user is logged in, otherwise hide it.
    const getNavLinks = () => {
        if (isAdmin) return adminLinks;
        if (user) return userLinks;
        // Filter out User Dashboard for non-logged in users
        return userLinks.filter(link => link.href !== '/user-dashboard');
    }
    const navLinks = getNavLinks()

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? 'backdrop-blur-2xl border-b border-system-primary/20'
            : 'backdrop-blur-xl'
            }`}
            style={{
                background: scrolled
                    ? 'rgba(26, 26, 100, 0.95)' // Primary Blue (#1A1A64) base with opacity
                    : 'rgba(26, 26, 100, 0.8)',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={isAdmin ? '/admin/dashboard' : '/'} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg animate-pulse-glow"
                            style={{ background: 'linear-gradient(135deg, #F06414 0%, #D4AF37 100%)', boxShadow: '0 0 20px rgba(240, 100, 20, 0.4)' }}>
                            🎓
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-white font-bold text-sm tracking-tight">Smart Campus</span>
                            <span className="text-white/70 text-xs font-medium tracking-wider">LOST & FOUND</span>
                        </div>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ href, label, icon: Icon }) => {
                            const active = pathname === href
                            return (
                                <Link key={href} href={href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${active
                                        ? 'text-white border border-system-accent/50'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                    style={active ? { background: 'rgba(240, 100, 20, 0.2)', borderColor: 'rgba(240, 100, 20, 0.5)' } : {}}>
                                    <Icon size={15} />
                                    {label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-3">
                        {!loading && !user && (
                            <>
                                <Link href="/login" className="btn-glass text-sm px-4 py-2">Login</Link>
                                <Link href="/register" className="btn-glass-primary text-sm px-4 py-2" style={{ borderColor: '#F06414', background: 'rgba(240,100,20,0.2)', color: 'white' }}>Register</Link>
                            </>
                        )}
                        {!loading && user && (
                            <>
                                {!isAdmin && (
                                    <Link href="/lost-items/new" className="text-sm px-4 py-2 rounded-xl text-white font-semibold transition-all shadow-sm" style={{ background: '#F06414' }}>
                                        + Report Item
                                    </Link>
                                )}
                                {/* User dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 btn-glass text-sm px-3 py-2 border-white/20"
                                    >
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                                            style={{ background: 'linear-gradient(135deg, #1A1A64 0%, #F06414 100%)' }}>
                                            {user.name?.[0]?.toUpperCase()}
                                        </div>
                                        <span className="max-w-24 truncate text-white">{user.name}</span>
                                        {isAdmin && <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold bg-system-gold/20 text-system-gold border border-system-gold/30">Admin</span>}
                                        <ChevronDown size={14} className={`text-white transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 rounded-xl py-1 shadow-glass-lg border border-system-primary/20"
                                            style={{ zIndex: 100, background: '#1A1A64' }}>
                                            {!isAdmin && (
                                                <>
                                                    <Link href="/user-dashboard" onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/90 hover:text-white hover:bg-white/10 transition-colors">
                                                        <LayoutDashboard size={14} /> Dashboard
                                                    </Link>
                                                    
                                                </>
                                            )}
                                            <div className="border-t border-white/10 my-1" />
                                            <button onClick={() => { logout(); setDropdownOpen(false) }}
                                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors">
                                                <LogOut size={14} /> Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-colors">
                        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-white/10 py-4 px-4 space-y-1 animate-slide-up"
                    style={{ background: 'rgba(10,10,26,0.95)', backdropFilter: 'blur(20px)' }}>
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                            <Icon size={16} /> {label}
                        </Link>
                    ))}
                    <div className="border-t border-white/5 pt-3 mt-3 space-y-2">
                        {!user ? (
                            <>
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-glass w-full justify-center">Login</Link>
                                <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-glass-primary w-full justify-center">Register</Link>
                            </>
                        ) : (
                            <>
                                {!isAdmin && <Link href="/user-dashboard" onClick={() => setMobileOpen(false)} className="btn-glass w-full justify-center">Dashboard</Link>}
                                <button onClick={() => { logout(); setMobileOpen(false) }} className="btn-glass-danger w-full justify-center">Logout</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
