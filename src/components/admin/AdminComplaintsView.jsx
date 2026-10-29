import React, { useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  Download,
  RefreshCw,
  Search,
  Calendar,
  Eye,
  SlidersHorizontal,
  Cpu,
  Info,
  Building2,
  Wrench,
  Trash2,
  Droplets,
  Lightbulb,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminComplaintsView({
  complaints = [],
  onSelectComplaint,
  onStatusChange,
  onBatchUpdate,
  onExportCsv,
  onRefresh,
  onShowToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [municipalityFilter, setMunicipalityFilter] = useState('All Municipalities');
  const [selectedIds, setSelectedIds] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);
  const [bulkDepartment, setBulkDepartment] = useState('Public Works & Roads (PWD)');
  const [bulkStatus, setBulkStatus] = useState('In Progress');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const pendingCount = useMemo(
    () => complaints.filter((c) => ['pending', 'reported'].includes(String(c.status || '').toLowerCase())).length,
    [complaints]
  );
  const inProgressCount = useMemo(
    () => complaints.filter((c) => ['in progress', 'assigned'].includes(String(c.status || '').toLowerCase())).length,
    [complaints]
  );
  const resolvedCount = useMemo(
    () => complaints.filter((c) => String(c.status || '').toLowerCase() === 'resolved').length,
    [complaints]
  );
  const activeMunicipalityCount = useMemo(
    () => new Set(complaints.map((c) => c.municipality || c.location?.split(',')[0]).filter(Boolean)).size,
    [complaints]
  );

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const q = searchQuery.trim().toLowerCase();
      if (q && q !== 'cmp-') {
        const displayId = (c.id.startsWith('CMP-') ? c.id : `CMP-${c.id}`).toLowerCase();
        const matchId = displayId.includes(q) || String(c.id).toLowerCase().includes(q);
        const matchTitle = String(c.title || '').toLowerCase().includes(q);
        const matchMun = String(c.municipality || c.location || '').toLowerCase().includes(q);
        if (!matchId && !matchTitle && !matchMun) return false;
      }
      if (statusFilter !== 'All Statuses' && String(c.status).toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (
        categoryFilter !== 'All Categories' &&
        !String(c.category || '').toLowerCase().includes(categoryFilter.toLowerCase())
      ) {
        return false;
      }
      if (
        priorityFilter !== 'All Priorities' &&
        String(c.priority || '').toLowerCase() !== priorityFilter.toLowerCase()
      ) {
        return false;
      }
      if (
        municipalityFilter !== 'All Municipalities' &&
        !String(c.municipality || c.location || '')
          .toLowerCase()
          .includes(municipalityFilter.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [complaints, searchQuery, statusFilter, categoryFilter, priorityFilter, municipalityFilter]);

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredComplaints.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredComplaints.map((c) => c.id));
    }
  };

  const handleBulkAssignConfirm = async () => {
    if (selectedIds.length === 0) return;
    if (onBatchUpdate) {
      await onBatchUpdate({
        ids: selectedIds,
        department: bulkDepartment,
        status: bulkStatus
      });
    }
    setBulkAssignModalOpen(false);
    if (onShowToast) {
      onShowToast(`Bulk assigned ${selectedIds.length} complaints to ${bulkDepartment} (${bulkStatus})`);
    }
  };

  const getCategoryIcon = (cat = '') => {
    const lower = cat.toLowerCase();
    if (lower.includes('road')) return <Wrench className="w-3.5 h-3.5 text-amber-600" />;
    if (lower.includes('garbage') || lower.includes('sanitation')) return <Trash2 className="w-3.5 h-3.5 text-slate-600" />;
    if (lower.includes('water')) return <Droplets className="w-3.5 h-3.5 text-blue-600" />;
    if (lower.includes('light') || lower.includes('electric')) return <Lightbulb className="w-3.5 h-3.5 text-amber-500" />;
    return <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />;
  };

  const getPriorityBadge = (prio = '') => {
    const lower = prio.toLowerCase();
    if (lower === 'critical') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (lower === 'high') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (lower === 'medium') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusBadge = (status = '') => {
    const lower = status.toLowerCase();
    if (lower === 'resolved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (lower === 'in progress' || lower === 'assigned') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const getStatusDot = (status = '') => {
    const lower = status.toLowerCase();
    if (lower === 'resolved') return 'bg-emerald-500';
    if (lower === 'in progress' || lower === 'assigned') return 'bg-blue-600';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Complaint Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor, review, and track civic complaints across all municipalities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              onExportCsv('CIRRS_All_Complaints_Export.csv', filteredComplaints);
              if (onShowToast) onShowToast('Exported filtered complaints to CSV');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Complaints</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onRefresh) onRefresh();
              if (onShowToast) onShowToast('Synchronized complaint queue with live nodes');
            }}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
            title="Refresh Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">All Complaints</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {complaints.length.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">
            Total registered across {activeMunicipalityCount} {activeMunicipalityCount === 1 ? 'municipality' : 'municipalities'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Pending</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {pendingCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">Awaiting department triage</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">In Progress</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {inProgressCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">Active field work assigned</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Resolved</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {resolvedCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">Successfully closed &amp; verified</p>
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
            placeholder="CMP-"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white cursor-pointer"
        >
          <option>All Statuses</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white cursor-pointer"
        >
          <option>All Categories</option>
          <option>Road Damage</option>
          <option>Garbage</option>
          <option>Water Supply</option>
          <option>Streetlights</option>
          <option>Drainage</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white cursor-pointer"
        >
          <option>All Priorities</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

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

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Last 30 Days</span>
        </div>
      </div>

      {/* Main Data Table Card with Bulk Selection Header */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Bulk Action Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[11px] tabular-nums">
                {selectedIds.length}
              </span>
              <span>selected</span>
            </div>

            <span className="text-slate-300">|</span>

            <button
              type="button"
              onClick={() => {
                const rows = filteredComplaints.filter((c) => selectedIds.includes(c.id));
                onExportCsv('CIRRS_Selected_Complaints.csv', rows);
                if (onShowToast) onShowToast(`Exported ${rows.length} selected complaints`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected</span>
            </button>

            <button
              type="button"
              onClick={() => setBulkAssignModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Bulk Assign</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[11px] font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI-assisted classification</span>
            </span>
            <Info className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-white">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredComplaints.length > 0 &&
                      selectedIds.length === filteredComplaints.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3">Complaint ID</th>
                <th className="py-3.5 px-3">Issue Details</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Municipality</th>
                <th className="py-3.5 px-3">Reported Date</th>
                <th className="py-3.5 px-3">Priority</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">AI Confidence</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No complaints found in Supabase database.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                const isSelected = selectedIds.includes(c.id);
                const confNum =
                  typeof c.aiConfidence === 'number'
                    ? c.aiConfidence
                    : parseInt(String(c.confidence || '92'), 10) || 92;
                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectComplaint(c)}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td
                      className="py-4 px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectRow(c.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-3 font-bold text-blue-600 tabular-nums whitespace-nowrap">
                      {c.id.startsWith('CMP-') || c.id.startsWith('CC') ? c.id : `CMP-${c.id}`}
                    </td>
                    <td className="py-4 px-3 font-semibold text-slate-900 max-w-xs">
                      {c.title}
                    </td>
                    <td className="py-4 px-3">
                      <div className="inline-flex items-center gap-2 text-slate-700 font-medium">
                        {getCategoryIcon(c.category)}
                        <span>{c.category}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 font-semibold text-slate-800">
                      {c.municipality || c.location?.split(',')[0] || 'Indore'}
                    </td>
                    <td className="py-4 px-3 text-slate-500 tabular-nums whitespace-nowrap">
                      {c.reportedDate || c.reported || '28 Oct 2026'}
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getPriorityBadge(
                          c.priority
                        )}`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${getStatusBadge(
                          c.status
                        )}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(c.status)}`}></span>
                        <span>{c.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${confNum}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                          {confNum}%
                        </span>
                      </div>
                    </td>
                    <td
                      className="py-4 px-4 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuId === c.id && (
                        <div className="absolute right-6 top-11 z-20 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-left text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onSelectComplaint(c);
                            }}
                            className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>View Dossier</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              const nextStatus = c.status === 'Resolved' ? 'In Progress' : 'Resolved';
                              onStatusChange(c.id, nextStatus);
                            }}
                            className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              Mark {c.status === 'Resolved' ? 'In Progress' : 'Resolved'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onExportCsv(`Dossier_${c.id}.csv`, [c]);
                            }}
                            className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                            <span>Export Row</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing{' '}
            <strong className="text-slate-900">
              {filteredComplaints.length === 0 ? 0 : `1–${filteredComplaints.length}`}
            </strong>{' '}
            of{' '}
            <strong className="text-slate-900 tabular-nums">
              {complaints.length.toLocaleString()}
            </strong>{' '}
            complaints
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 font-semibold bg-white cursor-pointer"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="w-8 h-8 rounded-lg font-bold bg-blue-600 text-white cursor-pointer"
              >
                1
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(currentPage + 1)}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Assign Modal */}
      {bulkAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Bulk Assign Selected Complaints ({selectedIds.length})
            </h3>
            <p className="text-xs text-slate-500">
              Route all selected dossiers to a designated municipal department and update their operational status.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Municipal Department
                </label>
                <select
                  value={bulkDepartment}
                  onChange={(e) => setBulkDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                >
                  <option>Public Works &amp; Roads (PWD)</option>
                  <option>Sanitation &amp; Solid Waste</option>
                  <option>Water Works &amp; Drainage</option>
                  <option>Electrical &amp; Street Lighting</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Transition Status
                </label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                >
                  <option>In Progress</option>
                  <option>Pending</option>
                  <option>Resolved</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBulkAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkAssignConfirm}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Apply Bulk Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
