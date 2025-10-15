import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Public: Get active payment methods for checkout
export async function GET() {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('payment_methods')
      .select('code,name,details')
      .eq('active', true)
      .order('name')
    if (error) throw error
    return NextResponse.json({ methods: data })
  } catch (e) {
    console.error('GET /payment-methods error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
