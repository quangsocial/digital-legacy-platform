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

    // Nếu có cấu hình Sepay thì gọi API Sepay, trả về link QR động
    if (acc.sepay_client_id && acc.sepay_client_secret && acc.sepay_merchant_id && acc.sepay_api_url) {
      // Gọi API Sepay
      const payload = {
        client_id: acc.sepay_client_id,
        client_secret: acc.sepay_client_secret,
        merchant_id: acc.sepay_merchant_id,
        order_code: orderNumber,
        amount: amount || 0,
        description: (acc.description_template || 'DH {order_number}').replace('{order_number}', orderNumber),
        bank_id: acc.sepay_bank_id || undefined,
        // Có thể bổ sung các trường khác nếu Sepay yêu cầu
      }
      try {
        const sepayRes = await fetch(acc.sepay_api_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const sepayJson = await sepayRes.json()
        if (sepayRes.ok && sepayJson.data && sepayJson.data.qr_data_url) {
          // Trả về link QR động từ Sepay
          return NextResponse.json({ url: sepayJson.data.qr_data_url, sepay: true, data: sepayJson.data })
        } else {
          // Nếu Sepay trả lỗi, fallback VietQR
          console.error('Sepay API error', sepayJson)
        }
      } catch (err) {
        console.error('Sepay API call failed', err)
        // Fallback VietQR
      }
    }
    // Fallback: build VietQR link như cũ
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
    return NextResponse.json({ url, sepay: false })
  } catch (e) {
    console.error('GET /api/payments/qr', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
