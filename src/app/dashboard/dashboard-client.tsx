'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    role?: string
  }
}

interface UserProfile {
  role: string
  full_name: string | null
}

interface DashboardClientProps {
  user: User
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState({
    totalMessages: 0,
    scheduled: 0,
    recipients: 0,
    sent: 0
  })
  const [recentMessages, setRecentMessages] = useState<any[]>([])

  useEffect(() => {
    fetchProfile()
    fetchStats()
    fetchRecentMessages()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
    }
  }

  const fetchStats = async () => {
    try {
      // Get total messages
      const { count: totalCount } = await supabase
        .from('legacy_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get scheduled messages
      const { count: scheduledCount } = await supabase
        .from('legacy_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'scheduled')

      // Get sent messages
      const { count: sentCount } = await supabase
        .from('legacy_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'sent')

      // Get recipients
      const { count: recipientsCount } = await supabase
        .from('recipients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setStats({
        totalMessages: totalCount || 0,
        scheduled: scheduledCount || 0,
        sent: sentCount || 0,
        recipients: recipientsCount || 0
      })
    } catch (err) {
      console.error('Stats fetch error:', err)
    }
  }

  const fetchRecentMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('legacy_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setRecentMessages(data || [])
    } catch (err) {
      console.error('Recent messages fetch error:', err)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
  const isSuperAdmin = profile?.role === 'super_admin'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Digital Legacy Platform
                {isAdmin && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                    {isSuperAdmin ? '👑 Super Admin' : '🛡️ Admin'}
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-600">
                Chào mừng, {profile?.full_name || user.user_metadata?.full_name || user.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="bg-red-500 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-2 px-4 rounded"
            >
              {loading ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Admin Panel */}
          {isAdmin && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-red-800 mb-4">
                {isSuperAdmin ? '👑 Super Admin Panel' : '🛡️ Admin Panel'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded border">
                  <h3 className="font-semibold mb-2">Quản lý Users</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Xem và quản lý tất cả người dùng
                  </p>
                  <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">
                    Manage Users
                  </button>
                </div>
                
                <div className="bg-white p-4 rounded border">
                  <h3 className="font-semibold mb-2">Thống kê System</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Xem báo cáo và analytics
                  </p>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
                    View Stats
                  </button>
                </div>

                {isSuperAdmin && (
                  <div className="bg-white p-4 rounded border">
                    <h3 className="font-semibold mb-2">Admin Management</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Tạo và quản lý admin khác
                    </p>
                    <a 
                      href="/admin-setup"
                      className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm inline-block"
                    >
                      Manage Admins
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📝</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Tin nhắn đã tạo
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalMessages}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">⏰</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Đang chờ gửi
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.scheduled}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">👥</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Người nhận
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.recipients}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">✅</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Đã gửi
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.sent}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a href="/messages/create" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow block">
              <div className="p-6">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tạo Tin nhắn Di sản
                </h3>
                <p className="text-gray-600 mb-4">
                  Tạo tin nhắn, hình ảnh hoặc thông tin quan trọng để gửi trong tương lai
                </p>
                <div className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center">
                  Tạo mới
                </div>
              </div>
            </a>

            <a href="/recipients" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow block">
              <div className="p-6">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Quản lý Người nhận
                </h3>
                <p className="text-gray-600 mb-4">
                  Thêm và quản lý danh sách người thân sẽ nhận tin nhắn của bạn
                </p>
                <div className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center">
                  Quản lý
                </div>
              </div>
            </a>

            <a href="/messages" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow block">
              <div className="p-6">
                <div className="text-4xl mb-4">💌</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Xem Tin nhắn
                </h3>
                <p className="text-gray-600 mb-4">
                  Xem và quản lý tất cả tin nhắn di sản đã tạo
                </p>
                <div className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-center">
                  Xem tất cả
                </div>
              </div>
            </a>
          </div>

          {/* Recent Messages */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Tin nhắn gần đây
                </h3>
                <a href="/messages" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Xem tất cả →
                </a>
              </div>
              <div className="p-6">
                {recentMessages.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-4">📭</div>
                    <p>Chưa có tin nhắn nào. Hãy tạo tin nhắn di sản đầu tiên của bạn!</p>
                    <a href="/messages/create" className="inline-block mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded">
                      Tạo tin nhắn mới
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentMessages.map((message) => (
                      <a
                        key={message.id}
                        href={`/messages/${message.id}`}
                        className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">
                                {message.content_type === 'text' && '📝'}
                                {message.content_type === 'image' && '🖼️'}
                                {message.content_type === 'video' && '🎥'}
                                {message.content_type === 'financial' && '💰'}
                                {message.content_type === 'document' && '📄'}
                              </span>
                              <h4 className="font-semibold text-gray-900">{message.title}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                message.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                message.status === 'sent' ? 'bg-green-100 text-green-800' :
                                message.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {message.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              📅 Gửi vào: {new Date(message.scheduled_date).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                          <div className="text-gray-400">→</div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}