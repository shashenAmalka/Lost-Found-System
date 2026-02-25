import SidebarNav from '@/components/user-dashboard/SidebarNav'

export const metadata = {
    title: 'Dashboard - Campus Find',
    description: 'User dashboard for Campus Find system',
}

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#F7F9F8] flex text-[#222222]">
            {/* Sidebar Navigation */}
            <SidebarNav />

            {/* Main Content Workspace */}
            <main className="flex-1 flex flex-col md:ml-64 w-full min-h-screen">
                {/* Mobile Header (visible only on small screens) */}
                <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
                    <span className="font-bold text-lg text-[#2F5D50]">Campus Find</span>
                    <button className="p-2 text-[#6B7280]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                    </button>
                </div>

                {children}
            </main>
        </div>
    )
}
