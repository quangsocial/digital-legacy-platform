import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin','super_admin'].includes(profile.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Revenue: sum orders.total where status completed
  const { data: revRows } = await admin.from('orders').select('total').eq('status','completed')
  const revenue = (revRows||[]).reduce((s:any,r:any)=>s+Number(r.total||0),0)
  // Collected cash and cashflow from cash_transactions only (avoid double counting with payments)
  const { data: inRows } = await admin.from('cash_transactions').select('amount').eq('txn_type','in')
  const { data: outRows } = await admin.from('cash_transactions').select('amount').eq('txn_type','out')
  const inSum = (inRows||[]).reduce((s:any,r:any)=>s+Number(r.amount||0),0)
  const outSum = (outRows||[]).reduce((s:any,r:any)=>s+Number(r.amount||0),0)
  const collectedCash = inSum
  const cashflow = inSum - outSum

  // Orders counts
  const { count: ordersPlaced } = await admin.from('orders').select('*', { count: 'exact', head: true })
  const { count: ordersSuccess } = await admin.from('orders').select('*', { count: 'exact', head: true }).eq('status','completed')
  const { count: ordersNeedsAction } = await admin.from('orders').select('*', { count: 'exact', head: true }).in('status',['new','pending_payment'])

  // Bills counts (payments)
  const { count: billsSuccess } = await admin.from('payments').select('*', { count: 'exact', head: true }).eq('status','paid')
  const { count: billsNeedsAction } = await admin.from('payments').select('*', { count: 'exact', head: true }).eq('status','new')

  return NextResponse.json({ revenue, collectedCash, cashflow, ordersPlaced: ordersPlaced||0, ordersSuccess: ordersSuccess||0, ordersNeedsAction: ordersNeedsAction||0, billsSuccess: billsSuccess||0, billsNeedsAction: billsNeedsAction||0 })
}
