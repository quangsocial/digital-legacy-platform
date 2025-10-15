import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

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

    // Get statistics in parallel
    const [usersResult, ordersResult, revenueResult, messagesResult] = await Promise.all([
      // Total users
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true }),

      // Total orders
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true }),

      // Total revenue (sum of completed orders)
      supabase
        .from('orders')
        .select('total')
        .eq('status', 'completed'),

      // Total messages (if you have messages table, otherwise return 0)
      Promise.resolve({ data: [], count: 0 })
    ])

    // Calculate total revenue
    const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0

    const stats = {
      totalUsers: usersResult.count || 0,
      totalOrders: ordersResult.count || 0,
      totalRevenue: totalRevenue,
      totalMessages: messagesResult.count || 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
