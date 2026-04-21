'use client'
import Link from 'next/link'
import { MapPin, Clock, Mail, Phone, ArrowUpRight, GraduationCap, Heart } from 'lucide-react'

export default function Footer() {
    const quickLinks = [
        { label: 'Home', href: '/' },
        { label: 'Lost Items', href: '/lost-items' },
        { label: 'Found Items', href: '/found-items' },
        { label: 'About Us', href: '/about' },
    ]

    const resourceLinks = [
        { label: 'How to Claim an Item', href: '/about#how-it-works' },
        { label: 'Report Guidelines', href: '/about' },
        { label: 'AI Matching System', href: '/about' },
        { label: 'Student Support', href: '/about' },
    ]

    return (
        <footer className="bg-[#1C2A59] text-white relative overflow-hidden">
            {/* Decorative top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-[#F0A500] via-[#008489] to-[#F0A500]" />

            {/* Main footer content */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="bg-white px-2.5 py-1.5 rounded-lg">
                                <span className="font-extrabold text-lg tracking-tight text-[#1C2A59]">SLIIT</span>
                                <span className="font-extrabold text-lg text-[#F0A500] ml-0.5">UNI</span>
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            The Smart Campus Lost & Found System — an AI-powered platform helping SLIIT students recover their belongings quickly and safely.
                        </p>
                        {/* <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>Made with</span>
                            <Heart size={12} className="text-red-400 fill-red-400" />
                            <span>by SLIIT Students</span>
                        </div> */}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F0A500] mb-5">Quick Links</h3>
                        <ul className="space-y-3">
                            {quickLinks.map(link => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-gray-300 text-sm font-medium hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                                        <span className="w-1 h-1 rounded-full bg-[#008489] group-hover:bg-[#F0A500] transition-colors" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F0A500] mb-5">Resources</h3>
                        <ul className="space-y-3">
                            {resourceLinks.map(link => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-gray-300 text-sm font-medium hover:text-white transition-all inline-flex items-center gap-1.5 group">
                                        <span className="w-1 h-1 rounded-full bg-[#008489] group-hover:bg-[#F0A500] transition-colors" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact / Office Info */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F0A500] mb-5">Lost & Found Office</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin size={14} className="text-[#F0A500]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white font-semibold">Main Building, Ground Floor</p>
                                    <p className="text-xs text-gray-400">SLIIT Malabe Campus</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                    <Clock size={14} className="text-[#F0A500]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white font-semibold">Mon – Fri: 8:30 AM – 5:00 PM</p>
                                    <p className="text-xs text-gray-400">Closed on public holidays</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                    <Mail size={14} className="text-[#F0A500]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white font-semibold">lostandfound@sliit.lk</p>
                                    <p className="text-xs text-gray-400">We respond within 24 hours</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                    <Phone size={14} className="text-[#F0A500]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white font-semibold">+94 11 754 4801</p>
                                    <p className="text-xs text-gray-400">Ext: 1234</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-gray-400 text-xs font-medium">
                        © {new Date().getFullYear()} SLIIT UNI — Sri Lanka Institute of Information Technology. All rights reserved.
                    </p>
                    <div className="flex items-center gap-5 text-xs text-gray-400 font-medium">
                        <Link href="#" className="hover:text-[#F0A500] transition-colors">Privacy Policy</Link>
                        <span className="text-gray-600">·</span>
                        <Link href="#" className="hover:text-[#F0A500] transition-colors">Terms of Use</Link>
                        <span className="text-gray-600">·</span>
                        <Link href="https://www.sliit.lk" target="_blank" className="hover:text-[#F0A500] transition-colors inline-flex items-center gap-1">
                            SLIIT.lk <ArrowUpRight size={10} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Decorative background elements */}
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle, #F0A500, transparent)' }} />
            <div className="absolute top-0 left-0 w-60 h-60 rounded-full opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle, #008489, transparent)' }} />
        </footer>
    )
}
