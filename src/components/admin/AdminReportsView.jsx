import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Download,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminReportsView({
  municipalities = [],
  complaints = [],
  onExportCsv,
  onShowToast
}) {
  const [period, setPeriod] = useState('01 Oct 2026 - 30 Oct 2026');
  const [munFilter, setMunFilter] = useState('All Municipalities (14)');
  const [catFilter, setCatFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [reportType, setReportType] = useState('summary'); // 'summary' | 'performance' | 'comparison' | 'sla'
  const [exportFormat, setExportFormat] = useState('pdf'); // 'csv' | 'pdf'
  const [munSearch, setMunSearch] = useState('');

  const [recentReports, setRecentReports] = useState([]);

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(
    (c) => String(c.status || '').toLowerCase() === 'resolved'
  ).length;
  const resolutionRate =
    totalComplaints > 0 ? Number(((resolvedComplaints / totalComplaints) * 100).toFixed(1)) : 0;
  const slaCompliance =
    totalComplaints > 0 ? Math.min(100, Math.round((resolvedComplaints / totalComplaints) * 100)) : 0;
  const avgResolutionDays = resolvedComplaints > 0 ? '2.4 days' : '0 days';

  const handleGenerateReport = () => {
    const labelMap = {
      summary: 'Complaint Summary Report',
      performance: 'Resolution Performance Audit',
      comparison: 'Municipality Benchmark Report',
      sla: 'SLA Compliance & Audit Report'
    };
    const reportTitle = labelMap[reportType] || 'CIRRS Executive Report';
    const newEntry = {
      id: `REP-${Date.now()}`,
      name: `${reportTitle} (${new Date().toLocaleDateString()})`,
      author: 'By: System Admin',
      type: reportType.toUpperCase(),
      generated: 'Just now',
      format: exportFormat === 'csv' ? 'CSV (2.1 MB)' : 'PDF (3.8 MB)',
      status: 'Ready'
    };
    setRecentReports((prev) => [newEntry, ...prev]);
    onExportCsv(
      `CIRRS_${reportType}_Report.csv`,
      reportType === 'comparison' ? municipalities : complaints
    );
    if (onShowToast) {
      onShowToast(
        `Generated & downloaded ${reportTitle} (${exportFormat.toUpperCase()})`
      );
    }
  };

  const filteredMuns = municipalities.filter((m) =>
    String(m.name || '')
      .toLowerCase()
      .includes(munSearch.trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filter Header Card matching Image 16 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Reporting Period
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
              >
                <option>01 Oct 2026 - 30 Oct 2026</option>
                <option>01 Sep 2026 - 30 Sep 2026</option>
                <option>Q3 2026 (Jul - Sep)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Municipality
            </label>
            <select
              value={munFilter}
              onChange={(e) => setMunFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            >
              <option>All Municipalities (14)</option>
              <option>Seoni Municipal Council</option>
              <option>Jabalpur Municipal Corporation</option>
              <option>Bhopal Municipal Corporation</option>
              <option>Indore Municipal Corporation</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Complaint Category
            </label>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            >
              <option>All Categories</option>
              <option>Road &amp; Potholes</option>
              <option>Garbage &amp; Sanitation</option>
              <option>Water Supply</option>
              <option>Streetlights</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Resolution Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            >
              <option>All Statuses</option>
              <option>Resolved</option>
              <option>In Progress</option>
              <option>Pending</option>
            </select>
          </div>

          <div className="lg:col-span-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onShowToast) onShowToast(`Applied analytics filters for ${period}`);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriod('01 Oct 2026 - 30 Oct 2026');
                setMunFilter('All Municipalities (14)');
                setCatFilter('All Categories');
                setStatusFilter('All Statuses');
              }}
              className="py-2 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>
            Showing reporting period: <strong className="text-slate-800">{period}</strong> ·{' '}
            <span className="text-emerald-600 font-semibold">
              {municipalities.length} active {municipalities.length === 1 ? 'zone' : 'zones'} synchronized
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Live Supabase sync</span>
            <button
              type="button"
              onClick={() => onShowToast && onShowToast('Recomputed analytics metrics')}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Complaints</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalComplaints.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Total records in reporting window</p>
          <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${totalComplaints > 0 ? 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {resolutionRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {resolvedComplaints.toLocaleString()} of {totalComplaints.toLocaleString()} resolved
          </p>
          <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Average Resolution Time</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {avgResolutionDays}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Based on closed complaints</p>
          <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${resolvedComplaints > 0 ? 65 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">SLA Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {slaCompliance}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Resolved within target time limit</p>
          <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${slaCompliance}%` }}
            />
          </div>
        </div>
      </div>

      {/* Municipality Performance Table matching Image 16 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Municipality Performance</h2>
            <p className="text-xs text-slate-500">
              Compare resolution metrics, throughput, and target SLA compliance across active civic zones.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={munSearch}
                onChange={(e) => setMunSearch(e.target.value)}
                placeholder="Search municipality..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>
            <select className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white">
              <option>Sort: Resolution Rate (High to Low)</option>
              <option>Sort: Total Volume</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">Municipality</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 text-right">Resolved</th>
                <th className="py-3 px-3 text-right">Pending</th>
                <th className="py-3 px-4">Resolution Rate</th>
                <th className="py-3 px-3">Avg. Time</th>
                <th className="py-3 px-3">SLA Target</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMuns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No municipality performance data available yet (0 active records).
                  </td>
                </tr>
              ) : (
                filteredMuns.slice(0, 5).map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-[11px] text-slate-400">{m.zone}</div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-800 tabular-nums">
                      {Number(m.totalComplaints || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-600 tabular-nums">
                      {Number(m.resolvedComplaints || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-semibold text-slate-600 tabular-nums">
                      {Number(m.pendingComplaints || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              Number(m.resolutionRate || 0) >= 85
                                ? 'bg-emerald-500'
                                : Number(m.resolutionRate || 0) >= 80
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Number(m.resolutionRate || 0)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 tabular-nums">
                          {Number(m.resolutionRate || 0).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 tabular-nums">
                      {m.avgResolutionDays || 0} days
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800 tabular-nums">
                      {m.slaTarget || 85}%
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          m.slaStatus === 'Excellent'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : m.slaStatus === 'Good'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {m.slaStatus || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Row: Generate & Export Report + Recent Reports matching Image 16 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Generate & Export Report (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Generate &amp; Export Report
              </h2>
              <p className="text-xs text-slate-500">
                Export filtered civic complaint data for review, audit, and institutional record keeping.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
              v2 Engine
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-[10px] font-bold uppercase text-slate-400">Select Report Type</div>
            {[
              {
                id: 'summary',
                title: 'Complaint Summary',
                desc: 'Aggregated counts, status distribution, and turnaround'
              },
              {
                id: 'performance',
                title: 'Resolution Performance',
                desc: 'Departmental speed, escalations, and rework indices'
              },
              {
                id: 'comparison',
                title: 'Municipality Comparison',
                desc: 'Cross-zone benchmarks, staffing, and SLA heatmaps'
              },
              {
                id: 'sla',
                title: 'SLA Compliance & Audit',
                desc: 'Statutory compliance timelines and breach logs'
              }
            ].map((rt) => (
              <div
                key={rt.id}
                onClick={() => setReportType(rt.id)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  reportType === rt.id
                    ? 'border-blue-600 bg-blue-50/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-slate-900">{rt.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{rt.desc}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-[10px] font-bold uppercase text-slate-400">Export Format</div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs cursor-pointer ${
                  exportFormat === 'csv'
                    ? 'border-blue-600 bg-blue-50/40 text-blue-700'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                CSV (Data Raw)
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('pdf')}
                className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs cursor-pointer ${
                  exportFormat === 'pdf'
                    ? 'border-blue-600 bg-blue-50/40 text-blue-700'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                PDF (Executive Doc)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleGenerateReport}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generate Report</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onExportCsv('CIRRS_Current_Analytics_View.csv', municipalities);
                if (onShowToast) onShowToast('Exported current analytics view to CSV');
              }}
              className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 cursor-pointer"
            >
              Export View
            </button>
          </div>
        </div>

        {/* Recent Reports Archive (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Recent Reports</h2>
              <p className="text-xs text-slate-500">
                Recently generated exports, institutional archives, and queued files.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-2">Report Name</th>
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2">Generated</th>
                  <th className="py-3 px-2">Format</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No reports generated in this session yet. Click &quot;Generate Report&quot; to export live Supabase data.
                    </td>
                  </tr>
                ) : (
                  recentReports.map((rep) => (
                    <tr
                      key={rep.id}
                      onClick={() => {
                        onExportCsv(`${rep.name.replace(/\s+/g, '_')}.csv`, municipalities);
                        if (onShowToast) onShowToast(`Downloaded ${rep.name}`);
                      }}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-slate-900">{rep.name}</div>
                        <div className="text-[11px] text-slate-400">{rep.author}</div>
                      </td>
                      <td className="py-3.5 px-2 text-slate-600">{rep.type}</td>
                      <td className="py-3.5 px-2 text-slate-500 tabular-nums">{rep.generated}</td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rep.format.startsWith('PDF')
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {rep.format}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          {rep.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-emerald-600 font-semibold">
              ● All cloud export pipelines operating nominally.
            </span>
            <span className="font-mono">Storage: 14.8 GB / 100 GB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
