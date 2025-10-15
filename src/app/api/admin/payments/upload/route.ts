import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'payment-proofs'

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
    const file = formData.get('file') as File | null
    const paymentId = (formData.get('paymentId') as string | null) || 'misc'
    if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 })

    // Ensure bucket exists and is public (idempotent)
    try {
      // @ts-ignore: createBucket options type
      await (admin.storage as any).createBucket(BUCKET, { public: true })
    } catch (e: any) {
      // ignore if already exists
    }

    const fileNameSafe = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const path = `${paymentId}/${Date.now()}_${fileNameSafe}`
    const { error: uploadErr } = await admin.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || 'application/octet-stream'
    })
    if (uploadErr) throw uploadErr

    // Build public URL (bucket should be public)
    const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(path)
    const url = publicUrlData.publicUrl

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload proof failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
