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
      email, // người dùng chỉ nhập email
      product_variant_id,
      plan_id,
      amount,
      customer_name // optional
    } = body;

    // Validate required fields
    console.log('DEBUG: body', body);
    if (!email || !product_variant_id) {
      console.error('DEBUG: Missing email or product_variant_id', { email, product_variant_id });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Tìm user theo email, nếu chưa có thì tạo mới
    let { data: userExists, error: userQueryError } = await admin
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single();
    console.log('DEBUG: userExists', userExists, 'userQueryError', userQueryError);

    let userId = '';
    let userEmail = email;
    let userFullName = customer_name || '';
    if (!userExists) {
      // Tạo user mới với email, sinh password ngẫu nhiên
      const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
      const { data: newUser, error: createUserError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      console.log('DEBUG: newUser', newUser, 'createUserError', createUserError);
      if (createUserError || !newUser?.user) {
        return NextResponse.json(
          { error: 'Không tạo được user mới', detail: createUserError },
          { status: 400 }
        );
      }
      userId = newUser.user.id;
      userEmail = newUser.user.email;
      // TODO: Gửi email tạo password cho user mới (có thể dùng Supabase hoặc dịch vụ ngoài)
      // TODO: Gửi email thông báo đơn hàng cho user mới
    } else {
      userId = userExists.id;
      userEmail = userExists.email;
      userFullName = userExists.full_name || customer_name || userExists.email;
    }

    // Verify product variant exists (use admin client)
    const { data: variant, error: variantError } = await admin
      .from('product_variants')
      .select('*, plans(*), products(*)')
      .eq('id', product_variant_id)
      .single();
    console.log('DEBUG: variant', variant, 'variantError', variantError);

    if (!variant) {
      return NextResponse.json(
        { error: 'Product variant not found', detail: variantError },
        { status: 404 }
      );
    }

  // Build snapshot fields to satisfy NOT NULL columns in orders schema
  const billing_cycle = variant.billing_period === 'yearly' ? 'yearly' : 'monthly';
  const plan_name = variant.name || variant.plans?.name || 'Unknown Plan';

    // Pricing snapshot
    const subtotal = typeof amount === 'number' && amount > 0 ? amount : Number(variant.price) || 0;
    const tax = 0;
    const discount = 0;
    const total = subtotal - discount + tax;

    // Create order with required fields using admin client (bypass RLS)
    // Rely on DB trigger to generate order_number; status default set to 'new' by migration patch
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        user_id: userId, // Đảm bảo là UUID, không phải email
        plan_id,
        product_variant_id,
        // schema fields
        customer_name: userFullName,
        customer_email: userEmail,
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
      .single();
    console.log('DEBUG: order', order, 'orderError', orderError);

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
        plan: order.plans?.name || order.plan_name || null,
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
