"use client";
import { useState } from 'react';

export default function VariantSelector({ product }: { product: any }) {
  const [selected, setSelected] = useState(product.product_variants?.[0]?.id || '');
  const selectedVariant = product.product_variants?.find((v: any) => v.id === selected);
  return (
    <form action={`/product/pre-checkout`} method="get" className="space-y-4">
      <input type="hidden" name="slug" value={product.slug} />
      <div>
        <label className="block font-semibold mb-1">Chọn gói/biến thể:</label>
        <select className="input w-full" name="variant" value={selected} onChange={e=>setSelected(e.target.value)}>
          {product.product_variants?.map((v: any) => (
            <option key={v.id} value={v.id}>{v.name} — {v.price?.toLocaleString()}₫</option>
          ))}
        </select>
      </div>
      <input type="hidden" name="price" value={selectedVariant?.price || ''} />
      <button className="btn btn-primary w-full" type="submit">Mua ngay</button>
    </form>
  );
}