'use client'

import { useState } from 'react'
import OrdersTable from '@/components/admin/OrdersTable'
import CreateOrderModal from '@/components/admin/CreateOrderModal'

export default function OrdersManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1) // Trigger refresh
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Quản lý đơn hàng</h2>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý tất cả đơn hàng</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            + Tạo đơn hàng
          </button>
          <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Info message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-blue-600 mr-3 text-xl">ℹ️</span>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Dữ liệu thật từ Database</h3>
            <p className="text-sm text-blue-700 mt-1">
              Trang này đang hiển thị dữ liệu thật từ API <code className="bg-blue-100 px-2 py-1 rounded">/api/admin/orders</code>. Bạn có thể cập nhật trạng thái đơn hàng trực tiếp.
            </p>
          </div>
        </div>
      </div>

      <OrdersTable refreshTrigger={refreshKey} />

      <CreateOrderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
