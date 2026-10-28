import React, { useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Download,
  Search,
  ArrowRight,
  MoreHorizontal,
  BarChart3,
  Cpu,
  Building2,
  Gauge,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

export default function AdminOverviewView({
  complaints = [],
  municipalities = [],
  onSelectComplaint,
  onNavigateTab,
  onExportCsv,
  onShowToast
}) {
  const [dateRange, setDateRange] = useState('Last 30 Days (Oct 1 - Oct 28, 2026)');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [currentPage, setCurrentPage] = useState(1);

  // Merge live complaints count with platform baseline
  const liveCount = complaints.length;
  const totalComplaints = 12845 + Math.max(0, liveCount - 7);
  const pendingCount = 1284 + complaints.filter((c) => c.status === 'Pending' || c.status === 'Submitted').length;
  const resolvedCount = 10236 + complaints.filter((c) => c.status === 'Resolved').length;
  const resolutionRate = ((resolvedCount / Math.max(1, totalComplaints)) * 100).toFixed(1);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchId = String(c.id || '').toLowerCase().includes(q);
        const matchTitle = String(c.title || '').toLowerCase().includes(q);
        const matchMun = String(c.municipality || c.location || '').toLowerCase().includes(q);
        if (!matchId && !matchTitle && !matchMun) return false;
      }
      if (categoryFilter !== 'All Categories') {
        if (!String(c.category || '').toLowerCase().includes(categoryFilter.toLowerCase())) return false;
      }
      if (statusFilter !== 'All Statuses') {
        if (String(c.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
      }
      if (priorityFilter !== 'All Priorities') {
        if (String(c.priority || '').toLowerCase() !== priorityFilter.toLowerCase()) return false;
      }
      return true;
    });
  }, [complaints, searchQuery, categoryFilter, statusFilter, priorityFilter]);

  const displayedComplaints = filteredComplaints.slice(0, 5);

  const getCategoryPillStyle = (cat = '') => {
    const lower = cat.toLowerCase();
    if (lower.includes('road')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (lower.includes('garbage') || lower.includes('sanitation')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (lower.includes('water')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (lower.includes('street') || lower.includes('light')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (lower.includes('drain')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getPriorityPillStyle = (prio = '') => {
    const lower = prio.toLowerCase();
    if (lower === 'critical') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (lower === 'high') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (lower === 'medium') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusPillStyle = (status = '') => {
    const lower = status.toLowerCase();
    if (lower === 'resolved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (lower === 'in progress' || lower === 'assigned') return 'bg-sky-50 text-sky-700 border-sky-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const getStatusDotStyle = (status = '') => {
    const lower = status.toLowerCase();
    if (lower === 'resolved') return 'bg-emerald-500';
    if (lower === 'in progress' || lower === 'assigned') return 'bg-sky-500';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-6">
      {/* Top Page Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor civic operations and platform performance from one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5 pointer-events-none" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-600 cursor-pointer"
            >
              <option value="Last 30 Days (Oct 1 - Oct 28, 2026)">Last 30 Days (Oct 1 - Oct 28, 2026)</option>
              <option value="Last 7 Days (Oct 22 - Oct 28, 2026)">Last 7 Days (Oct 22 - Oct 28, 2026)</option>
              <option value="Q3 2026 (Jul - Sep 2026)">Q3 2026 (Jul - Sep 2026)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              onExportCsv('CIRRS_Executive_Overview_Report.csv', filteredComplaints);
              if (onShowToast) onShowToast('Generated & downloaded CIRRS Executive Overview Report (CSV)');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Complaints</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {totalComplaints.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold tabular-nums">
              ↑ +12.5%
            </span>
            <span className="text-slate-500">vs last month</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Pending Complaints</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {pendingCount.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold tabular-nums">
              ↓ -8.2%
            </span>
            <span className="text-slate-500">favorable drop</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Resolved Complaints</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {resolvedCount.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold tabular-nums">
              ↑ +15.8%
            </span>
            <span className="text-slate-500">vs last month</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Resolution Rate</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{resolutionRate}%</div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold tabular-nums">
              ↑ +5.4%
            </span>
            <span className="text-slate-500">efficiency delta</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Complaint Trends + Issues by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Complaint Trends Area Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Complaint Trends</h2>
              <p className="text-xs text-slate-500">Reported vs. resolved complaints (Last 7 Days)</p>
            </div>
            <div className="flex items-center gap-5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-slate-600 font-medium">
                  Reported <strong className="text-slate-900 tabular-nums">(1,840)</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 font-medium">
                  Resolved <strong className="text-slate-900 tabular-nums">(1,620)</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Area Line Chart */}
          <div className="relative pt-6 pb-2">
            {/* Tooltip Callout matching screenshot */}
            <div className="absolute right-16 top-0 z-10 bg-slate-900 text-white px-3.5 py-2 rounded-xl shadow-lg text-[11px]">
              <div className="text-slate-400 font-medium">Oct 27, 2026</div>
              <div className="font-bold mt-0.5 tabular-nums">310 Reported · 285 Resolved</div>
            </div>

            <svg viewBox="0 0 600 190" className="w-full h-44 overflow-visible">
              <defs>
                <linearGradient id="adminReportedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="adminResolvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              {[30, 75, 120, 165].map((y, idx) => (
                <g key={y}>
                  <line x1="35" y1={y} x2="580" y2={y} stroke="#F1F5F9" strokeWidth="1" />
                  <text x="5" y={y + 4} className="text-[10px] fill-slate-400 font-mono">
                    {400 - idx * 100}
                  </text>
                </g>
              ))}

              {/* Area Fills */}
              <path
                d="M45,145 C120,130 180,105 260,95 C340,85 420,65 490,48 C530,42 555,58 575,65 L575,165 L45,165 Z"
                fill="url(#adminReportedGrad)"
              />
              <path
                d="M45,155 C120,142 180,120 260,110 C340,100 420,82 490,58 C530,54 555,70 575,78 L575,165 L45,165 Z"
                fill="url(#adminResolvedGrad)"
              />

              {/* Reported Line */}
              <path
                d="M45,145 C120,130 180,105 260,95 C340,85 420,65 490,48 C530,42 555,58 575,65"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Resolved Line */}
              <path
                d="M45,155 C120,142 180,120 260,110 C340,100 420,82 490,58 C530,54 555,70 575,78"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Vertical Focus Line on Oct 27 */}
              <line
                x1="490"
                y1="48"
                x2="490"
                y2="165"
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle cx="490" cy="48" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="490" cy="58" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            <div className="grid grid-cols-7 text-center text-[11px] text-slate-400 pt-2 pl-6">
              <span>Oct 22</span>
              <span>Oct 23</span>
              <span>Oct 24</span>
              <span>Oct 25</span>
              <span>Oct 26</span>
              <span className="font-bold text-blue-600">Oct 27</span>
              <span>Oct 28</span>
            </div>
          </div>
        </div>

        {/* Issues by Category Donut Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Issues by Category</h2>
            <p className="text-xs text-slate-500">Distribution across active municipal reports</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 my-auto py-4">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="4.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="4.5"
                  strokeDasharray="30 70"
                  strokeDashoffset="0"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="4.5"
                  strokeDasharray="23 77"
                  strokeDashoffset="-30"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="4.5"
                  strokeDasharray="16 84"
                  strokeDashoffset="-53"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="4.5"
                  strokeDasharray="12 88"
                  strokeDashoffset="-69"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="4.5"
                  strokeDasharray="10 90"
                  strokeDashoffset="-81"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="4.5"
                  strokeDasharray="9 91"
                  strokeDashoffset="-91"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-extrabold text-slate-900 tabular-nums">12.8k</span>
                <span className="text-[10px] text-slate-400">Total</span>
              </div>
            </div>

            {/* Category Legend */}
            <div className="flex-1 w-full space-y-2.5 text-xs">
              {[
                { label: 'Road Damage', pct: '34%', count: '4,367', color: 'bg-blue-600' },
                { label: 'Garbage & Waste', pct: '26%', count: '3,340', color: 'bg-emerald-500' },
                { label: 'Water Supply', pct: '18%', count: '2,312', color: 'bg-amber-500' },
                { label: 'Streetlights', pct: '12%', count: '1,541', color: 'bg-purple-500' },
                { label: 'Drainage', pct: '7%', count: '899', color: 'bg-indigo-500' },
                { label: 'Other', pct: '3%', count: '386', color: 'bg-slate-400' }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                    <span className="text-slate-700 font-medium">{item.label}</span>
                  </div>
                  <div className="tabular-nums text-slate-500">
                    <strong className="text-slate-900">{item.pct}</strong> ({item.count})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Recent Complaints</h2>
            <p className="text-xs text-slate-500">Latest civic issues reported across municipalities</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('complaints')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            <span>View All Complaints</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, keyword..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white cursor-pointer"
            >
              <option>All Categories</option>
              <option>Road Damage</option>
              <option>Garbage</option>
              <option>Water Supply</option>
              <option>Streetlights</option>
              <option>Drainage</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white cursor-pointer"
            >
              <option>All Statuses</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white cursor-pointer"
            >
              <option>All Priorities</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Complaint ID</th>
                <th className="py-3 px-3">Issue Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Municipality</th>
                <th className="py-3 px-3">Reported Date</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {displayedComplaints.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectComplaint(c)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-3 font-bold text-blue-600 tabular-nums whitespace-nowrap">
                    {c.id.startsWith('CMP-') || c.id.startsWith('CC') ? c.id : `CMP-${c.id}`}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-900">{c.title}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getCategoryPillStyle(
                        c.category
                      )}`}
                    >
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">
                    {c.municipality || c.location?.split(',')[0] || 'Indore'}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 tabular-nums">
                    {c.reportedDate || c.reported || '28 Oct 2026'}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getPriorityPillStyle(
                        c.priority
                      )}`}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusPillStyle(
                        c.status
                      )}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotStyle(c.status)}`}></span>
                      <span>{c.status}</span>
                    </span>
                  </td>
                  <td
                    className="py-3.5 px-3 text-right"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectComplaint(c);
                    }}
                  >
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">1 to {displayedComplaints.length}</strong> of{' '}
            <strong className="text-slate-800 tabular-nums">{totalComplaints.toLocaleString()}</strong> complaints
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Previous
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg font-bold cursor-pointer ${
                  currentPage === p
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
            <span className="px-1 text-slate-400">...</span>
            <button
              type="button"
              onClick={() => onNavigateTab('complaints')}
              className="px-2.5 h-8 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 tabular-nums cursor-pointer"
            >
              2,569
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Municipality Performance + Quick Insights & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Municipality Performance (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Municipality Performance</h2>
              <p className="text-xs text-slate-500">Top municipalities by complaint resolution efficiency</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4">
            {[
              {
                rank: '1. Indore Municipal Corp',
                stats: '4,820 Total · 4,210 Resolved',
                pct: 87.3,
                barColor: 'bg-emerald-500',
                textColor: 'text-emerald-600'
              },
              {
                rank: '2. Bhopal Municipal Corp',
                stats: '3,240 Total · 2,680 Resolved',
                pct: 82.7,
                barColor: 'bg-blue-600',
                textColor: 'text-blue-600'
              },
              {
                rank: '3. Jabalpur Municipal Corp',
                stats: '2,110 Total · 1,590 Resolved',
                pct: 75.3,
                barColor: 'bg-blue-600',
                textColor: 'text-blue-600'
              },
              {
                rank: '4. Nagpur Municipal Corp',
                stats: '1,650 Total · 1,180 Resolved',
                pct: 71.5,
                barColor: 'bg-amber-500',
                textColor: 'text-amber-600'
              },
              {
                rank: '5. Seoni Municipal Council',
                stats: '1,025 Total · 576 Resolved',
                pct: 56.2,
                barColor: 'bg-rose-500',
                textColor: 'text-rose-600'
              }
            ].map((m) => (
              <div key={m.rank} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{m.rank}</span>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="text-slate-400 text-[11px]">{m.stats}</span>
                    <span className={`font-extrabold ${m.textColor}`}>{m.pct}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${m.barColor}`} style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights & Telemetry (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Quick Insights &amp; Telemetry</h2>
              <p className="text-xs text-slate-500">AI-driven operational summaries</p>
            </div>
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Most Reported Category</div>
                <div className="text-xs font-extrabold text-slate-900">
                  Road Damage (34% of all reports)
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Highest Volume Municipality</div>
                <div className="text-xs font-extrabold text-slate-900">
                  Indore (4,820 active &amp; historical cases)
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Avg. Resolution Turnaround</div>
                <div className="text-xs font-extrabold text-slate-900">
                  28.4 hours (across all zones)
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Active Platform Load</div>
                <div className="text-xs font-extrabold text-slate-900">
                  {pendingCount.toLocaleString()} Open Cases (312 under SLA Escalation)
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>MeitY Data Governance Compliant · 256-bit Encrypted Admin Audit Ledger</span>
            </div>
            <span className="font-mono">v2.4.8-prod</span>
          </div>
        </div>
      </div>
    </div>
  );
}
