import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  UserPlus,
  Ban,
  Download,
  RefreshCw,
  Search,
  Calendar,
  MoreHorizontal,
  User,
  FileText,
  ArrowRight,
  Check,
  Clock,
  ShieldAlert
} from 'lucide-react';

export default function AdminCitizenView({
  citizens = [],
  onUpdateCitizenStatus,
  onSelectComplaintId,
  onExportCsv,
  onRefresh,
  onShowToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [municipalityFilter, setMunicipalityFilter] = useState('All Municipalities');
  const [verificationFilter, setVerificationFilter] = useState('Verification Status');
  const [accountStatusFilter, setAccountStatusFilter] = useState('Account Status');
  const [selectedIds, setSelectedIds] = useState(['CIT-20481']);
  const [focusedCitizen, setFocusedCitizen] = useState(citizens[0] || null);

  const filteredCitizens = useMemo(() => {
    return citizens.filter((c) => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchName = String(c.name || '').toLowerCase().includes(q);
        const matchEmail = String(c.email || '').toLowerCase().includes(q);
        const matchId = String(c.id || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchId) return false;
      }
      if (
        municipalityFilter !== 'All Municipalities' &&
        !String(c.municipality || '').toLowerCase().includes(municipalityFilter.toLowerCase())
      ) {
        return false;
      }
      if (
        verificationFilter !== 'Verification Status' &&
        c.verification !== verificationFilter
      ) {
        return false;
      }
      if (
        accountStatusFilter !== 'Account Status' &&
        c.accountStatus !== accountStatusFilter
      ) {
        return false;
      }
      return true;
    });
  }, [citizens, searchQuery, municipalityFilter, verificationFilter, accountStatusFilter]);

  const activeFocusedCitizen =
    citizens.find((c) => c.id === focusedCitizen?.id) || filteredCitizens[0] || citizens[0];

  const toggleSelectCitizen = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header matching Image 15 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Citizen Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View and manage registered citizen accounts and platform activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              onExportCsv('CIRRS_Citizens_Registry.csv', filteredCitizens);
              if (onShowToast) onShowToast('Exported Citizen Registry to CSV');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Citizens</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onRefresh) onRefresh();
              if (onShowToast) onShowToast('Synchronized Citizen Registry');
            }}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 KPI Cards matching Image 15 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Citizens</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {(84320 + Math.max(0, citizens.length - 7)).toLocaleString()}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
              +14.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Registered across 14 active municipalities</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Verified Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">79,105</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
              93.8% Rate
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Aadhaar / OTP &amp; email verified citizens</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">New This Month</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">3,412</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
              +8.4% vs Sep
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Onboarded during October 2026</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Suspended Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">148</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold">
              0.17% Total
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Flagged for spam or policy violation</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by citizen name, email, or Citizen ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600"
          />
        </div>

        <select
          value={municipalityFilter}
          onChange={(e) => setMunicipalityFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white cursor-pointer"
        >
          <option>All Municipalities</option>
          <option>Seoni</option>
          <option>Jabalpur</option>
          <option>Nagpur</option>
          <option>Indore</option>
          <option>Bhopal</option>
        </select>

        <select
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white cursor-pointer"
        >
          <option>Verification Status</option>
          <option>Verified</option>
          <option>Pending</option>
        </select>

        <select
          value={accountStatusFilter}
          onChange={(e) => setAccountStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white cursor-pointer"
        >
          <option>Account Status</option>
          <option>Active</option>
          <option>Suspended</option>
        </select>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Registration Date</span>
        </div>
      </div>

      {/* Main Citizens Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/60 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] mr-1.5 tabular-nums">
                {selectedIds.length}
              </span>
              citizen selected
            </span>
            <button
              type="button"
              onClick={() => {
                const rows = filteredCitizens.filter((c) => selectedIds.includes(c.id));
                onExportCsv('Selected_Citizens.csv', rows);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected</span>
            </button>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-[11px] font-bold uppercase text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Clear Selection
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-500">
            Showing <strong className="text-slate-800">1–{filteredCitizens.length}</strong> of{' '}
            <strong className="text-slate-800">84,320</strong> citizens
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="py-3.5 px-3">Citizen</th>
                <th className="py-3.5 px-3">Email</th>
                <th className="py-3.5 px-3">Municipality</th>
                <th className="py-3.5 px-3">Reg. Date</th>
                <th className="py-3.5 px-3 text-center">Complaints</th>
                <th className="py-3.5 px-3">Verification</th>
                <th className="py-3.5 px-3">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCitizens.map((c) => {
                const isSelected = activeFocusedCitizen?.id === c.id;
                const isVerified = c.verification === 'Verified';
                const isSuspended = c.accountStatus === 'Suspended';
                return (
                  <tr
                    key={c.id}
                    onClick={() => setFocusedCitizen(c)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td
                      className="py-3.5 px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectCitizen(c.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-blue-600"
                      />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {c.initials || 'CI'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">{c.email}</td>
                    <td className="py-3.5 px-3 font-medium text-slate-800">{c.municipality}</td>
                    <td className="py-3.5 px-3 text-slate-500 tabular-nums">{c.registrationDate}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold tabular-nums">
                        {c.complaintsCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                          <Check className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isSuspended
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSuspended ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span>{c.accountStatus}</span>
                      </span>
                    </td>
                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedCitizen(c);
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Split Panel: Citizen Detail Overview matching Image 15 */}
      {activeFocusedCitizen && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-600">
              <User className="w-4 h-4 text-blue-600" />
              <span>Citizen Detail Overview</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Selected from table · Click any row to inspect
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Identity Profile (4 cols) */}
            <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center">
                  {activeFocusedCitizen.initials || 'RV'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {activeFocusedCitizen.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      {activeFocusedCitizen.accountStatus}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {activeFocusedCitizen.id} · {activeFocusedCitizen.verification} Citizen
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Email Address</div>
                  <div className="font-semibold text-slate-800 truncate">
                    {activeFocusedCitizen.email}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Municipality</div>
                  <div className="font-semibold text-slate-800">
                    {activeFocusedCitizen.municipality}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Registration Date</div>
                  <div className="font-semibold text-slate-800">
                    {activeFocusedCitizen.registrationDate}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Civic Trust Score</div>
                  <div className="font-bold text-emerald-600">
                    {activeFocusedCitizen.trustScore || '94% Reliable'}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Issue Engagement History (4 cols) */}
            <div className="lg:col-span-4 space-y-3 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase text-[10px] text-slate-400">
                  Issue Engagement History
                </span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {activeFocusedCitizen.complaintsCount} Total Submissions
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{
                    width: `${
                      (activeFocusedCitizen.resolvedCount /
                        Math.max(1, activeFocusedCitizen.complaintsCount)) *
                      100
                    }%`
                  }}
                />
                <div className="bg-amber-400 h-full flex-1" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Resolved Issues
                  </span>
                  <strong className="text-slate-900 tabular-nums">
                    {activeFocusedCitizen.resolvedCount}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Pending Review
                  </span>
                  <strong className="text-slate-900 tabular-nums">
                    {activeFocusedCitizen.pendingCount}
                  </strong>
                </div>
              </div>
            </div>

            {/* Right Recent Active Complaint & Account Actions (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                Recent Active Complaint
              </div>

              {activeFocusedCitizen.recentComplaint && (
                <div
                  onClick={() =>
                    onSelectComplaintId &&
                    onSelectComplaintId(activeFocusedCitizen.recentComplaint.id)
                  }
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-400 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-blue-600">
                        {activeFocusedCitizen.recentComplaint.id}
                      </span>
                      <span className="font-bold text-slate-900">
                        {activeFocusedCitizen.recentComplaint.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {activeFocusedCitizen.recentComplaint.category} ·{' '}
                      {activeFocusedCitizen.recentComplaint.ward} ·{' '}
                      <span className="text-amber-600 font-semibold">
                        {activeFocusedCitizen.recentComplaint.status}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onExportCsv(
                      `Citizen_${activeFocusedCitizen.id}_Profile.csv`,
                      [activeFocusedCitizen]
                    );
                    if (onShowToast)
                      onShowToast(`Exported profile for ${activeFocusedCitizen.name}`);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  View Full Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (activeFocusedCitizen.recentComplaint && onSelectComplaintId) {
                      onSelectComplaintId(activeFocusedCitizen.recentComplaint.id);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Complaint History
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextStatus =
                      activeFocusedCitizen.accountStatus === 'Suspended'
                        ? 'Active'
                        : 'Suspended';
                    if (onUpdateCitizenStatus) {
                      onUpdateCitizenStatus(activeFocusedCitizen.id, {
                        accountStatus: nextStatus
                      });
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    activeFocusedCitizen.accountStatus === 'Suspended'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  {activeFocusedCitizen.accountStatus === 'Suspended'
                    ? 'Reactivate Account'
                    : 'Suspend Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
