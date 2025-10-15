'use client'

import { useEffect, useMemo, useState } from 'react'

type TxType = 'in'|'out'

const IN_CATEGORIES = [
  'Sales revenue', 'Customer deposit', 'Interest income', 'Other income'
]
const OUT_CATEGORIES = [
  'Supplier payment', 'Salary', 'Rent', 'Utilities', 'Tax', 'Refund', 'Marketing', 'Other expense'
]

interface Row {
  id: string
  type: TxType
  category: string
  amount: number
  currency: string
  date: string
  notes?: string
  orderId?: string|null
  orderNumber?: string|null
}

export default function CashTransactions() {
  const [items, setItems] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [editing, setEditing] = useState<Partial<Row>|null>(null)

  const categories = useMemo(() => type === 'out' ? OUT_CATEGORIES : IN_CATEGORIES, [type])

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q.length===0 || q.length>=2) params.set('q', q)
    if (type) params.set('type', type)
    if (category) params.set('category', category)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const res = await fetch(`/api/admin/cash-transactions?${params.toString()}`)
    const json = await res.json()
    setItems(json.items||[])
    setLoading(false)
  }
  useEffect(() => { load() }, [])
  useEffect(() => { const t=setTimeout(load, 400); return ()=>clearTimeout(t) }, [q, type, category, from, to])

  const save = async () => {
    if (!editing) return
    const isNew = !editing.id
    const payload: any = {
      type: editing.type,
      category: editing.category,
      amount: editing.amount,
      currency: editing.currency||'VND',
      date: editing.date,
      notes: editing.notes,
      order_id: editing.orderId,
    }
    const res = await fetch('/api/admin/cash-transactions', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isNew ? payload : { id: editing.id, ...payload })
    })
    if (res.ok) {
      setEditing(null)
      await load()
    } else {
      alert('Không lưu được phiếu thu/chi')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters - 2 rows layout */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input" placeholder="Tìm kiếm: nội dung, mã đơn…" value={q} onChange={e=>setQ(e.target.value)} />
          <div className="flex gap-2">
            <button className={`px-3 py-2 rounded-lg border ${type===''?'bg-black text-white border-black':'bg-white'}`} onClick={()=>setType('')}>All</button>
            <button className={`px-3 py-2 rounded-lg border ${type==='in'?'bg-green-600 text-white border-green-600':'bg-white'}`} onClick={()=>setType('in')}>In</button>
            <button className={`px-3 py-2 rounded-lg border ${type==='out'?'bg-red-600 text-white border-red-600':'bg-white'}`} onClick={()=>setType('out')}>Out</button>
          </div>
          <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="">Tất cả loại</option>
            {categories.map(c => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input type="date" className="input" value={from} onChange={e=>setFrom(e.target.value)} />
          <input type="date" className="input" value={to} onChange={e=>setTo(e.target.value)} />
          <div className="flex gap-2">
            <button className="btn btn-ghost border border-gray-200" onClick={()=>{ setQ(''); setType(''); setCategory(''); setFrom(''); setTo('') }}>Reset</button>
            <div className="ml-auto"/>
            <button className="btn btn-primary" onClick={()=>setEditing({ type: 'in', category: '', amount: 0, currency: 'VND', date: new Date().toISOString().slice(0,10) })}>+ Tạo phiếu thu/chi</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã phiếu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhóm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gắn với đơn</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Đang tải…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Chưa có phiếu thu/chi</td></tr>
            ) : items.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {r.type === 'in' ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">In</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Out</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{(r as any).voucherNumber || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold {r.type==='in'?'text-emerald-700':'text-red-700'}">
                  {r.type==='in' ? '+' : '-'} {r.amount.toLocaleString('vi-VN')} {r.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(r.date).toLocaleDateString('vi-VN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.orderNumber || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end gap-3">
                    {/* Print voucher */}
                    <button title="In phiếu" className="text-gray-700 hover:text-black" onClick={()=>window.open(`/admin/cash/print?voucherId=${r.id}`, '_blank')}>🖨️</button>
                    {/* Print related bill if any */}
                    {r.orderId && (
                      <button title="In bill" className="text-gray-700 hover:text-black" onClick={()=>window.open(`/admin/payments/print?orderId=${r.orderId}`, '_blank')}>🧾</button>
                    )}
                    {/* Edit */}
                    <button className="text-blue-600 hover:text-blue-800" onClick={()=>setEditing(r)}>Sửa</button>
                    {/* Delete */}
                    <button className="text-red-600 hover:text-red-800" onClick={async()=>{
                      if (!confirm('Xóa phiếu này?')) return
                      const res = await fetch(`/api/admin/cash-transactions?id=${r.id}`, { method: 'DELETE' })
                      if (res.ok) {
                        await load()
                      } else {
                        alert('Không xóa được')
                      }
                    }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{editing.id ? 'Sửa phiếu' : 'Tạo phiếu thu/chi'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Loại</label>
                <select className="input" value={editing.type||'in'} onChange={e=>setEditing(s=>({...s!, type: e.target.value as TxType, category: ''}))}>
                  <option value="in">In (thu)</option>
                  <option value="out">Out (chi)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nhóm</label>
                <select className="input" value={editing.category||''} onChange={e=>setEditing(s=>({...s!, category: e.target.value}))}>
                  <option value="">-- Chọn nhóm --</option>
                  {(editing.type==='out' ? OUT_CATEGORIES : IN_CATEGORIES).map(c => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Số tiền</label>
                <input type="number" className="input" value={editing.amount as any || 0} onChange={e=>setEditing(s=>({...s!, amount: Number(e.target.value)}))} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tiền tệ</label>
                <select className="input" value={editing.currency||'VND'} onChange={e=>setEditing(s=>({...s!, currency: e.target.value}))}>
                  {['VND','USD','EUR','JPY','GBP','SGD','AUD'].map(c => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ngày</label>
                <input type="date" className="input" value={(editing.date||'').slice(0,10)} onChange={e=>setEditing(s=>({...s!, date: e.target.value}))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Ghi chú</label>
                <textarea className="input" value={editing.notes||''} onChange={e=>setEditing(s=>({...s!, notes: e.target.value}))} />
              </div>
              {editing.type==='in' && (
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Gắn với đơn hàng (nếu là Doanh thu bán hàng)</label>
                  <OrderLookup orderNumber={editing.orderNumber||''} onChange={(order)=>setEditing(s=>({...s!, orderId: order?.id||null, orderNumber: order?.order_number||''}))} />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn btn-ghost border border-gray-200" onClick={()=>setEditing(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={save}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OrderLookup({ orderNumber, onChange }: { orderNumber: string, onChange: (order: any|null)=>void }) {
  const [q, setQ] = useState(orderNumber || '')
  const [results, setResults] = useState<any[]>([])
  useEffect(() => { const t=setTimeout(async()=>{
    if (!q || q.length<2) { setResults([]); return }
    const res = await fetch(`/api/admin/orders?q=${encodeURIComponent(q)}&limit=5`)
    const json = await res.json()
    setResults(json.orders||[])
  }, 400); return ()=>clearTimeout(t) }, [q])
  return (
    <div>
      <input className="input" placeholder="Nhập mã đơn để gắn" value={q} onChange={e=>setQ(e.target.value)} />
      {results.length>0 && (
        <div className="mt-2 border rounded-lg divide-y">
          {results.map((o:any)=>(
            <button key={o.id} type="button" className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={()=>onChange(o)}>
              <div className="text-sm font-medium">{o.orderNumber || o.order_number}</div>
              <div className="text-xs text-gray-500">{o.customerName || o.customer_name} — {o.totalAmount?.toLocaleString?.('vi-VN')||''}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
