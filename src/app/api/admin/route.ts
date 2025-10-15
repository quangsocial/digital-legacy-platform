import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { action, email, password } = await request.json()

    if (action === 'create_super_admin') {
      // For now, just return instructions to manually create the user
      return NextResponse.json({
        success: false,
        message: 'Manual setup required',
        instructions: [
          '1. Đăng ký tài khoản thông thường qua /login',
          '2. Sau khi đăng ký, chạy SQL command để upgrade role',
          '3. SQL: UPDATE profiles SET role = \'super_admin\' WHERE email = \'quangsocial@gmail.com\';'
        ],
        manualSteps: {
          step1: 'Đăng ký tài khoản quangsocial@gmail.com qua trang /login',
          step2: 'Vào Supabase SQL Editor',
          step3: 'Chạy: UPDATE profiles SET role = \'super_admin\' WHERE email = \'quangsocial@gmail.com\';',
          step4: 'Đăng nhập lại để thấy admin panel'
        },
        requiresServiceRoleKey: true,
        currentServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'Missing'
      })
    }

    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 })

  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      message: 'Admin API endpoint',
      serviceRoleKeyConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      instructions: 'Use POST with action parameter'
    })

  } catch (error) {
    console.error('Admin GET error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}