'use client'

import { useEffect, useState } from 'react'

interface Payment {
  id: string
  paymentNumber: string
  orderNumber: string
  customerName: string
  amount: number
  method: string
  status: string
  transactionId: string | null
  createdAt: string
  productVariantId?: string | null
  productName?: string | null
  variantName?: string | null
  notes?: string
  adminNotes?: string
}

export default function PaymentsTable() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [updating, setUpdating] = useState<string | null>(null)
  const [editing, setEditing] = useState<Payment | null>(null)
  const [editForm, setEditForm] = useState({
    amount: 0,
    payment_method: 'bank_transfer',
    transaction_id: '',
    notes: '',
    admin_notes: ''
  })
  const [markPaidId, setMarkPaidId] = useState<string | null>(null)
  const [markPaidForm, setMarkPaidForm] = useState({
    payment_method: 'bank_transfer',
    notes: '',
    file: null as File | null,
    proof_url: ''
  })

  useEffect(() => {
    fetchPayments()
    // preload products for filter
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data.products || [])
      } catch {}
    }
    loadProducts()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (methodFilter) params.set('method', methodFilter)
      if (productFilter) params.set('product_variant_id', productFilter)
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      if (q) params.set('q', q)
      const response = await fetch(`/api/admin/payments?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments')
      }

      const data = await response.json()
      setPayments(data.payments || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching payments:', err)
      setError('Không thể tải dữ liệu thanh toán')
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      setUpdating(paymentId)
      const response = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId, status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update payment')
      }

      await fetchPayments()
      alert('✅ Cập nhật trạng thái thanh toán thành công!')
    } catch (err) {
      console.error('Error updating payment:', err)
      alert('❌ Không thể cập nhật trạng thái thanh toán')
    } finally {
      setUpdating(null)
    }
  }

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    // Client-side refine for q if needed
    const matchesQ = !q || [payment.paymentNumber, payment.orderNumber, payment.customerName].some(v => (v||'').toLowerCase().includes(q.toLowerCase()))
    return matchesQ
  })

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
            onClick={fetchPayments}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string, text: string, label: string }> = {
      new: { bg: 'bg-sky-100', text: 'text-sky-700', label: 'Mới' },
      paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đã thanh toán' },
      refunded: { bg: 'bg-zinc-100', text: 'text-zinc-700', label: 'Hoàn tiền' },
    }
    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status }
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  const getMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      'credit_card': '💳',
      'bank_transfer': '🏦',
      'e_wallet': '📱',
      'crypto': '₿'
    }
    return icons[method] || '💰'
  }

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'credit_card': 'Thẻ tín dụng',
      'bank_transfer': 'Chuyển khoản',
      'e_wallet': 'Ví điện tử',
      'crypto': 'Tiền điện tử'
    }
    if (!method) return 'Chưa chọn'
    return labels[method] || method
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4">
        <div className="flex gap-4">
            <input 
              value={q} onChange={(e)=>setQ(e.target.value)}
              placeholder="Tìm: tên, mã đơn, mã bill"
              className="input flex-1"
            />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">Tất cả trạng thái</option>
              <option value="new">Mới</option>
            <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đang xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Hoàn tất</option>
            <option value="failed">Thất bại</option>
            <option value="refunded">Đã hoàn tiền</option>
              <option value="cancelled">Đã hủy</option>
          </select>
          <select 
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="input"
          >
            <option value="">Tất cả phương thức</option>
            <option value="bank_transfer">Chuyển khoản</option>
              <option value="momo">Ví MoMo</option>
            <option value="crypto">Tiền điện tử</option>
              <option value="paypal">PayPal</option>
          </select>
            <select 
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="input"
            >
              <option value="">Tất cả sản phẩm</option>
              {products.flatMap((p:any) => p.product_variants?.map((v:any) => (
                <option key={v.id} value={v.id}>{p.name} — {v.name}</option>
              )))}
            </select>
            <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="input" />
            <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="input" />
          <button 
            onClick={() => {
                setStatusFilter('')
                setMethodFilter('')
                setProductFilter('')
                setFrom(''); setTo(''); setQ('')
            }}
            className="btn btn-ghost border border-gray-200"
          >
            Reset
          </button>
          <button 
            onClick={fetchPayments}
            className="ml-auto btn btn-ghost border border-gray-200"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredPayments.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thanh toán</h3>
          <p className="text-gray-600">
            {statusFilter || methodFilter
              ? 'Không tìm thấy thanh toán phù hợp với bộ lọc.'
              : 'Chưa có thanh toán nào trong hệ thống.'}
          </p>
        </div>
      )}

      {/* Payments Table */}
      {filteredPayments.length > 0 && (
  <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương thức
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
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.paymentNumber}</div>
                    {payment.transactionId && (
                      <div className="text-xs text-gray-500">ID: {payment.transactionId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.orderNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {payment.amount.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <span className="mr-2">{getMethodIcon(payment.method)}</span>
                      {getMethodLabel(payment.method)}
                      {('proofUrl' in payment) && (payment as any).proofUrl && (
                        <a href={(payment as any).proofUrl} target="_blank" rel="noreferrer" className="ml-3 text-blue-600 hover:underline">Xem chứng từ</a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(payment)} className="text-gray-700 hover:text-black">Sửa</button>
                      {payment.status === 'new' && (
                        <button onClick={() => { setMarkPaidId(payment.id); setMarkPaidForm({ payment_method: 'bank_transfer', notes: '', file: null, proof_url: '' }) }} disabled={updating===payment.id} className="text-emerald-600 hover:text-emerald-900 disabled:opacity-50">Đánh dấu đã thanh toán</button>
                      )}
                      {payment.status === 'paid' && (
                        <button onClick={() => updatePaymentStatus(payment.id, 'refunded')} disabled={updating===payment.id} className="text-orange-600 hover:text-orange-900 disabled:opacity-50">Hoàn tiền</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {filteredPayments.length > 0 && (
  <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-soft border border-gray-100">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{filteredPayments.length}</span> trong tổng số <span className="font-medium">{payments.length}</span> thanh toán
          </div>
          <div className="text-sm font-medium text-gray-900">
            Tổng: <span className="text-lg text-green-600">
              {filteredPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Sửa thanh toán</h3>
            <div className="space-y-3">
              <input className="input bg-gray-50 text-gray-600" value={editing.paymentNumber} readOnly />
              <input className="input" type="number" placeholder="Số tiền"
                value={editForm.amount}
                onChange={(e)=>setEditForm(f=>({...f, amount: Number(e.target.value)}))} />
              <select className="input" value={editForm.payment_method} onChange={(e)=>setEditForm(f=>({...f, payment_method: e.target.value}))}>
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="momo">Ví MoMo</option>
                <option value="paypal">PayPal</option>
                <option value="crypto">Tiền điện tử</option>
              </select>
              <input className="input" placeholder="Mã giao dịch" value={editForm.transaction_id}
                onChange={(e)=>setEditForm(f=>({...f, transaction_id: e.target.value}))} />
              <textarea className="input" placeholder="Ghi chú" value={editForm.notes}
                onChange={(e)=>setEditForm(f=>({...f, notes: e.target.value}))} />
              <textarea className="input" placeholder="Ghi chú admin" value={editForm.admin_notes}
                onChange={(e)=>setEditForm(f=>({...f, admin_notes: e.target.value}))} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn btn-ghost border border-gray-200" onClick={() => setEditing(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={async () => {
                try {
                  if (!editing) return
                  setUpdating(editing.id)
                  const res = await fetch('/api/admin/payments', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: editing.id,
                      amount: editForm.amount,
                      payment_method: editForm.payment_method,
                      transaction_id: editForm.transaction_id,
                      notes: editForm.notes,
                      admin_notes: editForm.admin_notes
                    })
                  })
                  if (!res.ok) throw new Error('Failed to edit payment')
                  await fetchPayments()
                  setEditing(null)
                } catch {
                  alert('❌ Không thể sửa thanh toán')
                } finally {
                  setUpdating(null)
                }
              }}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Paid Modal */}
      {markPaidId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Xác nhận đã thanh toán</h3>
            <div className="space-y-3">
              <select className="input" value={markPaidForm.payment_method} onChange={(e)=>setMarkPaidForm(f=>({...f, payment_method: e.target.value}))}>
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="momo">Ví MoMo</option>
                <option value="paypal">PayPal</option>
                <option value="crypto">Tiền điện tử</option>
              </select>
              <textarea className="input" placeholder="Ghi chú (tùy chọn)" value={markPaidForm.notes} onChange={(e)=>setMarkPaidForm(f=>({...f, notes: e.target.value}))} />
              <input type="file" className="w-full" onChange={(e)=>{
                const file = e.target.files?.[0] || null
                setMarkPaidForm(f=>({...f, file}))
              }} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn btn-ghost border border-gray-200" onClick={() => setMarkPaidId(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={async () => {
                try {
                  if (!markPaidId) return
                  setUpdating(markPaidId)
                  let proof_url = markPaidForm.proof_url || ''
                  if (markPaidForm.file) {
                    const fd = new FormData()
                    fd.append('file', markPaidForm.file)
                    fd.append('paymentId', markPaidId)
                    const up = await fetch('/api/admin/payments/upload', { method: 'POST', body: fd })
                    const upJson = await up.json()
                    if (!up.ok) throw new Error(upJson.error || 'Upload failed')
                    proof_url = upJson.url
                  }
                  const res = await fetch('/api/admin/payments', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId: markPaidId, status: 'paid', payment_method: markPaidForm.payment_method, notes: markPaidForm.notes, proof_url })
                  })
                  if (!res.ok) throw new Error('Failed to mark as paid')
                  await fetchPayments()
                  setMarkPaidId(null)
                } catch {
                  alert('❌ Không thể xác nhận thanh toán')
                } finally {
                  setUpdating(null)
                }
              }}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
