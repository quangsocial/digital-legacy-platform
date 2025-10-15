'use client'

import { useEffect, useState } from 'react'

interface Payment {
  id: string
  paymentNumber: string
  orderNumber: string
  customerName: string
  amount: number
  currency?: string
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
    currency: 'VND',
    payment_method: 'bank_transfer',
    // Link to configured account (preferred)
    bank_account_id: '',
    paypal_account_id: '',
    momo_account_id: '',
    crypto_wallet_id: '',
    // Bank transfer details
    bank_name: '',
    account_number: '',
    account_holder: '',
    bank_branch: '',
    // MoMo details
    momo_number: '',
    momo_account: '',
    // PayPal details
    paypal_email: '',
    // Crypto details
    crypto_currency: 'USDT',
    crypto_network: 'BSC',
    crypto_address: '',
    crypto_qr_url: '',
    transaction_id: '',
    notes: '',
    admin_notes: ''
  })
  const currencyOptions = [
    { code: 'VND', label: 'VND — Vietnamese Dong' },
    { code: 'USD', label: 'USD — US Dollar' },
    { code: 'EUR', label: 'EUR — Euro' },
    { code: 'JPY', label: 'JPY — Japanese Yen' },
    { code: 'GBP', label: 'GBP — British Pound' },
    { code: 'SGD', label: 'SGD — Singapore Dollar' },
    { code: 'AUD', label: 'AUD — Australian Dollar' },
  ] as const
  const [markPaidId, setMarkPaidId] = useState<string | null>(null)
  const [markPaidForm, setMarkPaidForm] = useState({
    payment_method: 'bank_transfer',
    // Link to configured account (preferred)
    bank_account_id: '',
    paypal_account_id: '',
    momo_account_id: '',
    crypto_wallet_id: '',
    // Bank transfer details
    bank_name: '',
    account_number: '',
    account_holder: '',
    bank_branch: '',
    // MoMo details
    momo_number: '',
    momo_account: '',
    // PayPal details
    paypal_email: '',
    // Crypto details
    crypto_currency: 'USDT',
    crypto_network: 'BSC',
    crypto_address: '',
    crypto_qr_url: '',
    notes: '',
    file: null as File | null,
    proof_url: ''
  })

  // Active payment accounts for dropdowns
  const [paymentOptions, setPaymentOptions] = useState<{ bank: any[], paypal: any[], momo: any[], crypto: any[] }>({ bank: [], paypal: [], momo: [], crypto: [] })

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
    // load active payment options
    const loadPaymentOptions = async () => {
      try {
        const res = await fetch('/api/payment-options')
        const data = await res.json()
        setPaymentOptions({
          bank: data.bank || [],
          paypal: data.paypal || [],
          momo: data.momo || [],
          crypto: data.crypto || []
        })
      } catch {}
    }
    loadPaymentOptions()
  }, [])

  // Auto-refetch when filters change (debounced for q)
  useEffect(() => {
    const t = setTimeout(() => {
      fetchPayments()
    }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, statusFilter, methodFilter, productFilter, from, to])

  const fetchPayments = async () => {
    try {
      setLoading(true)
  const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (methodFilter) params.set('method', methodFilter)
      if (productFilter) params.set('product_variant_id', productFilter)
      if (from) params.set('from', from)
      if (to) params.set('to', to)
  if (q.length === 0 || q.length >= 2) params.set('q', q)
  params.set('limit', '50')
  params.set('page', '1')
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Text search */}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm: tên, email, SĐT, mã đơn, mã bill, giao dịch"
            className="input w-full"
          />
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="new">Mới</option>
            <option value="paid">Đã thanh toán</option>
            <option value="refunded">Hoàn tiền</option>
          </select>
          {/* Method filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="input w-full"
          >
            <option value="">Tất cả phương thức</option>
            <option value="bank_transfer">Chuyển khoản</option>
            <option value="momo">Ví MoMo</option>
            <option value="paypal">PayPal</option>
            <option value="crypto">Tiền điện tử</option>
          </select>
          {/* Product filter */}
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="input w-full"
          >
            <option value="">Tất cả sản phẩm</option>
            {products.flatMap((p: any) =>
              p.product_variants?.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {p.name} — {v.name}
                </option>
              ))
            )}
          </select>
          {/* Date from */}
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="input w-full"
          />
          {/* Date to */}
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="input w-full"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              setStatusFilter('')
              setMethodFilter('')
              setProductFilter('')
              setFrom('')
              setTo('')
              setQ('')
            }}
            className="btn btn-ghost border border-gray-200"
          >
            Reset
          </button>
          <button
            onClick={fetchPayments}
            className="btn btn-ghost border border-gray-200"
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
                    {payment.amount.toLocaleString('vi-VN')} {payment.currency || 'VND'}
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
                      <button onClick={() => {
                        setEditing(payment)
                        const pd = (payment as any).paymentDetails || {}
                        setEditForm({
                          amount: payment.amount,
                          currency: payment.currency || 'VND',
                          payment_method: (payment as any).method || 'bank_transfer',
                          bank_account_id: '',
                          paypal_account_id: '',
                          momo_account_id: '',
                          crypto_wallet_id: '',
                          // hydrate method-specific fields
                          bank_name: pd.bank_name || '',
                          account_number: pd.account_number || '',
                          account_holder: pd.account_holder || '',
                          bank_branch: pd.bank_branch || '',
                          momo_number: pd.momo_number || '',
                          momo_account: pd.momo_account || '',
                          paypal_email: pd.paypal_email || '',
                          crypto_currency: pd.crypto_currency || 'USDT',
                          crypto_network: pd.crypto_network || 'BSC',
                          crypto_address: pd.crypto_address || '',
                          crypto_qr_url: pd.crypto_qr_url || '',
                          transaction_id: payment.transactionId || '',
                          notes: (payment as any).notes || '',
                          admin_notes: (payment as any).adminNotes || ''
                        })
                      }} className="text-gray-700 hover:text-black">Sửa</button>
                      {payment.status === 'new' && (
                        <button onClick={() => { setMarkPaidId(payment.id); setMarkPaidForm({ payment_method: 'bank_transfer', bank_account_id: '', paypal_account_id: '', momo_account_id: '', crypto_wallet_id: '', bank_name: '', account_number: '', account_holder: '', bank_branch: '', momo_number: '', momo_account: '', paypal_email: '', crypto_currency: 'USDT', crypto_network: 'BSC', crypto_address: '', crypto_qr_url: '', notes: '', file: null, proof_url: '' }) }} disabled={updating===payment.id} className="text-emerald-600 hover:text-emerald-900 disabled:opacity-50">Đánh dấu đã thanh toán</button>
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Số tiền</label>
                  <input className="input" type="number" placeholder="Số tiền"
                    value={editForm.amount}
                    onChange={(e)=>setEditForm(f=>({...f, amount: Number(e.target.value)}))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Đơn vị tiền tệ</label>
                  <select className="input" value={editForm.currency} onChange={(e)=>setEditForm(f=>({...f, currency: e.target.value}))}>
                    {currencyOptions.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <select className="input" value={editForm.payment_method} onChange={(e)=>setEditForm(f=>({...f, payment_method: e.target.value}))}>
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="momo">Ví MoMo</option>
                <option value="paypal">PayPal</option>
                <option value="crypto">Tiền điện tử</option>
              </select>
              {/* Choose configured account instead of retyping */}
              {editForm.payment_method === 'bank_transfer' && (
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500">Tài khoản ngân hàng đã cấu hình</label>
                  <select className="input" value={editForm.bank_account_id} onChange={e=>setEditForm(f=>({...f, bank_account_id: e.target.value}))}>
                    <option value="">-- Chọn tài khoản --</option>
                    {paymentOptions.bank.map((b:any)=> (
                      <option key={b.id} value={b.id}>{b.bank_name} • {b.account_number} — {b.account_holder}</option>
                    ))}
                  </select>
                </div>
              )}
              {editForm.payment_method === 'momo' && (
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500">Ví MoMo đã cấu hình</label>
                  <select className="input" value={editForm.momo_account_id} onChange={e=>setEditForm(f=>({...f, momo_account_id: e.target.value}))}>
                    <option value="">-- Chọn ví MoMo --</option>
                    {paymentOptions.momo.map((m:any)=> (
                      <option key={m.id} value={m.id}>{m.momo_account} • {m.momo_number}</option>
                    ))}
                  </select>
                </div>
              )}
              {editForm.payment_method === 'paypal' && (
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500">Tài khoản PayPal đã cấu hình</label>
                  <select className="input" value={editForm.paypal_account_id} onChange={e=>setEditForm(f=>({...f, paypal_account_id: e.target.value}))}>
                    <option value="">-- Chọn PayPal --</option>
                    {paymentOptions.paypal.map((p:any)=> (
                      <option key={p.id} value={p.id}>{p.display_name || p.paypal_email} • {p.currency}</option>
                    ))}
                  </select>
                </div>
              )}
              {editForm.payment_method === 'crypto' && (
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500">Ví Crypto đã cấu hình</label>
                  <select className="input" value={editForm.crypto_wallet_id} onChange={e=>setEditForm(f=>({...f, crypto_wallet_id: e.target.value}))}>
                    <option value="">-- Chọn ví --</option>
                    {paymentOptions.crypto.map((c:any)=> (
                      <option key={c.id} value={c.id}>{c.token} — {c.network} • {c.address.slice(0,8)}…</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Additional fields per payment method */}
              {editForm.payment_method === 'bank_transfer' && (
                <div className="space-y-2">
                  <input className="input" placeholder="Ngân hàng" value={editForm.bank_name} onChange={e=>setEditForm(f=>({...f, bank_name: e.target.value}))} />
                  <input className="input" placeholder="Số tài khoản" value={editForm.account_number} onChange={e=>setEditForm(f=>({...f, account_number: e.target.value}))} />
                  <input className="input" placeholder="Chủ tài khoản" value={editForm.account_holder} onChange={e=>setEditForm(f=>({...f, account_holder: e.target.value}))} />
                  <input className="input" placeholder="Chi nhánh" value={editForm.bank_branch} onChange={e=>setEditForm(f=>({...f, bank_branch: e.target.value}))} />
                </div>
              )}
              {editForm.payment_method === 'momo' && (
                <div className="space-y-2">
                  <input className="input" placeholder="Số MoMo" value={editForm.momo_number} onChange={e=>setEditForm(f=>({...f, momo_number: e.target.value}))} />
                  <input className="input" placeholder="Chủ ví MoMo" value={editForm.momo_account} onChange={e=>setEditForm(f=>({...f, momo_account: e.target.value}))} />
                </div>
              )}
              {editForm.payment_method === 'paypal' && (
                <input className="input" placeholder="Email PayPal" value={editForm.paypal_email} onChange={e=>setEditForm(f=>({...f, paypal_email: e.target.value}))} />
              )}
              {editForm.payment_method === 'crypto' && (
                <div className="space-y-2">
                  <select className="input" value={editForm.crypto_currency} onChange={e=>setEditForm(f=>({...f, crypto_currency: e.target.value}))}>
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                  <select className="input" value={editForm.crypto_network} onChange={e=>setEditForm(f=>({...f, crypto_network: e.target.value}))}>
                    <option value="BSC">BNB Chain</option>
                    <option value="ETH">Ethereum</option>
                    <option value="TRC20">TRON</option>
                  </select>
                  <input className="input" placeholder="Địa chỉ ví" value={editForm.crypto_address} onChange={e=>setEditForm(f=>({...f, crypto_address: e.target.value}))} />
                  <input className="input" placeholder="URL QR code" value={editForm.crypto_qr_url} onChange={e=>setEditForm(f=>({...f, crypto_qr_url: e.target.value}))} />
                </div>
              )}
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
                      currency: editForm.currency,
                      payment_method: editForm.payment_method,
                      // link to configured account
                      bank_account_id: editForm.bank_account_id,
                      paypal_account_id: editForm.paypal_account_id,
                      momo_account_id: editForm.momo_account_id,
                      crypto_wallet_id: editForm.crypto_wallet_id,
                      // method-specific
                      bank_name: editForm.bank_name,
                      account_number: editForm.account_number,
                      account_holder: editForm.account_holder,
                      bank_branch: editForm.bank_branch,
                      momo_number: editForm.momo_number,
                      momo_account: editForm.momo_account,
                      paypal_email: editForm.paypal_email,
                      crypto_currency: editForm.crypto_currency,
                      crypto_network: editForm.crypto_network,
                      crypto_address: editForm.crypto_address,
                      crypto_qr_url: editForm.crypto_qr_url,
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
              {/* Choose configured account */}
              {markPaidForm.payment_method === 'bank_transfer' && (
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500">Tài khoản ngân hàng</label>
                  <select className="input" value={markPaidForm.bank_account_id} onChange={e=>setMarkPaidForm(f=>({...f, bank_account_id: e.target.value}))}>
                    <option value="">-- Chọn tài khoản --</option>
                    {paymentOptions.bank.map((b:any)=> (
                      <option key={b.id} value={b.id}>{b.bank_name} • {b.account_number} — {b.account_holder}</option>
                    ))}
                  </select>
                </div>
              )}
              {markPaidForm.payment_method === 'momo' && (
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500">Ví MoMo</label>
                  <select className="input" value={markPaidForm.momo_account_id} onChange={e=>setMarkPaidForm(f=>({...f, momo_account_id: e.target.value}))}>
                    <option value="">-- Chọn ví MoMo --</option>
                    {paymentOptions.momo.map((m:any)=> (
                      <option key={m.id} value={m.id}>{m.momo_account} • {m.momo_number}</option>
                    ))}
                  </select>
                </div>
              )}
              {markPaidForm.payment_method === 'paypal' && (
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500">Tài khoản PayPal</label>
                  <select className="input" value={markPaidForm.paypal_account_id} onChange={e=>setMarkPaidForm(f=>({...f, paypal_account_id: e.target.value}))}>
                    <option value="">-- Chọn PayPal --</option>
                    {paymentOptions.paypal.map((p:any)=> (
                      <option key={p.id} value={p.id}>{p.display_name || p.paypal_email} • {p.currency}</option>
                    ))}
                  </select>
                </div>
              )}
              {markPaidForm.payment_method === 'crypto' && (
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500">Ví Crypto</label>
                  <select className="input" value={markPaidForm.crypto_wallet_id} onChange={e=>setMarkPaidForm(f=>({...f, crypto_wallet_id: e.target.value}))}>
                    <option value="">-- Chọn ví --</option>
                    {paymentOptions.crypto.map((c:any)=> (
                      <option key={c.id} value={c.id}>{c.token} — {c.network} • {c.address.slice(0,8)}…</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Method-specific fields */}
              {markPaidForm.payment_method === 'bank_transfer' && (
                <div className="space-y-2">
                  <input className="input" placeholder="Ngân hàng" value={markPaidForm.bank_name} onChange={e=>setMarkPaidForm(f=>({...f, bank_name: e.target.value}))} />
                  <input className="input" placeholder="Số tài khoản" value={markPaidForm.account_number} onChange={e=>setMarkPaidForm(f=>({...f, account_number: e.target.value}))} />
                  <input className="input" placeholder="Chủ tài khoản" value={markPaidForm.account_holder} onChange={e=>setMarkPaidForm(f=>({...f, account_holder: e.target.value}))} />
                  <input className="input" placeholder="Chi nhánh" value={markPaidForm.bank_branch} onChange={e=>setMarkPaidForm(f=>({...f, bank_branch: e.target.value}))} />
                </div>
              )}
              {markPaidForm.payment_method === 'momo' && (
                <div className="space-y-2">
                  <input className="input" placeholder="Số MoMo" value={markPaidForm.momo_number} onChange={e=>setMarkPaidForm(f=>({...f, momo_number: e.target.value}))} />
                  <input className="input" placeholder="Chủ ví MoMo" value={markPaidForm.momo_account} onChange={e=>setMarkPaidForm(f=>({...f, momo_account: e.target.value}))} />
                </div>
              )}
              {markPaidForm.payment_method === 'paypal' && (
                <input className="input" placeholder="Email PayPal" value={markPaidForm.paypal_email} onChange={e=>setMarkPaidForm(f=>({...f, paypal_email: e.target.value}))} />
              )}
              {markPaidForm.payment_method === 'crypto' && (
                <div className="space-y-2">
                  <select className="input" value={markPaidForm.crypto_currency} onChange={e=>setMarkPaidForm(f=>({...f, crypto_currency: e.target.value}))}>
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                  <select className="input" value={markPaidForm.crypto_network} onChange={e=>setMarkPaidForm(f=>({...f, crypto_network: e.target.value}))}>
                    <option value="BSC">BNB Chain</option>
                    <option value="ETH">Ethereum</option>
                    <option value="TRC20">TRON</option>
                  </select>
                  <input className="input" placeholder="Địa chỉ ví" value={markPaidForm.crypto_address} onChange={e=>setMarkPaidForm(f=>({...f, crypto_address: e.target.value}))} />
                  <input className="input" placeholder="URL QR code" value={markPaidForm.crypto_qr_url} onChange={e=>setMarkPaidForm(f=>({...f, crypto_qr_url: e.target.value}))} />
                </div>
              )}
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
                    body: JSON.stringify({ paymentId: markPaidId, status: 'paid', payment_method: markPaidForm.payment_method, notes: markPaidForm.notes, proof_url,
                      bank_account_id: markPaidForm.bank_account_id,
                      paypal_account_id: markPaidForm.paypal_account_id,
                      momo_account_id: markPaidForm.momo_account_id,
                      crypto_wallet_id: markPaidForm.crypto_wallet_id,
                      payment_details: {
                      bank_name: markPaidForm.bank_name,
                      account_number: markPaidForm.account_number,
                      account_holder: markPaidForm.account_holder,
                      bank_branch: markPaidForm.bank_branch,
                      momo_number: markPaidForm.momo_number,
                      momo_account: markPaidForm.momo_account,
                      paypal_email: markPaidForm.paypal_email,
                      crypto_currency: markPaidForm.crypto_currency,
                      crypto_network: markPaidForm.crypto_network,
                      crypto_address: markPaidForm.crypto_address,
                      crypto_qr_url: markPaidForm.crypto_qr_url,
                    } })
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
