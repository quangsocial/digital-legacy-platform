import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Digital Legacy Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tạo và lên lịch gửi tin nhắn, hình ảnh, video và thông tin quan trọng 
            đến người thân trong tương lai. Một di chúc số an toàn và thông minh.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-semibold text-gray-800 mb-2">Tạo Di chúc</h3>
              <p className="text-gray-600 text-sm">
                Viết tin nhắn, lưu hình ảnh và thông tin quan trọng
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="text-3xl mb-3">⏰</div>
              <h3 className="font-semibold text-gray-800 mb-2">Lên lịch gửi</h3>
              <p className="text-gray-600 text-sm">
                Đặt thời gian gửi tự động trong tương lai
              </p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <div className="text-3xl mb-3">�</div>
              <h3 className="font-semibold text-gray-800 mb-2">Nhắc nhở</h3>
              <p className="text-gray-600 text-sm">
                Nhận thông báo để có thể hủy nếu cần thiết
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="text-3xl mb-3">�</div>
              <h3 className="font-semibold text-gray-800 mb-2">Nhiều người nhận</h3>
              <p className="text-gray-600 text-sm">
                Gửi nội dung khác nhau cho từng người thân
              </p>
            </div>
          </div>

          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Link 
              href="/login"
              className="block md:inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              Bắt đầu tạo Di chúc
            </Link>
            <Link 
              href="/login"
              className="block md:inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              Đăng nhập
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-4">
              🔒 All messages are encrypted and stored securely. 
              We never store or log the content of your messages.
            </p>
            <div className="space-x-4">
              <a 
                href="/setup"
                className="text-blue-500 hover:text-blue-700 text-sm underline"
              >
                Cần thiết lập database? Click đây
              </a>
              <a 
                href="/admin-setup"
                className="text-red-500 hover:text-red-700 text-sm underline"
              >
                👑 Admin Setup
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}