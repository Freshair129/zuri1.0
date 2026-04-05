'use client'

/**
 * Marketing Dashboard — core/marketing (FEAT09)
 * Executive overview: KPI cards, spend vs revenue chart, hourly heatmap,
 * top campaigns table. All data from /api/marketing/* — never direct Meta API.
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, LineChart,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, ExternalLink,
  DollarSign, MousePointerClick, Eye, Users, Zap, Target,
} from 'lucide-react'

const RANGES = ['7d', '30d', '90d']
const RANGE_LABELS = { '7d': '7 วัน', '30d': '30 วัน', '90d': '90 วัน' }
const DOW_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

function fmt(n, { type = 'number', decimals = 0 } = {}) {
  if (n == null) return '—'
  if (type === 'currency') return `฿${Number(n).toLocaleString('th-TH', { minimumFractionDigits: decimals })}`
  if (type === 'pct')      return `${Number(n).toFixed(decimals)}%`
  if (type === 'x')        return `${Number(n).toFixed(decimals)}x`
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: decimals })
}

function ChangeChip({ value }) {
  if (value == null) return <span className="text-gray-400 text-xs">—</span>
  const up = value > 0
  const Icon = up ? TrendingUp : value < 0 ? TrendingDown : Minus
  const color = up ? 'text-green-600 bg-green-50' : value < 0 ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-100'
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full ${color}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

function KpiCard({ label, value, change, icon: Icon, color = 'orange' }) {
  const colors = {
    orange: 'bg-orange-50 text-orange-600',
    green:  'bg-green-50 text-green-600',
    blue:   'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    pink:   'bg-pink-50 text-pink-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <span className={`p-1.5 rounded-lg ${colors[color]}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      <ChangeChip value={change} />
    </div>
  )
}

function StatusBadge({ status }) {
  const map = { ACTIVE:'bg-green-100 text-green-700', PAUSED:'bg-yellow-100 text-yellow-700', ARCHIVED:'bg-gray-100 text-gray-500' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>{status}</span>
}

function heatColor(value, max) {
  if (!max || !value) return '#f3f4f6'
  const p = value / max
  if (p < 0.15) return '#fef3c7'
  if (p < 0.35) return '#fde68a'
  if (p < 0.55) return '#fbbf24'
  if (p < 0.75) return '#f97316'
  return '#ea580c'
}

export default function MarketingPage() {
  const router = useRouter()
  const [range, setRange]           = useState('30d')
  const [dashboard, setDashboard]   = useState(null)
  const [timeSeries, setTimeSeries] = useState([])
  const [heatmap, setHeatmap]       = useState([])
  const [campaigns, setCampaigns]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const fetchAll = useCallback(async (r) => {
    setLoading(true); setError(null)
    try {
      const [dash, ts, heat, camps] = await Promise.all([
        fetch(`/api/marketing/dashboard?range=${r}`).then(x => x.json()),
        fetch(`/api/marketing/campaigns?type=timeseries&range=${r}`).then(x => x.json()),
        fetch(`/api/marketing/campaigns?type=heatmap&range=${r}`).then(x => x.json()),
        fetch(`/api/marketing/campaigns?range=${r}`).then(x => x.json()),
      ])
      setDashboard(Array.isArray(dash) ? null : dash)
      setTimeSeries(Array.isArray(ts) ? ts : [])
      setHeatmap(Array.isArray(heat) ? heat : [])
      setCampaigns((Array.isArray(camps) ? camps : []).slice(0, 10))
    } catch (err) {
      console.error('[marketing/page]', err)
      setError('ดึงข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll(range) }, [range, fetchAll])

  const { mat: heatMat, maxVal: heatMax } = (() => {
    const mat = {}; let maxVal = 0
    heatmap.forEach(({ dow, hour, spend }) => { mat[`${dow}-${hour}`] = spend; if (spend > maxVal) maxVal = spend })
    return { mat, maxVal }
  })()

  const c = dashboard?.current ?? {}
  const ch = dashboard?.changes ?? {}

  return (
    <div className="p-6 space-y-6">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
          <p className="text-sm text-gray-500 mt-0.5">วิเคราะห์ประสิทธิภาพโฆษณา Meta Ads · ซิงค์ทุก 1 ชั่วโมง</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
            {RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${range === r ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {RANGE_LABELS[r]}
              </button>
            ))}
          </div>
          <button onClick={() => router.push('/marketing/campaigns')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <ExternalLink className="h-4 w-4" />ดูทุก Campaign
          </button>
          <button onClick={() => fetchAll(range)} disabled={loading} className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50" title="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="col-span-2"><KpiCard label="ยอดใช้โฆษณา"       value={fmt(c.spend,{type:'currency'})}           change={ch.spend}       icon={DollarSign}        color="orange" /></div>
        <div className="col-span-2"><KpiCard label="รายได้ (attributed)" value={fmt(c.revenue,{type:'currency'})}         change={ch.revenue}     icon={TrendingUp}        color="green"  /></div>
        <KpiCard label="ROAS"        value={fmt(c.roas,{type:'x',decimals:2})}  change={ch.roas}        icon={Target}            color="blue"   />
        <KpiCard label="CPL"         value={fmt(c.cpl,{type:'currency'})}       change={ch.cpl}         icon={Users}             color="purple" />
        <KpiCard label="CTR"         value={fmt(c.ctr,{type:'pct',decimals:2})} change={ch.ctr}         icon={MousePointerClick} color="pink"   />
        <KpiCard label="Impressions" value={fmt(c.impressions)}                 change={ch.impressions} icon={Eye}               color="indigo" />
        <KpiCard label="Clicks"      value={fmt(c.clicks)}                      change={ch.clicks}      icon={Zap}               color="orange" />
        <KpiCard label="Leads"       value={fmt(c.leads)}                       change={ch.leads}       icon={Users}             color="green"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">ยอดใช้โฆษณา vs รายได้</h2>
          {timeSeries.length === 0 && !loading
            ? <div className="h-52 flex items-center justify-center text-sm text-gray-400">ไม่มีข้อมูล</div>
            : <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={timeSeries} margin={{top:4,right:16,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{fontSize:10}} tickFormatter={d=>d?.slice(5)} interval="preserveStartEnd" />
                  <YAxis yAxisId="left"  tick={{fontSize:10}} tickFormatter={v=>`฿${(v/1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{fontSize:10}} tickFormatter={v=>`฿${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v,n)=>[`฿${Number(v).toLocaleString()}`,n==='spend'?'Spend':'Revenue']} labelFormatter={l=>`วันที่ ${l}`} />
                  <Legend wrapperStyle={{fontSize:12}} />
                  <Bar  yAxisId="left"  dataKey="spend"   name="Spend"   fill="#fb923c" radius={[3,3,0,0]} />
                  <Line yAxisId="right" dataKey="revenue" name="Revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
          }
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">CTR Trend (%)</h2>
          {timeSeries.length === 0 && !loading
            ? <div className="h-52 flex items-center justify-center text-sm text-gray-400">ไม่มีข้อมูล</div>
            : <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timeSeries} margin={{top:4,right:16,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{fontSize:10}} tickFormatter={d=>d?.slice(5)} interval="preserveStartEnd" />
                  <YAxis tick={{fontSize:10}} tickFormatter={v=>`${v.toFixed(1)}%`} />
                  <Tooltip formatter={v=>[`${Number(v).toFixed(2)}%`,'CTR']} labelFormatter={l=>`วันที่ ${l}`} />
                  <Line dataKey="ctr" name="CTR" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
          }
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Hourly Spend Heatmap</h2>
          <span className="text-xs text-gray-400">สีเข้ม = Spend สูง</span>
        </div>
        {heatmap.length === 0 && !loading
          ? <div className="h-16 flex items-center justify-center text-sm text-gray-400">ไม่มีข้อมูล</div>
          : <div className="overflow-x-auto">
              <div className="inline-flex gap-0.5">
                <div className="flex flex-col gap-0.5 mr-1">
                  <div className="h-5 w-7" />
                  {Array.from({length:24},(_,h)=>(
                    <div key={h} className="h-5 w-7 flex items-center justify-end pr-1 text-xs text-gray-400">{h%6===0?h:''}</div>
                  ))}
                </div>
                {DOW_LABELS.map((dow,d)=>(
                  <div key={d} className="flex flex-col gap-0.5">
                    <div className="h-5 w-10 text-center text-xs font-medium text-gray-500">{dow}</div>
                    {Array.from({length:24},(_,h)=>{
                      const val = heatMat[`${d}-${h}`] ?? 0
                      return <div key={h} className="h-5 w-10 rounded-sm" style={{backgroundColor:heatColor(val,heatMax)}} title={`${DOW_LABELS[d]} ${h}:00 — ฿${val.toFixed(0)}`} />
                    })}
                  </div>
                ))}
              </div>
            </div>
        }
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Top Campaigns (by spend)</h2>
          <button onClick={()=>router.push('/marketing/campaigns')} className="text-xs font-medium text-orange-600 hover:text-orange-700">ดูทั้งหมด →</button>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({length:4}).map((_,i)=>(
              <div key={i} className="px-5 py-3 flex gap-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded flex-1" /><div className="h-4 bg-gray-100 rounded w-20" /><div className="h-4 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">ไม่มี campaign ในช่วงนี้</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-2.5 text-left">Campaign</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-right">Spend</th>
                  <th className="px-4 py-2.5 text-right">Revenue</th>
                  <th className="px-4 py-2.5 text-right">ROAS</th>
                  <th className="px-4 py-2.5 text-right">CTR</th>
                  <th className="px-4 py-2.5 text-right">Leads</th>
                  <th className="px-4 py-2.5 text-right">CPL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaigns.map(camp=>(
                  <tr key={camp.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>router.push('/marketing/campaigns')}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-xs">{camp.name}</p>
                      <p className="text-xs text-gray-400">{camp.objective??'—'}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={camp.status} /></td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(camp.spend,{type:'currency'})}</td>
                    <td className="px-4 py-3 text-right text-green-700">{fmt(camp.revenue,{type:'currency'})}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${camp.roas>=3?'text-green-600':camp.roas>=1?'text-yellow-600':'text-red-500'}`}>
                        {fmt(camp.roas,{type:'x',decimals:2})}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmt(camp.ctr,{type:'pct',decimals:2})}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmt(camp.leads)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmt(camp.cpl,{type:'currency'})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
