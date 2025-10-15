import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET: list all payment methods
export async function GET() {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || !['admin','super_admin'].includes(profile.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await admin.from('payment_methods').select('*').order('name')
    if (error) throw error
    return NextResponse.json({ methods: data })
  } catch (e) {
    console.error('GET /admin/payment-methods error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: create or update a method by code
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || !['admin','super_admin'].includes(profile.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { code, name, details, active } = body
    if (!code || !name) return NextResponse.json({ error: 'Missing code or name' }, { status: 400 })

    const payload: any = { code, name }
    if (details !== undefined) payload.details = details
    if (active !== undefined) payload.active = !!active

    const { data, error } = await admin
      .from('payment_methods')
      .upsert(payload, { onConflict: 'code' })
      .select()
    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('POST /admin/payment-methods error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: update by id or code (toggle active, update name/details)
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || !['admin','super_admin'].includes(profile.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { id, code, name, details, active } = body
    if (!id && !code) return NextResponse.json({ error: 'Missing id or code' }, { status: 400 })

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (details !== undefined) updates.details = details
    if (active !== undefined) updates.active = !!active

    let query = admin.from('payment_methods').update(updates)
    if (id) query = query.eq('id', id)
    else query = query.eq('code', code)
    const { data, error } = await query.select().single()
    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('PATCH /admin/payment-methods error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
