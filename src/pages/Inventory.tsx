import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import { Warehouse, Filter, AlertTriangle, X, Package, Truck, ShieldAlert } from 'lucide-react'

type CellLevel = 'out' | 'danger' | 'low' | 'ok'

function getCellLevel(quantity: number, safetyLine: number): CellLevel {
  if (quantity === 0) return 'out'
  if (quantity < safetyLine) return 'danger'
  if (quantity < safetyLine * 1.5) return 'low'
  return 'ok'
}

const levelStyles: Record<CellLevel, string> = {
  out: 'bg-red-600/80 text-white animate-pulse-warning',
  danger: 'bg-orange-500/70 text-white animate-pulse-warning',
  low: 'bg-yellow-500/60 text-yellow-100',
  ok: 'bg-green-600/50 text-green-100',
}

const levelLabels: Record<CellLevel, string> = {
  out: '缺货',
  danger: '低于安全线',
  low: '库存偏低',
  ok: '库存充足',
}

interface DetailData {
  partId: string
  warehouseId: string
  quantity: number
  inTransit: number
  safetyLine: number
}

export default function Inventory() {
  const { spareParts, warehouses, inventoryItems, getPartById, getWarehouseById } = useStore()
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')
  const [detail, setDetail] = useState<DetailData | null>(null)

  const categories = useMemo(() => ['全部', ...Array.from(new Set(spareParts.map(p => p.category)))], [spareParts])

  const filteredParts = useMemo(() => {
    return spareParts.filter(p => selectedCategory === '全部' || p.category === selectedCategory)
  }, [spareParts, selectedCategory])

  const displayWarehouses = useMemo(() => {
    if (selectedWarehouse === 'all') return warehouses
    return warehouses.filter(w => w.id === selectedWarehouse)
  }, [warehouses, selectedWarehouse])

  const getInventory = (partId: string, warehouseId: string) => {
    return inventoryItems.find(i => i.partId === partId && i.warehouseId === warehouseId)
  }

  const alerts = useMemo(() => {
    const items: { partId: string; warehouseId: string; quantity: number; safetyLine: number; deficit: number }[] = []
    for (const inv of inventoryItems) {
      if (inv.quantity < inv.safetyLine) {
        items.push({
          partId: inv.partId,
          warehouseId: inv.warehouseId,
          quantity: inv.quantity,
          safetyLine: inv.safetyLine,
          deficit: inv.safetyLine - inv.quantity,
        })
      }
    }
    items.sort((a, b) => b.deficit - a.deficit)
    return items
  }, [inventoryItems])

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const part = getPartById(a.partId)
      if (!part) return false
      if (selectedCategory !== '全部' && part.category !== selectedCategory) return false
      if (selectedWarehouse !== 'all' && a.warehouseId !== selectedWarehouse) return false
      return true
    })
  }, [alerts, selectedCategory, selectedWarehouse, getPartById])

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="库存网格"
        subtitle="备件库存热力图 · 安全线预警"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter size={14} />
              <span>仓库</span>
            </div>
            <select
              value={selectedWarehouse}
              onChange={e => setSelectedWarehouse(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-600"
            >
              <option value="all">全部仓库</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-600"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="sticky left-0 z-10 bg-slate-900 px-4 py-3 text-left text-xs font-medium text-slate-400 min-w-[180px] border-r border-slate-800">备件</th>
                    {displayWarehouses.map(w => (
                      <th key={w.id} className="px-3 py-3 text-center text-xs font-medium text-slate-400 min-w-[90px]">
                        <div>{w.name.slice(0, 2)}</div>
                        <div className="text-[10px] text-slate-500">{w.region}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map(part => (
                    <tr key={part.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="sticky left-0 z-10 bg-slate-900 px-4 py-2 border-r border-slate-800">
                        <div className="text-xs font-medium text-slate-200">{part.name}</div>
                        <div className="text-[10px] text-slate-500">{part.partNo}</div>
                      </td>
                      {displayWarehouses.map(w => {
                        const inv = getInventory(part.id, w.id)
                        const qty = inv?.quantity ?? 0
                        const safety = inv?.safetyLine ?? part.safetyStock
                        const level = getCellLevel(qty, safety)
                        return (
                          <td key={w.id} className="px-1 py-1 text-center">
                            <button
                              onClick={() => inv && setDetail({ partId: part.id, warehouseId: w.id, quantity: qty, inTransit: inv.inTransit, safetyLine: safety })}
                              className={`w-full rounded-md px-2 py-1.5 text-xs font-medium transition-transform hover:scale-105 cursor-pointer ${levelStyles[level]}`}
                              title={`${part.name} · ${w.name}: ${qty} / 安全线 ${safety} (${levelLabels[level]})`}
                            >
                              {qty}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-600/80" /> 缺货</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-500/70" /> 低于安全线</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-500/60" /> 库存偏低</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-600/50" /> 库存充足</span>
            </div>
          </div>

          <div className="w-80 flex-shrink-0">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-orange-400" />
                <h3 className="text-sm font-semibold text-slate-200">安全线预警</h3>
                <span className="ml-auto text-xs bg-red-600/30 text-red-400 px-2 py-0.5 rounded-full">{filteredAlerts.length}</span>
              </div>
              <div className="space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto">
                {filteredAlerts.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-6">暂无预警</p>
                )}
                {filteredAlerts.map((a, i) => {
                  const part = getPartById(a.partId)
                  const wh = getWarehouseById(a.warehouseId)
                  if (!part || !wh) return null
                  return (
                    <div key={i} className="bg-slate-800/60 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-200 truncate">{part.name}</div>
                          <div className="text-[10px] text-slate-500">{part.partNo} · {wh.name}</div>
                        </div>
                        <button className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md whitespace-nowrap transition-colors">
                          创建申领
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${a.quantity === 0 ? 'bg-red-500' : 'bg-orange-500'}`}
                            style={{ width: `${Math.min(100, (a.quantity / a.safetyLine) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {a.quantity} / {a.safetyLine}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDetail(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200">库存详情</h3>
              <button onClick={() => setDetail(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X size={16} />
              </button>
            </div>
            {(() => {
              const part = getPartById(detail.partId)
              const wh = getWarehouseById(detail.warehouseId)
              if (!part || !wh) return null
              const level = getCellLevel(detail.quantity, detail.safetyLine)
              return (
                <div className="p-5 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                        <Package size={16} className="text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">{part.name}</div>
                        <div className="text-xs text-slate-500">{part.partNo} · {part.spec}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                        <Warehouse size={16} className="text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">{wh.name}</div>
                        <div className="text-xs text-slate-500">{wh.region} · {wh.address}</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-slate-100">{detail.quantity}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">当前库存</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-400">{detail.inTransit}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-center gap-1">
                        <Truck size={10} /> 在途
                      </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-orange-400">{detail.safetyLine}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-center gap-1">
                        <ShieldAlert size={10} /> 安全线
                      </div>
                    </div>
                  </div>
                  <div className={`rounded-lg px-4 py-2.5 text-xs font-medium text-center ${levelStyles[level]}`}>
                    {levelLabels[level]}
                  </div>
                  {level === 'out' || level === 'danger' ? (
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                      创建申领
                    </button>
                  ) : null}
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
