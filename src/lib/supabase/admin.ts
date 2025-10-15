import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with Service Role for admin operations
// Uses SUPABASE_SERVICE_ROLE_KEY to access auth.admin and bypass RLS when needed
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase URL or Service Role Key in environment variables')
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'admin-server',
      },
    },
  })
}
