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

  const { data } = await admin.from('orders').select('created_at')
  const map = new Map<string, number>()
  for (const r of (data||[])) {
    const d = new Date(r.created_at).toISOString().slice(0,10)
    map.set(d, (map.get(d)||0) + 1)
  }
  const series = Array.from(map.entries()).sort(([a],[b])=>a.localeCompare(b)).map(([date, value])=>({ date, value }))
  return NextResponse.json({ series })
}
