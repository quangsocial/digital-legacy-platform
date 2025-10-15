'use client'

import { useState, useEffect } from 'react'

interface CreateOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface User {
  id: string
  name: string
  email: string
}

interface Product {
  id: string
  name: string
  slug: string
  product_variants: ProductVariant[]
}

interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  compare_at_price: number | null
  billing_period: string
  is_popular: boolean
  plans: {
    id: string
    name: string
    description: string
  }
}

export default function CreateOrderModal({ isOpen, onClose, onSuccess }: CreateOrderModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    user_id: '',
    product_variant_id: '',
    plan_id: '',
    amount: 0,
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    setLoadingData(true)
    try {
      // Fetch users
      const usersRes = await fetch('/api/admin/users')
      const usersData = await usersRes.json()
      setUsers(usersData.users || [])

      // Fetch products
      const productsRes = await fetch('/api/products')
      const productsData = await productsRes.json()
      setProducts(productsData.products || [])

      if (productsData.products?.length > 0) {
        setSelectedProduct(productsData.products[0])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Không thể tải dữ liệu')
    } finally {
      setLoadingData(false)
    }
  }

  const handleVariantChange = (variantId: string) => {
    const variant = selectedProduct?.product_variants.find(v => v.id === variantId)
    if (variant) {
      setFormData({
        ...formData,
        product_variant_id: variantId,
        plan_id: variant.plans.id,
        amount: variant.price,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/admin/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      alert('✅ ' + data.message)
      setFormData({
        user_id: '',
        product_variant_id: '',
        plan_id: '',
        amount: 0,
        notes: '',
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error creating order:', err)
      setError(err.message || 'Không thể tạo đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Tạo đơn hàng mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        {loadingData ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* User Selection */}
            <div>
              <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
                Khách hàng <span className="text-red-500">*</span>
              </label>
              <select
                id="user_id"
                required
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn khách hàng --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {users.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ Chưa có người dùng nào. Vui lòng tạo người dùng trước.
                </p>
              )}
            </div>

            {/* Product Selection */}
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                Sản phẩm
              </label>
              <select
                id="product"
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const product = products.find(p => p.id === e.target.value)
                  setSelectedProduct(product || null)
                  setFormData({
                    ...formData,
                    product_variant_id: '',
                    plan_id: '',
                    amount: 0,
                  })
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Variant Selection */}
            {selectedProduct && selectedProduct.product_variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn gói <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {selectedProduct.product_variants
                    .sort((a, b) => (a.price || 0) - (b.price || 0))
                    .map((variant) => (
                      <div
                        key={variant.id}
                        onClick={() => handleVariantChange(variant.id)}
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          formData.product_variant_id === variant.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {variant.is_popular && (
                          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                            Phổ biến
                          </div>
                        )}
                        <div className="font-semibold text-gray-900">{variant.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{variant.plans.name}</div>
                        <div className="mt-2">
                          {variant.compare_at_price && variant.compare_at_price > variant.price && (
                            <div className="text-xs text-gray-400 line-through">
                              {variant.compare_at_price.toLocaleString('vi-VN')}₫
                            </div>
                          )}
                          <div className="text-lg font-bold text-blue-600">
                            {variant.price.toLocaleString('vi-VN')}₫
                          </div>
                          <div className="text-xs text-gray-500">
                            {variant.billing_period === 'monthly' && '/ tháng'}
                            {variant.billing_period === 'yearly' && '/ năm'}
                            {variant.billing_period === 'lifetime' && '/ trọn đời'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amount"
                required
                min="0"
                step="1000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Hiển thị: {formData.amount.toLocaleString('vi-VN')}₫
              </p>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ghi chú về đơn hàng (tùy chọn)"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || users.length === 0 || !formData.product_variant_id}
              >
                {loading ? 'Đang tạo...' : 'Tạo đơn hàng'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
