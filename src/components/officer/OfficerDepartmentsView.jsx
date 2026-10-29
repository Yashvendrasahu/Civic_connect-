import React, { useState } from 'react';
import { MUNICIPAL_DIVISIONS } from '../../services/officerPortalData.js';
import { civicDataService } from '../../services/supabaseClient.js';
import {
  Building2,
  Users,
  Truck,
  AlertTriangle,
  Search,
  Download,
  Calendar,
  BarChart3,
  ArrowRight,
  Phone,
  CheckCircle2,
  X,
  ShieldCheck,
  Clock
} from 'lucide-react';

export default function OfficerDepartmentsView({ officerProfile, complaints = [], onShowToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Divisions');
  const [capacityFilter, setCapacityFilter] = useState('All Capacities');
  const [shiftFilter, setShiftFilter] = useState('All Shifts / States');
  const [activeModal, setActiveModal] = useState(null); // null | 'matrix' | 'shifts' | divisionObject

  const dynamicDivisions = MUNICIPAL_DIVISIONS.map((d) => {
    const keyword = d.name.split(' ')[0].toLowerCase();
    const matching = complaints.filter((c) =>
      `${c.department || ''} ${c.category || ''}`.toLowerCase().includes(keyword)
    );
    const resolvedCount = matching.filter((c) => c.status === 'Resolved').length;
    const inProgCount = matching.filter(
      (c) => c.status === 'In Progress' || c.status === 'Assigned'
    ).length;
    const openCount = Math.max(0, matching.length - resolvedCount);
    const overdueCount = matching.filter(
      (c) => c.status !== 'Resolved' && (c.slaRemaining || '').toLowerCase().includes('overdue')
    ).length;
    const utilization = matching.length > 0 ? Math.min(100, openCount * 15) : 0;
    return {
      ...d,
      openCount,
      inProgCount,
      resolvedCount,
      overdueCount,
      squadsCount: inProgCount,
      utilization,
      utilizationLabel: `${utilization}% Bandwidth Load`
    };
  });

  const totalOpenComplaints = dynamicDivisions.reduce((sum, d) => sum + d.openCount, 0);
  const totalActiveSquads = dynamicDivisions.reduce((sum, d) => sum + d.squadsCount, 0);
  const totalOverdueCases = dynamicDivisions.reduce((sum, d) => sum + d.overdueCount, 0);

  const filteredDivisions = dynamicDivisions.filter((d) => {
    const matchesSearch =
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.leadName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      deptFilter === 'All Divisions' ||
      d.name.toLowerCase().includes(deptFilter.toLowerCase());
    const matchesCap =
      capacityFilter === 'All Capacities' ||
      (capacityFilter === 'High Load (>75%)' && d.utilization >= 75) ||
      (capacityFilter === 'Optimal (<75%)' && d.utilization < 75);
    return matchesSearch && matchesDept && matchesCap;
  });

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 mb-1">
            OPERATIONS & CAPACITY MONITORING
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Departments & Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Live municipal division bandwidth, field squad deployment rosters, and cross-departmental SLA workload.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              const rows = filteredDivisions.map((d) => ({
                DivisionCode: d.code,
                DepartmentName: d.name,
                ZoneCoverage: d.zoneCoverage,
                DivisionLead: d.isUserDept ? officerProfile.name : d.leadName,
                Role: d.leadRole,
                SquadsCount: d.squadsCount,
                BandwidthUtilization: `${d.utilization}%`,
                OpenCases: d.openCount,
                InProgress: d.inProgCount,
                Resolved: d.resolvedCount
              }));
              civicDataService.exportToCsv('imc-zone04-division-roster.csv', rows);
              onShowToast('IMC Zone 04 Squad & Engineer Roster exported as CSV.');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Roster</span>
          </button>
          <button
            onClick={() => setActiveModal('matrix')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Capacity Matrix</span>
          </button>
          <button
            onClick={() => setActiveModal('shifts')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Shift Schedule</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search departments, squads, engineers..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option>All Divisions</option>
            <option>Roads & Infrastructure</option>
            <option>Water Supply & Sewerage</option>
            <option>Sanitation & Waste</option>
            <option>Electrical & Street Lighting</option>
          </select>

          <select
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option>All Capacities</option>
            <option>High Load (&gt;75%)</option>
            <option>Optimal (&lt;75%)</option>
          </select>

          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option>All Shifts / States</option>
            <option>Morning Shift (06:00 - 14:00)</option>
            <option>General Shift (09:30 - 18:00)</option>
            <option>Night Emergency Response</option>
          </select>
        </div>
      </div>

      {/* 4 KPI Summary Cards (100% Dynamic from Supabase complaints) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              TOTAL DEPARTMENTS
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              Operational
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
            {dynamicDivisions.length} Divisions
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Integrated on Municipal Command Bus</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              ACTIVE FIELD SQUADS
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
              Live Telemetry
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
            {totalActiveSquads} Teams
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Deployed on active work orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              OPEN COMPLAINTS
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold">
              Live Queue
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
            {totalOpenComplaints} Active
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Synced from Supabase complaints</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              OVERDUE CASES
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">
              SLA Monitor
            </span>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 font-mono mt-2">
            {totalOverdueCases} SLA Alerts
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">
            {totalOverdueCases === 0 ? '0 overdue complaints' : 'Immediate attention required'}
          </p>
        </div>
      </div>

      {/* Municipal Operational Divisions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDivisions.map((div) => {
          const leadDisplayName = div.isUserDept ? officerProfile.name : div.leadName;
          return (
            <div
              key={div.id}
              className={`bg-white rounded-2xl border p-6 shadow-2xs flex flex-col justify-between space-y-5 transition-all ${
                div.isUserDept
                  ? 'border-blue-600 ring-2 ring-blue-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-4">
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-400">{div.code}</span>
                      {div.isUserDept && (
                        <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                          YOUR DEPARTMENT
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg mt-1">{div.name}</h3>
                    <p className="text-[11px] text-slate-500">{div.zoneCoverage}</p>
                  </div>

                  {!div.isUserDept && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        div.statusTone === 'emerald'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : div.statusTone === 'amber'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {div.statusBadge}
                    </span>
                  )}
                </div>

                {/* Bandwidth Utilization Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Squad Bandwidth</span>
                    <span className="font-mono font-bold text-slate-900">{div.utilizationLabel}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${div.barColor}`}
                      style={{ width: `${div.utilization}%` }}
                    />
                  </div>
                </div>

                {/* 5-Metric Counter Strip */}
                <div className="grid grid-cols-5 gap-1.5 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="font-mono font-extrabold text-sm text-slate-900">{div.squadsCount}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">Squads</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="font-mono font-extrabold text-sm text-slate-900">{div.openCount}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">Open</div>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
                    <div className="font-mono font-extrabold text-sm text-blue-700">{div.inProgCount}</div>
                    <div className="text-[10px] text-blue-600 font-semibold">In Prog</div>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <div className="font-mono font-extrabold text-sm text-emerald-700">{div.resolvedCount}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Resolved</div>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100">
                    <div className="font-mono font-extrabold text-sm text-rose-600">{div.overdueCount}</div>
                    <div className="text-[10px] text-rose-600 font-semibold">Overdue</div>
                  </div>
                </div>
              </div>

              {/* Division Lead & View Squads Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">DIVISION LEAD</span>
                  <div className="font-bold text-xs text-slate-900">{leadDisplayName}</div>
                  <div className="text-[11px] text-slate-500">{div.leadRole}</div>
                </div>

                <button
                  onClick={() => setActiveModal(div)}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>View Squads</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for View Squads / Capacity Matrix / Shift Schedule */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                  IMC OPERATIONS ROSTER
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {activeModal === 'matrix'
                    ? 'Zone 04 Cross-Departmental Capacity Matrix'
                    : activeModal === 'shifts'
                    ? 'Municipal Field Squad Shift Schedule (24x7)'
                    : `${activeModal.name} — Deployed Field Squads`}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeModal === 'matrix' ? (
              <div className="space-y-3 text-xs">
                {MUNICIPAL_DIVISIONS.map((d) => (
                  <div key={d.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{d.name} ({d.code})</div>
                      <div className="text-slate-500">Lead: {d.leadName} · {d.squadsCount} Squads</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">{d.utilization}% Load</span>
                      <div className="text-[11px] text-emerald-600 font-semibold">SLA Target: 96%+</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeModal === 'shifts' ? (
              <div className="space-y-3 text-xs">
                {[
                  { shift: 'Shift A (Morning Peak)', hours: '06:00 AM – 02:00 PM IST', squads: '16 Squads Active', lead: 'Er. Rajesh Verma (Duty SE)' },
                  { shift: 'Shift B (Afternoon & Evening)', hours: '02:00 PM – 10:00 PM IST', squads: '12 Squads Active', lead: 'Er. R. K. Verma (AE Zone 4)' },
                  { shift: 'Shift C (Night Emergency Rapid Unit)', hours: '10:00 PM – 06:00 AM IST', squads: '6 Rapid Units', lead: 'IMC Central Control Room' }
                ].map((s, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{s.shift}</div>
                      <div className="text-slate-500 font-mono mt-0.5">{s.hours}</div>
                      <div className="text-slate-600 mt-1">Commander: {s.lead}</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold">
                      {s.squads}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {activeModal.squads?.map((sq) => (
                  <div
                    key={sq.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600">{sq.id}</span>
                        <span className="font-bold text-slate-900 text-sm">{sq.name}</span>
                      </div>
                      <div className="text-slate-600 mt-1">
                        Foreman: <strong>{sq.foreman}</strong> ({sq.crew} Staff) · Vehicle: <span className="font-mono">{sq.vehicle}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                        {sq.status}
                      </span>
                      <button
                        onClick={() => {
                          onShowToast(`Radio dispatch ping sent to ${sq.name} (${sq.vehicle})`);
                          setActiveModal(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold cursor-pointer"
                      >
                        Ping Crew
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
