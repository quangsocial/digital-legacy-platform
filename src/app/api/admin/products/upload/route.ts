import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'product-images'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()

    // Auth: admin only
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || !['admin','super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const files = (formData.getAll('files') as File[]).filter(Boolean)
    const fileSingle = formData.get('file') as File | null
    const productId = (formData.get('productId') as string | null) || 'misc'

    const uploadFiles: File[] = files.length > 0 ? files : (fileSingle ? [fileSingle] : [])
    if (uploadFiles.length === 0) return NextResponse.json({ error: 'Missing files' }, { status: 400 })

    // Ensure bucket exists and is public (idempotent)
    try {
      // @ts-ignore
      await (admin.storage as any).createBucket(BUCKET, { public: true })
    } catch (e) {
      // ignore if exists
    }

    const urls: string[] = []
    for (const f of uploadFiles) {
      const safe = f.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
      const path = `${productId}/${Date.now()}_${Math.random().toString(36).slice(2)}_${safe}`
      const { error: uploadErr } = await admin.storage.from(BUCKET).upload(path, f, {
        upsert: true,
        contentType: f.type || 'application/octet-stream'
      })
      if (uploadErr) throw uploadErr
      const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(path)
      urls.push(publicUrlData.publicUrl)
    }

    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Upload product images failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
