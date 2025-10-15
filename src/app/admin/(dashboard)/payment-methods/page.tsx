export default function PaymentMethodsManagement() {
  const paymentMethods = [
    { id: 1, name: 'Chuyển khoản ngân hàng', icon: '🏦', enabled: true, description: 'Thanh toán qua chuyển khoản ngân hàng' },
    { id: 2, name: 'PayPal', icon: '💳', enabled: true, description: 'Thanh toán qua PayPal' },
    { id: 3, name: 'Cryptocurrency', icon: '₿', enabled: false, description: 'Thanh toán bằng tiền mã hóa' },
    { id: 4, name: 'Momo', icon: '📱', enabled: true, description: 'Thanh toán qua ví MoMo' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Phương thức thanh toán</h2>
          <p className="text-gray-600 mt-1">Cấu hình các phương thức thanh toán</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          + Thêm phương thức
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{method.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{method.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={method.enabled} readOnly />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4">
                Cấu hình
              </button>
              <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bank Transfer Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Cấu hình chuyển khoản ngân hàng</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên ngân hàng</label>
            <input
              type="text"
              placeholder="Vietcombank"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số tài khoản</label>
            <input
              type="text"
              placeholder="1234567890"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên chủ tài khoản</label>
            <input
              type="text"
              placeholder="NGUYEN VAN A"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chi nhánh</label>
            <input
              type="text"
              placeholder="Hà Nội"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  )
}
