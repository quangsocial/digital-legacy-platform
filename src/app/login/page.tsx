'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/dashboard')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Digital Legacy Platform
            </h1>
            <p className="text-gray-600">
              Đăng nhập để quản lý di chúc số của bạn
            </p>
          </div>

          <Auth
            supabaseClient={supabase}
            view="magic_link"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
            }}
            localization={{
              variables: {
                sign_up: {
                  email_label: 'Địa chỉ email',
                  password_label: 'Mật khẩu',
                  email_input_placeholder: 'Nhập email của bạn',
                  password_input_placeholder: 'Nhập mật khẩu',
                  button_label: 'Đăng ký',
                  loading_button_label: 'Đang đăng ký...',
                  social_provider_text: 'Đăng nhập với {{provider}}',
                  link_text: 'Chưa có tài khoản? Đăng ký',
                  confirmation_text: 'Kiểm tra email để xác nhận tài khoản',
                },
                sign_in: {
                  email_label: 'Địa chỉ email',
                  password_label: 'Mật khẩu',
                  email_input_placeholder: 'Nhập email của bạn',
                  password_input_placeholder: 'Nhập mật khẩu',
                  button_label: 'Đăng nhập',
                  loading_button_label: 'Đang đăng nhập...',
                  social_provider_text: 'Đăng nhập với {{provider}}',
                  link_text: 'Đã có tài khoản? Đăng nhập',
                },
                magic_link: {
                  email_input_label: 'Địa chỉ email',
                  email_input_placeholder: 'Nhập email của bạn',
                  button_label: 'Gửi liên kết đăng nhập',
                  loading_button_label: 'Đang gửi liên kết...',
                  link_text: 'Gửi liên kết đăng nhập qua email',
                  confirmation_text: 'Kiểm tra email để đăng nhập',
                },
                forgotten_password: {
                  email_label: 'Địa chỉ email',
                  password_label: 'Mật khẩu',
                  email_input_placeholder: 'Nhập email của bạn',
                  button_label: 'Gửi hướng dẫn đặt lại mật khẩu',
                  loading_button_label: 'Đang gửi hướng dẫn...',
                  link_text: 'Quên mật khẩu?',
                  confirmation_text: 'Kiểm tra email để đặt lại mật khẩu',
                },
              },
            }}
            providers={[]}
            redirectTo={`${window.location.origin}/auth/callback`}
          />

          <div className="mt-6 text-center">
            <a 
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Quay về trang chủ
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}