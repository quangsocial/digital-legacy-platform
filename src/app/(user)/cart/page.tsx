export default function CartPage() {
  // Mock cart items
  const cartItems = [
    {
      id: 1,
      plan: 'Premium',
      price: 299000,
      billing: 'monthly',
      quantity: 1,
    },
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Giỏ hàng của bạn</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">🛒</span>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-6">
              Hãy chọn một gói dịch vụ phù hợp với bạn
            </p>
            <a
              href="/pricing"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Xem bảng giá
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Gói {item.plan}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Thanh toán: {item.billing === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}
                      </p>
                      <p className="text-lg font-bold text-blue-600 mt-2">
                        {item.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                          +
                        </button>
                      </div>
                      
                      <button className="text-red-500 hover:text-red-700 p-2">
                        <span className="text-xl">🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupon */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Mã giảm giá</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors">
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Tổng đơn hàng</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-medium">{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Thuế VAT (10%)</span>
                    <span className="font-medium">{tax.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Giảm giá</span>
                    <span className="font-medium text-green-600">-0đ</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Tổng cộng</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {total.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                <a
                  href="/checkout"
                  className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg font-semibold transition-colors"
                >
                  Tiến hành thanh toán
                </a>

                <a
                  href="/pricing"
                  className="block w-full mt-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-center rounded-lg font-medium transition-colors"
                >
                  Tiếp tục mua hàng
                </a>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>🔒</span>
                    <span>Thanh toán an toàn và bảo mật</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
