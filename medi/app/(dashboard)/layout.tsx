import Sidebar from '@/components/ui/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="overflow-x-hidden md:pl-64">
        <div className="min-h-screen p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
