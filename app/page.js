'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ItemCard from '@/components/ui/ItemCard'
import {
    Search, Shield, Brain, Bell, LifeBuoy, ArrowRight, CheckCircle2,
    MapPin, Clock, Users, Sparkles, ClipboardList, HelpCircle, Package
} from 'lucide-react'

export default function HomePage() {
    const [recentLost, setRecentLost] = useState([])
    const [recentFound, setRecentFound] = useState([])
    const [statsVisible, setStatsVisible] = useState(false)

    useEffect(() => {
        fetch('/api/lost-items?page=1').then(r => r.json()).then(d => {
            setRecentLost(d.items?.slice(0, 3) || [])
        }).catch(() => { })
        fetch('/api/found-items?page=1').then(r => r.json()).then(d => {
            setRecentFound(d.items?.slice(0, 3) || [])
        }).catch(() => { })
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => setStatsVisible(true), 200)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div style={{ backgroundColor: '#F4F5F7', minHeight: '100vh', position: 'relative' }}>
            <Navbar />

            {/* Hero Section */}
            <section className="relative flex items-center min-h-[75vh] w-full"
                style={{
                    backgroundImage: 'url(/hero-bg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    marginTop: '80px'
                }}>
                <div className="absolute inset-0 z-0 bg-white/70 backdrop-blur-[1px]"></div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 text-center sm:text-left pt-12 pb-24">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 border border-[#1C2A59]/10 mb-6 shadow-sm">
                        <Sparkles size={14} className="text-[#F0A500]" />
                        <span className="text-[#1C2A59] font-bold text-sm tracking-wide">AI-Powered Lost & Found Platform</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-[#1C2A59] tracking-tight leading-tight">
                        Recover What <span style={{ color: '#F0A500' }}>Matters.</span>
                    </h1>
                    <p className="text-lg md:text-xl mb-10 max-w-2xl text-[#3E4A56] font-medium leading-relaxed">
                        Lost something on campus? Our intelligent matching system connects lost and found reports automatically — helping SLIIT students recover their belongings faster than ever.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <Link href="/lost-items/new"
                            className="group flex items-center justify-center gap-3 px-8 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl font-bold text-lg"
                            style={{ backgroundColor: '#F0A500', color: '#1C2A59' }}>
                            <Search size={22} />
                            Report Lost Item
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/found-items/new"
                            className="group flex items-center justify-center gap-3 px-8 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl font-bold text-lg bg-[#1C2A59] text-white">
                            <Shield size={22} />
                            Upload Found Item
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Quick helpful hints */}
                    <div className="flex flex-wrap gap-4 text-sm text-[#3E4A56] font-medium">
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> Free for all SLIIT students</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> AI-powered matching</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> Secure identity verification</span>
                    </div>
                </div>
            </section>

            {/* Stats Row */}
            <section className="relative z-20 -mt-12 mb-16 px-4 lg:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Items Recovered', value: '1,200+', icon: CheckCircle2, color: '#008489' },
                        { label: 'Active Users', value: '5,000+', icon: Users, color: '#1C2A59' },
                        { label: 'Avg Match Time', value: '< 24h', icon: Clock, color: '#F0A500' },
                        { label: 'Verification Rate', value: '98%', icon: Shield, color: '#008489' },
                    ].map((s, idx) => {
                        const Icon = s.icon
                        return (
                            <div key={idx}
                                className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center transform transition-all duration-700 hover:shadow-xl hover:-translate-y-1 ${statsVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
                                style={{ transitionDelay: `${idx * 100}ms` }}>
                                <Icon size={22} className="mx-auto mb-2" style={{ color: s.color }} />
                                <div className="text-2xl md:text-3xl font-extrabold mb-1 text-[#1C2A59]">{s.value}</div>
                                <div className="text-xs font-bold uppercase text-gray-400 tracking-wider">{s.label}</div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* How It Works - Step by Step Guide */}
            <section className="py-20 px-4 lg:px-8 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#008489] mb-3 block">Getting Started</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1C2A59]">
                            How Does It <span style={{ color: '#F0A500' }}>Work?</span>
                        </h2>
                        <p className="text-[#3E4A56] mt-3 max-w-xl mx-auto">Follow these simple steps to report or recover your belongings</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { step: '01', title: 'Report', desc: 'Submit a detailed report with item description, location, and photos.', icon: ClipboardList, color: '#F0A500' },
                            { step: '02', title: 'AI Match', desc: 'Our AI scans all reports and identifies potential matches instantly.', icon: Brain, color: '#8B5CF6' },
                            { step: '03', title: 'Verify', desc: 'Prove your ownership with identifying details like brand, marks, or serial.', icon: Shield, color: '#1C2A59' },
                            { step: '04', title: 'Recover', desc: 'Once verified, pick up your item at the campus Lost & Found office.', icon: CheckCircle2, color: '#008489' },
                        ].map((item, i) => {
                            const Icon = item.icon
                            return (
                                <div key={i} className="relative group">
                                    <div className="bg-[#F4F5F7] rounded-2xl p-6 border border-gray-100 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                                        <span className="text-4xl font-extrabold block mb-3 opacity-20" style={{ color: item.color }}>{item.step}</span>
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: item.color + '15' }}>
                                            <Icon size={22} style={{ color: item.color }} />
                                        </div>
                                        <h3 className="text-[#1C2A59] font-bold text-lg mb-2">{item.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                    {i < 3 && (
                                        <div className="hidden md:block absolute top-1/2 -right-3 w-6 text-center text-gray-300 font-bold">→</div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Feature Grid - Platform Capabilities */}
            <section className="py-20 px-4 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#008489] mb-3 block">Platform Features</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1C2A59]">
                            Why Choose <span style={{ color: '#F0A500' }}>Smart Campus?</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Brain, title: 'Smart AI Matching', desc: 'Automatically connects lost and found reports using AI analysis of descriptions, categories, and locations.', color: '#8B5CF6' },
                            { icon: Shield, title: 'Secure Verification', desc: 'Multi-layer identity verification ensures only rightful owners can claim items. Protected by SLIIT student IDs.', color: '#1C2A59' },
                            { icon: Bell, title: 'Instant Notifications', desc: 'Real-time alerts when a potential match is found. Never miss an update on your claim status.', color: '#F0A500' },
                            { icon: LifeBuoy, title: 'Admin Support', desc: 'Dedicated campus admin team reviews claims and resolves disputes for a fair recovery process.', color: '#008489' },
                        ].map(({ icon: Icon, title, desc, color }, idx) => (
                            <div key={title} className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                                <div className="p-3 mb-5 rounded-xl inline-flex transition-colors" style={{ backgroundColor: color + '12' }}>
                                    <Icon size={24} style={{ color }} />
                                </div>
                                <h3 className="text-lg font-bold text-[#1C2A59] mb-2 group-hover:text-[#F0A500] transition-colors">{title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent Lost Items */}
            {recentLost.length > 0 && (
                <section className="py-16 px-4 lg:px-8 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500 mb-1 block">Needs Your Help</span>
                                <h2 className="text-2xl font-extrabold text-[#1C2A59] flex items-center gap-3">
                                    <span className="w-2 h-7 bg-red-500 inline-block rounded-sm"></span>
                                    Recently Lost Items
                                </h2>
                            </div>
                            <Link href="/lost-items" className="flex items-center gap-1.5 text-sm font-bold text-[#008489] hover:text-[#1C2A59] transition-colors group">
                                View All
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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

            {/* Recent Found Items */}
            {recentFound.length > 0 && (
                <section className="py-16 px-4 lg:px-8 bg-[#F4F5F7] border-t border-gray-100">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-green-600 mb-1 block">Waiting for Owners</span>
                                <h2 className="text-2xl font-extrabold text-[#1C2A59] flex items-center gap-3">
                                    <span className="w-2 h-7 bg-green-500 inline-block rounded-sm"></span>
                                    Recently Found Items
                                </h2>
                            </div>
                            <Link href="/found-items" className="flex items-center gap-1.5 text-sm font-bold text-[#008489] hover:text-[#1C2A59] transition-colors group">
                                View All
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {recentFound.map(item => (
                                <ItemCard key={item._id} item={item} type="found" />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Quick Help / FAQ Cards */}
            <section className="py-20 px-4 lg:px-8 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#008489] mb-3 block">Help Center</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1C2A59]">
                            Frequently Asked <span style={{ color: '#F0A500' }}>Questions</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { q: 'How do I report a lost item?', a: 'Click "Report Lost Item" in the navbar, fill in the details like description, category, location, and upload a photo if available. Our AI will start matching immediately.' },
                            { q: 'How does AI matching work?', a: 'Our system analyzes item descriptions, categories, colors, brands, and locations across all reports. When a potential match is found, both parties are notified instantly.' },
                            { q: 'How do I claim a found item?', a: 'Navigate to the Found Items page, find your item, and submit a claim with ownership proof — like identifying marks, brand details, or serial numbers.' },
                            { q: 'Is my data secure?', a: 'Absolutely. We use JWT authentication and all data is encrypted. Only verified SLIIT students can access the platform, and claims are reviewed by admin before approval.' },
                            { q: 'Where do I pick up my item?', a: 'Once your claim is approved, visit the Lost & Found Office at the Main Building, Ground Floor, SLIIT Malabe Campus during working hours (Mon-Fri 8:30 AM - 5:00 PM).' },
                            { q: 'Can I message the finder?', a: 'Yes! Our built-in messaging system lets you communicate directly with the person who found your item to coordinate details and verify ownership.' },
                        ].map((faq, i) => (
                            <div key={i} className="bg-[#F4F5F7] rounded-2xl p-6 border border-gray-100 hover:bg-white hover:shadow-md hover:border-gray-200 transition-all duration-300">
                                <div className="flex items-start gap-3 mb-3">
                                    <HelpCircle size={18} className="text-[#F0A500] shrink-0 mt-0.5" />
                                    <h3 className="text-[#1C2A59] font-bold text-sm">{faq.q}</h3>
                                </div>
                                <p className="text-gray-500 text-sm leading-relaxed ml-[30px]">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 lg:px-8 bg-[#1C2A59] relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #F0A500, transparent)' }} />
                    <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #008489, transparent)' }} />
                </div>
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <Sparkles className="mx-auto mb-5 text-[#F0A500]" size={36} />
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                        Don't see your item?
                    </h2>
                    <p className="text-gray-300 text-lg mb-10 leading-relaxed">
                        New items are reported every day. Submit a detailed lost report and our AI will keep searching for you — you'll be notified the moment a match is found.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/lost-items/new"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:-translate-y-0.5 transition-all"
                            style={{ backgroundColor: '#F0A500', color: '#1C2A59' }}>
                            Report Lost Item <ArrowRight size={20} />
                        </Link>
                        <Link href="/about"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold border-2 border-white/20 text-white hover:bg-white/10 transition-all">
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
