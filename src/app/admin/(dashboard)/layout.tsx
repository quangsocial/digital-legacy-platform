import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export const metadata = {
  title: 'Admin Dashboard - Digital Legacy Platform',
  description: 'Quản lý hệ thống Digital Legacy Platform',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-8 surface-grad">
          {children}
        </main>
      </div>
    </div>
  )
}
