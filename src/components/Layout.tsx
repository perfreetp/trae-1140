import { type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  PackageSearch,
  Grid3X3,
  ClipboardCheck,
  Truck,
  Recycle,
  BarChart3,
} from 'lucide-react'

const navItems = [
  { path: '/workboard', label: '工单看板', icon: LayoutDashboard },
  { path: '/catalog', label: '备件目录', icon: PackageSearch },
  { path: '/inventory', label: '库存网格', icon: Grid3X3 },
  { path: '/requisition', label: '申领审批', icon: ClipboardCheck },
  { path: '/transfer', label: '调拨发运', icon: Truck },
  { path: '/recovery', label: '旧件回收', icon: Recycle },
  { path: '/analytics', label: '统计分析', icon: BarChart3 },
]

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <aside className="w-60 flex-shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <PackageSearch size={18} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-50 leading-tight">备件供应链</div>
              <div className="text-[10px] text-slate-500 leading-tight">SPARE PARTS SCM</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 font-medium'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
              坐席
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-300 truncate">王主管</div>
              <div className="text-[10px] text-slate-500">售后服务部</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
