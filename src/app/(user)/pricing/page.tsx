export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'Trải nghiệm cơ bản cho người dùng mới',
      features: [
        '1 người nhận',
        '5 tin nhắn',
        'Lưu trữ 100MB',
        'Hỗ trợ email cơ bản',
      ],
      cta: 'Bắt đầu miễn phí',
      highlight: false,
    },
    {
      name: 'Basic',
      price: '99,000',
      description: 'Phù hợp cho cá nhân và gia đình nhỏ',
      features: [
        '5 người nhận',
        '50 tin nhắn',
        'Lưu trữ 1GB',
        'Đính kèm hình ảnh & video',
        'Hỗ trợ ưu tiên',
        'Lên lịch gửi tin nhắn',
      ],
      cta: 'Chọn gói Basic',
      highlight: false,
    },
    {
      name: 'Premium',
      price: '299,000',
      description: 'Tối ưu cho gia đình lớn và doanh nghiệp',
      features: [
        'Không giới hạn người nhận',
        'Không giới hạn tin nhắn',
        'Lưu trữ 10GB',
        'Đính kèm mọi định dạng file',
        'Hỗ trợ 24/7',
        'Mã hóa dữ liệu nâng cao',
        'Sao lưu tự động',
        'Chia sẻ với nhiều admin',
      ],
      cta: 'Chọn gói Premium',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Liên hệ',
      description: 'Giải pháp tùy chỉnh cho tổ chức',
      features: [
        'Tất cả tính năng Premium',
        'Tùy chỉnh giao diện',
        'API riêng',
        'Đào tạo nhân viên',
        'Hỗ trợ dedicated',
        'SLA 99.9%',
        'Triển khai on-premise',
      ],
      cta: 'Liên hệ tư vấn',
      highlight: false,
    },
  ]

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Chọn gói phù hợp với bạn
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bảo vệ di sản số của bạn với các gói dịch vụ linh hoạt. 
            Tất cả các gói đều được mã hóa và bảo mật cao.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                plan.highlight ? 'ring-4 ring-blue-600' : ''
              }`}
            >
              {plan.highlight && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                  PHỔ BIẾN NHẤT
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6 min-h-[40px]">{plan.description}</p>
                
                <div className="mb-6">
                  {plan.price === 'Liên hệ' ? (
                    <div className="text-3xl font-bold text-gray-800">Liên hệ</div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                      {plan.price !== '0' && <span className="text-gray-600 ml-2">đ/tháng</span>}
                    </div>
                  )}
                </div>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.highlight
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {plan.cta}
                </button>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Câu hỏi thường gặp
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Tôi có thể đổi gói sau này không?
              </h3>
              <p className="text-gray-600 text-sm">
                Có, bạn có thể nâng cấp hoặc hạ cấp gói bất cứ lúc nào. 
                Chi phí sẽ được tính theo tỷ lệ.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Dữ liệu có an toàn không?
              </h3>
              <p className="text-gray-600 text-sm">
                Tất cả dữ liệu đều được mã hóa end-to-end và lưu trữ 
                trên server bảo mật cao.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Có hoàn tiền không?
              </h3>
              <p className="text-gray-600 text-sm">
                Chúng tôi có chính sách hoàn tiền trong vòng 30 ngày 
                nếu bạn không hài lòng.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Làm sao để liên hệ hỗ trợ?
              </h3>
              <p className="text-gray-600 text-sm">
                Bạn có thể liên hệ qua email, chat hoặc hotline 24/7 
                tùy theo gói đăng ký.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Bạn vẫn chưa chắc chắn? Hãy thử gói miễn phí trước!
          </p>
          <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg transition-colors">
            Bắt đầu dùng thử miễn phí
          </button>
        </div>
      </div>
    </div>
  )
}
