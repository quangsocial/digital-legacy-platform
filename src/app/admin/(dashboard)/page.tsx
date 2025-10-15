import { DashboardStats } from '@/components/admin/DashboardStats'
import DashboardCharts from '@/components/admin/DashboardCharts'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600 mt-1">Tổng quan hệ thống Digital Legacy Platform</p>
      </div>

      {/* Statistics Cards - Real Data from Database */}
      <DashboardStats />

  {/* Charts and KPIs */}
  <DashboardCharts />

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Dashboard đang hiển thị dữ liệu thật</h4>
            <p className="text-blue-700 text-sm">
              Các số liệu trên được lấy trực tiếp từ database Supabase. Nếu database chưa có dữ liệu, các số sẽ hiển thị là 0.
            </p>
            <p className="text-blue-700 text-sm mt-2">
              Các trang <strong>Users</strong>, <strong>Orders</strong>, và <strong>Payments</strong> sẽ hiển thị dữ liệu thật từ database khi bạn truy cập.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
