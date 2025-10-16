import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/admin/orders/get?orderNumber=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')
    if (!orderNumber) return NextResponse.json({ error: 'Missing orderNumber' }, { status: 400 })

    const admin = createAdminClient()
    // Always search with dashes removed (for new format)
    const { data: order, error } = await admin
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber.replace(/-/g, ''))
      .single()
    if (error || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Remove dashes from order_number in response
    const orderPatched = { ...order, order_number: (order.order_number || '').replace(/-/g, '') }
    return NextResponse.json({ order: orderPatched }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
