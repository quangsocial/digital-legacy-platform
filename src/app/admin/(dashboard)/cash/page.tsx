import CashTransactions from '@/components/admin/CashTransactions'

export default function CashManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Phiếu thu/chi</h2>
        <p className="text-gray-600 mt-1">Quản lý dòng tiền: thu (In) và chi (Out)</p>
      </div>
      <CashTransactions />
    </div>
  )
}
