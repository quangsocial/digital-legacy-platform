import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-16">
            <div className="text-6xl mb-6">🔐</div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Digital Legacy Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Tạo và lên lịch gửi tin nhắn, hình ảnh, video và thông tin quan trọng 
              đến người thân trong tương lai. Một di chúc số an toàn và thông minh.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Bắt đầu tạo Di chúc
              </Link>
              <Link 
                href="/pricing"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 text-lg font-bold rounded-xl border-2 border-gray-300 transition-all transform hover:scale-105"
              >
                Xem bảng giá
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span>🔒</span>
              <span>Mã hóa end-to-end • An toàn tuyệt đối • Không lưu log</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Tính năng nổi bật</h2>
            <p className="text-xl text-gray-600">Giải pháp hoàn hảo cho di sản số của bạn</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:scale-105">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Tạo Di chúc</h3>
              <p className="text-gray-600">
                Viết tin nhắn, lưu hình ảnh, video và thông tin quan trọng một cách dễ dàng
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:scale-105">
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Lên lịch gửi</h3>
              <p className="text-gray-600">
                Đặt thời gian gửi tự động hoặc kích hoạt bằng các điều kiện đặc biệt
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:scale-105">
              <div className="text-5xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Nhắc nhở</h3>
              <p className="text-gray-600">
                Nhận thông báo định kỳ để xác nhận và có thể hủy nếu cần thiết
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:scale-105">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Nhiều người nhận</h3>
              <p className="text-gray-600">
                Gửi nội dung khác nhau cho từng người thân một cách riêng tư
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:scale-105">
              <div className="text-5xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Bảo mật cao</h3>
              <p className="text-gray-600">
                Mã hóa end-to-end, không ai có thể đọc nội dung ngoài người nhận
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:scale-105">
              <div className="text-5xl mb-4">☁️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Cloud Storage</h3>
              <p className="text-gray-600">
                Lưu trữ đám mây an toàn với khả năng sao lưu tự động
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:scale-105">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Đa nền tảng</h3>
              <p className="text-gray-600">
                Truy cập mọi lúc mọi nơi trên web, mobile, tablet
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:scale-105">
              <div className="text-5xl mb-4">🎥</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Đa phương tiện</h3>
              <p className="text-gray-600">
                Hỗ trợ text, hình ảnh, video, audio và mọi loại file
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-8 opacity-90">
            Tạo di chúc số của bạn ngay hôm nay. Miễn phí dùng thử 30 ngày!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Bắt đầu miễn phí
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 font-bold rounded-xl transition-all transform hover:scale-105"
            >
              Xem bảng giá
            </Link>
          </div>
        </div>
      </section>

      {/* Admin Link */}
      <section className="py-8 text-center">
        <a 
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          👑 Admin Login
        </a>
      </section>
    </div>
  )
}
