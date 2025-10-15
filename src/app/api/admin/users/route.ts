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

    // Get all users with their subscription info using admin client to bypass RLS
    const { data: users, error } = await admin
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        created_at,
        subscriptions (
          plan_name,
          status,
          end_date
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Format data for frontend
    const formattedUsers = users?.map(user => ({
      id: user.id,
      name: user.full_name || user.email.split('@')[0],
      email: user.email,
      role: user.role || 'user',
      plan: user.subscriptions?.[0]?.plan_name || 'Free',
      status: user.subscriptions?.[0]?.status || 'active',
      joinedAt: new Date(user.created_at).toLocaleDateString('vi-VN'),
    })) || []

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
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
    const { email, password, full_name, role = 'user' } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Create user using Supabase Admin API
    // Use Service Role admin client to create users
    const admin = createAdminClient()
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: full_name || email.split('@')[0],
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: createError.message || 'Failed to create user' },
        { status: 400 }
      )
    }

    if (!newUser.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Ensure profile exists and set role/full_name via UPSERT (creates if missing)
    // Use admin client to bypass RLS on profiles table
    const { error: profileError } = await admin
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        email: newUser.user.email,
        full_name: full_name || email.split('@')[0],
        role,
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Error updating profile:', profileError)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        full_name: full_name || email.split('@')[0],
        role,
      },
      message: 'User created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
