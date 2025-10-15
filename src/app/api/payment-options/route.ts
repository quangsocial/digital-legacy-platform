import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Public endpoint to expose active checkout options grouped by category
export async function GET() {
  try {
    const admin = createAdminClient()
    const [banks, paypals, momos, cryptos] = await Promise.all([
      admin.from('payment_bank_accounts').select('*').eq('active', true).order('sort_order'),
      admin.from('payment_paypal_accounts').select('*').eq('active', true).order('sort_order'),
      admin.from('payment_momo_accounts').select('*').eq('active', true).order('sort_order'),
      admin.from('payment_crypto_wallets').select('*').eq('active', true).order('sort_order'),
    ])

    return NextResponse.json({
      bank: banks.data || [],
      paypal: paypals.data || [],
      momo: momos.data || [],
      crypto: cryptos.data || [],
    })
  } catch (e) {
    console.error('GET /payment-options', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
