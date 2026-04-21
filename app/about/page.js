'use client'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import Footer from '@/components/Footer'
import {
    Brain, Shield, Users,
    CheckCircle2, Sparkles, Heart,
    Eye, Lock, Target, Code, Search, Zap
} from 'lucide-react'

export default function AboutPage() {
    const stats = [
        { value: '2026', label: 'Established', icon: CheckCircle2 },
        { value: 'AI', label: 'Powered Engine', icon: Brain },
        { value: '100%', label: 'Student Built', icon: Users },
    ]

    const teamValues = [
        { icon: Eye, title: 'Transparency', desc: 'Every claim is tracked and visible to both parties throughout the entire verification process.' },
        { icon: Lock, title: 'Security', desc: 'Student data is encrypted and only verified users can access the platform features.' },
        { icon: Zap, title: 'Speed', desc: 'AI matching runs in real-time, connecting lost and found reports within minutes of submission.' },
        { icon: Heart, title: 'Community', desc: 'Built by students, for students — fostering a culture of honesty and mutual support on campus.' },
    ]

    return (
        <div style={{ backgroundColor: '#F4F5F7', minHeight: '100vh' }}>
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-[#1C2A59]" style={{ marginTop: '80px' }}>
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                     <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/hero-bg.png')] bg-cover bg-center mix-blend-overlay"></div>
                     <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #F0A500, transparent)' }} />
                     <div className="absolute bottom-0 left-20 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #008489, transparent)' }} />
                </div>

                <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 border border-white/10 bg-white/5 backdrop-blur-md">
                        <Users size={16} className="text-[#F0A500]" />
                        <span className="text-white font-bold text-sm tracking-wide">About The Project</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight text-white max-w-4xl mx-auto">
                        Empowering the Campus Community Through <span style={{ color: '#F0A500' }}>Technology</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
                        We are a team of passionate SLIIT students who built the Smart Campus Lost & Found System to solve a real-world problem using AI and modern web technologies.
                    </p>
                </div>
            </section>

            {/* Stats Row */}
            <section className="relative -mt-12 z-20 px-4 lg:px-8 mb-20">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((stat, i) => {
                            const Icon = stat.icon
                            return (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 flex items-center gap-5 transform transition-all duration-300 hover:-translate-y-1">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#F4F5F7' }}>
                                        <Icon size={26} className="text-[#008489]" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-extrabold text-[#1C2A59]">{stat.value}</div>
                                        <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-16 px-4 lg:px-8 bg-white border-y border-gray-100">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#008489] mb-4 block">The Origin</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1C2A59] mb-6 leading-tight">
                            Born out of a <br />
                            <span style={{ color: '#F0A500' }}>Campus Necessity</span>
                        </h2>
                        <div className="space-y-4 text-lg text-[#3E4A56] leading-relaxed">
                            <p>
                                Every semester, an untold number of valuable items—laptops, hard drives, student IDs, and wallets—are misplaced across the vast SLIIT campus.
                            </p>
                            <p>
                                Traditional methods of recovery, like checking with security desks or posting on disconnected social media groups, were highly inefficient and often frustrating for students.
                            </p>
                            <p className="font-semibold text-[#1C2A59] border-l-4 border-[#F0A500] pl-4">
                                "We realized that as IT students, we had the skills to build a centralized, intelligent solution to make belongings recovery effortless."
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#F0A500] rounded-3xl translate-x-4 translate-y-4 opacity-20"></div>
                        <div className="bg-[#1C2A59] rounded-3xl p-8 relative z-10 shadow-xl overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full"></div>
                             <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-tr-full"></div>
                             
                             <Target size={40} className="text-[#F0A500] mb-6" />
                             <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                             <p className="text-gray-300 leading-relaxed mb-6">
                                 To create a seamless, stress-free campus environment where losing an item doesn't mean it's gone forever. We imagine a community empowered by trust and state-of-the-art tech.
                             </p>
                             
                             <hr className="border-white/10 mb-6" />
                             
                             <Code size={30} className="text-[#008489] mb-4" />
                             <h3 className="text-xl font-bold text-white mb-4">The IT Project Management (ITPM) Module</h3>
                             <p className="text-gray-300 leading-relaxed">
                                 This platform was initiated as a comprehensive project under the ITPM module, applying Agile methodologies, rigorous system design, and collaborative development.
                             </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-24 px-4 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#008489] mb-3 block">Principles</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1C2A59]">
                            Our Core <span style={{ color: '#F0A500' }}>Values</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamValues.map((v, i) => {
                            const Icon = v.icon
                            return (
                                <div key={i} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:bg-[#1C2A59] bg-[#F4F5F7]">
                                        <Icon size={28} className="text-[#F0A500]" />
                                    </div>
                                    <h4 className="font-bold text-xl text-[#1C2A59] mb-3">{v.title}</h4>
                                    <p className="text-gray-500 leading-relaxed">{v.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

             {/* Tech Stack Banner */}
             <section className="py-16 bg-[#F0A500] px-4 lg:px-8">
                 <div className="max-w-6xl mx-auto text-center">
                     <h2 className="text-2xl md:text-3xl font-extrabold text-[#1C2A59] mb-8">Powered by Modern Web Technologies</h2>
                     <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-80 transition-all duration-500">
                         <span className="text-xl font-bold text-[#1C2A59]">Next.js</span>
                         <span className="text-xl font-bold text-[#1C2A59]">React</span>
                         <span className="text-xl font-bold text-[#1C2A59]">Node.js</span>
                         <span className="text-xl font-bold text-[#1C2A59]">MongoDB</span>
                         <span className="text-xl font-bold text-[#1C2A59]">Tailwind CSS</span>
                     </div>
                 </div>
             </section>

             {/* Footer area CTA */}
             <section className="py-20 text-center px-4 lg:px-8 bg-white">
                 <div className="max-w-3xl mx-auto">
                     <Sparkles className="mx-auto mb-6 text-[#008489]" size={40} />
                     <h2 className="text-3xl font-extrabold text-[#1C2A59] mb-6">Experience the platform</h2>
                     <p className="text-lg text-gray-500 mb-8">Join thousands of students who are already using the system to recover their lost items.</p>
                     <div className="flex justify-center flex-wrap gap-4">
                        <Link href="/lost-items"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:-translate-y-0.5 transition-all bg-[#F0A500] text-[#1C2A59]">
                            <Search size={20} /> Browse Lost Items
                        </Link>
                         <Link href="/"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold border-2 border-[#1C2A59]/10 text-[#1C2A59] hover:bg-[#F4F5F7] transition-all">
                            Back to Home
                        </Link>
                     </div>
                 </div>
             </section>

            <Footer />
        </div>
    )
}
