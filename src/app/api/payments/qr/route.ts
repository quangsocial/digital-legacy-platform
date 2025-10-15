import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Build a VietQR-like URL using stored QR Bank account and inject variables
// Query: ?accountId=...&orderNumber=...&amount=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const orderNumber = searchParams.get('orderNumber') || ''
    const amountStr = searchParams.get('amount')
    const amount = amountStr ? Number(amountStr) : undefined
    if (!accountId) return NextResponse.json({ error: 'Missing accountId' }, { status: 400 })

    const admin = createAdminClient()
    const { data: acc, error } = await admin
      .from('payment_qr_bank_accounts')
      .select('*')
      .eq('id', accountId)
      .single()
    if (error || !acc) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

    const bankCode: string = acc.bank_code
    const accountNumber: string = acc.account_number
    const template: string = acc.qr_template || 'compact2'
    const includeAmount: boolean = !!acc.include_amount
    let addInfo: string = (acc.description_template as string) || 'DH {order_number}'
    addInfo = addInfo.replace('{order_number}', orderNumber)

    // Compose VietQR static link pattern
    // Example: https://img.vietqr.io/image/<bankCode>-<accountNumber>-<template>.png?amount=...&addInfo=...
    const base = `https://img.vietqr.io/image/${encodeURIComponent(bankCode)}-${encodeURIComponent(accountNumber)}-${encodeURIComponent(template)}.png`
    const params = new URLSearchParams()
    if (includeAmount && amount && amount > 0) params.set('amount', String(Math.round(amount)))
    if (addInfo) params.set('addInfo', addInfo)

    const url = `${base}?${params.toString()}`
    return NextResponse.json({ url })
  } catch (e) {
    console.error('GET /api/payments/qr', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
