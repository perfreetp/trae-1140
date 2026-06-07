import { useState } from 'react'
import { useStore } from '@/store'
import type { Requisition, RequisitionItem } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'
import PageHeader from '@/components/PageHeader'
import { Plus, Eye, CheckCircle, XCircle, Search, AlertTriangle, ArrowRightLeft, ToggleLeft, ToggleRight } from 'lucide-react'

type TabKey = 'all' | 'pending' | 'approved' | 'rejected' | 'shipped'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审批' },
  { key: 'approved', label: '已批准' },
  { key: 'rejected', label: '已驳回' },
  { key: 'shipped', label: '已出库' },
]

const statusLabels: Record<string, string> = {
  all: '全部',
  pending: '待审批',
  approved: '已批准',
  rejected: '已驳回',
  shipped: '已出库',
}

export default function RequisitionPage() {
  const { requisitions, workOrders, spareParts, addRequisition, updateRequisitionStatus, getPartById, getWorkOrderById, getPartTotalStock } = useStore()

  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Requisition | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [newWorkOrderId, setNewWorkOrderId] = useState('')
  const [newApplicant, setNewApplicant] = useState('')
  const [newUrgent, setNewUrgent] = useState(false)
  const [newItems, setNewItems] = useState<{ partId: string; quantity: number }[]>([])
  const [partSearch, setPartSearch] = useState('')
  const [substitutes, setSubstitutes] = useState<Record<string, string>>({})

  const filtered = activeTab === 'all' ? requisitions : requisitions.filter((r) => r.status === activeTab)

  const tabCounts = tabs.reduce<Record<TabKey, number>>((acc, t) => {
    acc[t.key] = t.key === 'all' ? requisitions.length : requisitions.filter((r) => r.status === t.key).length
    return acc
  }, {} as Record<TabKey, number>)

  const handleApprove = (req: Requisition) => {
    setSelected(req)
    setRejectReason('')
    setApproveOpen(true)
  }

  const handleDetail = (req: Requisition) => {
    setSelected(req)
    setDetailOpen(true)
  }

  const submitApproval = (action: 'approved' | 'rejected') => {
    if (!selected) return
    if (action === 'rejected' && !rejectReason.trim()) return
    updateRequisitionStatus(selected.id, action)
    setApproveOpen(false)
    setSelected(null)
    setRejectReason('')
  }

  const confirmSubstitute = (itemId: string, subPartId: string) => {
    setSubstitutes((prev) => ({ ...prev, [itemId]: subPartId }))
  }

  const handleCreate = () => {
    const items: RequisitionItem[] = newItems.map((it, i) => {
      const part = spareParts.find((p) => p.id === it.partId)
      return {
        id: `ri_new_${Date.now()}_${i}`,
        partId: it.partId,
        quantity: it.quantity,
        substituted: false,
        originalPartId: '',
      }
    })
    const hasHighValue = items.some((it) => spareParts.find((p) => p.id === it.partId)?.highValue)
    const req: Requisition = {
      id: `req_new_${Date.now()}`,
      reqNo: `REQ-2026-${String(requisitions.length + 1).padStart(4, '0')}`,
      workOrderId: newWorkOrderId,
      applicant: newApplicant,
      status: 'pending',
      urgent: newUrgent,
      needsApproval: hasHighValue,
      approver: hasHighValue ? '王主管' : '',
      createdAt: new Date().toISOString().slice(0, 10),
      items,
    }
    addRequisition(req)
    setCreateOpen(false)
    resetCreateForm()
  }

  const resetCreateForm = () => {
    setNewWorkOrderId('')
    setNewApplicant('')
    setNewUrgent(false)
    setNewItems([])
    setPartSearch('')
  }

  const addItem = (partId: string) => {
    if (!partId || newItems.some((it) => it.partId === partId)) return
    setNewItems([...newItems, { partId, quantity: 1 }])
    setPartSearch('')
  }

  const removeItem = (partId: string) => {
    setNewItems(newItems.filter((it) => it.partId !== partId))
  }

  const updateItemQty = (partId: string, quantity: number) => {
    setNewItems(newItems.map((it) => (it.partId === partId ? { ...it, quantity: Math.max(1, quantity) } : it)))
  }

  const filteredParts = partSearch
    ? spareParts.filter((p) => p.name.includes(partSearch) || p.partNo.includes(partSearch))
    : spareParts

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <PageHeader
        title="申领审批"
        subtitle="配件申领与审批管理"
        actions={
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} /> 新建申领
          </button>
        }
      />

      <div className="flex gap-1 px-6 pt-4">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t.key ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
            {t.label} <span className="ml-1 text-xs opacity-70">{tabCounts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500">
              <th className="text-left py-3 px-3 font-medium">申领单号</th>
              <th className="text-left py-3 px-3 font-medium">关联工单</th>
              <th className="text-left py-3 px-3 font-medium">申请人</th>
              <th className="text-left py-3 px-3 font-medium">状态</th>
              <th className="text-left py-3 px-3 font-medium">紧急</th>
              <th className="text-left py-3 px-3 font-medium">需审批</th>
              <th className="text-left py-3 px-3 font-medium">审批人</th>
              <th className="text-left py-3 px-3 font-medium">创建日期</th>
              <th className="text-left py-3 px-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((req) => {
              const wo = getWorkOrderById(req.workOrderId)
              const hasHighValue = req.items.some((it) => getPartById(it.partId)?.highValue)
              return (
                <tr key={req.id} className={`border-b border-slate-800/60 hover:bg-slate-900/50 ${req.urgent ? 'border-l-2 border-l-red-500' : ''}`}>
                  <td className="py-3 px-3 text-slate-200 font-mono">{req.reqNo}</td>
                  <td className="py-3 px-3 text-slate-300">{wo?.orderNo || '-'}</td>
                  <td className="py-3 px-3 text-slate-300">{req.applicant}</td>
                  <td className="py-3 px-3"><StatusBadge status={req.status} /></td>
                  <td className="py-3 px-3">{req.urgent && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 font-medium">紧急</span>}</td>
                  <td className="py-3 px-3">{req.needsApproval && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium">是</span>}</td>
                  <td className="py-3 px-3 text-slate-400">{req.approver || '-'}</td>
                  <td className="py-3 px-3 text-slate-400">{req.createdAt}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {req.status === 'pending' && (
                        <button onClick={() => handleApprove(req)} className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded text-xs font-medium transition-colors">
                          <CheckCircle size={12} /> 审批
                        </button>
                      )}
                      <button onClick={() => handleDetail(req)} className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded text-xs font-medium transition-colors">
                        <Eye size={12} /> 查看详情
                      </button>
                      {hasHighValue && <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-medium">高价值</span>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-600">暂无申领记录</div>}
      </div>

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); resetCreateForm() }} title="新建申领单" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">关联工单</label>
              <select value={newWorkOrderId} onChange={(e) => setNewWorkOrderId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-600 outline-none">
                <option value="">选择工单</option>
                {workOrders.map((wo) => <option key={wo.id} value={wo.id}>{wo.orderNo} - {wo.customerName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">申请人</label>
              <input value={newApplicant} onChange={(e) => setNewApplicant(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-600 outline-none" placeholder="输入申请人" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400">紧急申领</label>
            <button onClick={() => setNewUrgent(!newUrgent)} className="text-slate-400 hover:text-blue-400 transition-colors">
              {newUrgent ? <ToggleRight size={28} className="text-blue-500" /> : <ToggleLeft size={28} />}
            </button>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <label className="block text-xs text-slate-400 mb-2">添加配件</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={partSearch} onChange={(e) => setPartSearch(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:border-blue-600 outline-none" placeholder="搜索配件名称或编号" />
              {partSearch && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg max-h-40 overflow-auto z-10">
                  {filteredParts.slice(0, 10).map((p) => {
                    const stock = getPartTotalStock(p.id)
                    return (
                      <button key={p.id} onClick={() => addItem(p.id)} disabled={newItems.some((it) => it.partId === p.id)} className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-40">
                        <span>{p.partNo} - {p.name}</span>
                        <span className={`text-xs ${stock > p.safetyStock ? 'text-emerald-400' : 'text-red-400'}`}>库存: {stock}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {newItems.length > 0 && (
            <div className="space-y-2">
              {newItems.map((it) => {
                const part = spareParts.find((p) => p.id === it.partId)
                if (!part) return null
                const stock = getPartTotalStock(part.id)
                return (
                  <div key={it.partId} className="flex items-center gap-3 bg-slate-800/60 rounded-lg px-3 py-2">
                    <div className="flex-1">
                      <div className="text-sm text-slate-200">{part.name} <span className="text-xs text-slate-500">{part.spec}</span></div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">库存: {stock}</span>
                        {part.highValue && <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">高价值·需审批</span>}
                      </div>
                    </div>
                    <input type="number" min={1} value={it.quantity} onChange={(e) => updateItemQty(it.partId, Number(e.target.value))} className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 text-center outline-none focus:border-blue-600" />
                    <button onClick={() => removeItem(it.partId)} className="text-slate-500 hover:text-red-400 text-xs">删除</button>
                  </div>
                )
              })}
            </div>
          )}

          <button onClick={handleCreate} disabled={!newWorkOrderId || !newApplicant || newItems.length === 0} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors">
            提交申领
          </button>
        </div>
      </Modal>

      <Modal open={approveOpen} onClose={() => setApproveOpen(false)} title="申领审批" wide>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">单号: <span className="text-slate-200">{selected.reqNo}</span></span>
              <span className="text-slate-400">申请人: <span className="text-slate-200">{selected.applicant}</span></span>
              <StatusBadge status={selected.status} />
              {selected.urgent && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">紧急</span>}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="text-left py-2 px-2 font-medium">配件名称</th>
                  <th className="text-left py-2 px-2 font-medium">数量</th>
                  <th className="text-left py-2 px-2 font-medium">单价</th>
                  <th className="text-left py-2 px-2 font-medium">小计</th>
                  <th className="text-left py-2 px-2 font-medium">标记</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((it) => {
                  const part = getPartById(it.partId)
                  const stock = part ? getPartTotalStock(part.id) : 0
                  return (
                    <tr key={it.id} className="border-b border-slate-800/40">
                      <td className="py-2 px-2 text-slate-200">{part?.name || '-'} <span className="text-xs text-slate-500">{part?.spec}</span></td>
                      <td className="py-2 px-2 text-slate-300">{it.quantity}</td>
                      <td className="py-2 px-2 text-slate-300">¥{part?.unitPrice || 0}</td>
                      <td className="py-2 px-2 text-slate-200 font-medium">¥{(part?.unitPrice || 0) * it.quantity}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1">
                          {it.substituted && <span className="text-xs px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/30">替代</span>}
                          {part?.highValue && <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">高价值</span>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {selected.items.some((it) => {
              const part = getPartById(it.partId)
              return part && part.substituteIds.length > 0 && getPartTotalStock(part.id) < it.quantity
            }) && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2"><AlertTriangle size={14} /> 库存不足，可考虑替代配件</div>
                {selected.items.filter((it) => {
                  const part = getPartById(it.partId)
                  return part && part.substituteIds.length > 0 && getPartTotalStock(part.id) < it.quantity
                }).map((it) => {
                  const part = getPartById(it.partId)!
                  return (
                    <div key={it.id} className="mb-2">
                      <div className="text-xs text-slate-400 mb-1">{part.name} 库存不足 (需{it.quantity}, 存{getPartTotalStock(part.id)})</div>
                      <div className="flex flex-wrap gap-2">
                        {part.substituteIds.map((subId) => {
                          const sub = getPartById(subId)
                          if (!sub) return null
                          const subStock = getPartTotalStock(subId)
                          return (
                            <div key={subId} className="flex items-center gap-2 bg-slate-900 rounded px-2 py-1">
                              <ArrowRightLeft size={12} className="text-violet-400" />
                              <span className="text-xs text-slate-300">{sub.name}</span>
                              <span className={`text-xs ${subStock >= it.quantity ? 'text-emerald-400' : 'text-red-400'}`}>库存: {subStock}</span>
                              <button onClick={() => confirmSubstitute(it.id, subId)} className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${substitutes[it.id] === subId ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                                确认替代
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-1">驳回原因（驳回时必填）</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-600 outline-none resize-none" placeholder="输入驳回原因..." />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => submitApproval('approved')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                <CheckCircle size={16} /> 批准
              </button>
              <button onClick={() => submitApproval('rejected')} disabled={!rejectReason.trim()} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors">
                <XCircle size={16} /> 驳回
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="申领详情" wide>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-slate-400">申领单号: <span className="text-slate-200">{selected.reqNo}</span></div>
              <div className="text-slate-400">关联工单: <span className="text-slate-200">{getWorkOrderById(selected.workOrderId)?.orderNo || '-'}</span></div>
              <div className="text-slate-400">申请人: <span className="text-slate-200">{selected.applicant}</span></div>
              <div className="text-slate-400">审批人: <span className="text-slate-200">{selected.approver || '-'}</span></div>
              <div className="text-slate-400">状态: <StatusBadge status={selected.status} /></div>
              <div className="text-slate-400">创建日期: <span className="text-slate-200">{selected.createdAt}</span></div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="text-left py-2 px-2 font-medium">配件名称</th>
                  <th className="text-left py-2 px-2 font-medium">数量</th>
                  <th className="text-left py-2 px-2 font-medium">单价</th>
                  <th className="text-left py-2 px-2 font-medium">小计</th>
                  <th className="text-left py-2 px-2 font-medium">标记</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((it) => {
                  const part = getPartById(it.partId)
                  const stock = part ? getPartTotalStock(part.id) : 0
                  return (
                    <tr key={it.id} className="border-b border-slate-800/40">
                      <td className="py-2 px-2 text-slate-200">{part?.name || '-'} <span className="text-xs text-slate-500">{part?.spec}</span></td>
                      <td className="py-2 px-2 text-slate-300">{it.quantity}</td>
                      <td className="py-2 px-2 text-slate-300">¥{part?.unitPrice || 0}</td>
                      <td className="py-2 px-2 text-slate-200 font-medium">¥{(part?.unitPrice || 0) * it.quantity}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1">
                          {it.substituted && <span className="text-xs px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/30">替代</span>}
                          {part?.highValue && <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">高价值</span>}
                          <span className={`text-xs ${stock > (part?.safetyStock || 0) ? 'text-emerald-400' : 'text-red-400'}`}>存:{stock}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {selected.items.some((it) => {
              const part = getPartById(it.partId)
              return part && part.substituteIds.length > 0 && getPartTotalStock(part.id) < it.quantity
            }) && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2"><AlertTriangle size={14} /> 可替代配件</div>
                {selected.items.filter((it) => {
                  const part = getPartById(it.partId)
                  return part && part.substituteIds.length > 0 && getPartTotalStock(part.id) < it.quantity
                }).map((it) => {
                  const part = getPartById(it.partId)!
                  return (
                    <div key={it.id} className="mb-2">
                      <div className="text-xs text-slate-400 mb-1">{part.name} 库存不足 (需{it.quantity}, 存{getPartTotalStock(part.id)})</div>
                      <div className="flex flex-wrap gap-2">
                        {part.substituteIds.map((subId) => {
                          const sub = getPartById(subId)
                          if (!sub) return null
                          const subStock = getPartTotalStock(subId)
                          return (
                            <div key={subId} className="flex items-center gap-2 bg-slate-900 rounded px-2 py-1">
                              <ArrowRightLeft size={12} className="text-violet-400" />
                              <span className="text-xs text-slate-300">{sub.name} ({sub.spec})</span>
                              <span className={`text-xs ${subStock >= it.quantity ? 'text-emerald-400' : 'text-red-400'}`}>库存: {subStock}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
