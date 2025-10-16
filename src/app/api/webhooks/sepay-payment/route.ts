import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// SePay Webhook: Xác nhận thanh toán tự động
// Đặt file này tại: src/app/api/webhooks/sepay-payment/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Tuỳ vào cấu trúc SePay gửi về, ví dụ:
    // {
    //   "amount": 1000000,
    //   "addInfo": "ORD2025100001", // hoặc "DH ORD2025100001"
    //   "description": "Thanh toan don hang DH ORD2025100001",
    //   ...
    // }
    const { addInfo = '', description = '', amount } = body
    // Tìm order_number trong addInfo hoặc description (không dấu gạch)
    const match = (addInfo || description || '').match(/([A-Z]{3}\d{6,})/)
    const orderNumber = match ? match[1].replace(/-/g, '') : null
    if (!orderNumber) {
      return NextResponse.json({ error: 'Không tìm thấy mã đơn hàng trong addInfo/description' }, { status: 400 })
    }
    // Tìm đơn hàng theo order_number
    const admin = createAdminClient()
    const { data: order, error } = await admin
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single()
    if (error || !order) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 })
    }
    // Nếu đã completed thì bỏ qua
    if (order.status === 'completed') {
      return NextResponse.json({ success: true, message: 'Đơn hàng đã xác nhận trước đó' })
    }
    // Cập nhật trạng thái đơn hàng
    const { error: updateErr } = await admin
      .from('orders')
      .update({ status: 'completed', completed_date: new Date().toISOString() })
      .eq('id', order.id)
    if (updateErr) {
      return NextResponse.json({ error: 'Không thể cập nhật đơn hàng', detail: updateErr }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'Đã xác nhận thanh toán', order_number: orderNumber })
  } catch (e) {
    return NextResponse.json({ error: 'Lỗi xử lý webhook' }, { status: 500 })
  }
}
