import { useState } from 'react'
import { ArrowRight, Plus, Printer, Truck, Eye } from 'lucide-react'
import { useStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'
import PageHeader from '@/components/PageHeader'
import type { Transfer } from '@/types'

const COURIERS = ['顺丰速运', '中通快递', '京东物流', '韵达快递', '圆通速递']
const STATUS_STEPS: Transfer['status'][] = ['pending', 'shipping', 'received']
const STATUS_LABELS: Record<string, string> = { pending: '待发运', shipping: '运输中', received: '已签收' }

export default function TransferPage() {
  const { transfers, warehouses, spareParts, addTransfer, updateTransfer, getPartById, getWarehouseById, getPartStock } = useStore()

  const [createOpen, setCreateOpen] = useState(false)
  const [packingOpen, setPackingOpen] = useState(false)
  const [courierOpen, setCourierOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Transfer | null>(null)

  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [items, setItems] = useState<{ partId: string; quantity: number }[]>([{ partId: '', quantity: 1 }])

  const [courier, setCourier] = useState('')
  const [trackingNo, setTrackingNo] = useState('')

  const openDetail = (tf: Transfer) => { setSelected(tf); setDetailOpen(true) }
  const openPacking = (tf: Transfer) => { setSelected(tf); setPackingOpen(true) }
  const openCourier = (tf: Transfer) => { setSelected(tf); setCourierOpen(true); setCourier(tf.courier); setTrackingNo(tf.trackingNo) }

  const handleCreate = () => {
    if (!fromId || !toId || items.some(i => !i.partId || i.quantity <= 0)) return
    const tf: Transfer = {
      id: crypto.randomUUID(),
      transferNo: `TF-${Date.now().toString().slice(-6)}`,
      fromWarehouseId: fromId,
      toWarehouseId: toId,
      status: 'pending',
      courier: '',
      trackingNo: '',
      createdAt: new Date().toISOString().slice(0, 10),
      items: items.map((i, idx) => ({ id: `${Date.now()}-${idx}`, partId: i.partId, quantity: i.quantity })),
    }
    addTransfer(tf)
    setCreateOpen(false)
    setFromId('')
    setToId('')
    setItems([{ partId: '', quantity: 1 }])
  }

  const handleCourierSave = () => {
    if (!selected || !courier || !trackingNo) return
    updateTransfer(selected.id, { courier, trackingNo, status: 'shipping' })
    setCourierOpen(false)
  }

  const addItemRow = () => setItems([...items, { partId: '', quantity: 1 }])
  const updateItem = (idx: number, field: string, value: string | number) => {
    const next = [...items]
    if (field === 'partId') next[idx].partId = value as string
    else next[idx].quantity = Number(value)
    setItems(next)
  }
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))

  const StatusProgress = ({ status }: { status: Transfer['status'] }) => {
    const current = STATUS_STEPS.indexOf(status)
    return (
      <div className="flex items-center gap-2">
        {STATUS_STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= current ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>{i + 1}</div>
            <span className={`text-xs ${i <= current ? 'text-blue-400' : 'text-slate-500'}`}>{STATUS_LABELS[s]}</span>
            {i < STATUS_STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < current ? 'bg-blue-600' : 'bg-slate-700'}`} />}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="调拨发运" subtitle="管理网点间备件调拨与物流" actions={
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />新建调拨
        </button>
      } />

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="text-left px-4 py-3">调拨单号</th>
                <th className="text-left px-4 py-3">源网点</th>
                <th className="px-2 py-3" />
                <th className="text-left px-4 py-3">目标网点</th>
                <th className="text-left px-4 py-3">状态</th>
                <th className="text-left px-4 py-3">快递公司</th>
                <th className="text-left px-4 py-3">快递单号</th>
                <th className="text-left px-4 py-3">创建日期</th>
                <th className="text-left px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map(tf => {
                const from = getWarehouseById(tf.fromWarehouseId)
                const to = getWarehouseById(tf.toWarehouseId)
                return (
                  <tr key={tf.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-200 font-mono">{tf.transferNo}</td>
                    <td className="px-4 py-3 text-slate-300">{from?.name}</td>
                    <td className="px-2 py-3"><ArrowRight size={14} className="text-slate-500" /></td>
                    <td className="px-4 py-3 text-slate-300">{to?.name}</td>
                    <td className="px-4 py-3"><StatusBadge status={tf.status} /></td>
                    <td className="px-4 py-3 text-slate-300">{tf.courier || '-'}</td>
                    <td className="px-4 py-3 text-slate-300 font-mono">{tf.trackingNo || '-'}</td>
                    <td className="px-4 py-3 text-slate-400">{tf.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openPacking(tf)} className="text-blue-400 hover:text-blue-300" title="打印装箱单"><Printer size={15} /></button>
                        <button onClick={() => openCourier(tf)} className="text-blue-400 hover:text-blue-300" title="登记快递"><Truck size={15} /></button>
                        <button onClick={() => openDetail(tf)} className="text-blue-400 hover:text-blue-300" title="查看详情"><Eye size={15} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="新建调拨" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">源网点</label>
              <select value={fromId} onChange={e => setFromId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm">
                <option value="">请选择</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">目标网点</label>
              <select value={toId} onChange={e => setToId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm">
                <option value="">请选择</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400">调拨物料</label>
              <button onClick={addItemRow} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} />添加</button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <select value={item.partId} onChange={e => updateItem(idx, 'partId', e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm">
                  <option value="">选择备件</option>
                  {spareParts.map(p => <option key={p.id} value={p.id}>{p.partNo} - {p.name}</option>)}
                </select>
                <input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm" />
                {fromId && item.partId && <span className="text-xs text-slate-500 whitespace-nowrap">库存:{getPartStock(item.partId, fromId)}</span>}
                {items.length > 1 && <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 text-sm">×</button>}
              </div>
            ))}
          </div>
          <button onClick={handleCreate} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">提交</button>
        </div>
      </Modal>

      <Modal open={packingOpen} onClose={() => setPackingOpen(false)} title="装箱单" wide>
        {selected && (
          <>
            <style>{`@media print { body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; } .print-area .print-hidden { display: none !important; } .print-area th, .print-area td { color: black !important; border-color: #ccc !important; } }`}</style>
            <div className="print-area">
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-slate-100">装箱单</h2>
                <p className="text-sm text-slate-400">调拨单号: {selected.transferNo}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div><span className="text-slate-400">源网点:</span> <span className="text-slate-200">{getWarehouseById(selected.fromWarehouseId)?.name}</span></div>
                <div><span className="text-slate-400">目标网点:</span> <span className="text-slate-200">{getWarehouseById(selected.toWarehouseId)?.name}</span></div>
              </div>
              <table className="w-full text-sm border border-slate-700">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left px-3 py-2">备件编号</th>
                    <th className="text-left px-3 py-2">名称</th>
                    <th className="text-left px-3 py-2">规格</th>
                    <th className="text-left px-3 py-2">数量</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map(item => {
                    const part = getPartById(item.partId)
                    return (
                      <tr key={item.id} className="border-b border-slate-800/50">
                        <td className="px-3 py-2 text-slate-200">{part?.partNo}</td>
                        <td className="px-3 py-2 text-slate-200">{part?.name}</td>
                        <td className="px-3 py-2 text-slate-300">{part?.spec}</td>
                        <td className="px-3 py-2 text-slate-200">{item.quantity}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end print-hidden">
                <button onClick={() => window.print()} className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                  <Printer size={14} />打印
                </button>
              </div>
            </div>
          </>
        )}
      </Modal>

      <Modal open={courierOpen} onClose={() => setCourierOpen(false)} title="登记快递">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">快递公司</label>
            <select value={courier} onChange={e => setCourier(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm">
              <option value="">请选择</option>
              {COURIERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">快递单号</label>
            <input value={trackingNo} onChange={e => setTrackingNo(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm" />
          </div>
          <button onClick={handleCourierSave} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">保存</button>
        </div>
      </Modal>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="调拨详情" wide>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-200">{selected.transferNo}</span>
              <StatusBadge status={selected.status} />
            </div>
            <StatusProgress status={selected.status} />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400">源网点:</span> <span className="text-slate-200">{getWarehouseById(selected.fromWarehouseId)?.name}</span></div>
              <div><span className="text-slate-400">目标网点:</span> <span className="text-slate-200">{getWarehouseById(selected.toWarehouseId)?.name}</span></div>
              <div><span className="text-slate-400">快递公司:</span> <span className="text-slate-200">{selected.courier || '-'}</span></div>
              <div><span className="text-slate-400">快递单号:</span> <span className="text-slate-200 font-mono">{selected.trackingNo || '-'}</span></div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left px-3 py-2">备件编号</th>
                  <th className="text-left px-3 py-2">名称</th>
                  <th className="text-left px-3 py-2">规格</th>
                  <th className="text-left px-3 py-2">数量</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map(item => {
                  const part = getPartById(item.partId)
                  return (
                    <tr key={item.id} className="border-b border-slate-800/50">
                      <td className="px-3 py-2 text-slate-200">{part?.partNo}</td>
                      <td className="px-3 py-2 text-slate-200">{part?.name}</td>
                      <td className="px-3 py-2 text-slate-300">{part?.spec}</td>
                      <td className="px-3 py-2 text-slate-200">{item.quantity}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  )
}
