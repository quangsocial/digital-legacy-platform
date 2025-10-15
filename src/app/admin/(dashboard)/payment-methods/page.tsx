"use client"
import { useEffect, useMemo, useState, useTransition } from 'react'

type Tab = 'all' | 'bank' | 'paypal' | 'momo' | 'crypto' | 'qr_bank'
type Category = Exclude<Tab, 'all'>

export default function PaymentMethodsManagement() {
  const [tab, setTab] = useState<Tab>('all')
  const [data, setData] = useState<any>({ bank: [], paypal: [], momo: [], crypto: [], qr_bank: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [editing, setEditing] = useState<{ category: Category, id?: string }|null>(null)
  const [form, setForm] = useState<any>({})
  const [isPending, startTransition] = useTransition()

  // Options
  const bankOptions = useMemo(() => [
    'Vietcombank', 'Techcombank', 'BIDV', 'VietinBank', 'ACB', 'MB', 'TPBank', 'Sacombank', 'VPBank', 'Agribank', 'SHB', 'HDBank', 'OCB', 'SCB', 'Eximbank', 'VIB', 'SeABank', 'PVcomBank', 'Bac A Bank', 'KienlongBank', 'Nam A Bank', 'MSB', 'NCB', 'OceanBank', 'ABBANK', 'LienVietPostBank', 'Saigonbank', 'BaoVietBank', 'CIMB', 'UOB', 'Standard Chartered', 'HSBC', 'ANZ', 'Shinhan'
  ], [])
  const currencyOptions = useMemo(() => ['VND','USD','EUR','JPY','GBP','SGD','AUD'], [])
  const cryptoTokenOptions = useMemo(() => ['USDT','USDC','BTC','ETH','BNB','SOL'], [])
  const cryptoNetworkOptions = useMemo(() => ([
    { value: 'BSC', label: 'BNB Chain (BEP20)' },
    { value: 'ETH', label: 'Ethereum (ERC20)' },
    { value: 'TRC20', label: 'TRON (TRC20)' },
    { value: 'POLYGON', label: 'Polygon (MATIC)' },
    { value: 'ARB', label: 'Arbitrum' },
    { value: 'SOL', label: 'Solana' },
  ]), [])

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/payment-accounts')
      if (!res.ok) throw new Error('failed')
  const json = await res.json()
  setData({ bank: json.bank||[], paypal: json.paypal||[], momo: json.momo||[], crypto: json.crypto||[], qr_bank: json.qr_bank||[] })
    } catch {
      setError('Không tải được danh sách phương thức')
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const toggle = async (category: Tab, id: string, active: boolean) => {
    try {
      const res = await fetch('/api/admin/payment-accounts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category, id, active }) })
      if (!res.ok) throw new Error('toggle failed')
      await load()
    } catch { alert('Không bật/tắt được') }
  }

  const openAdd = (category: Category) => {
    startTransition(() => {
      setEditing({ category })
      if (category === 'bank') setForm({ bank_name: '', bank_name_select: bankOptions[0], bank_name_other: '', account_number: '', account_holder: '', bank_branch: '', currency: 'VND', active: true, sort_order: 0 })
      if (category === 'paypal') setForm({ paypal_email: '', display_name: '', currency: 'USD', active: true, sort_order: 0 })
      if (category === 'momo') setForm({ momo_number: '', momo_account: '', qr_url: '', qr_image_url: '', active: true, sort_order: 0 })
      if (category === 'crypto') setForm({ token: 'USDT', network: 'BSC', address: '', qr_url: '', qr_image_url: '', memo_tag: '', active: true, sort_order: 0 })
      if (category === 'qr_bank') setForm({ bank_code: '', bank_name: '', account_number: '', account_holder: '', qr_template: 'compact2', description_template: 'DH {order_number}', include_amount: true, active: true, sort_order: 0 })
    })
  }
  const openEdit = (category: Category, item: any) => {
    startTransition(() => {
      setEditing({ category, id: item.id })
      if (category === 'bank') {
        setForm({ ...item, bank_name_select: bankOptions.includes(item.bank_name) ? item.bank_name : '__other__', bank_name_other: bankOptions.includes(item.bank_name) ? '' : item.bank_name })
      } else {
        setForm({ ...item })
      }
    })
  }

  const changeAddCategory = (newCat: Category) => {
    // Only use when adding (no id)
    startTransition(() => {
      setEditing({ category: newCat })
      openAdd(newCat)
    })
  }

  const save = async () => {
    if (!editing) return
    const method = editing.id ? 'PATCH' : 'POST'
    const body: any = { category: editing.category, ...(editing.id ? { id: editing.id } : {}), ...form }
    // Normalize bank_name if using select+other
    if (editing.category === 'bank') {
      const selected = form.bank_name_select
      body.bank_name = selected === '__other__' ? (form.bank_name_other || '') : selected
      delete body.bank_name_select
      delete body.bank_name_other
    }
    // Extract qr_params from qr_url if provided
    const extractParams = (url?: string) => {
      try {
        if (!url) return {}
        const u = new URL(url)
        const params: any = {}
        u.searchParams.forEach((v, k) => { params[k] = v })
        return params
      } catch { return {} }
    }
  if (editing.category === 'bank') body.qr_params = extractParams(body.qr_url)
  if (editing.category === 'momo') body.qr_params = extractParams(body.qr_url)
  if (editing.category === 'crypto') body.qr_params = extractParams(body.qr_url)
  // qr_bank: no direct upload; values already normalized
    try {
      const res = await fetch('/api/admin/payment-accounts', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('save failed')
      setEditing(null)
      await load()
    } catch { alert('Không lưu được') }
  }

  const Field = ({ label, children }: any) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )

  const renderList = (category: Tab) => {
    const makeTag = (cat: Tab) => (
      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border mr-2 ${
        cat==='bank' ? 'bg-blue-50 text-blue-700 border-blue-200' :
        cat==='paypal' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
        cat==='momo' ? 'bg-pink-50 text-pink-700 border-pink-200' :
        cat==='crypto' ? 'bg-amber-50 text-amber-700 border-amber-200' : cat==='qr_bank' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-700 border-gray-200'
      }`}>
        {cat==='bank' && 'Bank'}
        {cat==='paypal' && 'PayPal'}
        {cat==='momo' && 'MoMo'}
        {cat==='crypto' && 'Crypto'}
        {cat==='qr_bank' && 'QR Bank'}
      </span>
    )

    const items: Array<{ item:any, cat: Exclude<Tab,'all'> }> = category === 'all'
      ? [
          ...(data.bank||[]).map((i:any)=>({ item:i, cat:'bank' as const })),
          ...(data.paypal||[]).map((i:any)=>({ item:i, cat:'paypal' as const })),
          ...(data.momo||[]).map((i:any)=>({ item:i, cat:'momo' as const })),
          ...(data.crypto||[]).map((i:any)=>({ item:i, cat:'crypto' as const })),
          ...(data.qr_bank||[]).map((i:any)=>({ item:i, cat:'qr_bank' as const })),
        ]
      : (data[category] || []).map((i:any)=>({ item:i, cat: category as Exclude<Tab,'all'> }))

    if (!items.length) return <div className="text-sm text-gray-500">Chưa có cấu hình. Nhấn "Thêm" để tạo.</div>

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(({ item, cat }) => (
          <div key={`${cat}-${item.id}`} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between">
            <div className="text-sm text-gray-700">
              <div className="mb-1">{makeTag(cat)}</div>
              {cat==='bank' && (
                <div>
                  <div className="font-medium">{item.bank_name}</div>
                  <div>{item.account_number} — {item.account_holder}</div>
                  <div className="text-xs text-gray-500">{item.bank_branch} • {item.currency}</div>
                </div>
              )}
              {cat==='paypal' && (
                <div>
                  <div className="font-medium">{item.display_name || 'PayPal'}</div>
                  <div>{item.paypal_email}</div>
                  <div className="text-xs text-gray-500">{item.currency}</div>
                </div>
              )}
              {cat==='momo' && (
                <div>
                  <div className="font-medium">{item.momo_account}</div>
                  <div>{item.momo_number}</div>
                </div>
              )}
              {cat==='crypto' && (
                <div>
                  <div className="font-medium">{item.token} — {item.network}</div>
                  <div className="break-all">{item.address}</div>
                </div>
              )}
              {cat==='qr_bank' && (
                <div>
                  <div className="font-medium">{item.bank_name}</div>
                  <div>{item.account_number} — {item.account_holder}</div>
                  <div className="text-xs text-gray-500">{item.bank_code} • {item.qr_template}</div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={!!item.active} onChange={()=>toggle(cat, item.id, !item.active)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <button className="text-blue-600 hover:text-blue-800 text-sm" onClick={()=>openEdit(cat, item)}>Sửa</button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Phương thức thanh toán</h2>
        <p className="text-gray-600 mt-1">Thêm nhiều phương thức trong mỗi danh mục và bật/tắt hiển thị ở trang thanh toán</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all','bank','paypal','momo','crypto','qr_bank'] as Tab[]).map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded-full border ${tab===t ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}>
            {t==='all' && 'Tất cả'}
            {t==='bank' && 'Chuyển khoản ngân hàng'}
            {t==='paypal' && 'PayPal'}
            {t==='momo' && 'MoMo'}
            {t==='crypto' && 'Crypto'}
            {t==='qr_bank' && 'Quét QR Ngân Hàng'}
          </button>
        ))}
        <div className="ml-auto">
          <button className="btn btn-primary" onClick={()=>openAdd(tab === 'all' ? 'bank' : tab)}>+ Thêm</button>
        </div>
      </div>

      {error && <div className="text-red-600">{error}</div>}
      {loading ? (<div>Đang tải…</div>) : renderList(tab)}

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 w-full max-w-xl p-6">
            <h3 className="text-lg font-semibold mb-4">{editing.id ? 'Sửa' : 'Thêm'} — {editing.category==='bank'?'Chuyển khoản':editing.category==='paypal'?'PayPal':editing.category==='momo'?'MoMo':editing.category==='crypto'?'Crypto':'Quét QR Ngân Hàng'}</h3>
            {/* When adding from 'All', allow choosing category */}
            {!editing.id && tab === 'all' && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn loại phương thức</label>
                <select className="input" value={editing.category} onChange={(e)=>changeAddCategory(e.target.value as Category)}>
                  <option value="bank">Chuyển khoản ngân hàng</option>
                  <option value="paypal">PayPal</option>
                  <option value="momo">MoMo</option>
                  <option value="crypto">Crypto</option>
                  <option value="qr_bank">Quét QR Ngân Hàng</option>
                </select>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {editing.category==='bank' && (
                <>
                  <Field label="Tên ngân hàng">
                    <select className="input" value={form.bank_name_select||bankOptions[0]} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, bank_name_select: e.target.value})))}>
                      {bankOptions.map(b=> (<option key={b} value={b}>{b}</option>))}
                      <option value="__other__">Khác…</option>
                    </select>
                    {form.bank_name_select==='__other__' && (
                      <input className="input mt-2" placeholder="Nhập tên ngân hàng" value={form.bank_name_other||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, bank_name_other: e.target.value})))} />
                    )}
                  </Field>
                  <Field label="Số tài khoản"><input className="input" value={form.account_number||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, account_number: e.target.value})))} /></Field>
                  <Field label="Chủ tài khoản"><input className="input" value={form.account_holder||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, account_holder: e.target.value})))} /></Field>
                  <Field label="Chi nhánh"><input className="input" value={form.bank_branch||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, bank_branch: e.target.value})))} /></Field>
                  <Field label="Tiền tệ">
                    <select className="input" value={form.currency||'VND'} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, currency: e.target.value})))}>
                      {currencyOptions.map(c => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </Field>
                  <Field label="QR Link">
                    <input className="input" placeholder="https://...?param=value" value={form.qr_url||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, qr_url: e.target.value})))} />
                  </Field>
                  <Field label="QR Upload">
                    <input type="file" onChange={async (e)=>{
                      const file = e.target.files?.[0]
                      if (!file) return
                      const fd = new FormData()
                      fd.append('file', file)
                      const up = await fetch('/api/admin/payments/upload', { method: 'POST', body: fd })
                      const json = await up.json()
                      if (up.ok && json.url) setForm((f:any)=>({...f, qr_image_url: json.url}))
                      else alert('Upload thất bại')
                    }} />
                  </Field>
                </>
              )}
              {editing.category==='paypal' && (
                <>
                  <Field label="Email PayPal"><input className="input" value={form.paypal_email||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, paypal_email: e.target.value})))} /></Field>
                  <Field label="Tên hiển thị"><input className="input" value={form.display_name||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, display_name: e.target.value})))} /></Field>
                  <Field label="Tiền tệ">
                    <select className="input" value={form.currency||'USD'} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, currency: e.target.value})))}>
                      {currencyOptions.map(c => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </Field>
                </>
              )}
              {editing.category==='momo' && (
                <>
                  <Field label="Số MoMo"><input className="input" value={form.momo_number||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, momo_number: e.target.value})))} /></Field>
                  <Field label="Chủ ví MoMo"><input className="input" value={form.momo_account||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, momo_account: e.target.value})))} /></Field>
                  <Field label="QR Code">
                    <div className="space-y-2">
                      <input className="input" placeholder="Hoặc nhập URL" value={form.qr_url||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, qr_url: e.target.value})))} />
                      <input type="file" onChange={async (e)=>{
                        const file = e.target.files?.[0]
                        if (!file) return
                        const fd = new FormData()
                        fd.append('file', file)
                        // Reuse payments upload endpoint to store and get URL
                        const up = await fetch('/api/admin/payments/upload', { method: 'POST', body: fd })
                        const json = await up.json()
                        if (up.ok && json.url) setForm((f:any)=>({...f, qr_image_url: json.url}))
                        else alert('Upload thất bại')
                      }} />
                    </div>
                  </Field>
                </>
              )}
              {editing.category==='crypto' && (
                <>
                  <Field label="Token">
                    <select className="input" value={form.token||'USDT'} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, token: e.target.value})))}>
                      {cryptoTokenOptions.map(t => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </Field>
                  <Field label="Mạng lưới">
                    <select className="input" value={form.network||'BSC'} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, network: e.target.value})))}>
                      {cryptoNetworkOptions.map(n => (<option key={n.value} value={n.value}>{n.label}</option>))}
                    </select>
                  </Field>
                  <Field label="Địa chỉ ví"><input className="input" value={form.address||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, address: e.target.value})))} /></Field>
                  <Field label="QR Code">
                    <div className="space-y-2">
                      <input className="input" placeholder="Hoặc nhập URL" value={form.qr_url||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, qr_url: e.target.value})))} />
                      <input type="file" onChange={async (e)=>{
                        const file = e.target.files?.[0]
                        if (!file) return
                        const fd = new FormData()
                        fd.append('file', file)
                        const up = await fetch('/api/admin/payments/upload', { method: 'POST', body: fd })
                        const json = await up.json()
                        if (up.ok && json.url) setForm((f:any)=>({...f, qr_image_url: json.url}))
                        else alert('Upload thất bại')
                      }} />
                    </div>
                  </Field>
                  <Field label="Memo/Tag (nếu có)"><input className="input" value={form.memo_tag||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, memo_tag: e.target.value})))} /></Field>
                </>
              )}
              {editing.category==='qr_bank' && (
                <>
                  <Field label="Mã ngân hàng (bank_code)"><input className="input" value={form.bank_code||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, bank_code: e.target.value})))} placeholder="VD: VCB, TCB, MBB" /></Field>
                  <Field label="Tên ngân hàng"><input className="input" value={form.bank_name||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, bank_name: e.target.value})))} /></Field>
                  <Field label="Số tài khoản"><input className="input" value={form.account_number||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, account_number: e.target.value})))} /></Field>
                  <Field label="Chủ tài khoản"><input className="input" value={form.account_holder||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, account_holder: e.target.value})))} /></Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="QR template"><input className="input" value={form.qr_template||'compact2'} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, qr_template: e.target.value})))} placeholder="compact | compact2" /></Field>
                    <Field label="Mẫu mô tả (addInfo)"><input className="input" value={form.description_template||'DH {order_number}'} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, description_template: e.target.value})))} placeholder="DH {order_number}" /></Field>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <input id="incAmount" type="checkbox" checked={!!form.include_amount} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, include_amount: e.target.checked})))} />
                    <label htmlFor="incAmount" className="text-sm">Nhúng số tiền vào QR</label>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="font-semibold text-xs text-gray-500 mb-1">Tích hợp Sepay (nếu muốn dùng API động)</div>
                    <Field label="Sepay Client ID"><input className="input" value={form.sepay_client_id||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, sepay_client_id: e.target.value})))} placeholder="Client ID từ Sepay" /></Field>
                    <Field label="Sepay Client Secret"><input className="input" value={form.sepay_client_secret||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, sepay_client_secret: e.target.value})))} placeholder="Client Secret từ Sepay" /></Field>
                    <Field label="Sepay Merchant ID"><input className="input" value={form.sepay_merchant_id||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, sepay_merchant_id: e.target.value})))} placeholder="Merchant ID từ Sepay" /></Field>
                    <Field label="Sepay API URL"><input className="input" value={form.sepay_api_url||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, sepay_api_url: e.target.value})))} placeholder="https://api.sepay.vn/api/v1/payment/create" /></Field>
                    <Field label="Sepay Bank ID"><input className="input" value={form.sepay_bank_id||''} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, sepay_bank_id: e.target.value})))} placeholder="bank_id theo Sepay (nếu có)" /></Field>
                  </div>
                </>
              )}
              <Field label="Sắp xếp">
                <input className="input" type="number" value={form.sort_order ?? 0} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, sort_order: Number(e.target.value||0)})))} />
              </Field>
              <Field label="Kích hoạt">
                <input type="checkbox" checked={!!form.active} onChange={e=>startTransition(()=>setForm((f:any)=>({...f, active: e.target.checked})))} />
              </Field>
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
