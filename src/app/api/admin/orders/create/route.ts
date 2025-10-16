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
    // 1. Check profiles for user by email
    let userId = '';
    let userEmail = email;
    let userFullName = customer_name || '';
    let userProfile = null;
    let userProfileErr = null;
    try {
      const res = await admin
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', email)
        .single();
      userProfile = res.data;
      userProfileErr = res.error;
    } catch (e) {}

    if (userProfile && userProfile.id) {
      userId = userProfile.id;
      userEmail = userProfile.email;
      userFullName = userProfile.full_name || customer_name || userProfile.email;
    } else {
      // 2. If not found in profiles, create new user in Supabase Auth
      const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
      const { data: newUser, error: createUserError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      if (createUserError || !newUser?.user) {
        return NextResponse.json(
          { error: 'Không tạo được user mới', detail: createUserError },
          { status: 400 }
        );
      }
      userId = newUser.user.id;
      userEmail = newUser.user.email;
      // Insert profile cho user mới
      const { error: profileInsertError } = await admin
        .from('profiles')
        .insert({ id: userId, email: userEmail, full_name: customer_name || userEmail });
      if (profileInsertError && !String(profileInsertError.message).includes('duplicate')) {
        return NextResponse.json(
          { error: 'Không tạo được profile cho user', detail: profileInsertError },
          { status: 400 }
        );
      }
      userFullName = customer_name || userEmail;
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
  // Nếu amount truyền vào là số (kể cả 0), dùng luôn, chỉ fallback sang variant.price nếu amount là undefined/null
  const subtotal = (typeof amount === 'number' && !isNaN(amount)) ? amount : (Number(variant.price) || 0);
    const tax = 0;
    const discount = 0;
    const total = subtotal - discount + tax;

    // Create order with required fields using admin client (bypass RLS)
    // Rely on DB trigger to generate order_number; status default set to 'new' by migration patch
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        user_id: userId, // Đảm bảo là UUID, không phải email
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

    // Remove dashes from order_number before returning
    const orderNumber = (order.order_number || '').replace(/-/g, '')
    return NextResponse.json({
      success: true,
      order: {
        id: order.id, // UUID v4
        order_number: orderNumber, // text, e.g. ORD2025100001
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        plan_name: order.plan_name,
        billing_cycle: order.billing_cycle,
        subtotal: order.subtotal,
        tax: order.tax,
        discount: order.discount,
        total: order.total,
        status: order.status,
        order_date: order.order_date,
        created_at: order.created_at,
        // Optionally include related info if needed
        profiles: order.profiles,
        plans: order.plans,
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
