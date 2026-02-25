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
        { href: '/lost-items', label: 'Lost Items', icon: Search },
        { href: '/found-items', label: 'Found Items', icon: Package },
    ]

    const adminLinks = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/claims', label: 'Claims', icon: Shield },
        { href: '/admin/users', label: 'Users', icon: User },
    ]

    const navLinks = isAdmin ? adminLinks : userLinks

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? 'backdrop-blur-2xl border-b border-white/10'
                : 'backdrop-blur-xl'
            }`}
            style={{
                background: scrolled
                    ? 'rgba(10, 10, 26, 0.85)'
                    : 'rgba(10, 10, 26, 0.6)',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={isAdmin ? '/admin/dashboard' : '/'} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg animate-pulse-glow"
                            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(6,182,212,0.8) 100%)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
                            🎓
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-white font-bold text-sm tracking-tight">Smart Campus</span>
                            <span className="text-white/50 text-xs font-medium tracking-wider">LOST & FOUND</span>
                        </div>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ href, label, icon: Icon }) => {
                            const active = pathname === href
                            return (
                                <Link key={href} href={href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${active
                                            ? 'text-white border border-white/20'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                    style={active ? { background: 'rgba(99,102,241,0.2)', borderColor: 'rgba(99,102,241,0.4)' } : {}}>
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
                                <Link href="/register" className="btn-glass-primary text-sm px-4 py-2">Register</Link>
                            </>
                        )}
                        {!loading && user && (
                            <>
                                {!isAdmin && (
                                    <Link href="/lost-items/new" className="btn-glass-cyan text-sm px-4 py-2">
                                        + Report Item
                                    </Link>
                                )}
                                {/* User dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 btn-glass text-sm px-3 py-2"
                                    >
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(6,182,212,0.8) 100%)' }}>
                                            {user.name?.[0]?.toUpperCase()}
                                        </div>
                                        <span className="max-w-24 truncate">{user.name}</span>
                                        {isAdmin && <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
                                            style={{ background: 'rgba(167,139,250,0.2)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.3)' }}>Admin</span>}
                                        <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl py-1 shadow-glass-lg"
                                            style={{ zIndex: 100 }}>
                                            {!isAdmin && (
                                                <>
                                                    <Link href="/user-dashboard" onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors">
                                                        <LayoutDashboard size={14} /> Dashboard
                                                    </Link>
                                                    <Link href="/profile" onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors">
                                                        <User size={14} /> Profile
                                                    </Link>
                                                </>
                                            )}
                                            <div className="border-t border-white/5 my-1" />
                                            <button onClick={() => { logout(); setDropdownOpen(false) }}
                                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors">
                                                <LogOut size={14} /> Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden btn-glass p-2">
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
