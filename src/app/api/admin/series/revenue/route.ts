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

  // Aggregate payments (paid) by date
  const { data } = await admin.from('payments').select('amount, payment_date').eq('status','paid')
  const map = new Map<string, number>()
  for (const r of (data||[])) {
    const d = new Date(r.payment_date).toISOString().slice(0,10)
    map.set(d, (map.get(d)||0) + Number(r.amount||0))
  }
  const series = Array.from(map.entries()).sort(([a],[b])=>a.localeCompare(b)).map(([date, value])=>({ date, value }))
  return NextResponse.json({ series })
}
