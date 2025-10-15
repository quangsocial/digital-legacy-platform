'use client'

import { useEffect, useState } from 'react'

interface KPI {
  revenue: number
  collectedCash: number
  cashflow: number // positive/negative
  ordersPlaced: number
  ordersSuccess: number
  ordersNeedsAction: number
  billsSuccess: number
  billsNeedsAction: number
}

interface SeriesPoint { date: string; value: number }

export default function DashboardCharts() {
  const [kpi, setKpi] = useState<KPI|null>(null)
  const [revSeries, setRevSeries] = useState<SeriesPoint[]>([])
  const [ordersSeries, setOrdersSeries] = useState<SeriesPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const k = await fetch('/api/admin/kpi').then(r=>r.json())
        const r = await fetch('/api/admin/series/revenue').then(r=>r.json())
        const o = await fetch('/api/admin/series/orders').then(r=>r.json())
        setKpi(k)
        setRevSeries(r.series||[])
        setOrdersSeries(o.series||[])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Doanh thu" value={kpi?.revenue||0} accent="text-blue-700" />
        <Card title="Tiền thực tế thu" value={kpi?.collectedCash||0} accent="text-emerald-700" />
        <Card title="Dòng tiền" value={kpi?.cashflow||0} accent={(kpi&&kpi.cashflow>=0)?'text-emerald-700':'text-red-700'} suffix={(kpi&&kpi.cashflow<0)?' âm':''} />
        <Card title="Đơn đặt" value={kpi?.ordersPlaced||0} />
        <Card title="Đơn thành công" value={kpi?.ordersSuccess||0} />
        <Card title="Đơn cần xử lý" value={kpi?.ordersNeedsAction||0} />
        <Card title="Bill thành công" value={kpi?.billsSuccess||0} />
        <Card title="Bill cần xử lý" value={kpi?.billsNeedsAction||0} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartBlock title="Doanh thu theo ngày (cột)">
          <MiniBar data={revSeries} />
        </ChartBlock>
        <ChartBlock title="Số đơn theo ngày (line)">
          <MiniLine data={ordersSeries} />
        </ChartBlock>
      </div>
    </div>
  )
}

function Card({ title, value, accent='text-gray-800', suffix='' }: { title: string; value: number; accent?: string; suffix?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className={`text-2xl font-bold ${accent}`}>{value.toLocaleString('vi-VN')}{suffix}</div>
    </div>
  )
}

function ChartBlock({ title, children }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-gray-700 font-medium mb-2">{title}</div>
      <div>{children}</div>
    </div>
  )
}

function MiniBar({ data }: { data: SeriesPoint[] }) {
  // Simple inline bar chart representation
  const max = Math.max(1, ...data.map(d=>d.value))
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d,i)=>(
        <div key={i} className="bg-blue-500 w-3" style={{ height: `${(d.value/max)*100}%` }} title={`${d.date}: ${d.value.toLocaleString('vi-VN')}`} />
      ))}
    </div>
  )
}

function MiniLine({ data }: { data: SeriesPoint[] }) {
  // Simple SVG line chart
  const w=400, h=160, p=10
  const max = Math.max(1, ...data.map(d=>d.value))
  const pts = data.map((d,i)=>({ x: p + (i*(w-2*p))/Math.max(1,data.length-1), y: h-p - (d.value/max)*(h-2*p) }))
  const dAttr = pts.map((pt,i)=>`${i?'L':'M'}${pt.x},${pt.y}`).join(' ')
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}> 
      <path d={dAttr} fill="none" stroke="#10b981" strokeWidth="2" />
    </svg>
  )
}
