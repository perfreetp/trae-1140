import { useState, useMemo, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, ChevronDown, ChevronUp, Package, FilePlus, Clock, Wrench, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { useStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import PageHeader from '@/components/PageHeader'

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'urgent', label: '紧急' },
]

function StatusCard({ label, count, icon, color, trend }: {
  label: string
  count: number
  icon: React.ReactNode
  color: string
  trend?: 'up' | 'down'
}) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900 p-5 ${color === 'red' ? 'ring-1 ring-red-500/30' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <div className={`${color === 'amber' ? 'text-amber-400' : color === 'blue' ? 'text-blue-400' : color === 'emerald' ? 'text-emerald-400' : 'text-red-400'}`}>
          {icon}
        </div>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className={`text-3xl font-bold ${color === 'amber' ? 'text-amber-400' : color === 'blue' ? 'text-blue-400' : color === 'emerald' ? 'text-emerald-400' : 'text-red-400'} ${color === 'red' ? 'animate-pulse' : ''}`}>
          {count}
        </span>
        {trend && (
          <span className={`mb-1 flex items-center text-xs ${trend === 'up' ? 'text-red-400' : 'text-emerald-400'}`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend === 'up' ? '+' : '-'}1
          </span>
        )}
      </div>
    </div>
  )
}

function ExpandedRow({ sparePartIds }: { sparePartIds: string[] }) {
  const { spareParts, getPartTotalStock } = useStore()

  const parts = useMemo(
    () => sparePartIds.map((id) => spareParts.find((p) => p.id === id)).filter(Boolean),
    [sparePartIds, spareParts]
  )

  if (parts.length === 0) {
    return (
      <tr>
        <td colSpan={10} className="bg-slate-900/50 px-8 py-3 text-sm text-slate-500">
          暂无关联备件
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td colSpan={10} className="bg-slate-900/50 px-8 py-3">
        <div className="flex flex-wrap gap-3">
          {parts.map((part) => {
            if (!part) return null
            const stock = getPartTotalStock(part.id)
            return (
              <div key={part.id} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm">
                <Package className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-slate-200">{part.name}</span>
                <span className="text-slate-500">{part.partNo}</span>
                <span className={`font-medium ${stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  库存:{stock}
                </span>
              </div>
            )
          })}
        </div>
      </td>
    </tr>
  )
}

export default function WorkBoard() {
  const navigate = useNavigate()
  const { workOrders } = useStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const brands = useMemo(() => [...new Set(workOrders.map((o) => o.brand))], [workOrders])

  const counts = useMemo(() => ({
    pending: workOrders.filter((o) => o.status === 'pending').length,
    in_progress: workOrders.filter((o) => o.status === 'in_progress').length,
    completed: workOrders.filter((o) => o.status === 'completed').length,
    urgent: workOrders.filter((o) => o.status === 'urgent').length,
  }), [workOrders])

  const filtered = useMemo(() => {
    return workOrders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false
      if (brandFilter && o.brand !== brandFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return o.orderNo.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.machineModel.toLowerCase().includes(q)
      }
      return true
    })
  }, [workOrders, search, statusFilter, brandFilter])

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="工单看板" subtitle="工单状态总览与管理" />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-4 gap-4">
          <StatusCard label="待处理" count={counts.pending} icon={<Clock className="h-5 w-5" />} color="amber" trend="up" />
          <StatusCard label="进行中" count={counts.in_progress} icon={<Wrench className="h-5 w-5" />} color="blue" trend="down" />
          <StatusCard label="已完成" count={counts.completed} icon={<CheckCircle2 className="h-5 w-5" />} color="emerald" trend="down" />
          <StatusCard label="紧急" count={counts.urgent} icon={<AlertTriangle className="h-5 w-5" />} color="red" trend="up" />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索工单号、客户、机型..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-blue-600 focus:outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-blue-600 focus:outline-none"
            >
              <option value="">全部品牌</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="px-4 py-3 text-left font-medium text-slate-400">工单号</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">客户</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">机型</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">品牌</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">故障描述</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">故障类型</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">状态</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">维修工</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">创建日期</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const isExpanded = expandedId === order.id
                return (
                  <Fragment key={order.id}>
                    <tr
                      onClick={() => toggleExpand(order.id)}
                      className={`cursor-pointer border-b border-slate-800/50 transition-colors hover:bg-slate-800/50 ${order.status === 'urgent' ? 'border-l-2 border-l-red-500' : ''}`}
                    >
                      <td className="px-4 py-3 text-slate-200 font-mono">
                        <span className="mr-1 inline-flex">{isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}</span>
                        {order.orderNo}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{order.customerName}</td>
                      <td className="px-4 py-3 text-slate-300">{order.machineModel}</td>
                      <td className="px-4 py-3 text-slate-400">{order.brand}</td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-slate-400">{order.faultDesc}</td>
                      <td className="px-4 py-3 text-slate-400">{order.faultType}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-slate-300">{order.technician}</td>
                      <td className="px-4 py-3 text-slate-500">{order.createdAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleExpand(order.id)}
                            className="rounded px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10"
                          >
                            查看备件
                          </button>
                          <button
                            onClick={() => navigate('/requisition', { state: { workOrderId: order.id } })}
                            className="rounded px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10"
                          >
                            创建申领
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && <ExpandedRow sparePartIds={order.sparePartIds} />}
                  </Fragment>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                    暂无匹配的工单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
