import { useState } from 'react'
import { RotateCcw, CheckCircle, Truck, AlertTriangle, Send, FileCheck } from 'lucide-react'
import { useStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'
import SidePanel from '@/components/SidePanel'
import PageHeader from '@/components/PageHeader'
import type { Recovery } from '@/types'

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待确认' },
  { key: 'registered', label: '已登记' },
  { key: 'shipping', label: '运输中' },
  { key: 'received', label: '已入库' },
  { key: 'abnormal', label: '异常' },
] as const

type TabKey = (typeof TABS)[number]['key']

const COURIERS = ['顺丰速运', '中通快递', '京东物流', '韵达快递', '圆通速递']

const statusMap: Record<Recovery['status'], string> = {
  pending: '待确认',
  registered: '已登记',
  shipping: '运输中',
  received: '已入库',
  abnormal: '异常',
}

export default function RecoveryPage() {
  const { recoveries, getPartById, getWorkOrderById, updateRecovery } = useStore()
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [consumeModal, setConsumeModal] = useState<Recovery | null>(null)
  const [returnModal, setReturnModal] = useState<Recovery | null>(null)
  const [abnormalPanel, setAbnormalPanel] = useState<Recovery | null>(null)
  const [consumeQty, setConsumeQty] = useState(1)
  const [returnForm, setReturnForm] = useState({ serialNo: '', courier: '顺丰速运', trackingNo: '', returnDate: '' })
  const [disposalMethod, setDisposalMethod] = useState<'stock_in' | 'scrap'>('stock_in')
  const [disposalReason, setDisposalReason] = useState('')
  const [mismatchReason, setMismatchReason] = useState('')

  const filtered = activeTab === 'all' ? recoveries : recoveries.filter((r) => r.status === activeTab)

  const tabCounts = TABS.map((t) => ({
    ...t,
    count: t.key === 'all' ? recoveries.length : recoveries.filter((r) => r.status === t.key).length,
  }))

  const handleConfirmConsume = () => {
    if (!consumeModal) return
    updateRecovery(consumeModal.id, { status: 'registered' })
    setConsumeModal(null)
  }

  const handleReturnSubmit = () => {
    if (!returnModal) return
    updateRecovery(returnModal.id, {
      serialNo: returnForm.serialNo || returnModal.serialNo,
      courier: returnForm.courier,
      trackingNo: returnForm.trackingNo,
      returnDate: returnForm.returnDate,
      status: 'shipping',
    })
    setReturnModal(null)
  }

  const handleSendReminder = () => {
    if (!abnormalPanel) return
    alert(`已发送催还通知：${abnormalPanel.recoveryNo}`)
  }

  const handleMismatchVerify = () => {
    if (!abnormalPanel) return
    updateRecovery(abnormalPanel.id, { serialMismatch: false, status: 'pending' })
    setAbnormalPanel(null)
  }

  const handleDisposalSubmit = () => {
    if (!abnormalPanel) return
    updateRecovery(abnormalPanel.id, { disposal: disposalMethod, status: 'registered' })
    setAbnormalPanel(null)
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <PageHeader title="旧件回收" subtitle="管理备件回收、返厂及报废流程" actions={<RotateCcw size={20} className="text-blue-600" />} />

      <div className="flex gap-1 px-6 pt-4 pb-2">
        {tabCounts.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {t.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${activeTab === t.key ? 'bg-blue-500 text-blue-100' : 'bg-slate-800 text-slate-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-6 pb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-800">
              <th className="pb-3 font-medium">回收单号</th>
              <th className="pb-3 font-medium">关联工单</th>
              <th className="pb-3 font-medium">备件名称</th>
              <th className="pb-3 font-medium">串号</th>
              <th className="pb-3 font-medium">状态</th>
              <th className="pb-3 font-medium">串号不符</th>
              <th className="pb-3 font-medium">超期天数</th>
              <th className="pb-3 font-medium">快递单号</th>
              <th className="pb-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const part = getPartById(r.partId)
              const wo = getWorkOrderById(r.workOrderId)
              const isAbnormal = r.status === 'abnormal' || r.serialMismatch || r.overdueDays > 0
              return (
                <tr key={r.id} className={`border-b border-slate-800/50 ${isAbnormal ? 'bg-amber-500/5' : ''}`}>
                  <td className="py-3 text-slate-200 font-mono text-xs">{r.recoveryNo}</td>
                  <td className="py-3 text-slate-300 font-mono text-xs">{wo?.orderNo || '-'}</td>
                  <td className="py-3 text-slate-200">{part?.name || '-'}</td>
                  <td className="py-3 text-slate-400 font-mono text-xs">{r.serialNo || '-'}</td>
                  <td className="py-3"><StatusBadge status={r.status} label={statusMap[r.status]} /></td>
                  <td className="py-3">
                    {r.serialMismatch && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
                        串号不符
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    {r.overdueDays > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
                        超期 {r.overdueDays}天
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-slate-400 font-mono text-xs">{r.trackingNo || '-'}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {r.status === 'pending' && (
                        <button onClick={() => setConsumeModal(r)} className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                          <CheckCircle size={14} />确认消耗
                        </button>
                      )}
                      {r.status === 'registered' && (
                        <button onClick={() => { setReturnModal(r); setReturnForm((f) => ({ ...f, serialNo: r.serialNo })) }} className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                          <Truck size={14} />登记返厂
                        </button>
                      )}
                      {r.status === 'abnormal' && (
                        <button onClick={() => setAbnormalPanel(r)} className="text-orange-400 hover:text-orange-300 text-xs flex items-center gap-1">
                          <AlertTriangle size={14} />处理异常
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal open={!!consumeModal} onClose={() => setConsumeModal(null)} title="确认消耗">
        {consumeModal && (() => {
          const part = getPartById(consumeModal.partId)
          const wo = getWorkOrderById(consumeModal.workOrderId)
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">工单号：</span><span className="text-slate-200">{wo?.orderNo}</span></div>
                <div><span className="text-slate-500">客户：</span><span className="text-slate-200">{wo?.customerName}</span></div>
                <div><span className="text-slate-500">备件：</span><span className="text-slate-200">{part?.name}</span></div>
                <div><span className="text-slate-500">规格：</span><span className="text-slate-200">{part?.spec}</span></div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">确认消耗数量</label>
                <input type="number" min={1} value={consumeQty} onChange={(e) => setConsumeQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm" />
              </div>
              <button onClick={handleConfirmConsume}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                确认消耗
              </button>
            </div>
          )
        })()}
      </Modal>

      <Modal open={!!returnModal} onClose={() => setReturnModal(null)} title="登记返厂">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">串号</label>
            <input value={returnForm.serialNo} onChange={(e) => setReturnForm((f) => ({ ...f, serialNo: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">快递公司</label>
            <select value={returnForm.courier} onChange={(e) => setReturnForm((f) => ({ ...f, courier: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm">
              {COURIERS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">快递单号</label>
            <input value={returnForm.trackingNo} onChange={(e) => setReturnForm((f) => ({ ...f, trackingNo: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">返厂日期</label>
            <input type="date" value={returnForm.returnDate} onChange={(e) => setReturnForm((f) => ({ ...f, returnDate: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm" />
          </div>
          <button onClick={handleReturnSubmit}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            提交登记
          </button>
        </div>
      </Modal>

      <SidePanel open={!!abnormalPanel} onClose={() => setAbnormalPanel(null)} title="处理异常">
        {abnormalPanel && (() => {
          const part = getPartById(abnormalPanel.partId)
          return (
            <div className="space-y-6">
              <div className="p-3 bg-slate-800 rounded-lg text-sm">
                <div className="text-slate-400">回收单号</div>
                <div className="text-slate-200 font-mono">{abnormalPanel.recoveryNo}</div>
                <div className="text-slate-400 mt-1">备件</div>
                <div className="text-slate-200">{part?.name} ({part?.spec})</div>
              </div>

              {abnormalPanel.overdueDays > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-orange-400 flex items-center gap-1.5"><AlertTriangle size={15} />超期未还</h4>
                  <div className="text-sm text-slate-400">已超期 <span className="text-red-400 font-medium">{abnormalPanel.overdueDays}</span> 天</div>
                  <button onClick={handleSendReminder}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-600/20 text-orange-400 border border-orange-500/30 rounded-lg text-sm hover:bg-orange-600/30 transition-colors">
                    <Send size={14} />发送催还
                  </button>
                </div>
              )}

              {abnormalPanel.serialMismatch && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-red-400 flex items-center gap-1.5"><AlertTriangle size={15} />串号不符</h4>
                  <div className="text-sm">
                    <div className="text-slate-400">预期串号：<span className="text-slate-200">{abnormalPanel.serialNo}</span></div>
                    <div className="text-slate-400">实际串号：<span className="text-red-400">待核实</span></div>
                  </div>
                  <input placeholder="核实原因" value={mismatchReason} onChange={(e) => setMismatchReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm" />
                  <button onClick={handleMismatchVerify}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-600/30 transition-colors">
                    <FileCheck size={14} />核实登记
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300">报废申请</h4>
                <div className="flex gap-3">
                  {(['stock_in', 'scrap'] as const).map((m) => (
                    <label key={m} className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-sm border transition-colors ${
                      disposalMethod === m ? 'bg-blue-600/20 border-blue-500/40 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                      <input type="radio" checked={disposalMethod === m} onChange={() => setDisposalMethod(m)} className="sr-only" />
                      {m === 'stock_in' ? '入库' : '报废'}
                    </label>
                  ))}
                </div>
                <input placeholder="申请原因" value={disposalReason} onChange={(e) => setDisposalReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm" />
                <button onClick={handleDisposalSubmit}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  <FileCheck size={14} />提交申请
                </button>
              </div>
            </div>
          )
        })()}
      </SidePanel>
    </div>
  )
}
