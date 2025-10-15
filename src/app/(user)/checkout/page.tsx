'use client'

import { useState } from 'react'

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('bank')

  const orderItems = [
    { name: 'Gói Premium', price: 299000, quantity: 1 },
  ]

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin khách hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Phương thức thanh toán</h2>
              
              <div className="space-y-3">
                {/* Bank Transfer */}
                <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'bank' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏦</span>
                      <span className="font-semibold text-gray-800">Chuyển khoản ngân hàng</span>
                    </div>
                    {paymentMethod === 'bank' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
                        <p className="font-semibold text-gray-800 mb-2">Thông tin chuyển khoản:</p>
                        <p className="text-gray-600">Ngân hàng: <strong>Vietcombank</strong></p>
                        <p className="text-gray-600">STK: <strong>1234567890</strong></p>
                        <p className="text-gray-600">Chủ TK: <strong>NGUYEN VAN A</strong></p>
                        <p className="text-gray-600 mt-2">
                          Nội dung: <strong>DLP [Số điện thoại]</strong>
                        </p>
                      </div>
                    )}
                  </div>
                </label>

                {/* Momo */}
                <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'momo' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="momo"
                    checked={paymentMethod === 'momo'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-2xl">📱</span>
                  <span className="font-semibold text-gray-800">Ví MoMo</span>
                </label>

                {/* PayPal */}
                <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'paypal' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-2xl">💳</span>
                  <span className="font-semibold text-gray-800">PayPal</span>
                </label>

                {/* Crypto */}
                <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'crypto' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="crypto"
                    checked={paymentMethod === 'crypto'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-2xl">₿</span>
                  <span className="font-semibold text-gray-800">Cryptocurrency</span>
                </label>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1" required />
                <span className="text-sm text-gray-600">
                  Tôi đồng ý với{' '}
                  <a href="/terms" className="text-blue-600 hover:underline">
                    Điều khoản sử dụng
                  </a>{' '}
                  và{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">
                    Chính sách bảo mật
                  </a>
                </span>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Đơn hàng của bạn</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      {item.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Thuế VAT (10%)</span>
                  <span>{tax.toLocaleString('vi-VN')}đ</span>
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

              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                Hoàn tất thanh toán
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
                <span>🔒</span>
                <span>Thanh toán an toàn 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
