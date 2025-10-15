'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { 
    title: 'Dashboard', 
    icon: '📊', 
    href: '/admin' 
  },
  { 
    title: 'Quản lý người dùng', 
    icon: '👥', 
    href: '/admin/users' 
  },
  { 
    title: 'Quản lý đơn hàng', 
    icon: '📦', 
    href: '/admin/orders' 
  },
  { 
    title: 'Quản lý thanh toán', 
    icon: '💰', 
    href: '/admin/payments' 
  },
  { 
    title: 'Phương thức thanh toán', 
    icon: '💳', 
    href: '/admin/payment-methods' 
  },
  { 
    title: 'Quản lý trang', 
    icon: '📄', 
    href: '/admin/pages' 
  },
  { 
    title: 'Cài đặt hệ thống', 
    icon: '⚙️', 
    href: '/admin/settings' 
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-72 bg-white/90 border-r border-gray-200 min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <span>👑</span>
          <span>Super Admin</span>
        </h2>
        <p className="text-sm text-[var(--muted)] mt-1">Digital Legacy Platform</p>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'text-[var(--fg)] hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-10 pt-6 border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--fg)] hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl">🏠</span>
          <span className="font-medium">Về trang chủ</span>
        </Link>
      </div>
    </aside>
  )
}
