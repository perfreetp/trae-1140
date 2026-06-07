import { useState, useMemo } from 'react'
import { Search, Filter, Eye, CalendarPlus, X, Gem, Package } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import SidePanel from '@/components/SidePanel'
import type { SparePart } from '@/types'

const CATEGORIES = ['空调', '冰箱', '洗衣机', '热水器']

export default function Catalog() {
  const { spareParts, warehouses, inventoryItems, getPartTotalStock, getPartById } = useStore()

  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [modelSearch, setModelSearch] = useState('')
  const [detailPart, setDetailPart] = useState<SparePart | null>(null)
  const [reservePart, setReservePart] = useState<SparePart | null>(null)
  const [reserveWh, setReserveWh] = useState('')
  const [reserveDate, setReserveDate] = useState('')
  const [reserveTech, setReserveTech] = useState('')

  const brands = useMemo(() => [...new Set(spareParts.map((p) => p.brand))], [spareParts])

  const filtered = useMemo(() => {
    return spareParts.filter((p) => {
      const q = search.toLowerCase()
      if (q && !p.partNo.toLowerCase().includes(q) && !p.name.toLowerCase().includes(q)) return false
      if (brandFilter && p.brand !== brandFilter) return false
      if (categoryFilter && p.category !== categoryFilter) return false
      if (modelSearch && !p.compatibleModels.some((m) => m.toLowerCase().includes(modelSearch.toLowerCase()))) return false
      return true
    })
  }, [spareParts, search, brandFilter, categoryFilter, modelSearch])

  const getWhStock = (partId: string, whId: string) =>
    inventoryItems.filter((i) => i.partId === partId && i.warehouseId === whId).reduce((s, i) => s + i.quantity, 0)

  const maxWhStock = (partId: string) =>
    Math.max(1, ...warehouses.map((w) => getWhStock(partId, w.id)))

  const handleReserve = () => {
    setReservePart(null)
    setReserveWh('')
    setReserveDate('')
    setReserveTech('')
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <PageHeader title="备件目录" subtitle="管理所有备件信息、库存与替代件" />

      <div className="px-6 py-3 flex flex-wrap items-center gap-3 border-b border-slate-800 bg-slate-900/40">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索编号或名称..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-600"
          />
        </div>
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-blue-600"
        >
          <option value="">全部品牌</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-blue-600"
        >
          <option value="">全部品类</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="relative min-w-[160px]">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
            placeholder="兼容机型..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-900 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium">备件编号</th>
              <th className="px-4 py-3 text-left font-medium">名称</th>
              <th className="px-4 py-3 text-left font-medium">规格</th>
              <th className="px-4 py-3 text-left font-medium">品牌</th>
              <th className="px-4 py-3 text-left font-medium">品类</th>
              <th className="px-4 py-3 text-left font-medium">兼容机型</th>
              <th className="px-4 py-3 text-right font-medium">单价</th>
              <th className="px-4 py-3 text-right font-medium">库存总量</th>
              <th className="px-4 py-3 text-right font-medium">安全库存</th>
              <th className="px-4 py-3 text-center font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const total = getPartTotalStock(p.id)
              const low = total < p.safetyStock
              return (
                <tr
                  key={p.id}
                  className={`border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors ${low ? 'bg-amber-950/20' : ''}`}
                >
                  <td className="px-4 py-3 text-slate-300 font-mono">
                    {p.partNo}
                    {p.highValue && (
                      <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                        <Gem size={10} />高价值
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-200">{p.name}</td>
                  <td className="px-4 py-3 text-slate-400">{p.spec}</td>
                  <td className="px-4 py-3 text-slate-300">{p.brand}</td>
                  <td className="px-4 py-3 text-slate-300">{p.category}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{p.compatibleModels.join(', ')}</td>
                  <td className="px-4 py-3 text-right text-slate-200">¥{p.unitPrice}</td>
                  <td className={`px-4 py-3 text-right font-medium ${low ? 'text-red-400' : 'text-slate-200'}`}>{total}</td>
                  <td className="px-4 py-3 text-right text-slate-400">{p.safetyStock}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setDetailPart(p)} className="px-2 py-1 rounded text-xs text-blue-400 hover:bg-blue-600/15 transition-colors flex items-center gap-1">
                        <Eye size={12} />查看详情
                      </button>
                      <button onClick={() => setReservePart(p)} className="px-2 py-1 rounded text-xs text-emerald-400 hover:bg-emerald-600/15 transition-colors flex items-center gap-1">
                        <CalendarPlus size={12} />预约领料
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Package size={40} className="mb-3 opacity-40" />
            <p>未找到匹配的备件</p>
          </div>
        )}
      </div>

      <SidePanel open={!!detailPart} onClose={() => setDetailPart(null)} title="备件详情">
        {detailPart && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['编号', detailPart.partNo],
                ['名称', detailPart.name],
                ['规格', detailPart.spec],
                ['品牌', detailPart.brand],
                ['单价', `¥${detailPart.unitPrice}`],
              ].map(([l, v]) => (
                <div key={l as string} className="bg-slate-800/50 rounded-lg px-3 py-2">
                  <div className="text-xs text-slate-500 mb-0.5">{l}</div>
                  <div className="text-sm text-slate-200">{v}</div>
                </div>
              ))}
              <div className="bg-slate-800/50 rounded-lg px-3 py-2">
                <div className="text-xs text-slate-500 mb-0.5">高价值</div>
                <div className="text-sm">{detailPart.highValue ? <span className="text-yellow-400">是</span> : <span className="text-slate-400">否</span>}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">兼容机型</h4>
              <div className="flex flex-wrap gap-1.5">
                {detailPart.compatibleModels.map((m) => (
                  <span key={m} className="px-2 py-0.5 rounded bg-blue-600/15 text-blue-400 text-xs border border-blue-600/30">{m}</span>
                ))}
              </div>
            </div>

            {detailPart.substituteIds.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">替代件</h4>
                <div className="space-y-2">
                  {detailPart.substituteIds.map((sid) => {
                    const sub = getPartById(sid)
                    if (!sub) return null
                    return (
                      <div key={sid} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                        <div>
                          <span className="text-sm text-slate-200">{sub.partNo}</span>
                          <span className="ml-2 text-xs text-slate-400">{sub.name}</span>
                        </div>
                        <span className="text-xs text-slate-300">库存 {getPartTotalStock(sid)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">仓库库存分布</h4>
              <div className="space-y-2">
                {warehouses.map((w) => {
                  const qty = getWhStock(detailPart.id, w.id)
                  const pct = (qty / maxWhStock(detailPart.id)) * 100
                  return (
                    <div key={w.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{w.name}</span>
                        <span className="text-slate-300">{qty}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </SidePanel>

      {reservePart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReservePart(null)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-[400px] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-100">预约领料</h3>
              <button onClick={() => setReservePart(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="mb-3 text-sm text-slate-400">
              备件: <span className="text-slate-200">{reservePart.partNo} - {reservePart.name}</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">选择仓库</label>
                <select value={reserveWh} onChange={(e) => setReserveWh(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-blue-600">
                  <option value="">请选择</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">预约日期</label>
                <input type="date" value={reserveDate} onChange={(e) => setReserveDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">技术人员</label>
                <input value={reserveTech} onChange={(e) => setReserveTech(e.target.value)} placeholder="请输入姓名" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-600" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setReservePart(null)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 transition-colors">取消</button>
              <button onClick={handleReserve} disabled={!reserveWh || !reserveDate || !reserveTech} className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">确认预约</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
