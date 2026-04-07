'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import {
    Brain, Shield, Bell, Users, MapPin, Clock,
    CheckCircle2, Sparkles, GraduationCap, Heart,
    ArrowRight, Star, Zap, Eye, Lock, MessageCircle
} from 'lucide-react'

export default function AboutPage() {
    const [activeFeature, setActiveFeature] = useState(0)
    const [statsVisible, setStatsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setStatsVisible(true), 300)
        return () => clearTimeout(timer)
    }, [])

    // Auto-rotate features
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature(prev => (prev + 1) % 4)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    const features = [
        {
            icon: Brain,
            title: 'AI-Powered Matching',
            description: 'Our intelligent algorithms analyze item descriptions, colors, brands, and locations to automatically connect lost and found reports — saving you hours of manual searching.',
            color: '#8B5CF6',
            bgColor: '#8B5CF6'
        },
        {
            icon: Shield,
            title: 'Verified Identity System',
            description: 'Every claim is verified through SLIIT student ID authentication. Only legitimate owners can retrieve items, ensuring security and trust across the platform.',
            color: '#1C2A59',
            bgColor: '#1C2A59'
        },
        {
            icon: Bell,
            title: 'Real-time Notifications',
            description: 'Get instant alerts when a potential match is found for your lost item. Stay informed with real-time updates on your claim status and admin decisions.',
            color: '#F0A500',
            bgColor: '#F0A500'
        },
        {
            icon: MessageCircle,
            title: 'Direct Messaging',
            description: 'Communicate directly with finders or claimants through our built-in messaging system. Coordinate item handovers safely within the campus network.',
            color: '#008489',
            bgColor: '#008489'
        }
    ]

    const stats = [
        { value: '1,200+', label: 'Items Recovered', icon: CheckCircle2 },
        { value: '98%', label: 'Verification Rate', icon: Shield },
        { value: '< 24h', label: 'Average Match Time', icon: Clock },
        { value: '5,000+', label: 'Active Users', icon: Users },
    ]

    const teamValues = [
        { icon: Eye, title: 'Transparency', desc: 'Every claim is tracked and visible to both parties throughout the entire verification process.' },
        { icon: Lock, title: 'Security', desc: 'Student data is encrypted and only verified users can access the platform features.' },
        { icon: Zap, title: 'Speed', desc: 'AI matching runs in real-time, connecting lost and found reports within minutes of submission.' },
        { icon: Heart, title: 'Community', desc: 'Built by students, for students — fostering a culture of honesty and mutual support on campus.' },
    ]

    const howItWorks = [
        { step: '01', title: 'Report', desc: 'Submit a lost or found item report with details like description, location, and photos.' },
        { step: '02', title: 'AI Match', desc: 'Our AI engine scans all reports and identifies potential matches based on multiple criteria.' },
        { step: '03', title: 'Verify', desc: 'Prove ownership by providing identifying details — brand, color, hidden marks, or serial numbers.' },
        { step: '04', title: 'Recover', desc: 'Once verified by admin, coordinate pickup at the campus Lost & Found office.' },
    ]

    return (
        <div style={{ backgroundColor: '#F4F5F7', minHeight: '100vh' }}>
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden" style={{ paddingTop: '100px' }}>
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #F0A500, transparent)' }} />
                    <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #1C2A59, transparent)' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #008489, transparent)' }} />
                </div>

                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 md:py-24 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 border border-[#1C2A59]/10" style={{ backgroundColor: 'white' }}>
                            <GraduationCap size={16} className="text-[#F0A500]" />
                            <span className="text-[#1C2A59] font-bold text-sm tracking-wide">SLIIT Smart Campus Initiative</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-[#1C2A59]">
                            Reuniting Students
                            <br />
                            <span className="relative inline-block">
                                <span style={{ color: '#F0A500' }}>With What Matters</span>
                                <svg className="absolute -bottom-2 left-0 w-full h-3 opacity-30" viewBox="0 0 300 12" preserveAspectRatio="none">
                                    <path d="M0,6 Q75,0 150,6 T300,6" stroke="#F0A500" strokeWidth="3" fill="none" />
                                </svg>
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-[#3E4A56] font-medium leading-relaxed max-w-2xl mx-auto mb-12">
                            The Smart Campus Lost & Found System is an AI-powered platform designed exclusively for the SLIIT University community — making it faster, safer, and smarter to recover lost belongings.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/lost-items/new"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                                style={{ backgroundColor: '#F0A500', color: '#1C2A59' }}>
                                Report a Lost Item
                                <ArrowRight size={20} />
                            </Link>
                            <Link href="/found-items/new"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl bg-[#1C2A59] text-white">
                                Upload Found Item
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Animated Stats Bar */}
            <section className="relative -mt-4 z-20 px-4 lg:px-8 mb-20">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => {
                            const Icon = stat.icon
                            return (
                                <div key={i}
                                    className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center transform transition-all duration-700 ${statsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                                    style={{ transitionDelay: `${i * 150}ms` }}
                                >
                                    <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#F4F5F7' }}>
                                        <Icon size={22} className="text-[#008489]" />
                                    </div>
                                    <div className="text-3xl font-extrabold text-[#1C2A59] mb-1">{stat.value}</div>
                                    <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 px-4 lg:px-8 bg-white border-y border-gray-100">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#008489] mb-4 block">Our Mission</span>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1C2A59] mb-6 leading-tight">
                                Making campus belongings recovery
                                <span className="block" style={{ color: '#F0A500' }}>effortless & trustworthy</span>
                            </h2>
                            <p className="text-[#3E4A56] text-lg leading-relaxed mb-6">
                                Every semester, thousands of items are lost across the SLIIT campus — phones, laptops, ID cards, wallets, and more.
                                Our platform bridges the gap between those who find items and those who lost them, using cutting-edge AI technology and a trusted verification system.
                            </p>
                            <p className="text-[#3E4A56] leading-relaxed">
                                Built as part of the IT Project Management module (ITPM), this system represents a real-world solution to a real campus problem — developed by students who understand the frustration of losing something important.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="bg-[#F4F5F7] rounded-3xl p-8 border border-gray-100">
                                <div className="space-y-5">
                                    {teamValues.map((v, i) => {
                                        const Icon = v.icon
                                        return (
                                            <div key={i} className="flex gap-4 items-start group cursor-default">
                                                <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors group-hover:bg-[#F0A500]/10"
                                                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                                                    <Icon size={18} className="text-[#F0A500]" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#1C2A59] text-sm mb-0.5">{v.title}</h4>
                                                    <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Feature Showcase */}
            <section className="py-24 px-4 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#008489] mb-3 block">Platform Features</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1C2A59]">
                            Powered by <span style={{ color: '#F0A500' }}>Intelligence</span>
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                        {/* Feature selector cards */}
                        <div className="space-y-3">
                            {features.map((feature, i) => {
                                const Icon = feature.icon
                                const isActive = activeFeature === i
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setActiveFeature(i)}
                                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${isActive
                                            ? 'border-[#1C2A59]/20 bg-white shadow-lg scale-[1.02]'
                                            : 'border-transparent bg-white/50 hover:bg-white hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-all"
                                                style={{ backgroundColor: isActive ? feature.bgColor : '#F4F5F7' }}>
                                                <Icon size={22} className={isActive ? 'text-white' : 'text-gray-400'} />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-base mb-1 transition-colors ${isActive ? 'text-[#1C2A59]' : 'text-gray-500'}`}>
                                                    {feature.title}
                                                </h3>
                                                {isActive && (
                                                    <p className="text-sm text-[#3E4A56] leading-relaxed animate-fadeIn">
                                                        {feature.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {isActive && (
                                            <div className="mt-3 ml-16">
                                                <div className="h-1 rounded-full overflow-hidden bg-gray-100">
                                                    <div className="h-full rounded-full animate-progressBar" style={{ backgroundColor: feature.bgColor }} />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Feature visual preview */}
                        <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200 flex items-center justify-center min-h-[400px] relative"
                            style={{ background: `linear-gradient(135deg, ${features[activeFeature].bgColor}15, ${features[activeFeature].bgColor}05)` }}>
                            <div className="text-center p-10">
                                <div className="w-28 h-28 mx-auto mb-8 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-500"
                                    style={{ backgroundColor: features[activeFeature].bgColor }}>
                                    {(() => {
                                        const Icon = features[activeFeature].icon
                                        return <Icon size={50} className="text-white" />
                                    })()}
                                </div>
                                <h3 className="text-2xl font-extrabold text-[#1C2A59] mb-3">{features[activeFeature].title}</h3>
                                <p className="text-[#3E4A56] max-w-sm mx-auto leading-relaxed">{features[activeFeature].description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-4 lg:px-8 bg-[#1C2A59]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F0A500] mb-3 block">Process</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                            How It Works
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {howItWorks.map((step, i) => (
                            <div key={i} className="relative group">
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:-translate-y-1">
                                    <span className="text-5xl font-extrabold block mb-3" style={{ color: '#F0A500', opacity: 0.4 }}>{step.step}</span>
                                    <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                                {/* Connector line */}
                                {i < 3 && (
                                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[#F0A500]/30" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

          

            {/* CTA Section */}
            <section className="py-20 px-4 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#1C2A59' }}>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #F0A500, transparent)' }} />
                    <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #008489, transparent)' }} />
                </div>

                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <Sparkles className="mx-auto mb-6 text-[#F0A500]" size={40} />
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                        Lost something on campus?
                    </h2>
                    <p className="text-gray-300 text-lg mb-10 leading-relaxed">
                        Don't worry. Report it now and let our AI help you find it. It takes less than 2 minutes.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/lost-items/new"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:-translate-y-0.5 transition-all"
                            style={{ backgroundColor: '#F0A500', color: '#1C2A59' }}>
                            Report Lost Item <ArrowRight size={20} />
                        </Link>
                        <Link href="/"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold border-2 border-white/20 text-white hover:bg-white/10 transition-all">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 bg-[#3E4A56] text-center border-t-4 border-[#F0A500]">
                <p className="font-semibold text-sm text-white">
                    SLIIT UNI © 2026 The Knowledge University · CourseWeb Integrated System
                </p>
                <div className="mt-4 flex justify-center gap-6 text-sm text-gray-300">
                    <Link href="#" className="hover:text-white transition-colors">Support.SLIIT.lk</Link>
                    <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Student Manuals</Link>
                </div>
            </footer>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes progressBar {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
                .animate-progressBar {
                    animation: progressBar 4s linear forwards;
                }
            `}</style>
        </div>
    )
}
