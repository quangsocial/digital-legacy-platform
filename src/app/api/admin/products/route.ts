import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// Helper to check admin
async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, status: 401 as const }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || !['admin','super_admin'].includes(profile.role)) return { ok: false, status: 403 as const }
  return { ok: true, status: 200 as const }
}

// GET - list products with variants (admin sees all)
export async function GET(request: Request) {
  try {
    const auth = await assertAdmin()
    if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
    const admin = createAdminClient()

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    let query = admin
      .from('products')
      .select(`
        *,
        product_variants (
          id,
          plan_id,
          sku,
          name,
          price,
          compare_at_price,
          billing_period,
          is_popular,
          is_available,
          sort_order,
          label,
          created_at,
          updated_at,
          plans(id, name, slug)
        )
      `)
      .order('sort_order', { ascending: true })

    if (q) {
      const like = `%${q}%`
      query = query.ilike('name', like)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ products: data || [] })
  } catch (error) {
    console.error('Error listing products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - create product with optional variants
export async function POST(request: Request) {
  try {
    const auth = await assertAdmin()
    if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
    const admin = createAdminClient()

    const body = await request.json()
    const { product, variants } = body as {
      product: any,
      variants?: Array<any>
    }

    if (!product?.name || !product?.slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 })
    }

    const insertProd: any = {
      name: product.name,
      slug: product.slug,
      description: product.description ?? null,
      short_description: product.short_description ?? null,
      category: product.category ?? 'subscription',
      status: product.status ?? 'active',
      images: product.images ?? null,
      is_featured: !!product.is_featured,
      sort_order: product.sort_order ?? 0,
      metadata: product.metadata ?? null,
      base_price: product.base_price ?? null,
    }
    // Derive image_url from first image if present
    if (Array.isArray(product.images) && product.images.length > 0) {
      insertProd.image_url = product.images[0]
    }

    const { data: prod, error: prodErr } = await admin
      .from('products')
      .insert(insertProd)
      .select()
      .single()
    if (prodErr) throw prodErr

    if (Array.isArray(variants) && variants.length > 0) {
      const toInsert = variants.map(v => ({
        product_id: prod.id,
        plan_id: v.plan_id,
        sku: v.sku ?? null,
        name: v.name,
        price: Number(v.price) || 0,
        compare_at_price: v.compare_at_price ?? null,
        billing_period: v.billing_period ?? null,
        is_popular: !!v.is_popular,
        is_available: v.is_available ?? true,
        sort_order: v.sort_order ?? 0,
        label: v.label ?? null,
        metadata: v.metadata ?? null,
      }))
      const { error: vErr } = await admin.from('product_variants').insert(toInsert)
      if (vErr) throw vErr
    }

    return NextResponse.json({ success: true, product: prod })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - update product and upsert variants
export async function PUT(request: Request) {
  try {
    const auth = await assertAdmin()
    if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
    const admin = createAdminClient()

    const body = await request.json()
    const { id, product, variants } = body as { id: string, product?: any, variants?: Array<any> }
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    if (product) {
      const updates: any = {}
      const fields = ['name','slug','description','short_description','category','status','images','is_featured','sort_order','metadata','base_price']
      for (const k of fields) if (product[k] !== undefined) updates[k] = product[k]
      // Always compute image_url from images when images provided
      if (product.images !== undefined) {
        if (Array.isArray(product.images) && product.images.length > 0) updates.image_url = product.images[0]
        else updates.image_url = null
      }
      if (Object.keys(updates).length) {
        const { error: updErr } = await admin.from('products').update(updates).eq('id', id)
        if (updErr) throw updErr
      }
    }

    if (Array.isArray(variants)) {
      // Variant operations: each variant may include id (update), or _delete flag
      for (const v of variants) {
        if (v._delete && v.id) {
          const { error: delErr } = await admin.from('product_variants').delete().eq('id', v.id)
          if (delErr) throw delErr
          continue
        }
        if (v.id) {
          const updates: any = {}
          const vFields = ['plan_id','sku','name','price','compare_at_price','billing_period','is_popular','is_available','sort_order','label','metadata']
          for (const k of vFields) if (v[k] !== undefined) updates[k] = v[k]
          const { error: vUpdErr } = await admin.from('product_variants').update(updates).eq('id', v.id)
          if (vUpdErr) throw vUpdErr
        } else {
          const insert: any = {
            product_id: id,
            plan_id: v.plan_id,
            sku: v.sku ?? null,
            name: v.name,
            price: Number(v.price) || 0,
            compare_at_price: v.compare_at_price ?? null,
            billing_period: v.billing_period ?? null,
            is_popular: !!v.is_popular,
            is_available: v.is_available ?? true,
            sort_order: v.sort_order ?? 0,
            label: v.label ?? null,
            metadata: v.metadata ?? null,
          }
          const { error: vInsErr } = await admin.from('product_variants').insert(insert)
          if (vInsErr) throw vInsErr
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - remove product
export async function DELETE(request: Request) {
  try {
    const auth = await assertAdmin()
    if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
    const admin = createAdminClient()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { error } = await admin.from('products').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
