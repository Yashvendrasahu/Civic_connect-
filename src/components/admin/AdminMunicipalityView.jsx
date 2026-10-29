import React, { useState, useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Plus,
  Search,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserX,
  Ban,
  Check,
  X,
  Mail,
  Phone
} from 'lucide-react';

export default function AdminMunicipalityView({
  municipalities = [],
  officers = [],
  onVerifyOfficer,
  onAddMunicipality,
  onUpdateMunicipalityStatus,
  onExportCsv,
  onRefresh,
  onShowToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('All States');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [verificationFilter, setVerificationFilter] = useState('All Verification States');
  const [activeSubView, setActiveSubView] = useState('all'); // 'all' | 'officer-queue'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMunName, setNewMunName] = useState('');
  const [newMunState, setNewMunState] = useState('Madhya Pradesh');
  const [newMunType, setNewMunType] = useState('Municipal Corporation');
  const [newMunNodal, setNewMunNodal] = useState('');
  const [newMunEmail, setNewMunEmail] = useState('');

  // Reject / Suspend Reason Modal for Municipal Officer
  const [rejectTargetOfficer, setRejectTargetOfficer] = useState(null);
  const [rejectActionType, setRejectActionType] = useState('Rejected'); // 'Rejected' | 'Suspended'
  const [rejectionReason, setRejectionReason] = useState('');

  // Compute pending officer approvals
  const pendingOfficers = useMemo(
    () =>
      officers.filter(
        (o) =>
          !o.adminVerified ||
          o.verificationStatus === 'Pending' ||
          o.verificationStatus === 'Rejected' ||
          o.verificationStatus === 'Suspended'
      ),
    [officers]
  );

  const pendingQueueCount = useMemo(
    () =>
      officers.filter((o) => !o.adminVerified && o.verificationStatus !== 'Verified').length +
      municipalities.filter((m) => m.verification === 'Pending').length,
    [officers, municipalities]
  );

  const activeMunCount = useMemo(
    () => municipalities.filter((m) => m.status === 'Active').length,
    [municipalities]
  );
  const inactiveMunCount = useMemo(
    () => municipalities.filter((m) => m.status !== 'Active').length,
    [municipalities]
  );
  const activeMunPct =
    municipalities.length > 0 ? Math.round((activeMunCount / municipalities.length) * 100) : 0;
  const distinctStatesCount = useMemo(
    () => new Set(municipalities.map((m) => m.state).filter(Boolean)).size,
    [municipalities]
  );

  const filteredMunicipalities = useMemo(() => {
    return municipalities.filter((m) => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchName = String(m.name || '').toLowerCase().includes(q);
        const matchId = String(m.id || '').toLowerCase().includes(q);
        const matchState = String(m.state || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchState) return false;
      }
      if (stateFilter !== 'All States' && m.state !== stateFilter) return false;
      if (statusFilter !== 'All Statuses' && m.status !== statusFilter) return false;
      if (
        verificationFilter !== 'All Verification States' &&
        m.verification !== verificationFilter
      ) {
        return false;
      }
      return true;
    });
  }, [municipalities, searchQuery, stateFilter, statusFilter, verificationFilter]);

  const handleCreateMunicipality = async (e) => {
    e.preventDefault();
    if (!newMunName.trim()) return;
    if (onAddMunicipality) {
      await onAddMunicipality({
        name: newMunName.trim(),
        subLabel: newMunType,
        state: newMunState,
        nodalOfficer: newMunNodal || 'Nodal Commissioner',
        nodalEmail: newMunEmail || 'nodal@mpurban.gov.in'
      });
    }
    setIsAddModalOpen(false);
    setNewMunName('');
    setNewMunNodal('');
    setNewMunEmail('');
  };

  const handleConfirmOfficerRejectOrSuspend = async () => {
    if (!rejectTargetOfficer) return;
    await onVerifyOfficer(rejectTargetOfficer.id, {
      action: rejectActionType === 'Suspended' ? 'suspend' : 'reject',
      reason:
        rejectionReason.trim() ||
        `Your municipal officer account was ${rejectActionType.toLowerCase()} by the CIRRS Super Admin.`
    });
    setRejectTargetOfficer(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header matching Image 13 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Municipality Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage municipalities, nodal officer onboarding, and monitor civic service performance across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              onExportCsv('CIRRS_Municipalities_Directory.csv', filteredMunicipalities);
              if (onShowToast) onShowToast('Exported Municipality Directory to CSV');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Municipality</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Registered Municipalities</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {municipalities.length.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">
            Across {distinctStatesCount} {distinctStatesCount === 1 ? 'state' : 'states'} &amp; union territories
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Active Municipalities</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {activeMunCount.toLocaleString()}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
              {activeMunPct}% Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500">{activeMunPct}% platform operational rate</p>
        </div>

        <div
          onClick={() => setActiveSubView(activeSubView === 'officer-queue' ? 'all' : 'officer-queue')}
          className="bg-white rounded-2xl border-2 border-amber-300/80 hover:border-amber-400 p-5 space-y-3 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Pending Verification</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {pendingQueueCount}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
              Review Queue
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Awaiting nodal officer approval (Click to review)</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Inactive Municipalities</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {inactiveMunCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">Suspended or onboarding</p>
        </div>
      </div>

      {/* MUNICIPAL OFFICER TWO-TIER VERIFICATION QUEUE PANEL */}
      <div className="bg-white rounded-2xl border border-blue-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold">
                  Municipal Officer Account Verification Queue (Two-Tier Access Control)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold tabular-nums">
                  {officers.filter((o) => !o.adminVerified).length} Pending Admin Approval
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Municipal Officers must verify their email AND be approved here by the Super Admin before they can log in to the Officer Portal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onRefresh) onRefresh();
              if (onShowToast) onShowToast('Refreshed Municipal Officer verification requests');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Requests</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3 px-4">Municipal Officer</th>
                <th className="py-3 px-3">Employee ID &amp; Dept</th>
                <th className="py-3 px-3">Municipality</th>
                <th className="py-3 px-3">Step 1: Email Status</th>
                <th className="py-3 px-3">Step 2: Admin Verification</th>
                <th className="py-3 px-4 text-right">Super Admin Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {officers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No municipal officer accounts registered yet. When a Municipal Officer signs up, their verification request will appear here.
                  </td>
                </tr>
              ) : (
                officers.map((off) => {
                  const isEmailVerified = Boolean(off.isVerified);
                  const isAdminApproved = Boolean(off.adminVerified) && off.verificationStatus === 'Verified';
                  const vStatus =
                    off.verificationStatus || (off.adminVerified ? 'Verified' : 'Pending');

                  return (
                    <tr key={off.id || off.email} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{off.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{off.email}</span>
                          {off.phone && <span>· {off.phone}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-bold text-slate-800">
                          {off.officerId || 'IMC-ENG-0842'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {off.department || 'Roads & Infrastructure'}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {off.city || 'Indore Municipal Corporation'}
                      </td>
                      <td className="py-3.5 px-3">
                        {isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                            <Check className="w-3 h-3" />
                            <span>Email Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                            <Clock className="w-3 h-3" />
                            <span>Awaiting Email OTP</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {vStatus === 'Verified' && isAdminApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Admin Approved (Login Enabled)</span>
                          </span>
                        ) : vStatus === 'Rejected' || vStatus === 'Suspended' ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                              <Ban className="w-3 h-3" />
                              <span>{vStatus}</span>
                            </span>
                            {off.adminRejectionReason && (
                              <div className="text-[10px] text-rose-600 max-w-xs truncate">
                                Reason: {off.adminRejectionReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                            <Clock className="w-3 h-3" />
                            <span>Pending Admin Approval</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {(!isAdminApproved || vStatus !== 'Verified') && (
                            <button
                              type="button"
                              onClick={() =>
                                onVerifyOfficer(off.id, {
                                  action: 'approve',
                                  email: off.email
                                })
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Verify &amp; Approve</span>
                            </button>
                          )}

                          {vStatus !== 'Rejected' && (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectTargetOfficer(off);
                                setRejectActionType(isAdminApproved ? 'Suspended' : 'Rejected');
                                setRejectionReason('');
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold cursor-pointer"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>{isAdminApproved ? 'Suspend' : 'Reject'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Bar for Municipality Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search municipality or city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white cursor-pointer"
          >
            <option>All States</option>
            <option>Madhya Pradesh</option>
            <option>Maharashtra</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white cursor-pointer"
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white cursor-pointer"
          >
            <option>All Verification States</option>
            <option>Verified</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      {/* Municipality Directory Table matching Image 13 */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3.5 px-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="py-3.5 px-3">Municipality</th>
                <th className="py-3.5 px-3">Municipality ID</th>
                <th className="py-3.5 px-3">State</th>
                <th className="py-3.5 px-3 text-right">Registered Citizens</th>
                <th className="py-3.5 px-3 text-right">Total Complaints</th>
                <th className="py-3.5 px-4">Resolution Rate</th>
                <th className="py-3.5 px-3">Verification</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMunicipalities.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No municipalities registered yet. Click &quot;+ Add Municipality&quot; or approve a Municipal Officer to register a node.
                  </td>
                </tr>
              ) : (
                filteredMunicipalities.map((m) => {
                  const isVerified = m.verification === 'Verified';
                  const isActive = m.status === 'Active';
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{m.name}</div>
                          <div className="text-[11px] text-slate-400">{m.subLabel}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3 font-mono font-semibold text-slate-600 tabular-nums">
                      {m.id}
                    </td>
                    <td className="py-4 px-3 text-slate-700 font-medium">{m.state}</td>
                    <td className="py-4 px-3 text-right font-bold text-slate-800 tabular-nums">
                      {Number(m.registeredCitizens || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-3 text-right font-bold text-slate-800 tabular-nums">
                      {Number(m.totalComplaints || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1 w-32">
                        <div className="text-[11px] font-bold text-slate-800 tabular-nums">
                          {m.resolutionRate}%
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${m.resolutionRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                          <Check className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span>{m.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (onUpdateMunicipalityStatus) {
                            onUpdateMunicipalityStatus(m.id, {
                              verification: isVerified ? 'Pending' : 'Verified',
                              status: isVerified ? 'Inactive' : 'Active'
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                          isVerified
                            ? 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isVerified ? 'Manage' : 'Verify Node'}
                      </button>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing{' '}
            <strong className="text-slate-900">
              {filteredMunicipalities.length === 0 ? 0 : `1–${filteredMunicipalities.length}`}
            </strong>{' '}
            of <strong className="text-slate-900">{municipalities.length.toLocaleString()}</strong> municipalities
          </div>
          <div className="flex items-center gap-1.5">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
              &lt; Previous
            </button>
            <button className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold">1</button>
          </div>
        </div>
      </div>

      {/* Add Municipality Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateMunicipality}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Onboard New Municipality</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Municipality Name *</label>
                <input
                  type="text"
                  required
                  value={newMunName}
                  onChange={(e) => setNewMunName(e.target.value)}
                  placeholder="e.g. Ujjain Municipal Corporation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State</label>
                  <select
                    value={newMunState}
                    onChange={(e) => setNewMunState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white"
                  >
                    <option>Madhya Pradesh</option>
                    <option>Maharashtra</option>
                    <option>Rajasthan</option>
                    <option>Gujarat</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Body Classification</label>
                  <select
                    value={newMunType}
                    onChange={(e) => setNewMunType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white"
                  >
                    <option>Municipal Corporation</option>
                    <option>Urban Local Body</option>
                    <option>Municipal Council</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Chief Nodal Officer Name</label>
                <input
                  type="text"
                  value={newMunNodal}
                  onChange={(e) => setNewMunNodal(e.target.value)}
                  placeholder="e.g. Er. Harshvardhan Singh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Nodal Email</label>
                <input
                  type="email"
                  value={newMunEmail}
                  onChange={(e) => setNewMunEmail(e.target.value)}
                  placeholder="nodal.ujjain@mpurban.gov.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Register &amp; Verify Municipality
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reject / Suspend Municipal Officer Reason Modal */}
      {rejectTargetOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {rejectActionType === 'Suspended'
                  ? 'Suspend Municipal Officer Account'
                  : 'Reject Municipal Officer Verification'}
              </h3>
              <button
                type="button"
                onClick={() => setRejectTargetOfficer(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
              Officer: <strong>{rejectTargetOfficer.name}</strong> ({rejectTargetOfficer.email})
              <div className="text-[11px] text-rose-700 mt-0.5">
                Active sessions will be immediately revoked and this reason will be displayed when the officer attempts to sign in.
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Official Administrative Reason *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Employee ID could not be verified with Indore Municipal Corporation nodal registry."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectTargetOfficer(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOfficerRejectOrSuspend}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirm {rejectActionType} &amp; Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
