'use client'

import { useEffect, useState } from 'react'

interface Stats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  totalMessages: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching stats:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-16"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Tổng người dùng</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {(stats?.totalUsers || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-4">Tổng số người dùng đã đăng ký</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Đơn hàng</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {(stats?.totalOrders || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-4">Tổng số đơn hàng</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Doanh thu</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {(stats?.totalRevenue || 0).toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-4">Doanh thu từ đơn hoàn thành</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Tin nhắn</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {(stats?.totalMessages || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-4">Tổng số tin nhắn</p>
      </div>
    </div>
  )
}
