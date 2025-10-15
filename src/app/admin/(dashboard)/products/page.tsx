import ProductsManager from '../../../../components/admin/ProductsManager'

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Quản lý sản phẩm</h2>
      </div>
      <ProductsManager />
    </div>
  )
}
