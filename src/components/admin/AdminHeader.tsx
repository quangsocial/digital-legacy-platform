'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  email: string
  role: string
  avatar_url?: string
  full_name?: string
}

export default function AdminHeader() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, avatar_url')
          .eq('id', authUser.id)
          .single()
        
        setUser({
          email: authUser.email || '',
          role: profile?.role || 'user',
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
        })
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'A'
  }

  return (
    <header className="nav-glass sticky top-0 z-20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Bảng điều khiển</h1>
          <p className="text-sm text-[var(--muted)]">Quản lý Digital Legacy Platform</p>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user.full_name || user.role}</p>
                <p className="text-xs text-[var(--muted)]">{user.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {getInitials(user.full_name, user.email)}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="ml-2 btn btn-ghost border border-gray-200"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  )
}
