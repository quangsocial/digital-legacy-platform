import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// POST - Create new order
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get request body
    const body = await request.json()
    const { 
      user_id, 
      product_variant_id, 
      plan_id,
      amount
    } = body

    // Validate required fields
    if (!user_id || !product_variant_id || !plan_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user exists (use admin client to bypass RLS)
    const { data: userExists } = await admin
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', user_id)
      .single()

    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify product variant exists (use admin client)
    const { data: variant } = await admin
      .from('product_variants')
      .select('*, plans(*), products(*)')
      .eq('id', product_variant_id)
      .single()

    if (!variant) {
      return NextResponse.json(
        { error: 'Product variant not found' },
        { status: 404 }
      )
    }

    // Build snapshot fields to satisfy NOT NULL columns in orders schema
    const billing_cycle = variant.billing_period === 'yearly' ? 'yearly' : 'monthly'
    const plan_name = variant.name || variant.plans?.name || 'Unknown Plan'
    const customer_name = userExists.full_name || userExists.email
    const customer_email = userExists.email

    // Pricing snapshot
  const subtotal = typeof amount === 'number' && amount > 0 ? amount : Number(variant.price) || 0
    const tax = 0
    const discount = 0
    const total = subtotal - discount + tax

    // Create order with required fields using admin client (bypass RLS)
    // Rely on DB trigger to generate order_number; status default set to 'new' by migration patch
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        user_id,
        plan_id,
        product_variant_id,
        // schema fields
        customer_name,
        customer_email,
        plan_name,
        billing_cycle,
        subtotal,
        tax,
        discount,
        total,
        status: 'new',
        order_date: new Date().toISOString(),
      })
      .select(`
        *,
        profiles:user_id (
          email,
          full_name
        ),
        plans (
          name,
          description
        )
      `)
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: orderError.message || 'Failed to create order' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.profiles.full_name || order.profiles.email,
        customerEmail: order.profiles.email,
        plan: order.plans.name,
        amount: (order.total ?? order.subtotal ?? subtotal),
        status: order.status,
        createdAt: order.created_at,
      },
      message: 'Order created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
