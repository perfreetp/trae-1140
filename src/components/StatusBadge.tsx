import type { ReactNode } from 'react'

type Variant = 'pending' | 'in_progress' | 'completed' | 'urgent' | 'approved' | 'rejected' | 'shipped' | 'shipping' | 'received' | 'registered' | 'abnormal' | 'info'

const variantStyles: Record<Variant, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  in_progress: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  urgent: 'bg-red-500/15 text-red-400 border-red-500/30',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  shipped: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  shipping: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  received: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  registered: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  abnormal: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  info: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

const statusLabels: Record<string, string> = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
  urgent: '紧急',
  approved: '已批准',
  rejected: '已驳回',
  shipped: '已出库',
  shipping: '运输中',
  received: '已签收',
  registered: '已登记',
  abnormal: '异常',
}

export default function StatusBadge({ status, label, icon }: { status: string; label?: string; icon?: ReactNode }) {
  const variant = (status in variantStyles ? status : 'info') as Variant
  const displayLabel = label || statusLabels[status] || status

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${variantStyles[variant]}`}>
      {icon}
      {displayLabel}
    </span>
  )
}
