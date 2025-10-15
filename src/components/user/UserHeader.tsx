'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function UserHeader() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Tính năng', href: '/#features' },
    { name: 'Bảng giá', href: '/pricing' },
    { name: 'Liên hệ', href: '/#contact' },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            <span className="text-xl font-bold text-gray-800">Digital Legacy</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <span className="text-xl">🛒</span>
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                0
              </span>
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Đăng nhập
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Bắt đầu ngay
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
