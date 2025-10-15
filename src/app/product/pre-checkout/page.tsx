"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PreCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get('slug') || '';
  const variant = searchParams.get('variant') || '';
  const price = Number(searchParams.get('price')) || 0;
  const [form, setForm] = useState({ name: '', email: '', method: '' });
  const [error, setError] = useState('');
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMethods() {
      setLoading(true);
      try {
        const res = await fetch('/api/payment-options');
        const data = await res.json();
        // Gộp tất cả phương thức thành 1 mảng, mỗi item có type riêng
        const all: any[] = [];
        if (data.qr_bank?.length) all.push(...data.qr_bank.map((m:any) => ({...m, _type: 'qr_bank'})));
        if (data.bank?.length) all.push(...data.bank.map((m:any) => ({...m, _type: 'bank'})));
        if (data.momo?.length) all.push(...data.momo.map((m:any) => ({...m, _type: 'momo'})));
        if (data.paypal?.length) all.push(...data.paypal.map((m:any) => ({...m, _type: 'paypal'})));
        if (data.crypto?.length) all.push(...data.crypto.map((m:any) => ({...m, _type: 'crypto'})));
        setMethods(all);
        // Chọn mặc định là phương thức đầu tiên nếu có
        if (all.length && !form.method) setForm(f => ({...f, method: all[0]._type + ':' + all[0].id}));
      } catch {
        setMethods([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.method) {
      setError('Vui lòng nhập đầy đủ thông tin và chọn phương thức thanh toán');
      return;
    }
    if (!variant || !price) {
      setError('Vui lòng chọn gói/biến thể sản phẩm.');
      return;
    }
    try {
      // Gọi API tạo order: chỉ truyền email, product_variant_id, amount, customer_name
      const res = await fetch('/api/admin/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          product_variant_id: variant,
          plan_id: null,
          amount: price,
          customer_name: form.name,
        })
      });
      const data = await res.json();
      if (!res.ok || !data.order?.orderNumber) {
        setError(data.error || 'Không tạo được đơn hàng');
        return;
      }
      // Chuyển sang trang checkout với order_number thực tế
      router.push(`/product/checkout?orderNumber=${data.order.orderNumber}&method=${form.method}`);
    } catch (err) {
      setError('Lỗi tạo đơn hàng');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Thông tin đặt hàng</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Họ tên</label>
          <input className="input w-full" value={form.name} onChange={e=>setForm(f=>({...f, name: e.target.value}))} />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input className="input w-full" value={form.email} onChange={e=>setForm(f=>({...f, email: e.target.value}))} />
        </div>
        <div>
          <label className="block mb-1">Phương thức thanh toán</label>
          {loading ? (
            <div className="text-gray-500 text-sm">Đang tải phương thức thanh toán...</div>
          ) : methods.length === 0 ? (
            <div className="text-red-600 text-sm">Không có phương thức thanh toán nào khả dụng</div>
          ) : (
            <div className="space-y-2">
              {methods.map((m, idx) => (
                <label key={m._type + m.id} className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer ${form.method === m._type + ':' + m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="method"
                    value={m._type + ':' + m.id}
                    checked={form.method === m._type + ':' + m.id}
                    onChange={e => setForm(f => ({...f, method: e.target.value}))}
                  />
                  <span className="font-medium">
                    {m._type === 'qr_bank' && 'Quét QR Ngân Hàng'}
                    {m._type === 'bank' && 'Chuyển khoản ngân hàng'}
                    {m._type === 'momo' && 'Ví MoMo'}
                    {m._type === 'paypal' && 'PayPal'}
                    {m._type === 'crypto' && 'Crypto'}
                  </span>
                  <span className="text-xs text-gray-500">{m.bank_name || m.display_name || m.token || m.paypal_email || m.momo_number || ''}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn btn-primary w-full" type="submit" disabled={loading || methods.length === 0}>Tiếp tục</button>
      </form>
    </div>
  );
}
