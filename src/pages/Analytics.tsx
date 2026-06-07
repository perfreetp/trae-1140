import { useState, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, BarChart3, Filter } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { monthlyStats, brandStats, regionStats, faultTypeStats } from '@/data/mockData'
import { useStore } from '@/store'

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']
const REGIONS = ['全部', '华东', '华南', '华北', '西南', '华中']
const BRANDS = ['全部', '格力', '海尔', '美的', '三花', '通用']
const TABS = ['备件周转', '一次修复率', '库存占用'] as const

const REGION_FACTOR: Record<string, number> = { '华东': 0.95, '华南': 0.88, '华北': 0.82, '西南': 0.75, '华中': 0.85 }
const BRAND_FACTOR: Record<string, number> = { '格力': 0.92, '海尔': 0.90, '美的': 0.87, '三花': 0.95, '通用': 0.98 }

const tooltipStyle = { contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' } }
const axisTick = { fill: '#94a3b8', fontSize: 12 }
const gridStyle = { stroke: '#334155', strokeDasharray: '3 3' }

function SummaryCard({ label, value, trend }: { label: string; value: string; trend?: number }) {
  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
      <p className="text-slate-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-slate-50 mt-1">{value}</p>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-sm ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend >= 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  )
}

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<number>(0)
  const [region, setRegion] = useState('全部')
  const [brand, setBrand] = useState('全部')
  const [reportDim, setReportDim] = useState('区域')
  const [reportMetric, setReportMetric] = useState('周转率')
  const [reportResult, setReportResult] = useState<{ name: string; value: number }[] | null>(null)
  useStore()

  const getFactor = () => {
    const rf = region !== '全部' ? REGION_FACTOR[region] ?? 1 : 1
    const bf = brand !== '全部' ? BRAND_FACTOR[brand] ?? 1 : 1
    return { rf, bf }
  }

  const filteredMonthly = useMemo(() => {
    const { rf, bf } = getFactor()
    if (rf === 1 && bf === 1) return monthlyStats
    return monthlyStats.map((m) => ({
      ...m,
      turnoverRate: +(m.turnoverRate * rf * bf).toFixed(1),
      fixRate: +(m.fixRate * bf).toFixed(0),
      inventoryValue: Math.round(m.inventoryValue * rf),
    }))
  }, [region, brand])

  const filteredBrandStats = useMemo(() => {
    const { rf } = getFactor()
    if (rf === 1) return brandStats
    return brandStats.map((b) => ({
      ...b,
      fixRate: +(b.fixRate * rf).toFixed(0),
      turnoverRate: +(b.turnoverRate * rf).toFixed(1),
      inventoryValue: Math.round(b.inventoryValue * rf),
    }))
  }, [region, brand])

  const filteredRegionStats = useMemo(() => {
    const { bf } = getFactor()
    if (bf === 1) return regionStats
    return regionStats.map((r) => ({
      ...r,
      fixRate: +(r.fixRate * bf).toFixed(0),
      turnoverRate: +(r.turnoverRate * bf).toFixed(1),
      inventoryValue: Math.round(r.inventoryValue * bf),
    }))
  }, [region, brand])

  const filteredFaultStats = useMemo(() => {
    const { rf, bf } = getFactor()
    if (rf === 1 && bf === 1) return faultTypeStats
    return faultTypeStats.map((f) => ({
      ...f,
      count: Math.round(f.count * rf * bf),
      fixRate: +(f.fixRate * bf).toFixed(0),
    }))
  }, [region, brand])

  const avgTurnover = useMemo(() => +(filteredMonthly.reduce((s, m) => s + m.turnoverRate, 0) / filteredMonthly.length).toFixed(1), [filteredMonthly])
  const currentTurnover = filteredMonthly[filteredMonthly.length - 1].turnoverRate
  const turnoverTrend = useMemo(() => +((currentTurnover - filteredMonthly[filteredMonthly.length - 2].turnoverRate) / filteredMonthly[filteredMonthly.length - 2].turnoverRate * 100).toFixed(1), [filteredMonthly, currentTurnover])

  const avgFixRate = useMemo(() => +(filteredMonthly.reduce((s, m) => s + m.fixRate, 0) / filteredMonthly.length).toFixed(0), [filteredMonthly])
  const currentFixRate = filteredMonthly[filteredMonthly.length - 1].fixRate
  const fixTrend = useMemo(() => +((currentFixRate - filteredMonthly[filteredMonthly.length - 2].fixRate) / filteredMonthly[filteredMonthly.length - 2].fixRate * 100).toFixed(1), [filteredMonthly, currentFixRate])

  const totalInventory = useMemo(() => filteredRegionStats.reduce((s, r) => s + r.inventoryValue, 0), [filteredRegionStats])
  const avgInventory = useMemo(() => +(totalInventory / filteredRegionStats.length).toFixed(0), [totalInventory, filteredRegionStats])
  const momChange = useMemo(() => +((filteredMonthly[5].inventoryValue - filteredMonthly[4].inventoryValue) / filteredMonthly[4].inventoryValue * 100).toFixed(1), [filteredMonthly])

  const generateReport = () => {
    const metricKey = reportMetric === '周转率' ? 'turnoverRate' : reportMetric === '修复率' ? 'fixRate' : 'inventoryValue'
    if (reportDim === '区域') {
      setReportResult(filteredRegionStats.map((r) => ({ name: r.region, value: r[metricKey] })))
    } else if (reportDim === '品牌') {
      setReportResult(filteredBrandStats.map((b) => ({ name: b.brand, value: b[metricKey] })))
    } else {
      const fKey = reportMetric === '修复率' ? 'fixRate' : 'count'
      setReportResult(filteredFaultStats.map((f) => ({ name: f.faultType, value: f[fKey] })))
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-50">
      <PageHeader title="统计分析" subtitle="备件运营数据洞察" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === i ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Filter size={16} className="text-slate-500" />
            <select value={region} onChange={(e) => { setRegion(e.target.value); setReportResult(null) }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300">
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
            <select value={brand} onChange={(e) => { setBrand(e.target.value); setReportResult(null) }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300">
              {BRANDS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>

        {activeTab === 0 && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-base font-semibold text-slate-200 mb-4">月度周转率趋势</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredMonthly}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="month" tick={axisTick} />
                  <YAxis tick={axisTick} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="turnoverRate" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: '#3B82F6' }} name="周转率" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <SummaryCard label="平均周转率" value={avgTurnover.toString()} />
              <SummaryCard label="本月周转率" value={currentTurnover.toString()} trend={turnoverTrend} />
              <SummaryCard label="趋势变化" value={`${turnoverTrend >= 0 ? '+' : ''}${turnoverTrend}%`} trend={turnoverTrend} />
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-base font-semibold text-slate-200 mb-4">月度修复率趋势</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={filteredMonthly}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="month" tick={axisTick} />
                  <YAxis tick={axisTick} domain={[70, 100]} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="fixRate" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: '#3B82F6' }} name="修复率%" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-base font-semibold text-slate-200 mb-4">品牌修复率</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={filteredBrandStats} layout="vertical">
                    <CartesianGrid {...gridStyle} />
                    <XAxis type="number" tick={axisTick} domain={[80, 100]} />
                    <YAxis type="category" dataKey="brand" tick={axisTick} width={50} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="fixRate" fill="#3B82F6" name="修复率%" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-base font-semibold text-slate-200 mb-4">故障类型分布</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={filteredFaultStats} dataKey="count" nameKey="faultType" cx="50%" cy="50%" outerRadius={90} label={({ faultType, percent }) => `${faultType} ${(percent * 100).toFixed(0)}%`}>
                      {filteredFaultStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SummaryCard label="平均修复率" value={`${avgFixRate}%`} />
              <SummaryCard label="本月修复率" value={`${currentFixRate}%`} trend={fixTrend} />
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-base font-semibold text-slate-200 mb-4">区域库存金额</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={filteredRegionStats}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="region" tick={axisTick} />
                  <YAxis tick={axisTick} />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => [`¥${(v / 10000).toFixed(1)}万`, '库存金额']} />
                  <Bar dataKey="inventoryValue" fill="#3B82F6" name="库存金额" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-base font-semibold text-slate-200 mb-4">月度库存趋势</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={filteredMonthly}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="month" tick={axisTick} />
                  <YAxis tick={axisTick} />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => [`¥${(v / 10000).toFixed(1)}万`, '库存金额']} />
                  <Line type="monotone" dataKey="inventoryValue" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: '#3B82F6' }} name="库存金额" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <SummaryCard label="总库存金额" value={`¥${(totalInventory / 10000).toFixed(0)}万`} />
              <SummaryCard label="区域均值" value={`¥${(avgInventory / 10000).toFixed(0)}万`} />
              <SummaryCard label="环比变化" value={`${momChange >= 0 ? '+' : ''}${momChange}%`} trend={momChange} />
            </div>
          </div>
        )}

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} /> 自定义报表
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <select value={reportDim} onChange={(e) => { setReportDim(e.target.value); setReportResult(null) }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300">
              {['区域', '品牌', '故障类型'].map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={reportMetric} onChange={(e) => { setReportMetric(e.target.value); setReportResult(null) }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300">
              {['周转率', '修复率', '库存金额'].map((m) => <option key={m}>{m}</option>)}
            </select>
            <button onClick={generateReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              生成报表
            </button>
            {region !== '全部' && <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">区域: {region}</span>}
            {brand !== '全部' && <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">品牌: {brand}</span>}
          </div>
          {reportResult && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-2 text-slate-400 font-medium">名称</th>
                  <th className="text-right py-2 text-slate-400 font-medium">{reportMetric}</th>
                </tr>
              </thead>
              <tbody>
                {reportResult.map((row) => (
                  <tr key={row.name} className="border-b border-slate-800/50">
                    <td className="py-2 text-slate-300">{row.name}</td>
                    <td className="py-2 text-slate-300 text-right">
                      {reportMetric === '库存金额' ? `¥${(row.value / 10000).toFixed(1)}万` : reportMetric === '修复率' ? `${row.value}%` : row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
