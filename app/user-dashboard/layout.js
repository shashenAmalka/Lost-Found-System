import SidebarNav from '@/components/user-dashboard/SidebarNav'

export const metadata = {
    title: 'Dashboard - Smart Campus Lost & Found',
    description: 'Premium user dashboard for Smart Campus Lost & Found',
}

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen flex font-sans" style={{ backgroundColor: '#F4F5F7', color: '#1C2A59', position: 'relative', overflow: 'hidden' }}>
            {/* Sidebar Navigation */}
            <SidebarNav />

            {/* Main Content Workspace */}
            <main className="flex-1 flex flex-col md:ml-64 w-full min-h-screen relative z-10">
                {/* Mobile Header (visible only on small screens) */}
                <div className="md:hidden flex items-center justify-between p-4 border-b sticky top-0 z-40 bg-white/90 backdrop-blur-md border-gray-200">
                    <span className="font-bold text-lg text-[#1C2A59]">Smart Campus</span>
                    <button className="p-2 text-gray-500 hover:text-[#1C2A59] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                    </button>
                </div>

                {children}
            </main>
        </div>
    )
}
