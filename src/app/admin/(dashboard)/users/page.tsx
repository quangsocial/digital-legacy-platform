'use client'

import { useState } from 'react'
import UsersTable from '@/components/admin/UsersTable'
import CreateUserModal from '@/components/admin/CreateUserModal'

export default function UsersManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1) // Trigger refresh
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Quản lý người dùng</h2>
          <p className="text-gray-600 mt-1">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          + Thêm người dùng
        </button>
      </div>

      {/* Info message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-blue-600 mr-3 text-xl">ℹ️</span>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Dữ liệu thật từ Database</h3>
            <p className="text-sm text-blue-700 mt-1">
              Trang này đang hiển thị dữ liệu thật từ API <code className="bg-blue-100 px-2 py-1 rounded">/api/admin/users</code>
            </p>
          </div>
        </div>
      </div>

      <UsersTable refreshTrigger={refreshKey} />

      <CreateUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
