import React, { useState } from 'react';
import { ANALYTICS_TREND_SERIES } from '../../services/officerPortalData.js';
import { civicDataService } from '../../services/supabaseClient.js';
import {
  Download,
  TrendingUp,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Building2,
  Sparkles
} from 'lucide-react';

export default function OfficerReportsView({ officerProfile, onShowToast }) {
  const [dateRange, setDateRange] = useState('Last 30 Days (21 Sep - 20 Oct 2026)');
  const [deptScope, setDeptScope] = useState('Roads & Infrastructure (Your Dept)');
  const [cadence, setCadence] = useState('Weekly'); // 'Daily' | 'Weekly' | 'Monthly'
  const [activeIndex, setActiveIndex] = useState(4); // Default Week 41

  const series = ANALYTICS_TREND_SERIES[cadence] || ANALYTICS_TREND_SERIES.Weekly;
  const activePoint = series[activeIndex] || series[0];

  // Compute SVG coordinates for smooth dual line/area chart
  const chartWidth = 760;
  const chartHeight = 250;
  const padX = 48;
  const padY = 28;
  const maxVal = Math.max(...series.map((d) => Math.max(d.received, d.resolved))) * 1.12;

  const getCoords = (idx, val) => {
    const x = padX + (idx / Math.max(1, series.length - 1)) * (chartWidth - padX * 2);
    const y = chartHeight - padY - (val / maxVal) * (chartHeight - padY * 2);
    return { x, y };
  };

  const receivedPoints = series.map((d, i) => getCoords(i, d.received));
  const resolvedPoints = series.map((d, i) => getCoords(i, d.resolved));

  const buildPath = (pts) =>
    pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const buildArea = (pts) =>
    `${buildPath(pts)} L ${pts[pts.length - 1].x.toFixed(1)} ${chartHeight - padY} L ${pts[0].x.toFixed(1)} ${chartHeight - padY} Z`;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 mb-1">
            OPERATIONS & ANALYTICS MONITORING
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reports & Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Statutory SLA compliance velocity, complaint inflow vs resolution trends, and ward-level audit metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option>Last 30 Days (21 Sep - 20 Oct 2026)</option>
              <option>Last 7 Days (14 Oct - 20 Oct 2026)</option>
              <option>Q3 FY 2026–27 (Jul - Sep 2026)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={deptScope}
              onChange={(e) => setDeptScope(e.target.value)}
              className="bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option>Roads & Infrastructure (Your Dept)</option>
              <option>All IMC Zones & Divisions</option>
              <option>Water Supply & Sewerage</option>
              <option>Sanitation & Solid Waste</option>
            </select>
          </div>

          <button
            onClick={() => {
              const rows = series.map((pt) => ({
                Cadence: cadence,
                Period: pt.label,
                DepartmentScope: deptScope,
                DateRange: dateRange,
                ComplaintsReceived: pt.received,
                ComplaintsResolved: pt.resolved,
                Velocity: pt.velocity
              }));
              civicDataService.exportToCsv(`imc-performance-report-${cadence.toLowerCase()}.csv`, rows);
              onShowToast('Official IMC Monthly Performance & SLA Audit Report (CSV) downloaded.');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Cards Row (Exact screenshot numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Complaints Received</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
              +8.4%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">1,248</div>
          <div className="text-[11px] text-slate-400">vs. 1,151 previous 30 days</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Complaints Resolved</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold">
              +14.2%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">1,084</div>
          <div className="text-[11px] text-slate-400">86.8% gross clearance ratio</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Avg Resolution Time</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold">
              -4.6 hrs faster
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">28.4 hrs</div>
          <div className="text-[11px] text-slate-400">Statutory benchmark: 48.0 hrs</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">SLA Compliance Rate</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold">
              +1.8%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-blue-600 font-mono tabular-nums">94.2%</div>
          <div className="text-[11px] text-slate-400">Rank #1 across MP Municipal Corps</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Overdue Complaints</span>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">
              Needs Triage
            </span>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 font-mono tabular-nums">19</div>
          <div className="text-[11px] text-rose-600 font-medium">5 escalated to SE desk today</div>
        </div>
      </div>

      {/* Main Chart Card: Complaint Trends & Inflow vs Resolution */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Complaint Trends & Inflow vs Resolution
            </h2>
            <p className="text-xs text-slate-500">
              Comparative trajectory of citizen complaints logged vs verified field resolutions ({deptScope})
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-full bg-blue-600" /> Received
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Resolved
              </span>
            </div>

            <div className="inline-flex bg-slate-100 p-1 rounded-xl">
              {['Daily', 'Weekly', 'Monthly'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setCadence(mode);
                    setActiveIndex(0);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    cadence === mode
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="relative">
          {/* Active Point Floating Callout Pill */}
          <div className="mb-3 inline-flex flex-wrap items-center gap-3 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs">
            <span className="font-bold text-blue-300">{activePoint.label}:</span>
            <span className="font-mono">
              <strong>{activePoint.received}</strong> Recv
            </span>
            <span>·</span>
            <span className="font-mono text-emerald-400">
              <strong>{activePoint.resolved}</strong> Resv
            </span>
            <span>·</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              {activePoint.velocity} Velocity
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg className="w-full h-64 min-w-[640px]" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              <defs>
                <linearGradient id="recvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(37, 99, 235, 0.22)" />
                  <stop offset="100%" stopColor="rgba(37, 99, 235, 0.0)" />
                </linearGradient>
                <linearGradient id="resvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.22)" />
                  <stop offset="100%" stopColor="rgba(16, 185, 129, 0.0)" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              {[0.2, 0.45, 0.7, 0.95].map((ratio, idx) => {
                const y = chartHeight - padY - ratio * (chartHeight - padY * 2);
                const labelVal = Math.round(ratio * maxVal);
                return (
                  <g key={idx}>
                    <line
                      x1={padX}
                      y1={y}
                      x2={chartWidth - padX}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                    />
                    <text x={10} y={y + 4} className="fill-slate-400 text-[10px] font-mono">
                      {labelVal}
                    </text>
                  </g>
                );
              })}

              {/* Area Fills */}
              <path d={buildArea(receivedPoints)} fill="url(#recvGrad)" />
              <path d={buildArea(resolvedPoints)} fill="url(#resvGrad)" />

              {/* Lines */}
              <path d={buildPath(receivedPoints)} fill="none" stroke="#2563eb" strokeWidth="3" />
              <path d={buildPath(resolvedPoints)} fill="none" stroke="#10b981" strokeWidth="3" />

              {/* Interactive Data Points */}
              {series.map((item, idx) => {
                const ptRecv = receivedPoints[idx];
                const ptResv = resolvedPoints[idx];
                const isSelected = idx === activeIndex;
                return (
                  <g
                    key={item.label}
                    onClick={() => setActiveIndex(idx)}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <line
                        x1={ptRecv.x}
                        y1={padY}
                        x2={ptRecv.x}
                        y2={chartHeight - padY}
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}
                    <circle
                      cx={ptRecv.x}
                      cy={ptRecv.y}
                      r={isSelected ? 6 : 4}
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <circle
                      cx={ptResv.x}
                      cy={ptResv.y}
                      r={isSelected ? 6 : 4}
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={ptRecv.x}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      className={`text-[10px] font-mono ${
                        isSelected ? 'fill-blue-600 font-bold' : 'fill-slate-500'
                      }`}
                    >
                      {item.label.split(' ')[0]} {item.label.split(' ')[1] || ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Operational Context Callout Box */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3 text-xs text-slate-700">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900">Operational Context (Post-Monsoon Road Restoration Drive):</strong>{' '}
            Inflow peaked during Week 41 (312 cases) due to arterial pothole reporting across Vijay Nagar and Ring Road. Deploying 2 reserve hot-mix bitumen squads raised weekly resolution velocity from 91% to <strong>97% in Week 42</strong>.
          </div>
        </div>
      </div>

      {/* Ward-Wise & Category SLA Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Zone 04 Ward-Wise SLA & Resolution Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Audited performance across Wards 18–24 under {officerProfile.name}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
            Zone Avg: 94.2% SLA
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-extrabold tracking-wider">
                <th className="py-3 px-4">Ward & Sector</th>
                <th className="py-3 px-4">Primary Lead Engineer</th>
                <th className="py-3 px-4 text-right">Received</th>
                <th className="py-3 px-4 text-right">Resolved</th>
                <th className="py-3 px-4 text-right">Avg Turnaround</th>
                <th className="py-3 px-4 text-right">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { ward: 'Ward 18 · Vijay Nagar & Scheme 54', eng: 'Er. R. K. Verma', recv: 342, resv: 318, time: '22.4 hrs', sla: '96.4%' },
                { ward: 'Ward 19 · Old & New Palasia', eng: 'Er. Vivek Tiwari', recv: 289, resv: 264, time: '26.1 hrs', sla: '94.8%' },
                { ward: 'Ward 20 · LIG & Press Complex', eng: 'Er. Prakash Dubey', recv: 214, resv: 198, time: '29.0 hrs', sla: '93.5%' },
                { ward: 'Ward 21 · Meghdoot & MR-9', eng: 'Dr. Anand Mehta', recv: 198, resv: 184, time: '24.8 hrs', sla: '95.1%' },
                { ward: 'Ward 22 · Bhawarkua & Holkar', eng: 'Er. Sunita Chouhan', recv: 205, resv: 180, time: '31.2 hrs', sla: '91.2%' }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{row.ward}</td>
                  <td className="py-3.5 px-4 text-slate-600">{row.eng}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">{row.recv}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600">{row.resv}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">{row.time}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold">
                      {row.sla}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
