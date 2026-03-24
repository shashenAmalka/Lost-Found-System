'use client'
import Link from 'next/link'
import { Users, ChevronRight } from 'lucide-react'
import UserModerationPanel from '@/components/admin/UserModerationPanel'

export default function AdminUsersPage() {
    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 text-gray-400">
                    <Link href="/admin/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
                    <ChevronRight size={12} />
                    <span className="text-[#F0A500]">User Moderation</span>
                </div>
                <h2 className="text-2xl font-black text-[#1C2A59] flex items-center gap-3 tracking-wide">
                    <Users size={24} className="text-[#F0A500]" />
                    User Moderation
                </h2>
                <p className="text-sm mt-1 font-medium text-gray-500">
                    Monitor, warn, and moderate student accounts · Issue warnings · Review appeals
                </p>
            </div>

            {/* Enhanced Moderation Panel */}
            <UserModerationPanel />
        </>
    )
}
