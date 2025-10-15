import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET: list with filters + pagination
export async function GET(request: Request) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin','super_admin'].includes(profile.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''
  const type = searchParams.get('type') || '' // in|out
  const category = searchParams.get('category') || ''
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const limit = Math.min(Number(searchParams.get('limit') || 50), 200)
  const page = Math.max(Number(searchParams.get('page') || 1), 1)

  let query = admin.from('cash_transactions').select(`
    id, voucher_number, txn_type, category, amount, currency, txn_date, notes, order_id,
    orders:orders!cash_transactions_order_id_fkey (order_number)
  `)
  if (type) query = query.eq('txn_type', type)
  if (category) query = query.eq('category', category)
  if (from) query = query.gte('txn_date', from)
  if (to) query = query.lte('txn_date', to)
  if (q && q.length >= 2) {
    const like = `*${q}*`
    query = query.or(`category.ilike.${like},notes.ilike.${like},orders.order_number.ilike.${like}`)
  }
  const fromIdx = (page-1)*limit
  const toIdx = fromIdx + limit - 1
  const { data, error } = await query.order('txn_date', { ascending: false }).range(fromIdx, toIdx)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const formatted = (data||[]).map((r:any)=>({
    id: r.id,
    voucherNumber: r.voucher_number || null,
    type: r.txn_type,
    category: r.category,
    amount: Number(r.amount)||0,
    currency: r.currency||'VND',
    date: r.txn_date,
    notes: r.notes||'',
    orderId: r.order_id||null,
    orderNumber: r.orders?.order_number||null,
  }))
  return NextResponse.json({ items: formatted })
}

// POST: create transaction
export async function POST(request: Request) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin','super_admin'].includes(profile.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { type, category, amount, currency='VND', date, notes, order_id } = body
  if (!type || !['in','out'].includes(type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  if (!category) return NextResponse.json({ error: 'Missing category' }, { status: 400 })
  const insert = {
    txn_type: type,
    category,
    amount: Number(amount)||0,
    currency,
    txn_date: date || new Date().toISOString(),
    notes: notes || null,
    order_id: order_id || null,
  }
  const { data, error } = await admin.from('cash_transactions').insert(insert).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, id: data.id })
}

// PATCH: update transaction
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin','super_admin'].includes(profile.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { id, type, category, amount, currency, date, notes, order_id } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const updates: any = {}
  if (type) updates.txn_type = type
  if (category !== undefined) updates.category = category
  if (amount !== undefined) updates.amount = Number(amount)||0
  if (currency !== undefined) updates.currency = currency
  if (date !== undefined) updates.txn_date = date
  if (notes !== undefined) updates.notes = notes
  if (order_id !== undefined) updates.order_id = order_id
  const { error } = await admin.from('cash_transactions').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE: remove a transaction by id
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin','super_admin'].includes(profile.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const { error } = await admin.from('cash_transactions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
