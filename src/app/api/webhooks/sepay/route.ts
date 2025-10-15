import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// This endpoint receives webhook POSTs from SePay
// To use: In SePay dashboard, go to "Tích hợp Webhooks" và thêm webhook với URL:
//    https://yourdomain.com/api/webhooks/sepay
// SePay sẽ gửi POST về endpoint này khi tài khoản nhận được tiền.
// Payload sẽ chứa nội dung chuyển khoản (content), số tiền, v.v.
// Endpoint sẽ tự động bóc tách mã đơn hàng từ nội dung và xác nhận thanh toán.

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const content = data.content || data.transaction_content || '';
    const amount = Number(data.transferAmount || data.amount_in || 0);
    // Extract order number from content, e.g. "DH123"
    const match = content.match(/DH(\d+)/);
    if (!match) {
      return NextResponse.json({ success: false, message: 'Order number not found in content' }, { status: 400 });
    }
    const orderId = match[1];
    const admin = createAdminClient();
    // Find order by id, check total and status
    const { data: order, error } = await admin
      .from('orders')
      .select('id, total, status')
      .eq('id', orderId)
      .single();
    if (error || !order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }
    if (order.status === 'completed' || order.status === 'cancelled') {
      return NextResponse.json({ success: false, message: 'Order already completed or cancelled' }, { status: 409 });
    }
    const orderTotal = Number(order.total);
    if (Math.abs(orderTotal - amount) > 1000) { // allow 1k VND rounding diff
      return NextResponse.json({ success: false, message: 'Amount does not match order total' }, { status: 400 });
    }
    // Update order status to completed
    const { error: updateErr } = await admin
      .from('orders')
      .update({ status: 'completed', completed_date: new Date().toISOString() })
      .eq('id', orderId);
    if (updateErr) {
      return NextResponse.json({ success: false, message: 'Failed to update order status' }, { status: 500 });
    }
    return NextResponse.json({ success: true, orderId });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Invalid payload or server error' }, { status: 400 });
  }
}
