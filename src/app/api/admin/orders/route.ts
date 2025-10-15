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

    // Get all orders with customer info using admin client to bypass RLS
    const { data: orders, error } = await admin
      .from('orders')
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        customer_notes,
        admin_notes,
        plan_name,
        billing_cycle,
        total,
        subtotal,
        tax,
        discount,
        currency,
        plan_id,
        product_variant_id,
        status,
        order_date,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Format data for frontend
    const formattedOrders = orders?.map(order => {
      const totalNumber = typeof order.total === 'number' ? order.total : Number(order.total ?? order.subtotal ?? 0)
      return {
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name || 'Không rõ',
        customerEmail: order.customer_email || '',
        plan: order.plan_name || 'Không rõ',
        // keep numeric for UI calculations and formatting
        amount: Number.isFinite(totalNumber) ? totalNumber : 0,
        status: order.status,
        // send ISO string; UI will format locale date
        date: order.order_date || order.created_at,
        // extra fields for editing
        billingCycle: order.billing_cycle,
        subtotal: Number(order.subtotal) || 0,
        tax: Number(order.tax) || 0,
        discount: Number(order.discount) || 0,
        currency: order.currency || 'VND',
        planId: order.plan_id,
        productVariantId: order.product_variant_id,
        customerNotes: order.customer_notes || '',
        adminNotes: order.admin_notes || '',
        customerPhone: order.customer_phone || '',
        customerAddress: order.customer_address || '',
      }
    }) || []

  return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error('Error fetching orders:', error)
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
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing orderId or status' },
        { status: 400 }
      )
    }

    // Update order status
    const { data: existingOrder, error: fetchErr } = await admin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchErr || !existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const allowedStatuses = ['new','draft','pending_payment','confirmed','completed','cancelled']
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updatePayload: any = { status }
    if (status === 'completed') updatePayload.completed_date = new Date().toISOString()
    if (status === 'cancelled') updatePayload.cancelled_date = new Date().toISOString()

    const { data, error } = await admin
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error

    // Auto-create a payment when order becomes completed
    if (status === 'completed') {
      // prevent duplicate bill: check if any payment already exists for this order
      const { data: existingPayments, error: payErr } = await admin
        .from('payments')
        .select('id')
        .eq('order_id', data.id)
        .limit(1)

      if (payErr) throw payErr
      if (!existingPayments || existingPayments.length === 0) {
        const paymentInsert = {
          order_id: data.id,
          user_id: data.user_id,
          amount: Number(data.total ?? data.subtotal ?? 0),
          status: 'new',
        }
        const { error: insertPayErr } = await admin.from('payments').insert(paymentInsert)
        if (insertPayErr) {
          console.error('Auto-create payment failed:', insertPayErr)
          throw insertPayErr
        }
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Edit order fields (admin only)
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      admin_notes,
      customer_notes,
      coupon_code,
      status,
      subtotal,
      tax,
      discount,
      currency,
      plan_id,
      product_variant_id
    } = body
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const updatable: any = {}
    if (customer_name !== undefined) updatable.customer_name = customer_name
    if (customer_email !== undefined) updatable.customer_email = customer_email
    if (customer_phone !== undefined) updatable.customer_phone = customer_phone
    if (customer_address !== undefined) updatable.customer_address = customer_address
    if (admin_notes !== undefined) updatable.admin_notes = admin_notes
    if (coupon_code !== undefined) updatable.coupon_code = coupon_code
    if (status !== undefined) updatable.status = status
    if (customer_notes !== undefined) updatable.customer_notes = customer_notes
    if (subtotal !== undefined) updatable.subtotal = subtotal
    if (tax !== undefined) updatable.tax = tax
    if (discount !== undefined) updatable.discount = discount
    if (currency !== undefined) updatable.currency = currency
    if (plan_id !== undefined) updatable.plan_id = plan_id
    if (product_variant_id !== undefined) {
      updatable.product_variant_id = product_variant_id
      // Derive billing_cycle and plan snapshot from variant
      const { data: variant, error: vErr } = await admin
        .from('product_variants')
        .select('billing_period, name, plans(id, name)')
        .eq('id', product_variant_id)
        .single()
      if (vErr) throw vErr
      if (variant) {
        updatable.billing_cycle = (variant.billing_period === 'yearly') ? 'yearly' : 'monthly'
        const planObj = Array.isArray(variant.plans) ? variant.plans[0] : variant.plans
        if (planObj?.id) updatable.plan_id = planObj.id
        // Update plan_name snapshot if available
        updatable.plan_name = planObj?.name || variant.name || updatable.plan_name
      }
    }

    // Keep total consistent if any pricing changed
    if (subtotal !== undefined || tax !== undefined || discount !== undefined) {
      const newSubtotal = subtotal ?? 0
      const newTax = tax ?? 0
      const newDiscount = discount ?? 0
      updatable.total = (Number(newSubtotal) || 0) - (Number(newDiscount) || 0) + (Number(newTax) || 0)
    }

    const { data, error } = await admin
      .from('orders')
      .update(updatable)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    // Auto-create payment if status is completed and none exists
    if (updatable.status === 'completed') {
      const { data: existingPayments, error: payErr } = await admin
        .from('payments')
        .select('id')
        .eq('order_id', data.id)
        .limit(1)
      if (payErr) throw payErr
      if (!existingPayments || existingPayments.length === 0) {
        const { error: insertPayErr } = await admin.from('payments').insert({
          order_id: data.id,
          user_id: data.user_id,
          amount: Number(data.total ?? data.subtotal ?? 0),
          status: 'new',
        })
        if (insertPayErr) {
          console.error('Auto-create payment (PUT) failed:', insertPayErr)
          throw insertPayErr
        }
      }
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error editing order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove an order (admin only)
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { error } = await admin
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
