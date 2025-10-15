import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function ensureAdmin() {
  return (async () => {
    const supabase = await createClient()
    const admin = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || !['admin','super_admin'].includes(profile.role)) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    return { admin }
  })()
}

export async function GET() {
  try {
    const auth = await ensureAdmin()
    if ('error' in auth) return auth.error
    const { admin } = auth

    const [banks, paypals, momos, cryptos, qrBanks] = await Promise.all([
      admin.from('payment_bank_accounts').select('*').order('sort_order'),
      admin.from('payment_paypal_accounts').select('*').order('sort_order'),
      admin.from('payment_momo_accounts').select('*').order('sort_order'),
      admin.from('payment_crypto_wallets').select('*').order('sort_order'),
      admin.from('payment_qr_bank_accounts').select('*').order('sort_order'),
    ])

    return NextResponse.json({
      bank: banks.data || [],
      paypal: paypals.data || [],
      momo: momos.data || [],
      crypto: cryptos.data || [],
      qr_bank: qrBanks.data || [],
    })
  } catch (e) {
    console.error('GET /admin/payment-accounts', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await ensureAdmin()
    if ('error' in auth) return auth.error
    const { admin } = auth

    const body = await request.json()
    const { category } = body
    if (!category) return NextResponse.json({ error: 'Missing category' }, { status: 400 })

    const byCat: any = {
      bank: { table: 'payment_bank_accounts', fields: ['bank_name','account_number','account_holder','bank_branch','currency','active','sort_order'] },
      paypal: { table: 'payment_paypal_accounts', fields: ['paypal_email','display_name','currency','active','sort_order'] },
      momo: { table: 'payment_momo_accounts', fields: ['momo_number','momo_account','qr_image_url','active','sort_order'] },
      crypto: { table: 'payment_crypto_wallets', fields: ['token','network','address','qr_image_url','memo_tag','active','sort_order'] },
      qr_bank: { table: 'payment_qr_bank_accounts', fields: [
        'bank_code','bank_name','account_number','account_holder','qr_template','description_template','include_amount',
        'sepay_client_id','sepay_client_secret','sepay_merchant_id','sepay_api_url','sepay_bank_id',
        'active','sort_order'] },
    }
    const meta = byCat[category]
    if (!meta) return NextResponse.json({ error: 'Invalid category' }, { status: 400 })

    const payload: any = {}
    for (const f of meta.fields) if (body[f] !== undefined) payload[f] = body[f]

    const { data, error } = await admin.from(meta.table).insert(payload).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('POST /admin/payment-accounts', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await ensureAdmin()
    if ('error' in auth) return auth.error
    const { admin } = auth

    const body = await request.json()
    const { category, id, ...rest } = body
    if (!category || !id) return NextResponse.json({ error: 'Missing category or id' }, { status: 400 })

    const byCat: any = {
      bank: 'payment_bank_accounts',
      paypal: 'payment_paypal_accounts',
      momo: 'payment_momo_accounts',
        crypto: 'payment_crypto_wallets',
        qr_bank: 'payment_qr_bank_accounts',
    }
    const table = byCat[category]
    if (!table) return NextResponse.json({ error: 'Invalid category' }, { status: 400 })

    const { data, error } = await admin.from(table).update(rest).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('PATCH /admin/payment-accounts', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
