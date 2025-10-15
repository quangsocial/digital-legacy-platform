import PaymentsTable from '@/components/admin/PaymentsTable'

export default function PaymentsManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Quản lý thanh toán</h2>
        <p className="text-gray-600 mt-1">Theo dõi tất cả giao dịch thanh toán</p>
      </div>

      {/* Info message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-blue-600 mr-3 text-xl">ℹ️</span>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Dữ liệu thật từ Database</h3>
            <p className="text-sm text-blue-700 mt-1">
              Trang này đang hiển thị dữ liệu thật từ API <code className="bg-blue-100 px-2 py-1 rounded">/api/admin/payments</code>. Bạn có thể xác nhận hoặc từ chối thanh toán.
            </p>
          </div>
        </div>
      </div>

      <PaymentsTable />
    </div>
  )
}
