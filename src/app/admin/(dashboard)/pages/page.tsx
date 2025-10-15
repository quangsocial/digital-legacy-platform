export default function PagesManagement() {
  const pages = [
    { id: 1, name: 'Trang chủ', path: '/', status: 'Published', lastModified: '2024-10-10' },
    { id: 2, name: 'Trang Pricing', path: '/pricing', status: 'Published', lastModified: '2024-10-08' },
    { id: 3, name: 'Trang giỏ hàng', path: '/cart', status: 'Draft', lastModified: '2024-10-12' },
    { id: 4, name: 'Trang thanh toán', path: '/checkout', status: 'Published', lastModified: '2024-10-05' },
    { id: 5, name: 'Dashboard người dùng', path: '/dashboard', status: 'Published', lastModified: '2024-10-14' },
    { id: 6, name: 'Trang login', path: '/login', status: 'Published', lastModified: '2024-09-28' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Quản lý trang</h2>
          <p className="text-gray-600 mt-1">Tùy chỉnh giao diện các trang website</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          + Tạo trang mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên trang
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đường dẫn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cập nhật lần cuối
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">📄</span>
                    <div className="text-sm font-medium text-gray-900">{page.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{page.path}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    page.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {page.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {page.lastModified}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4">Chỉnh sửa</button>
                  <button className="text-green-600 hover:text-green-900 mr-4">Xem trước</button>
                  <button className="text-gray-600 hover:text-gray-900">Sao chép</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
