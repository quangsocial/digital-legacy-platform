import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - List all products with variants
export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all products with their variants
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (
          *,
          plans (
            id,
            name,
            description
          )
        )
      `)
      .eq('status', 'active')
      .order('sort_order', { ascending: true })

    if (error) throw error

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
