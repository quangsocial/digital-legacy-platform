"use client"

import { useEffect, useMemo, useState } from 'react'

// Local minimal types to satisfy TS in this component
type Plan = { id: string; name: string; slug?: string; description?: string }
type ProductDraft = {
  id?: string
  name: string
  slug: string
  description?: string
  short_description?: string
  images?: string[]
  base_price?: number | null
  status?: 'active' | 'inactive' | 'archived'
  category?: string
  is_featured?: boolean
  sort_order?: number
}
type VariantDraft = {
  id?: string
  plan_id?: string
  name: string
  price: number
  compare_at_price?: number
  billing_period?: string
  is_popular?: boolean
  is_available?: boolean
  sort_order?: number
  label?: 'HOT' | 'BEST CHOICE' | 'VIP' | null
  sku?: string
}

export default function ProductsManager() {
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [plans, setPlans] = useState<Plan[]>([])
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<{ product: ProductDraft; variants: VariantDraft[] } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)

  const slugify = (s: string) => {
    return (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip accents
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [pRes, vRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/plans'),
      ])
      const pData = await pRes.json()
      const vData = await vRes.json()
      setItems(pData.products || [])
      setPlans(vData.plans || [])
    } catch (e) {
      console.error(e)
      alert('Không tải được danh sách sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return items.filter((it:any) => it.name?.toLowerCase().includes(s) || it.slug?.toLowerCase().includes(s))
  }, [items, q])

  const openCreate = () => {
    setEditing({
      product: { name: '', slug: '', status: 'active', category: 'subscription', is_featured: false, sort_order: 0, images: [] },
      variants: []
    })
    setSlugEdited(false)
  }

  const openEdit = (p:any) => {
    setEditing({
      product: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description ?? '',
        short_description: p.short_description ?? '',
        images: Array.isArray(p.images) ? p.images : [],
        base_price: p.base_price ?? null,
        status: p.status,
        category: p.category,
        is_featured: !!p.is_featured,
        sort_order: p.sort_order ?? 0,
      },
      variants: (p.product_variants||[]).map((v:any) => ({
        id: v.id,
        plan_id: v.plan_id,
        name: v.name,
        price: Number(v.price)||0,
        compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : undefined,
        billing_period: v.billing_period,
        is_popular: !!v.is_popular,
        is_available: !!v.is_available,
        sort_order: v.sort_order ?? 0,
        label: v.label || null,
        sku: v.sku || undefined,
      }))
    })
    setSlugEdited(false)
  }

  const addVariant = () => {
    setEditing(ed => ed ? ({ ...ed, variants: [...ed.variants, { name: '', price: 0, sort_order: (ed.variants.at(-1)?.sort_order||0)+1 }] }) : ed)
  }

  const removeVariant = (idx:number) => setEditing(ed => ed ? ({ ...ed, variants: ed.variants.filter((_,i)=>i!==idx) }) : ed)

  const setVariant = (idx:number, patch: Partial<VariantDraft>) => setEditing(ed => {
    if (!ed) return ed
    const arr = [...ed.variants]
    arr[idx] = { ...arr[idx], ...patch }
    return { ...ed, variants: arr }
  })

  const addDefaultFour = () => {
    if (!plans.length) return
    const lookup = (slug:string) => plans.find(p => p.slug === slug)
    const presets: VariantDraft[] = [
      { name: 'Free Plan', price: 0, plan_id: lookup('free')?.id, billing_period: 'lifetime', sort_order: 1 },
      { name: 'Basic Plan', price: 99000, plan_id: lookup('basic')?.id, billing_period: 'monthly', sort_order: 2, label: 'HOT' },
      { name: 'Premium Plan', price: 299000, plan_id: lookup('premium')?.id, billing_period: 'monthly', sort_order: 3, label: 'BEST CHOICE' },
      { name: 'Enterprise Plan', price: 999000, plan_id: lookup('enterprise')?.id, billing_period: 'monthly', sort_order: 4, label: 'VIP' },
    ]
    setEditing(ed => ed ? ({ ...ed, variants: presets }) : ed)
  }

  const save = async () => {
    if (!editing) return
    const product = editing.product
    const variants = editing.variants
    if (!product.name || !product.slug) {
      alert('Tên và slug là bắt buộc')
      return
    }
    try {
      setLoading(true)
      if (product.id) {
        const res = await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id, product, variants }) })
        if (!res.ok) throw new Error('update failed')
      } else {
        const res = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product, variants }) })
        if (!res.ok) throw new Error('create failed')
      }
      await loadAll()
      setEditing(null)
    } catch (e:any) {
      console.error(e)
      alert('Không lưu được sản phẩm: ' + e?.message)
    } finally {
      setLoading(false)
    }
  }

  const del = async (id: string) => {
    if (!confirm('Xóa sản phẩm này?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      await loadAll()
    } catch (e) {
      alert('Không xóa được sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center gap-3 mb-4">
        <input placeholder="Tìm sản phẩm..." className="input" value={q} onChange={e=>setQ(e.target.value)} />
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm sản phẩm</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Biến thể</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p:any) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.category}</div>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 flex items-center gap-2">
                  {p.slug}
                  <a
                    href={`/product/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Xem trang sản phẩm"
                    className="inline-flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
                      <path d="M12.293 2.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-8.5 8.5a1 1 0 0 1-.325.217l-4 1.5a1 1 0 0 1-1.263-1.263l1.5-4a1 1 0 0 1 .217-.325l8.5-8.5ZM15 7l-2-2m-2.293 9.293 8.5-8.5a3 3 0 0 0-4.243-4.243l-8.5 8.5a3 3 0 0 0-.651 1.012l-1.5 4A3 3 0 0 0 5.293 19.207l4-1.5a3 3 0 0 0 1.012-.651Z" />
                    </svg>
                  </a>
                </td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${p.status==='active'?'bg-emerald-100 text-emerald-700':p.status==='inactive'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-700'}`}>{p.status}</span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {(p.product_variants||[]).slice(0,3).map((v:any) => (
                    <div key={v.id} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-800">{v.name}</span>
                      <span className="text-gray-400">·</span>
                      <span>{Number(v.price||0).toLocaleString('vi-VN')}₫</span>
                      {v.label && <span className="ml-1 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">{v.label}</span>}
                    </div>
                  ))}
                  {(p.product_variants||[]).length > 3 && <div className="text-xs text-gray-400">+{(p.product_variants||[]).length - 3} nữa</div>}
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="btn btn-ghost" onClick={()=>openEdit(p)}>Sửa</button>
                    <button className="btn btn-ghost text-rose-600" onClick={()=>del(p.id)}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Không có sản phẩm</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editing.product.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
              <button className="btn btn-ghost" onClick={()=>setEditing(null)}>Đóng</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: info + images */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Tên sản phẩm</label>
                    <input
                      className="input"
                      value={editing.product.name}
                      onChange={e=>
                        setEditing(ed=>{
                          if (!ed) return ed
                          const name = e.target.value
                          const nextSlug = slugEdited ? ed.product.slug : slugify(name)
                          return { ...ed, product: { ...ed.product, name, slug: nextSlug } }
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Slug</label>
                    <input
                      className="input"
                      value={editing.product.slug}
                      onChange={e=>{
                        setSlugEdited(true)
                        setEditing(ed=>ed?{...ed,product:{...ed.product,slug:slugify(e.target.value)}}:ed)
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500">Mô tả ngắn</label>
                    <input className="input" value={editing.product.short_description||''} onChange={e=>setEditing(ed=>ed?{...ed,product:{...ed.product,short_description:e.target.value}}:ed)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500">Mô tả dài (khung soạn thảo)</label>
                    <textarea className="input h-28" value={editing.product.description||''} onChange={e=>setEditing(ed=>ed?{...ed,product:{...ed.product,description:e.target.value}}:ed)} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs text-gray-500 block">Tải nhiều ảnh (gallery)</label>
                  <input type="file" multiple accept="image/*" onChange={async (e)=>{
                    const inputEl = e.currentTarget as HTMLInputElement | null
                    const files = inputEl?.files; if (!files || files.length===0) return;
                    setUploading(true)
                    try {
                      const fd = new FormData();
                      Array.from(files).forEach((f: File)=>fd.append('files', f));
                      if (editing?.product?.id) fd.append('productId', editing.product.id as string)
                      const up = await fetch('/api/admin/products/upload', { method: 'POST', body: fd })
                      const upJson = await up.json();
                      if (!up.ok) throw new Error(upJson.error||'Upload failed');
                      const urls: string[] = upJson.urls||[];
                      setEditing(ed=> ed ? ({...ed, product: { ...ed.product, images: [...(ed.product.images||[]), ...urls ] }}) : ed)
                    } catch (err:any) {
                      alert('Upload ảnh thất bại: '+ err?.message)
                    } finally {
                      setUploading(false)
                      if (inputEl) inputEl.value = ''
                    }
                  }} />
                  {uploading && <div className="text-xs text-gray-500 mt-1">Đang tải ảnh...</div>}
                  <div className="mt-2 text-xs text-gray-500">Ảnh đầu tiên sẽ được dùng làm ảnh đại diện sản phẩm.</div>
                </div>
                <div className="mt-2">
                  <label className="text-xs text-gray-500">Thư viện ảnh</label>
                  <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {(editing.product.images||[]).map((url: string, idx: number) => (
                      <div key={idx} className="relative group border rounded-lg overflow-hidden">
                        <img src={url} alt="img" className="w-full h-20 object-cover" />
                        {idx===0 && <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[10px] px-1 py-0.5 rounded">Cover</span>}
                        <button type="button" className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100" onClick={()=> setEditing(ed=>ed?{...ed,product:{...ed.product,images:(ed.product.images||[]).filter((_:string,i:number)=>i!==idx)}}:ed)}>X</button>
                      </div>
                    ))}
                    {(editing.product.images||[]).length === 0 && (
                      <div className="text-xs text-gray-400">Chưa có ảnh</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: pricing + meta + variants */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Giá gốc (base price)</label>
                    <input type="number" className="input" value={editing.product.base_price??''} onChange={e=>setEditing(ed=>ed?{...ed,product:{...ed.product,base_price:e.target.value?Number(e.target.value):null}}:ed)} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Trạng thái</label>
                    <select className="input" value={editing.product.status||'active'} onChange={e=>setEditing(ed=>ed?{...ed,product:{...ed.product,status:e.target.value as any}}:ed)}>
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                      <option value="archived">archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Danh mục</label>
                    <input className="input" value={editing.product.category||'subscription'} onChange={e=>setEditing(ed=>ed?{...ed,product:{...ed.product,category:e.target.value}}:ed)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="is_featured" type="checkbox" checked={!!editing.product.is_featured} onChange={e=>setEditing(ed=>ed?{...ed,product:{...ed.product,is_featured:e.target.checked}}:ed)} />
                    <label htmlFor="is_featured" className="text-sm">Nổi bật</label>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Biến thể (Variants)</h4>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-ghost" onClick={addVariant}>+ Thêm biến thể</button>
                      <button className="btn btn-ghost" onClick={addDefaultFour}>⚡ Dùng 4 gói mặc định</button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {editing.variants.map((v, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                        <div className="md:col-span-4">
                          <label className="text-xs text-gray-500">Tên gói</label>
                          <input className="input" value={v.name} onChange={e=>setVariant(idx,{ name: e.target.value })} />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-xs text-gray-500">Kế hoạch (Plan)</label>
                          <select className="input" value={v.plan_id||''} onChange={e=>setVariant(idx,{ plan_id: e.target.value })}>
                            <option value="">-- chọn kế hoạch --</option>
                            {plans.map(pl => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-500">Giá</label>
                          <input type="number" className="input" value={v.price} onChange={e=>setVariant(idx,{ price: Number(e.target.value||0) })} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-500">Label</label>
                          <select className="input" value={v.label||''} onChange={e=>setVariant(idx,{ label: e.target.value as any })}>
                            <option value="">(none)</option>
                            <option value="HOT">HOT</option>
                            <option value="BEST CHOICE">BEST CHOICE</option>
                            <option value="VIP">VIP</option>
                          </select>
                        </div>
                        <div className="md:col-span-1 flex md:justify-end">
                          <button className="btn btn-ghost text-rose-600" onClick={()=>removeVariant(idx)}>Xóa</button>
                        </div>
                      </div>
                    ))}
                    {editing.variants.length === 0 && (
                      <div className="text-sm text-gray-500">Chưa có biến thể nào</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={()=>setEditing(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={save} disabled={loading}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
