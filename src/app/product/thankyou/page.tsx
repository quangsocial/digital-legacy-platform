"use client";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ThankYouPageContent() {
  const searchParams = useSearchParams();
  const order = searchParams.get('order') || '';
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h1 className="text-2xl font-bold mb-4 text-emerald-600">Cảm ơn bạn đã đặt hàng!</h1>
      <div className="mb-2">Mã đơn hàng của bạn: <b>DH{order}</b></div>
      <div className="mb-4 text-gray-600">Chúng tôi sẽ xác nhận thanh toán và liên hệ với bạn qua email.</div>
      <a href="/product" className="btn btn-primary">Quay về trang sản phẩm</a>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense>
      <ThankYouPageContent />
    </Suspense>
  );
}
