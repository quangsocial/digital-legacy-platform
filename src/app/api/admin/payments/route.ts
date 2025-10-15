import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
  const supabase = await createClient()
  const admin = createAdminClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Build filters from query params
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''
    const statusParam = searchParams.get('status') || ''
    const methodParam = searchParams.get('method') || ''
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const productVariantId = searchParams.get('product_variant_id')

    // Get payments with order + product info
    let query = admin
      .from('payments')
      .select(`
        id,
        payment_number,
        amount,
        payment_method,
        status,
        payment_date,
        transaction_id,
  notes,
  admin_notes,
  proof_url,
        order_id,
        orders!inner (
          order_number,
          customer_name,
          customer_email,
          product_variant_id,
          product_variants!orders_product_variant_id_fkey (
            name,
            sku,
            products (
              name
            )
          )
        )
      `)

    if (statusParam) query = query.eq('status', statusParam)
    if (methodParam) query = query.eq('payment_method', methodParam)
    if (from) query = query.gte('payment_date', from)
    if (to) query = query.lte('payment_date', to)
    if (productVariantId) query = query.eq('orders.product_variant_id', productVariantId)

    const { data: payments, error } = await query.order('payment_date', { ascending: false })

    if (error) throw error

    // Format data for frontend
    const formattedPayments = payments?.map((payment: any) => ({
      id: payment.id,
      paymentNumber: payment.payment_number,
      orderNumber: payment.orders?.order_number || 'N/A',
      customerName: payment.orders?.customer_name || 'N/A',
      amount: Number(payment.amount) || 0,
      method: payment.payment_method,
      status: payment.status,
      transactionId: payment.transaction_id || null,
      createdAt: payment.payment_date,
      productVariantId: payment.orders?.product_variant_id || null,
      productName: payment.orders?.product_variants?.products?.name || null,
      variantName: payment.orders?.product_variants?.name || null,
      notes: payment.notes || '',
      adminNotes: payment.admin_notes || '',
      proofUrl: payment.proof_url || null,
    })) || []

    return NextResponse.json({ payments: formattedPayments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
  const supabase = await createClient()
  const admin = createAdminClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

  const body = await request.json()
  const { paymentId, status, payment_method, notes, proof_url } = body

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Missing paymentId or status' },
        { status: 400 }
      )
    }

    // Validate new status against compact set
    const allowed = ['new','paid','refunded']
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // If marking as paid, require payment_method
    if (status === 'paid' && !payment_method) {
      return NextResponse.json({ error: 'payment_method is required when marking as paid' }, { status: 400 })
    }

    // Update payment status (and optional fields)
    const updatePayload: any = { status }
    if (status === 'paid' && payment_method) updatePayload.payment_method = payment_method
    if (notes !== undefined) updatePayload.notes = notes
    if (proof_url !== undefined) updatePayload.proof_url = proof_url

    const { data, error } = await admin
      .from('payments')
      .update(updatePayload)
      .eq('id', paymentId)
      .select()
      .single()

    if (error) throw error

    // If refunded, cancel linked order as requested
    if (status === 'refunded' && data?.order_id) {
      const { error: orderErr } = await admin
        .from('orders')
        .update({ status: 'cancelled', cancelled_date: new Date().toISOString() })
        .eq('id', data.order_id)
      if (orderErr) throw orderErr
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Edit payment fields (admin only)
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || !['admin','super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, amount, payment_method, transaction_id, notes, admin_notes } = body
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const updates: any = {}
    if (amount !== undefined) updates.amount = Number(amount) || 0
    if (payment_method !== undefined) updates.payment_method = payment_method
    if (transaction_id !== undefined) updates.transaction_id = transaction_id
    if (notes !== undefined) updates.notes = notes
    if (admin_notes !== undefined) updates.admin_notes = admin_notes

    const { data, error } = await admin
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error editing payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
