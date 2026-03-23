'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ItemCard from '@/components/ui/ItemCard'
import { Search, Shield, Brain, Bell, LifeBuoy } from 'lucide-react'

export default function HomePage() {
    const [recentLost, setRecentLost] = useState([])

    useEffect(() => {
        fetch('/api/lost-items?page=1').then(r => r.json()).then(d => {
            setRecentLost(d.items?.slice(0, 3) || [])
        }).catch(() => { })
    }, [])

    return (
        <div style={{ backgroundColor: '#F4F5F7', minHeight: '100vh', position: 'relative' }}>
            <Navbar />

            {/* Horizontal Hero Section */}
            <section className="relative flex items-center min-h-[70vh] w-full"
                style={{
                    backgroundImage: 'url(/hero-bg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    marginTop: '60px' // Offset for fixed navbar
                }}>
                {/* Light Glass Overlay for readability but keeping the bright theme */}
                <div className="absolute inset-0 z-0 bg-white/70 backdrop-blur-[1px]"></div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 text-center sm:text-left pt-12 pb-20">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-[#1C2A59]/10 border border-[#1C2A59]/20 mb-6">
                        <span className="text-[#1C2A59] font-bold text-sm tracking-wide">🏆 Official Campus Tool</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[#1C2A59] tracking-tight">
                        Recover What <span style={{ color: '#F0A500' }}>Matters.</span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-12 max-w-2xl text-[#3E4A56] font-medium leading-relaxed">
                        Connect with SLIIT CourseWeb's dedicated AI-powered lost and found portal to retrieve your belongings securely.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5">
                        {/* Report Lost Item (SLIIT Gold) */}
                        <Link href="/lost-items/new"
                            className="group flex flex-1 sm:flex-none items-center justify-center gap-3 px-8 py-4 rounded shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                            style={{
                                backgroundColor: '#F0A500',
                                color: '#1C2A59',
                                fontWeight: '700'
                            }}>
                            <Search size={22} />
                            <span className="text-lg uppercase tracking-wide">Report Lost Item</span>
                        </Link>

                        {/* Upload Found Item (Navy Blue) */}
                        <Link href="/found-items/new"
                            className="group flex flex-1 sm:flex-none items-center justify-center gap-3 px-8 py-4 rounded shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                            style={{
                                backgroundColor: '#1C2A59',
                                color: '#FFFFFF',
                                fontWeight: '700'
                            }}>
                            <Shield size={22} />
                            <span className="text-lg uppercase tracking-wide">Upload Found Item</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Row (CourseWeb Style Blocks) */}
            <section className="relative z-20 -mt-10 mb-16 px-4 lg:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { label: 'Campus Items Found', value: '1,200+' },
                        { label: 'CourseWeb Integrated', value: 'Yes' },
                        { label: 'Verification Rate', value: '98%' },
                    ].map((s, idx) => (
                        <div key={idx} className="bg-white rounded p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                            <div className="text-3xl font-extrabold mb-1" style={{ color: '#1C2A59' }}>{s.value}</div>
                            <div className="text-sm font-semibold uppercase text-gray-500 tracking-wider">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-16 px-4 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-10 border-b-2 border-gray-200 pb-4">
                        <h2 className="text-2xl font-bold text-[#1C2A59] flex items-center gap-3">
                            <span className="w-2 h-6 bg-[#F0A500] inline-block rounded-sm"></span> 
                            Platform Capabilities
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Brain, title: 'Smart Matching', desc: 'Auto-connection between reports based on descriptions.' },
                            { icon: Shield, title: 'Student Identity', desc: 'Secure verification using your SLIIT IT number.' },
                            { icon: Bell, title: 'Instant Alerts', desc: 'Notifications synced seamlessly with your dashboard.' },
                            { icon: LifeBuoy, title: 'Admin Support', desc: 'Dedicated faculty assistance for dispute resolution.' },
                        ].map(({ icon: Icon, title, desc }, idx) => (
                            <div key={title} className="bg-white p-6 rounded shadow-sm border border-gray-200 hover:border-[#1C2A59]/30 transition-colors">
                                <div className="p-3 mb-4 rounded-full inline-flex" style={{ backgroundColor: '#F4F5F7', color: '#008489' }}>
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-[#3E4A56] mb-2">{title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent lost items (If any exist) */}
            {recentLost.length > 0 && (
                <section className="py-16 px-4 lg:px-8 bg-white border-t border-gray-200">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-[#1C2A59] flex items-center gap-3">
                                <span className="w-2 h-6 bg-[#008489] inline-block rounded-sm"></span> 
                                Active Lost Reports
                            </h2>
                            <Link href="/lost-items" className="text-sm font-bold tracking-wide hover:underline" style={{ color: '#008489' }}>
                                View All &rarr;
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {recentLost.map(item => (
                                <ItemCard key={item._id} item={item} type="lost" />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer matching CourseWeb */}
            <footer className="py-8 bg-[#3E4A56] text-center border-t-4 border-[#F0A500]">
                <p className="font-semibold text-sm text-white">
                    SLIIT UNI © 2026 The Knowledge University · CourseWeb Integrated System
                </p>
                <div className="mt-4 flex justify-center gap-6 text-sm text-gray-300">
                    <Link href="#" className="hover:text-white transition-colors">Support.SLIIT.lk</Link>
                    <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Student Manuals</Link>
                </div>
            </footer>
        </div>
    )
}
