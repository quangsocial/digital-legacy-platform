'use client'

import { useState } from 'react'

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [admins, setAdmins] = useState<any[]>([])

  const createSuperAdmin = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_super_admin',
          email: 'quangsocial@gmail.com',
          password: '@gmail.com@'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create super admin')
        setResult(data)
      } else {
        setResult(data)
        // Fetch updated admin list
        fetchAdmins()
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Admin setup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin')
      const data = await response.json()
      
      if (response.ok) {
        setAdmins(data.admins || [])
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err)
    }
  }

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_super_admin',
          email,
          password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create admin')
      } else {
        setResult(data)
        setShowForm(false)
        fetchAdmins()
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👑</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Admin Setup
            </h1>
            <p className="text-gray-600">
              Tạo tài khoản Super Admin cho Digital Legacy Platform
            </p>
          </div>

          {/* Quick Setup Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-800 mb-4">Quick Setup - Super Admin</h3>
            <div className="text-sm text-blue-700 mb-4">
              <p><strong>Email:</strong> quangsocial@gmail.com</p>
              <p><strong>Password:</strong> @gmail.com@</p>
              <p><strong>Role:</strong> Super Administrator (toàn quyền)</p>
            </div>
            
            <button
              onClick={createSuperAdmin}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-6 rounded"
            >
              {loading ? 'Đang tạo...' : 'Tạo Super Admin'}
            </button>
          </div>

          {/* Manual Create Form */}
          <div className="mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
              {showForm ? 'Ẩn form' : 'Tạo admin khác'}
            </button>

            {showForm && (
              <form onSubmit={handleManualCreate} className="bg-gray-50 p-4 rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 bg-green-500 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-2 px-4 rounded"
                >
                  {loading ? 'Đang tạo...' : 'Tạo Admin'}
                </button>
              </form>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <div className="text-red-500 text-xl mr-2">❌</div>
                <h3 className="font-semibold text-red-800">Lỗi</h3>
              </div>
              <p className="text-red-700">{error}</p>
              {result?.details && (
                <p className="text-red-600 text-sm mt-2">Chi tiết: {result.details}</p>
              )}
            </div>
          )}

          {/* Manual Setup Instructions */}
          {result && result.manualSteps && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="text-yellow-500 text-2xl mr-3">📝</div>
                <h3 className="font-semibold text-yellow-800">Hướng dẫn thiết lập Manual</h3>
              </div>
              
              <p className="text-yellow-700 mb-4">
                Do chưa có Service Role Key, bạn cần thiết lập manual theo các bước sau:
              </p>

              <div className="space-y-3">
                <div className="bg-white rounded p-3 border-l-4 border-blue-500">
                  <p className="font-medium text-blue-800">Bước 1: Đăng ký tài khoản</p>
                  <p className="text-blue-700 text-sm">{result.manualSteps.step1}</p>
                  <a 
                    href="/login"
                    className="inline-block mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Đến trang đăng ký
                  </a>
                </div>

                <div className="bg-white rounded p-3 border-l-4 border-green-500">
                  <p className="font-medium text-green-800">Bước 2: Vào Supabase SQL Editor</p>
                  <p className="text-green-700 text-sm">{result.manualSteps.step2}</p>
                  <a 
                    href="https://supabase.com/dashboard/project/skkhbzrvzbsqebujlwcu/sql"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Mở SQL Editor
                  </a>
                </div>

                <div className="bg-white rounded p-3 border-l-4 border-purple-500">
                  <p className="font-medium text-purple-800">Bước 3: Chạy SQL Command</p>
                  <p className="text-purple-700 text-sm mb-2">{result.manualSteps.step3}</p>
                  <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                    UPDATE profiles SET role = 'super_admin' WHERE email = 'quangsocial@gmail.com';
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("UPDATE profiles SET role = 'super_admin' WHERE email = 'quangsocial@gmail.com';")
                      alert('SQL command đã được copy!')
                    }}
                    className="mt-2 bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Copy SQL
                  </button>
                </div>

                <div className="bg-white rounded p-3 border-l-4 border-orange-500">
                  <p className="font-medium text-orange-800">Bước 4: Đăng nhập lại</p>
                  <p className="text-orange-700 text-sm">{result.manualSteps.step4}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-blue-800 text-sm">
                  <strong>Lưu ý:</strong> Sau khi hoàn thành các bước trên, bạn sẽ thấy admin panel khi đăng nhập với tài khoản quangsocial@gmail.com
                </p>
              </div>
            </div>
          )}

          {/* Success Display */}
          {result && !error && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <div className="text-green-500 text-xl mr-2">✅</div>
                <h3 className="font-semibold text-green-800">Thành công!</h3>
              </div>
              <p className="text-green-700">{result.message}</p>
              {result.user && (
                <div className="mt-2 text-sm text-green-600">
                  <p>User ID: {result.user.id}</p>
                  <p>Email: {result.user.email}</p>
                  <p>Role: {result.user.role}</p>
                </div>
              )}
            </div>
          )}

          {/* Admin List */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Danh sách Admin</h3>
              <button
                onClick={fetchAdmins}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Refresh
              </button>
            </div>
            
            {admins.length > 0 ? (
              <div className="space-y-2">
                {admins.map((admin) => (
                  <div key={admin.id} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{admin.email}</p>
                        <p className="text-sm text-gray-600">
                          {admin.full_name} • {admin.role}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          admin.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Chưa có admin nào. Hãy tạo admin đầu tiên.
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="text-center space-x-4">
            <a 
              href="/login"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Đăng nhập Admin
            </a>
            <a 
              href="/"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Trang chủ
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}