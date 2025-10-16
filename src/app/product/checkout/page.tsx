"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get('orderNumber') || '';
  const method = searchParams.get('method') || '';

  const [order, setOrder] = useState<any>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [qrBank, setQrBank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrderAndQR() {
      setLoading(true);
      setError('');
      try {
        // Fetch order info by orderNumber
        const res = await fetch(`/api/admin/orders/get?orderNumber=${orderNumber}`);
        const data = await res.json();
        if (!res.ok || !data.order) throw new Error(data.error || 'Không tìm thấy đơn hàng');
        setOrder(data.order);

        // Parse method (method=qr_bank:<id>)
        let qrBankId = '';
        if (method.startsWith('qr_bank:')) {
          qrBankId = method.replace('qr_bank:', '');
        }
        // Fetch QR bank info
        let qrBankData = null;
        if (qrBankId) {
          const bankRes = await fetch(`/api/payment-options`);
          const bankData = await bankRes.json();
          qrBankData = (bankData.qr_bank || []).find((b:any) => b.id === qrBankId);
        }
        setQrBank(qrBankData);

        // Build QR code url
        if (qrBankData) {
          const qrRes = await fetch(`/api/payments/qr?accountId=${qrBankData.id}&orderNumber=${orderNumber}&amount=${data.order.total}`);
          const qrData = await qrRes.json();
          if (!qrRes.ok || !qrData.url) throw new Error('Không tạo được mã QR');
          setQrUrl(qrData.url);
        } else {
          setQrUrl('');
        }
      } catch (err:any) {
        setError(err?.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    }
    if (orderNumber) fetchOrderAndQR();
  }, [orderNumber, method]);

  const handlePaid = () => {
    router.push(`/product/thankyou?order=${orderNumber}`);
  };

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-xl font-bold mb-4">Thanh toán đơn hàng</h1>
      {order && (
        <>
          <div className="mb-2">Sản phẩm: <b>{order.product_name || ''}</b></div>
          <div className="mb-2">Khách hàng: <b>{order.customer_name}</b> ({order.customer_email})</div>
          <div className="mb-2">Số tiền: <b>{order.total?.toLocaleString()}₫</b></div>
          <div className="mb-4">Mã đơn hàng: <b>{(order.order_number || '').replace(/-/g, '')}</b></div>
        </>
      )}
      {loading ? (
        <div className="mb-4 text-gray-500">Đang tải mã QR...</div>
      ) : error ? (
        <div className="mb-4 text-red-600">{error}</div>
      ) : (
        <div className="mb-4">
          <img src={qrUrl} alt="QR Code" className="mx-auto w-64 h-64 bg-white p-2 rounded-xl border" />
          <div className="text-xs text-gray-500 mt-2">Quét QR bằng app ngân hàng để thanh toán</div>
          {qrBank && (
            <div className="mt-2 text-xs text-gray-700">Ngân hàng: <b>{qrBank.bank_name}</b> ({qrBank.account_number})<br/>Chủ tài khoản: <b>{qrBank.account_holder}</b></div>
          )}
        </div>
      )}
      <button className="btn btn-success w-full" onClick={handlePaid} disabled={loading || !!error}>Tôi đã thanh toán</button>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutPageContent />
    </Suspense>
  );
}
