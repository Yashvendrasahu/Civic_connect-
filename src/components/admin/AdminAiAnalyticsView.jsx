import React, { useState } from 'react';
import {
  Cpu,
  Download,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  TrendingUp,
  Eye,
  X
} from 'lucide-react';
import { ADMIN_AI_REVIEW_QUEUE } from './adminReferenceData.js';

export default function AdminAiAnalyticsView({
  complaints = [],
  onSelectComplaintId,
  onExportCsv,
  onShowToast
}) {
  const [trendMode, setTrendMode] = useState('Daily');
  const [reviewQueue, setReviewQueue] = useState(ADMIN_AI_REVIEW_QUEUE);
  const [reviewModalItem, setReviewModalItem] = useState(null);
  const [overrideCategory, setOverrideCategory] = useState('Drainage');
  const [overridePriority, setOverridePriority] = useState('High');

  const handleConfirmReviewOverride = () => {
    if (!reviewModalItem) return;
    setReviewQueue((prev) =>
      prev.map((r) =>
        r.id === reviewModalItem.id
          ? {
              ...r,
              predictedCategory: overrideCategory,
              suggestedPriority: overridePriority,
              confidence: 99,
              status: 'Verified by Admin'
            }
          : r
      )
    );
    if (onShowToast) {
      onShowToast(
        `AI Classification verified & calibrated for ${reviewModalItem.id} (${overrideCategory} · ${overridePriority})`
      );
    }
    setReviewModalItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching Image 17 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
              NEURAL TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-powered complaint classification, priority prediction, and civic trend insights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Last 30 Days</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onExportCsv('CIRRS_AI_Telemetry_Insights.csv', reviewQueue);
              if (onShowToast) onShowToast('Exported AI Telemetry & Review Queue (CSV)');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Insights</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onShowToast) onShowToast('Recalibrated Neural Classifier v3.8 weights');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalibrate</span>
          </button>
        </div>
      </div>

      {/* ISO/IEC 42001 Governance Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5 text-indigo-950">
          <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>AI-Assisted Decision Support:</strong> Predictions are generated via multi-modal NLP &amp; image analysis. Low-confidence items (&lt;70%) are automatically routed for human nodal review.
          </span>
        </div>
        <span className="text-[11px] font-bold text-indigo-700 whitespace-nowrap">
          ISO/IEC 42001 Compliant
        </span>
      </div>

      {/* 4 KPI Cards matching Image 17 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Complaints Analyzed</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              100% Coverage
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">12,845</div>
          <p className="text-[11px] text-slate-500">+1,420 processed this week</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">High-Priority Issues</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
              +6.4% Spike
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">1,942</div>
          <p className="text-[11px] text-slate-500">Auto-escalated to municipal leads</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Average Confidence</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
              +1.8% Accuracy
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">91.4%</div>
          <p className="text-[11px] text-slate-500">Across 6 primary civic categories</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Pending AI Review</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
              Confidence &lt; 70%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {reviewQueue.filter((r) => r.status !== 'Verified by Admin').length + 144}
          </div>
          <p className="text-[11px] text-slate-500">Awaiting manual classification check</p>
        </div>
      </div>

      {/* Middle Row: Category Distribution + Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Category Distribution (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Complaint Category Distribution
              </h2>
              <p className="text-xs text-slate-500">
                AI-classified volume share across municipal sectors
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">NLP + Vision</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="4.5" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#2563EB" strokeWidth="4.5" strokeDasharray="34 66" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="4.5" strokeDasharray="24 76" strokeDashoffset="-34" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#0EA5E9" strokeWidth="4.5" strokeDasharray="18 82" strokeDashoffset="-58" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="4.5" strokeDasharray="12 88" strokeDashoffset="-76" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#8B5CF6" strokeWidth="4.5" strokeDasharray="8 92" strokeDashoffset="-88" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-extrabold text-slate-900 tabular-nums">12.8k</span>
                <span className="text-[10px] text-slate-400">Total Classified</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-2.5 text-xs">
              {[
                { label: 'Road Damage', count: '4,367', pct: '34%', color: 'bg-blue-600' },
                { label: 'Garbage & Sanitation', count: '3,083', pct: '24%', color: 'bg-emerald-500' },
                { label: 'Water Supply', count: '2,312', pct: '18%', color: 'bg-sky-500' },
                { label: 'Streetlights', count: '1,541', pct: '12%', color: 'bg-amber-500' },
                { label: 'Drainage & Sewage', count: '1,028', pct: '8%', color: 'bg-purple-500' },
                { label: 'Other / Unclassified', count: '514', pct: '4%', color: 'bg-slate-400' }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="font-medium text-slate-700">{item.label}</span>
                  </div>
                  <div className="tabular-nums text-slate-500">
                    {item.count} <strong className="text-slate-900 ml-1">{item.pct}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI-Assisted Priority Distribution (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                AI-Assisted Priority Distribution
              </h2>
              <p className="text-xs text-slate-500">
                Automated urgency scoring based on severity, location, and impact radius
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
              SLA Linked
            </span>
          </div>

          {/* Stacked Bar */}
          <div className="w-full h-6 rounded-xl overflow-hidden flex text-[10px] font-bold text-white">
            <div className="bg-rose-600 flex items-center justify-center" style={{ width: '15%' }}>
              15% High
            </div>
            <div className="bg-amber-500 flex items-center justify-center" style={{ width: '48%' }}>
              48% Medium
            </div>
            <div className="bg-emerald-500 flex items-center justify-center" style={{ width: '37%' }}>
              37% Low
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">High Priority (Urgent SLA: 24h)</div>
                <div className="text-[11px] text-slate-500">
                  Main road hazards, major water pipe bursts, hospital/school proximity
                </div>
              </div>
              <div className="text-right tabular-nums">
                <div className="font-extrabold text-rose-600 text-sm">1,942</div>
                <div className="text-[10px] text-slate-400">15.1% of total</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Medium Priority (Standard SLA: 72h)</div>
                <div className="text-[11px] text-slate-500">
                  Missed garbage collection, secondary road potholes, blocked drains
                </div>
              </div>
              <div className="text-right tabular-nums">
                <div className="font-extrabold text-amber-600 text-sm">6,165</div>
                <div className="text-[10px] text-slate-400">48.0% of total</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Low Priority (Routine SLA: 7 Days)</div>
                <div className="text-[11px] text-slate-500">
                  Single streetlight outage, minor signage wear, non-blocking debris
                </div>
              </div>
              <div className="text-right tabular-nums">
                <div className="font-extrabold text-emerald-600 text-sm">4,738</div>
                <div className="text-[10px] text-slate-400">36.9% of total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotspots + Model Telemetry Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Potential Civic Hotspots (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Potential Civic Hotspots</h2>
              <p className="text-xs text-slate-500">
                Municipalities with elevated complaint clustering or rising risk scores
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold">
              5 Zones Flagged
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                rank: 1,
                city: 'Bhopal Municipal Corp',
                sub: 'Primary: Road Damage & Drainage (Ward 12, 19)',
                count: '1,420 Complaints',
                delta: '+24% Spike',
                badgeColor: 'bg-rose-50 text-rose-700'
              },
              {
                rank: 2,
                city: 'Nagpur Municipal Corp',
                sub: 'Primary: Water Supply Leakage (Sitabuldi Zone)',
                count: '1,180 Complaints',
                delta: '+19% Spike',
                badgeColor: 'bg-rose-50 text-rose-700'
              },
              {
                rank: 3,
                city: 'Indore Municipal Corp',
                sub: 'Primary: Garbage Collection (Vijay Nagar Sector)',
                count: '980 Complaints',
                delta: '+14% Rise',
                badgeColor: 'bg-amber-50 text-amber-700'
              },
              {
                rank: 4,
                city: 'Jabalpur Municipal Corp',
                sub: 'Primary: Streetlights & Potholes (Civil Lines)',
                count: '845 Complaints',
                delta: '+11% Rise',
                badgeColor: 'bg-amber-50 text-amber-700'
              },
              {
                rank: 5,
                city: 'Seoni Municipal Council',
                sub: 'Primary: Road Damage (Bus Stand Arterial)',
                count: '512 Complaints',
                delta: '+8% Normal',
                badgeColor: 'bg-blue-50 text-blue-700'
              }
            ].map((h) => (
              <div
                key={h.rank}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-extrabold text-[11px] flex items-center justify-center">
                    {h.rank}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{h.city}</div>
                    <div className="text-[11px] text-slate-500">{h.sub}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 tabular-nums">{h.count}</div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${h.badgeColor}`}>
                    {h.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Classification Performance & Model Telemetry (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Classification Performance &amp; Model Telemetry
              </h2>
              <p className="text-xs text-slate-500">
                Reliability metrics and human-in-the-loop calibration summary
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-500">v3.8</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="text-slate-500 font-medium">High-Confidence Predictions</div>
              <div className="text-2xl font-extrabold text-emerald-600 tabular-nums">84.2%</div>
              <div className="text-[11px] text-slate-400">
                10,815 complaints scored ≥ 85% confidence
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="text-slate-500 font-medium">Low-Confidence Flagged</div>
              <div className="text-2xl font-extrabold text-amber-600 tabular-nums">4.1%</div>
              <div className="text-[11px] text-slate-400">
                526 complaints routed for manual check
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="text-slate-500 font-medium">Auto-Categorized vs Manual</div>
              <div className="text-2xl font-extrabold text-blue-600 tabular-nums">92% : 8%</div>
              <div className="text-[11px] text-slate-400">
                92% automated routing · 8% officer override
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="text-slate-500 font-medium">Duplicate Cluster Detection</div>
              <div className="text-2xl font-extrabold text-indigo-600 tabular-nums">1,128</div>
              <div className="text-[11px] text-slate-400">
                Redundant reports merged via spatial radius
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800">Avg. Inference &amp; Routing Latency</div>
              <div className="text-[11px] text-slate-500">
                Real-time text + image classification pipeline
              </div>
            </div>
            <span className="font-mono font-extrabold text-emerald-600 text-sm">340 ms</span>
          </div>
        </div>
      </div>

      {/* Complaints Requiring AI Review Table matching Image 17 */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                Complaints Requiring AI Review
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                Low Confidence Queue
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Complaints where AI classification confidence fell below the 70% threshold or conflicting visual/text cues were detected.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3.5 px-4">Complaint ID</th>
                <th className="py-3.5 px-3">Issue Title</th>
                <th className="py-3.5 px-3">Municipality</th>
                <th className="py-3.5 px-3">Predicted Category</th>
                <th className="py-3.5 px-3">Suggested Priority</th>
                <th className="py-3.5 px-3">Confidence Score</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {reviewQueue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="py-4 px-4 font-bold text-blue-600 tabular-nums">{item.id}</td>
                  <td className="py-4 px-3 font-semibold text-slate-900">{item.title}</td>
                  <td className="py-4 px-3 text-slate-700">{item.municipality}</td>
                  <td className="py-4 px-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                      {item.predictedCategory}
                    </span>
                  </td>
                  <td className="py-4 px-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                      {item.suggestedPriority}
                    </span>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.confidence >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${item.confidence}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-amber-700 tabular-nums">
                        {item.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        item.status === 'Verified by Admin'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectComplaintId && onSelectComplaintId('CMP-10245')}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                      >
                        View Complaint
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReviewModalItem(item);
                          setOverrideCategory(item.predictedCategory);
                          setOverridePriority(item.suggestedPriority);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                      >
                        Review Classification
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Classification Modal */}
      {reviewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Calibrate AI Classification ({reviewModalItem.id})
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalItem(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">{reviewModalItem.title}</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Verified Category</label>
                <select
                  value={overrideCategory}
                  onChange={(e) => setOverrideCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white"
                >
                  <option>Drainage</option>
                  <option>Road Damage</option>
                  <option>Garbage</option>
                  <option>Water Supply</option>
                  <option>Streetlights</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Verified Priority</label>
                <select
                  value={overridePriority}
                  onChange={(e) => setOverridePriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white"
                >
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewModalItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReviewOverride}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirm &amp; Train Model
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
