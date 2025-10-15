
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

async function getProduct(slug: string) {
  let url = '';
  if (typeof window === 'undefined') {
    // Server: use absolute URL
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    url = new URL('/api/products', base).toString();
  } else {
    // Client: use relative URL
    url = '/api/products';
  }
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const { products } = await res.json();
  return (products || []).find((p: any) => p.slug === slug) || null;
}

const VariantSelector = dynamic(() => import('./VariantSelector'), { ssr: false });

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) return notFound();
  return (
    <div className="max-w-2xl mx-auto p-6">
      {product.images && product.images.length > 0 && (
        <img src={product.images[0]} alt={product.name} className="w-full h-64 object-cover rounded-xl mb-4" />
      )}
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      {product.short_description && <div className="text-md text-gray-700 mb-2">{product.short_description}</div>}
      <div className="mb-4 text-gray-600">{product.description}</div>
      <div className="mb-2">Giá: <b>{product.base_price?.toLocaleString() || 'Liên hệ'}₫</b></div>
      {product.category && <div className="mb-2 text-xs text-gray-500">Danh mục: {product.category}</div>}
      <div className="mb-4">
        {product.product_variants && product.product_variants.length > 0 && (
          <VariantSelector product={product} />
        )}
      </div>
      {(!product.product_variants || product.product_variants.length === 0) && (
        <a href={`/product/pre-checkout?slug=${product.slug}`} className="btn btn-primary">Mua ngay</a>
      )}
    </div>
  );
}
