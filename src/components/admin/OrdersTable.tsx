'use client'

import { useEffect, useState } from 'react'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  plan: string
  amount: number
  status: string
  date: string
  billingCycle?: string
  subtotal?: number
  tax?: number
  discount?: number
  currency?: string
  planId?: string
  productVariantId?: string
  customerNotes?: string
  adminNotes?: string
  customerPhone?: string
  customerAddress?: string
}

interface OrdersTableProps {
  refreshTrigger?: number
}

export default function OrdersTable({ refreshTrigger }: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [editing, setEditing] = useState<Order | null>(null)
  const [editForm, setEditForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    admin_notes: '',
    customer_notes: '',
    subtotal: 0,
    tax: 0,
    discount: 0,
    currency: 'VND',
    status: 'new',
    product_variant_id: ''
  })
  const [products, setProducts] = useState<any[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const currencyOptions = [
    { code: 'VND', label: 'VND — Vietnamese Dong' },
    { code: 'USD', label: 'USD — US Dollar' },
    { code: 'EUR', label: 'EUR — Euro' },
    { code: 'JPY', label: 'JPY — Japanese Yen' },
    { code: 'GBP', label: 'GBP — British Pound' },
    { code: 'SGD', label: 'SGD — Singapore Dollar' },
    { code: 'AUD', label: 'AUD — Australian Dollar' },
  ] as const

  useEffect(() => {
    fetchOrders()
  }, [refreshTrigger])
  useEffect(() => {
    // Preload products for edit modal product selection
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data.products || [])
      } catch (e) {
        // ignore silently
      }
    }
    loadProducts()
  }, [])

  const onSelectProduct = (productId: string) => {
    const product = products.find((p: any) => p.id === productId)
    setVariants(product ? product.product_variants || [] : [])
    // reset variant selection
    setEditForm(f => ({ ...f, product_variant_id: '' }))
    setSelectedProductId(productId)
  }

  const onSelectVariant = (variantId: string) => {
    setEditForm(f => ({ ...f, product_variant_id: variantId }))
    const v = variants.find((vv: any) => vv.id === variantId)
    const price = Number(v?.price ?? 0)
    // Khi đổi gói, cập nhật giá tiền ngay
    setEditForm(f => ({ ...f, subtotal: price }))
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders')
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Không thể tải dữ liệu đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId)
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      // Refresh orders after update
      await fetchOrders()
      alert('✅ Cập nhật trạng thái đơn hàng thành công!')
    } catch (err) {
      console.error('Error updating order:', err)
      alert('❌ Không thể cập nhật trạng thái đơn hàng')
    } finally {
      setUpdating(null)
    }
  }

  const openEdit = (order: Order) => {
    setEditing(order)
    // try to infer current product by finding which product contains the order's variant
    let initialProductId = ''
    if (order.productVariantId && products.length) {
      const found = products.find((p:any) => (p.product_variants||[]).some((v:any)=>v.id===order.productVariantId))
      if (found) initialProductId = found.id
    }
    if (initialProductId) {
      setSelectedProductId(initialProductId)
      const product = products.find((p:any)=>p.id===initialProductId)
      setVariants(product ? product.product_variants || [] : [])
    } else {
      // fallback: first product
      if (products.length) {
        setSelectedProductId(products[0].id)
        setVariants(products[0].product_variants || [])
      }
    }
    setEditForm({
      customer_name: order.customerName || '',
      customer_email: order.customerEmail || '',
      customer_phone: order.customerPhone || '',
      customer_address: order.customerAddress || '',
      admin_notes: order.adminNotes || '',
      customer_notes: order.customerNotes || '',
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      discount: order.discount || 0,
      currency: order.currency || 'VND',
      status: order.status || 'new',
      product_variant_id: order.productVariantId || ''
    })
  }

  const submitEdit = async () => {
    if (!editing) return
    try {
      setUpdating(editing.id)
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing.id,
          customer_name: editForm.customer_name,
          customer_email: editForm.customer_email,
          customer_phone: editForm.customer_phone,
          customer_address: editForm.customer_address,
          admin_notes: editForm.admin_notes,
          customer_notes: editForm.customer_notes,
          subtotal: Number(editForm.subtotal),
          tax: Number(editForm.tax),
          discount: Number(editForm.discount),
          currency: editForm.currency,
          status: editForm.status,
          product_variant_id: editForm.product_variant_id
        })
      })
      if (!res.ok) throw new Error('Failed to update order')
      await fetchOrders()
      setEditing(null)
    } catch (e) {
      alert('❌ Không thể sửa đơn hàng')
    } finally {
      setUpdating(null)
    }
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return
    try {
      setUpdating(id)
      const res = await fetch(`/api/admin/orders?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete order')
      await fetchOrders()
      alert('🗑️ Đã xóa đơn hàng')
    } catch (e) {
      alert('❌ Không thể xóa đơn hàng')
    } finally {
      setUpdating(null)
    }
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    return statusFilter === '' || order.status === statusFilter
  })

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.amount, 0)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchOrders}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      new: { bg: 'bg-sky-100', text: 'text-sky-700', label: 'Mới' },
      draft: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Nháp' },
      pending_payment: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Chờ thanh toán' },
      confirmed: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Đã xác nhận' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Hoàn thành' },
      cancelled: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Đã hủy' },
      // fallback for legacy
      pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Chờ xử lý' },
      processing: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Đang xử lý' },
      refunded: { bg: 'bg-zinc-100', text: 'text-zinc-700', label: 'Hoàn tiền' },
    }
    const badge = map[status] || { bg: 'bg-zinc-100', text: 'text-zinc-700', label: status }
    return (
      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Chờ xử lý</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Doanh thu</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.totalRevenue.toLocaleString('vi-VN')}₫
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
            <option value="refunded">Hoàn tiền</option>
          </select>
          <button 
            onClick={() => setStatusFilter('')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Reset
          </button>
          <button 
            onClick={fetchOrders}
            className="ml-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng</h3>
          <p className="text-gray-600">
            {statusFilter 
              ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc.'
              : 'Chưa có đơn hàng nào trong hệ thống.'}
          </p>
        </div>
      )}

      {/* Orders Table */}
      {filteredOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gói
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-500">{order.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {order.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {order.amount.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(order)}
                        className="text-gray-700 hover:text-black disabled:opacity-50"
                        disabled={updating === order.id}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        disabled={updating === order.id}
                      >
                        Xóa
                      </button>
                      {order.status === 'new' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'pending_payment')}
                          disabled={updating === order.id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          Chờ thanh toán
                        </button>
                      )}
                      {order.status === 'pending_payment' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          disabled={updating === order.id}
                          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                        >
                          Xác nhận
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          disabled={updating === order.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Hoàn thành
                        </button>
                      )}
                      {(order.status === 'new' || order.status === 'pending_payment' || order.status === 'confirmed') && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          disabled={updating === order.id}
                          className="text-rose-600 hover:text-rose-900 disabled:opacity-50"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-4">
            <h3 className="text-base md:text-lg font-semibold mb-3">Sửa đơn hàng</h3>
            <div className="space-y-2">
              <input className="input !px-3 !py-2 text-sm bg-gray-50 text-gray-600" placeholder="Mã đơn hàng" value={editing?.orderNumber || ''} readOnly />
              <input className="input !px-3 !py-2 text-sm" placeholder="Tên khách"
                value={editForm.customer_name}
                onChange={(e) => setEditForm(f => ({...f, customer_name: e.target.value}))} />
              <input className="input !px-3 !py-2 text-sm" placeholder="Email"
                value={editForm.customer_email}
                onChange={(e) => setEditForm(f => ({...f, customer_email: e.target.value}))} />
              {/* Ghi chú đơn hàng (khách) đưa lên ngay dưới email */}
              <textarea className="input !px-3 !py-2 text-sm" placeholder="Ghi chú đơn hàng (khách)"
                value={editForm.customer_notes}
                onChange={(e) => setEditForm(f => ({...f, customer_notes: e.target.value}))} />
              {/* Chọn sản phẩm/gói gọn gàng */}
              <div className="grid grid-cols-1 gap-2">
                <select className="input !px-3 !py-2 text-sm" onChange={(e) => onSelectProduct(e.target.value)} value={selectedProductId}>
                  <option value="" disabled>Chọn sản phẩm</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <select className="input !px-3 !py-2 text-sm" value={editForm.product_variant_id} onChange={(e) => onSelectVariant(e.target.value)}>
                  <option value="">Chọn gói (variant)</option>
                  {variants.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.name} - {Number(v.price || 0).toLocaleString('vi-VN')}₫</option>
                  ))}
                </select>
              </div>
              {/* Giá và đơn vị tiền tệ trên cùng một hàng */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Giá tiền</label>
                  <input className="input !px-3 !py-2 text-sm" type="number" placeholder="Tổng tiền (Subtotal)"
                    value={editForm.subtotal}
                    onChange={(e) => setEditForm(f => ({...f, subtotal: Number(e.target.value)}))} />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Đơn vị tiền tệ</label>
                  <select className="input !px-3 !py-2 text-sm" value={editForm.currency}
                    onChange={(e) => setEditForm(f => ({...f, currency: e.target.value }))}>
                    {currencyOptions.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Trạng thái */}
              <div className="grid grid-cols-1 gap-2">
                <select className="input !px-3 !py-2 text-sm" value={editForm.status}
                  onChange={(e) => setEditForm(f => ({...f, status: e.target.value}))}>
                  <option value="new">Mới</option>
                  <option value="draft">Nháp</option>
                  <option value="pending_payment">Chờ thanh toán</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              {/* Thông tin liên hệ - có thể thu gọn */}
              <details className="rounded-xl border border-gray-200">
                <summary className="cursor-pointer select-none text-sm px-3 py-2 text-[var(--fg)]">Thông tin liên hệ</summary>
                <div className="p-3 space-y-2">
                  <input className="input !px-3 !py-2 text-sm" placeholder="SĐT"
                    value={editForm.customer_phone}
                    onChange={(e) => setEditForm(f => ({...f, customer_phone: e.target.value}))} />
                  <input className="input !px-3 !py-2 text-sm" placeholder="Địa chỉ"
                    value={editForm.customer_address}
                    onChange={(e) => setEditForm(f => ({...f, customer_address: e.target.value}))} />
                </div>
              </details>

              {/* Thuế & giảm giá (tùy chọn) */}
              <details className="rounded-xl border border-gray-200">
                <summary className="cursor-pointer select-none text-sm px-3 py-2 text-[var(--fg)]">Thuế và giảm giá (tùy chọn)</summary>
                <div className="p-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1">Thuế</label>
                    <input className="input !px-3 !py-2 text-sm" type="number" placeholder="Thuế"
                    value={editForm.tax}
                    onChange={(e) => setEditForm(f => ({...f, tax: Number(e.target.value)}))} />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1">Giảm giá</label>
                    <input className="input !px-3 !py-2 text-sm" type="number" placeholder="Giảm giá"
                    value={editForm.discount}
                    onChange={(e) => setEditForm(f => ({...f, discount: Number(e.target.value)}))} />
                  </div>
                </div>
              </details>

              {/* Ghi chú admin để xuống dưới cùng */}
              <textarea className="input !px-3 !py-2 text-sm" placeholder="Ghi chú admin"
                value={editForm.admin_notes}
                onChange={(e) => setEditForm(f => ({...f, admin_notes: e.target.value}))} />
            </div>
            {/* Footer with prominent total next to Save */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-right">
                <div className="text-[13px] text-gray-500 leading-tight">Tổng tiền</div>
                <div className="text-red-600 font-semibold text-lg leading-tight">
                  {Math.max(0, (Number(editForm.subtotal)||0) - (Number(editForm.discount)||0) + (Number(editForm.tax)||0)).toLocaleString('vi-VN')}
                  <span className="ml-1 text-xs align-middle text-red-500">{editForm.currency}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button className="btn btn-ghost border border-gray-200 text-sm" onClick={() => setEditing(null)}>Hủy</button>
                <button className="btn btn-primary text-sm" onClick={submitEdit} disabled={!!updating}>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
