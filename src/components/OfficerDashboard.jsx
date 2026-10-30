import React, { useState, useMemo } from 'react';
import {
  OFFICER_DEFAULT_PROFILE
} from '../services/officerPortalData.js';
import { civicDataService } from '../services/supabaseClient.js';
import OfficerComplaintDetailView from './officer/OfficerComplaintDetailView.jsx';
import OfficerMapView from './officer/OfficerMapView.jsx';
import OfficerDepartmentsView from './officer/OfficerDepartmentsView.jsx';
import OfficerReportsView from './officer/OfficerReportsView.jsx';
import OfficerNotificationsView from './officer/OfficerNotificationsView.jsx';
import OfficerProfileSettingsView from './officer/OfficerProfileSettingsView.jsx';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Sparkles,
  UserCheck,
  Clock,
  CheckCircle2,
  MapPin,
  Users,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
  HelpCircle,
  LogOut,
  Search,
  Plus,
  AlertTriangle,
  Download,
  ArrowRight,
  Cpu,
  Truck,
  Filter,
  Check,
  ChevronRight,
  Building2,
  Menu,
  X,
  SlidersHorizontal
} from 'lucide-react';

export default function OfficerDashboard({
  currentUser,
  complaints: externalComplaints = [],
  notifications = [],
  onNavigate,
  onSelectTicket,
  onStatusChange,
  onSwitchUserRole,
  onLogout,
  onUpdateCurrentUser,
  onRefreshData
}) {
  // Navigation state across all sidebar options + detail inspection view
  const [activeNav, setActiveNav] = useState('dashboard');
  // 'dashboard' | 'all-complaints' | 'new-complaints' | 'assigned-to-me' | 'in-progress' | 'resolved' | 'map-view' | 'departments' | 'reports' | 'notifications' | 'profile-settings' | 'complaint-detail'

  const [detailMode, setDetailMode] = useState('verification'); // 'verification' | 'execution'
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Dashboard states (Screen 1)
  const [attentionDismissed, setAttentionDismissed] = useState(false);
  const [priorityTab, setPriorityTab] = useState('all'); // 'all' | 'critical' | 'high' | 'overdue'

  // All Complaints table & filter states (Screen 2)
  const [tableStatusTab, setTableStatusTab] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All Priorities');
  const [filterCategory, setFilterCategory] = useState('Category: All');
  const [filterDept, setFilterDept] = useState('Department: All');
  const [sortBy, setSortBy] = useState('Sort by: Recently Updated');
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  // Modals (Quick Dispatch & Support)
  const [isQuickDispatchOpen, setIsQuickDispatchOpen] = useState(false);
  const [quickTargetId, setQuickTargetId] = useState('');
  const [quickSquad, setQuickSquad] = useState('Indore PWD Road Maintenance Squad #04 (MP09-CZ-8821)');
  const [quickInstructions, setQuickInstructions] = useState(
    'Mobilize immediately to geo-coordinates. Upload site preparation photo within 45 minutes.'
  );
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [localToast, setLocalToast] = useState('');

  // Local patches layered over live complaints from Supabase / backend
  const [localPatches, setLocalPatches] = useState({});

  // Build complaints list exclusively from live externalComplaints (starts empty until records are created)
  const mergedComplaints = useMemo(() => {
    return (externalComplaints || [])
      .filter((ext) => ext?.id)
      .map((ext, idx) => {
        const patch = localPatches[ext.id] || {};
        const combined = { ...ext, ...patch };
        const rawPriority = combined.priority || 'High Priority';
        const priorityLevel = rawPriority.toLowerCase().includes('critical')
          ? 'Critical'
          : rawPriority.toLowerCase().includes('high')
          ? 'High'
          : 'Medium';
        const normalizedStatus =
          combined.status === 'Resolved'
            ? 'Resolved'
            : combined.status === 'In Progress'
            ? 'In Progress'
            : combined.status === 'Assigned'
            ? 'Assigned'
            : combined.status === 'Unassigned'
            ? 'Unassigned'
            : 'Needs Verification';

        return {
          ...combined,
          id: combined.id,
          title: combined.title || 'Civic Infrastructure Issue',
          shortTitle: combined.shortTitle || combined.title || 'Civic Infrastructure Issue',
          category: combined.category || 'Road Damage',
          department: combined.department || 'Roads & Infrastructure',
          subDepartment: combined.subDepartment || 'PWD Zone 4',
          location: combined.location || 'Ward 18, Indore',
          fullLocation: combined.fullLocation || `${combined.location || 'Vijay Nagar, Indore'} (Ward 18, Zone 4)`,
          geo: combined.geo || '22.7533° N, 75.8937° E',
          reported: combined.reported || 'Just now',
          reportedAgo: combined.reportedAgo || combined.reported || 'Reported recently',
          slaRemaining: combined.slaRemaining || (normalizedStatus === 'Resolved' ? 'Completed' : '5h 30m left'),
          slaStatus: combined.slaStatus || 'Due in 6 hours',
          priority: rawPriority,
          priorityLevel,
          status: normalizedStatus,
          executionStatus: combined.executionStatus || normalizedStatus,
          assignedToMe: combined.assignedToMe !== undefined ? combined.assignedToMe : true,
          isNew: normalizedStatus === 'Needs Verification' || normalizedStatus === 'Unassigned',
          isOverdue: Boolean(combined.isOverdue || priorityLevel === 'Critical'),
          aiConfidence: combined.confidence || combined.aiConfidence || '95%',
          aiAssessment:
            combined.aiAssessment ||
            `${combined.aiDetected || 'Surface Defect'} · ${combined.confidence || '95%'} Conf.`,
          aiDetectedClass: combined.aiDetected || combined.aiDetectedClass || 'Road Surface Damage',
          aiDimensions: combined.dimensions || combined.aiDimensions || '~12cm Depth',
          aiSummary: combined.description || combined.aiSummary || 'AI computer vision verified infrastructure defect.',
          aiReasoning:
            combined.aiReasoning || 'Automated visual inspection matched municipal hazard profile.',
          citizenName: combined.citizenName || 'Verified Citizen',
          citizenBadge: combined.citizenBadge || 'Aadhaar Verified Citizen',
          assignedSquad: combined.assignedSquad || combined.assignedTeam || 'Unassigned',
          leadEngineer: combined.leadEngineer || 'Er. Rajesh Verma',
          image:
            combined.image ||
            'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80',
          mapCoords: combined.mapCoords || {
            x: 34 + ((idx * 17) % 42),
            y: 26 + ((idx * 19) % 48)
          },
          workLogs: Array.isArray(combined.workLogs) ? combined.workLogs : []
        };
      });
  }, [externalComplaints, localPatches]);

  // Dynamic Officer Profile combining real logged-in user details with IMC Officer defaults
  const [customProfileEdits, setCustomProfileEdits] = useState({});
  const officerProfile = useMemo(() => {
    const base = { ...OFFICER_DEFAULT_PROFILE };
    if (currentUser) {
      if (currentUser.name) {
        base.name = currentUser.name;
        base.initials = currentUser.initials ||
          currentUser.name
            .replace('Er. ', '')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
      }
      if (currentUser.email) base.email = currentUser.email;
      if (currentUser.phone) base.phone = currentUser.phone;
      if (currentUser.department) base.department = currentUser.department;
      if (currentUser.officerId) base.officerId = currentUser.officerId;
      if (currentUser.city) base.city = currentUser.city;
    }
    return { ...base, ...customProfileEdits };
  }, [currentUser, customProfileEdits]);

  const firstName = useMemo(() => {
    const clean = (officerProfile.name || 'Rajesh').replace(/^Er\.\s*/i, '').trim();
    return clean.split(' ')[0] || 'Rajesh';
  }, [officerProfile.name]);

  const showOfficerToast = (msg) => {
    setLocalToast(msg);
    setTimeout(() => {
      setLocalToast('');
    }, 3500);
  };

  const handleOpenComplaintDetail = (complaintObj, mode = 'verification') => {
    if (!complaintObj) return;
    setSelectedComplaintId(complaintObj.id);
    setDetailMode(mode);
    setActiveNav('complaint-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateComplaint = (complaintId, patch) => {
    setLocalPatches((prev) => ({
      ...prev,
      [complaintId]: { ...(prev[complaintId] || {}), ...patch }
    }));
    if (patch.status && onStatusChange) {
      onStatusChange(complaintId, patch.status);
    }
    if (onRefreshData) {
      onRefreshData();
    }
  };

  const handleUpdateOfficerProfile = (updates) => {
    setCustomProfileEdits((prev) => ({ ...prev, ...updates }));
    if (onUpdateCurrentUser && currentUser) {
      onUpdateCurrentUser({ ...currentUser, ...updates });
    }
  };

  const activeComplaintObj =
    mergedComplaints.find((c) => c.id === selectedComplaintId) || mergedComplaints[0] || null;

  // Dynamic KPI counts computed from mergedComplaints
  const totalCount = mergedComplaints.length;
  const newCount = mergedComplaints.filter(
    (c) => c.isNew || c.status === 'Needs Verification' || c.status === 'New'
  ).length;
  const unassignedCount = mergedComplaints.filter(
    (c) => !c.assignedSquad || c.assignedSquad.includes('Unassigned') || c.status === 'Unassigned'
  ).length;
  const assignedCount = mergedComplaints.filter((c) => c.status === 'Assigned').length;
  const inProgressCount = mergedComplaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'Assigned'
  ).length;
  const resolvedCount = mergedComplaints.filter((c) => c.status === 'Resolved').length;
  const overdueCount = mergedComplaints.filter((c) => c.isOverdue && c.status !== 'Resolved').length;
  const assignedToMeCount = mergedComplaints.filter((c) => c.assignedToMe).length;
  const activeQueueAllCount = mergedComplaints.filter((c) => c.status !== 'Resolved').length;
  const criticalCount = mergedComplaints.filter(
    (c) => c.status !== 'Resolved' && c.priorityLevel === 'Critical'
  ).length;
  const highCount = mergedComplaints.filter(
    (c) => c.status !== 'Resolved' && c.priorityLevel === 'High'
  ).length;
  const unreadNotifCount = (notifications || []).filter(
    (n) => (n.unread !== undefined ? Boolean(n.unread) : !n.read)
  ).length;

  // Breadcrumb label helper
  const breadcrumbLabel = {
    dashboard: 'Dashboard',
    'all-complaints': 'Complaint Management / All Complaints',
    'new-complaints': 'Complaint Management / New Complaints',
    'assigned-to-me': 'Complaint Management / Assigned to Me',
    'in-progress': 'Complaint Management / In Progress',
    resolved: 'Complaint Management / Resolved',
    'map-view': 'Operations / Map View (GIS Hotspots)',
    departments: 'Operations / Departments & Team',
    reports: 'Insights / Reports & Performance',
    notifications: 'Account / Notifications',
    'profile-settings': 'Account / Profile & Settings',
    'complaint-detail': `Complaint Management / #${selectedComplaintId}`
  }[activeNav] || 'Dashboard';

  // Filtered complaints for Complaint Management screens (All / New / Assigned to Me / In Progress / Resolved)
  const filteredManagementComplaints = useMemo(() => {
    return mergedComplaints.filter((c) => {
      // First apply sidebar view preset
      if (activeNav === 'new-complaints' && !c.isNew && c.status !== 'New' && c.status !== 'Needs Verification') {
        return false;
      }
      if (activeNav === 'assigned-to-me' && !c.assignedToMe) {
        return false;
      }
      if (activeNav === 'in-progress' && c.status !== 'In Progress' && c.status !== 'Assigned') {
        return false;
      }
      if (activeNav === 'resolved' && c.status !== 'Resolved') {
        return false;
      }

      // Apply Status Tab inside All Complaints
      if (activeNav === 'all-complaints' && tableStatusTab !== 'All') {
        if (tableStatusTab === 'New' && !c.isNew) return false;
        if (tableStatusTab === 'Needs Verification' && c.status !== 'Needs Verification') return false;
        if (tableStatusTab === 'Assigned' && c.status !== 'Assigned') return false;
        if (tableStatusTab === 'In Progress' && c.status !== 'In Progress') return false;
        if (tableStatusTab === 'Resolved' && c.status !== 'Resolved') return false;
      }

      // Apply dropdown filters
      if (filterPriority === 'High & Critical' && c.priorityLevel !== 'High' && c.priorityLevel !== 'Critical') {
        return false;
      }
      if (filterCategory !== 'Category: All' && !c.category.toLowerCase().includes(filterCategory.replace('Category: ', '').toLowerCase())) {
        return false;
      }
      if (filterDept !== 'Department: All' && !c.department.toLowerCase().includes(filterDept.replace('Department: ', '').toLowerCase())) {
        return false;
      }
      if (globalSearch) {
        const q = globalSearch.toLowerCase();
        const match =
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          (c.citizenName && c.citizenName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [mergedComplaints, activeNav, tableStatusTab, filterPriority, filterCategory, filterDept, globalSearch]);

  const toggleSelectRow = (id) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Priority queue items on Dashboard (Screen 1)
  const priorityQueueItems = useMemo(() => {
    return mergedComplaints.filter((c) => {
      if (c.status === 'Resolved') return false;
      if (priorityTab === 'critical') return c.priorityLevel === 'Critical';
      if (priorityTab === 'high') return c.priorityLevel === 'High';
      if (priorityTab === 'overdue') return c.isOverdue;
      return true;
    });
  }, [mergedComplaints, priorityTab]);

  // Sidebar Menu Definition with live dynamic badge counts
  const sidebarSections = [
    {
      heading: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      heading: 'COMPLAINT MANAGEMENT',
      items: [
        { id: 'all-complaints', label: 'All Complaints', icon: FileSpreadsheet, badge: String(totalCount) },
        { id: 'new-complaints', label: 'New Complaints', icon: Sparkles, badge: String(newCount), badgeTone: 'blue' },
        { id: 'assigned-to-me', label: 'Assigned to Me', icon: UserCheck, badge: String(assignedToMeCount) },
        { id: 'in-progress', label: 'In Progress', icon: Clock, badge: String(inProgressCount) },
        { id: 'resolved', label: 'Resolved', icon: CheckCircle2, badge: String(resolvedCount), badgeTone: 'emerald' }
      ]
    },
    {
      heading: 'OPERATIONS',
      items: [
        { id: 'map-view', label: 'Map View (Hotspots)', icon: MapPin },
        { id: 'departments', label: 'Departments & Team', icon: Users }
      ]
    },
    {
      heading: 'INSIGHTS',
      items: [
        { id: 'reports', label: 'Reports & Performance', icon: BarChart3 }
      ]
    },
    {
      heading: 'ACCOUNT',
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount > 0 ? String(unreadNotifCount) : undefined, badgeTone: 'rose' },
        { id: 'profile-settings', label: 'Profile & Settings', icon: Settings }
      ]
    }
  ];

  // ============================================================================
  // RENDER COMPLAINT MANAGEMENT VIEW (All Complaints + New / Assigned / In Progress / Resolved)
  // ============================================================================
  const renderComplaintManagementView = () => {
    const viewConfigs = {
      'all-complaints': {
        superTitle: 'COMPLAINT MANAGEMENT · CENTRAL QUEUE',
        title: 'All Complaints',
        subtitle: 'Unified municipal complaint registry with AI computer vision triage, SLA tracking, and bulk squad dispatch.'
      },
      'new-complaints': {
        superTitle: 'COMPLAINT MANAGEMENT · FRESH INFLOW',
        title: 'New Complaints (Needs Triage)',
        subtitle: 'Newly reported citizen complaints awaiting officer verification and initial field squad assignment.'
      },
      'assigned-to-me': {
        superTitle: `PERSONAL CASELOAD · ${officerProfile.officerId}`,
        title: `Assigned to Me (${officerProfile.name})`,
        subtitle: `Direct complaints under your supervisory jurisdiction in ${officerProfile.department} (Zone 04).`
      },
      'in-progress': {
        superTitle: 'ACTIVE FIELD EXECUTION · LIVE TELEMETRY',
        title: 'In Progress Complaints',
        subtitle: 'Active work orders with municipal squads currently deployed on-site across Wards 18–24.'
      },
      resolved: {
        superTitle: 'AUDITED CLOSURES · QUALITY VERIFIED',
        title: 'Resolved Complaints',
        subtitle: 'Completed municipal repairs signed off with post-execution geotagged evidence and citizen feedback.'
      }
    };

    const cfg = viewConfigs[activeNav] || viewConfigs['all-complaints'];

    return (
      <div className="space-y-6">
        {/* Top Title & Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 mb-1">
              {cfg.superTitle}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {cfg.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{cfg.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                const rows = filteredManagementComplaints.map((c) => ({
                  ComplaintID: c.id,
                  Title: c.title,
                  Category: c.category,
                  Department: c.department,
                  Location: c.location,
                  Priority: c.priority,
                  Status: c.status,
                  AssignedSquad: c.assignedSquad,
                  ReportedAt: c.reported
                }));
                civicDataService.exportToCsv(`imc-complaints-${activeNav}.csv`, rows);
                showOfficerToast(`Exported ${rows.length} complaints to IMC CSV ledger.`);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Complaints</span>
            </button>
            <button
              onClick={() => {
                if (!quickTargetId && mergedComplaints[0]?.id) {
                  setQuickTargetId(mergedComplaints[0].id);
                }
                setIsQuickDispatchOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Batch Actions</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                TOTAL COMPLAINTS
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
                Live Sync
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">{totalCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Zone 04 (Wards 18–24)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                NEEDS REVIEW / VERIFICATION
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold">
                Requires Action
              </span>
            </div>
            <div className="text-2xl font-extrabold text-amber-600 font-mono mt-2">{newCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">AI Computer Vision pre-screened</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                IN PROGRESS
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                Active Crews
              </span>
            </div>
            <div className="text-2xl font-extrabold text-blue-600 font-mono mt-2">{inProgressCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Field Squads Deployed</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                OVERDUE / SLA ALERT
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">
                SLA Monitor
              </span>
            </div>
            <div className="text-2xl font-extrabold text-rose-600 font-mono mt-2">{overdueCount}</div>
            <p className="text-[11px] text-rose-600 font-medium mt-1">Immediate dispatch required</p>
          </div>
        </div>

        {/* Multi-Dropdown Filter Bar (Screen 2) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option>All Priorities</option>
                <option>High & Critical</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option>Category: All</option>
                <option>Category: Road Damage</option>
                <option>Category: Streetlight</option>
                <option>Category: Garbage</option>
                <option>Category: Water</option>
                <option>Category: Drainage</option>
              </select>

              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option>Department: All</option>
                <option>Department: Roads & Infrastructure</option>
                <option>Department: Electrical</option>
                <option>Department: Sanitation</option>
                <option>Department: Water Supply</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option>Sort by: Recently Updated</option>
                <option>Sort by: SLA Urgency</option>
                <option>Sort by: AI Confidence</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFilterPriority('All Priorities');
                  setFilterCategory('Category: All');
                  setFilterDept('Department: All');
                  setTableStatusTab('All');
                  setGlobalSearch('');
                  showOfficerToast('All complaint filters reset.');
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={() => showOfficerToast('Filters applied to IMC complaint queue.')}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Status Segmented Tabs (When on All Complaints) */}
          {activeNav === 'all-complaints' && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
              {[
                { id: 'All', label: `All (${totalCount})` },
                { id: 'New', label: `New (${newCount})` },
                { id: 'Needs Verification', label: `Needs Verification (${newCount})` },
                { id: 'Assigned', label: `Assigned (${assignedCount})` },
                { id: 'In Progress', label: `In Progress (${inProgressCount})` },
                { id: 'Resolved', label: `Resolved (${resolvedCount})` }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setTableStatusTab(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tableStatusTab === st.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Selection Bar */}
        {selectedRowIds.length > 0 && (
          <div className="bg-blue-600 text-white rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <span className="w-6 h-6 rounded-lg bg-white text-blue-600 font-mono font-extrabold flex items-center justify-center">
                {selectedRowIds.length}
              </span>
              <span>
                {selectedRowIds.length} Complaints Selected (Bulk operation enabled)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={async () => {
                  await civicDataService.batchUpdateComplaints({
                    ids: selectedRowIds,
                    department: officerProfile.department || 'Roads & Infrastructure',
                    assignedSquad: 'Indore PWD Road Maintenance Squad #04',
                    status: 'In Progress',
                    note: `Bulk assigned to ${officerProfile.department} (PWD Road Maintenance Squad #04)`
                  });
                  selectedRowIds.forEach((id) => {
                    handleUpdateComplaint(id, {
                      status: 'In Progress',
                      assignedSquad: 'Indore PWD Road Maintenance Squad #04',
                      department: officerProfile.department || 'Roads & Infrastructure'
                    });
                  });
                  showOfficerToast(
                    `Assigned ${selectedRowIds.length} selected complaints to PWD Road Maintenance Squad #04 in Supabase.`
                  );
                  setSelectedRowIds([]);
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 cursor-pointer"
              >
                Assign Department
              </button>
              <button
                onClick={() => {
                  const selectedRows = mergedComplaints
                    .filter((c) => selectedRowIds.includes(c.id))
                    .map((c) => ({
                      ComplaintID: c.id,
                      Title: c.title,
                      Category: c.category,
                      Department: c.department,
                      Location: c.location,
                      Priority: c.priority,
                      Status: c.status,
                      AssignedSquad: c.assignedSquad
                    }));
                  civicDataService.exportToCsv('imc-selected-complaints.csv', selectedRows);
                  showOfficerToast(`Exported ${selectedRows.length} selected records to CSV.`);
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white border border-blue-400/40 text-xs font-bold cursor-pointer"
              >
                Export Selected
              </button>
              <button
                onClick={async () => {
                  await civicDataService.batchUpdateComplaints({
                    ids: selectedRowIds,
                    status: 'In Progress',
                    assignedSquad: 'Batch Field Inspection Unit #01',
                    note: 'Marked for Batch Field Inspection by Municipal Officer'
                  });
                  selectedRowIds.forEach((id) => {
                    handleUpdateComplaint(id, {
                      status: 'In Progress',
                      assignedSquad: 'Batch Field Inspection Unit #01'
                    });
                  });
                  showOfficerToast(
                    `Marked ${selectedRowIds.length} complaints for Batch Field Inspection.`
                  );
                  setSelectedRowIds([]);
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white border border-blue-400/40 text-xs font-bold cursor-pointer"
              >
                Mark for Batch Inspection
              </button>
            </div>
          </div>
        )}

        {/* High-Density Complaints Data Grid (Screen 2) */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredManagementComplaints.length > 0 &&
                        selectedRowIds.length === filteredManagementComplaints.length
                      }
                      onChange={(e) =>
                        setSelectedRowIds(
                          e.target.checked ? filteredManagementComplaints.map((c) => c.id) : []
                        )
                      }
                      className="rounded text-blue-600"
                    />
                  </th>
                  <th className="py-3.5 px-4">COMPLAINT ID</th>
                  <th className="py-3.5 px-4">ISSUE & LOCATION</th>
                  <th className="py-3.5 px-4">CATEGORY & DEPT</th>
                  <th className="py-3.5 px-4">AI ASSESSMENT</th>
                  <th className="py-3.5 px-4">PRIORITY</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredManagementComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 px-6 text-center">
                      <div className="max-w-sm mx-auto space-y-2">
                        <div className="text-sm font-extrabold text-slate-800">
                          No complaints in this queue yet
                        </div>
                        <p className="text-xs text-slate-500">
                          Your Supabase complaints table is currently empty or no records match the selected filters. Once a citizen submits an issue, it will appear here in real time.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredManagementComplaints.map((item) => {
                    const isChecked = selectedRowIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleOpenComplaintDetail(item, 'verification')}
                        className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${
                          isChecked ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        <td
                          className="py-4 px-4"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectRow(item.id)}
                            className="rounded text-blue-600"
                          />
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="font-mono font-extrabold text-blue-600 text-xs">
                            #{item.id}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {item.reportedAgo}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top max-w-xs">
                          <div className="flex items-start gap-3">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900 line-clamp-1">
                                {item.shortTitle || item.title}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                                <span>{item.location}</span>
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                SLA: {item.slaRemaining}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="font-bold text-slate-800">{item.category}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.subDepartment || item.department}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-200/80 text-blue-700 font-mono text-[11px] font-bold">
                            <Cpu className="w-3 h-3" />
                            <span>{item.aiAssessment}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              item.priorityLevel === 'Critical'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : item.priorityLevel === 'High'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              item.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : item.status === 'Unassigned'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td
                          className="py-4 px-4 align-top text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenComplaintDetail(item, 'verification')}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => handleOpenComplaintDetail(item, 'execution')}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold cursor-pointer"
                              title="Manage Assignment & Work Updates"
                            >
                              Manage
                            </button>
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
      </div>
    );
  };

  // ============================================================================
  // RENDER SCREEN 1: OFFICER DASHBOARD (unnamed__2__f68db2ae.png)
  // ============================================================================
  const renderDashboardHome = () => {
    return (
      <div className="space-y-6">
        {/* Greeting Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Good morning, {firstName}!
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {officerProfile.department} · IMC Zone 4
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Here is what&apos;s happening across your assigned wards ({officerProfile.wards || 'Ward 18–24'}) today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                const dutyRows = mergedComplaints.map((c) => ({
                  Officer: officerProfile.name,
                  OfficerID: officerProfile.officerId,
                  ComplaintID: c.id,
                  Issue: c.title,
                  WardLocation: c.location,
                  Priority: c.priority,
                  Status: c.status,
                  AssignedSquad: c.assignedSquad
                }));
                civicDataService.exportToCsv('imc-ward-duty-log.csv', dutyRows);
                showOfficerToast('Ward 18–24 Officer Duty Log exported as CSV.');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Ward Duty Log</span>
            </button>
            <button
              onClick={() => setActiveNav('new-complaints')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
            >
              <span>View New Complaints ({newCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Attention Required Alert Banner */}
        {!attentionDismissed && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-200">
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <span>ATTENTION REQUIRED · STATUTORY SLA MONITOR</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-white/15">
                  {highCount + criticalCount} High-Priority Complaints
                </span>
                <span>•</span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-200">
                  {unassignedCount} Unassigned (SLA &lt; 8 hrs)
                </span>
                <span>•</span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-400/25 text-rose-100">
                  {newCount} Awaiting Verification
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setAttentionDismissed(true)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
              >
                Dismiss Notice
              </button>
              <button
                onClick={() => setActiveNav('all-complaints')}
                className="px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Review Priority Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 5 KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div
            onClick={() => setActiveNav('new-complaints')}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                NEW COMPLAINTS
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
                Live
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono mt-2">{newCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Awaiting initial triage</div>
          </div>

          <div
            onClick={() => setActiveNav('all-complaints')}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                UNASSIGNED
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold">
                Action Req.
              </span>
            </div>
            <div className="text-3xl font-extrabold text-amber-600 font-mono mt-2">{unassignedCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Needs squad dispatch</div>
          </div>

          <div
            onClick={() => setActiveNav('in-progress')}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                IN PROGRESS
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                Active
              </span>
            </div>
            <div className="text-3xl font-extrabold text-blue-600 font-mono mt-2">{inProgressCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Active on-site works</div>
          </div>

          <div
            onClick={() => setActiveNav('resolved')}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                RESOLVED
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold">
                94.8% SLA
              </span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 font-mono mt-2">{resolvedCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Verified closures</div>
          </div>

          <div
            onClick={() => {
              setPriorityTab('overdue');
            }}
            className="bg-white p-5 rounded-2xl border border-rose-200 shadow-2xs hover:border-rose-400 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500">
                OVERDUE
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">
                Penalty Alert
              </span>
            </div>
            <div className="text-3xl font-extrabold text-rose-600 font-mono mt-2">{overdueCount}</div>
            <div className="text-[11px] text-rose-600 font-semibold mt-1">Escalate immediately</div>
          </div>
        </div>

        {/* Main 2-Column Split: Priority Queue (Left 8 Cols) + Department Overview & Activity Chart (Right 4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Priority Queue */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Priority Queue
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-[11px] font-bold">
                    Live SLA Sort
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  AI-triaged complaints requiring immediate verification or squad dispatch
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: `All Priorities (${activeQueueAllCount})` },
                  { id: 'critical', label: `Critical (${criticalCount})` },
                  { id: 'high', label: `High (${highCount})` },
                  { id: 'overdue', label: `Overdue (${overdueCount})` }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPriorityTab(t.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      priorityTab === t.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Complaint Cards */}
            <div className="space-y-4">
              {priorityQueueItems.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center space-y-2">
                  <div className="text-sm font-extrabold text-slate-800">
                    No active priority complaints in queue
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Your database starts clean with zero records. When citizens submit complaints, AI-triaged priority tickets will appear here automatically.
                  </p>
                </div>
              ) : (
                priorityQueueItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-extrabold text-xs text-blue-600">
                            #{item.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.priorityLevel === 'Critical'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {item.priority}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {item.status}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {item.reportedAgo}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                          {item.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            {item.location}
                          </span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span className="font-mono font-bold text-rose-600">
                            SLA: {item.slaRemaining}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Computer Vision Callout Box inside Card */}
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-start gap-2.5">
                      <Cpu className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-blue-950">
                          AI Computer Vision ({item.aiConfidence} Confidence):
                        </span>{' '}
                        <span className="text-slate-700">{item.aiSummary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-slate-500">
                      Squad: <strong className="text-slate-800">{item.assignedSquad}</strong>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleOpenComplaintDetail(item, 'verification')}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        View Full Inspection
                      </button>
                      <button
                        onClick={() => handleOpenComplaintDetail(item, 'execution')}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Quick Assign & Manage</span>
                      </button>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Department Overview & Complaint Activity (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Department Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Department Overview</h3>
                  <p className="text-xs text-slate-500">{officerProfile.department}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs font-bold">
                  {officerProfile.ward || 'Municipal Zone'}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Field Squad Bandwidth</span>
                  <span className="font-mono font-bold text-blue-600">
                    {totalCount > 0 ? `${Math.min(100, inProgressCount * 15)}% Utilized · ${inProgressCount} Deployed` : '0% Utilized · 0 Deployed'}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${totalCount > 0 ? Math.min(100, inProgressCount * 15) : 0}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="font-mono text-xl font-extrabold text-slate-900">
                    {Math.max(0, totalCount - resolvedCount)} cases
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Total Open in Dept</div>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                  <div className="font-mono text-xl font-extrabold text-blue-700">
                    {inProgressCount} active
                  </div>
                  <div className="text-[11px] text-blue-600 mt-0.5">Crews On-Site Now</div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="font-mono text-xl font-extrabold text-emerald-700">
                    {resolvedCount} verified
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">Closed This Week</div>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100">
                  <div className="font-mono text-xl font-extrabold text-rose-600">
                    {overdueCount} critical
                  </div>
                  <div className="text-[11px] text-rose-600 mt-0.5">SLA &lt; 4 Hours</div>
                </div>
              </div>

              <button
                onClick={() => setActiveNav('departments')}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Full Division Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Complaint Activity (Last 7 Days) Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Complaint Activity</h3>
                  <p className="text-xs text-slate-500">Last 7 Days (Received vs Resolved)</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  {totalCount > 0 ? `${Math.round((resolvedCount / totalCount) * 100)}% Velocity` : '0% Velocity'}
                </span>
              </div>

              {/* 7-Day Dual Bar Chart (Dynamic from live complaints) */}
              <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4 px-1">
                {[
                  { day: 'Wed', recv: 0, resv: 0 },
                  { day: 'Thu', recv: 0, resv: 0 },
                  { day: 'Fri', recv: 0, resv: 0 },
                  { day: 'Sat', recv: 0, resv: 0 },
                  { day: 'Sun', recv: 0, resv: 0 },
                  { day: 'Mon', recv: 0, resv: 0 },
                  {
                    day: 'Today',
                    recv: totalCount > 0 ? Math.min(100, totalCount * 20) : 0,
                    resv: resolvedCount > 0 ? Math.min(100, resolvedCount * 20) : 0,
                    rawRecv: totalCount,
                    rawResv: resolvedCount
                  }
                ].map((bar) => (
                  <div key={bar.day} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1 h-28">
                      <div
                        className="w-2.5 bg-blue-600 rounded-t"
                        style={{ height: `${bar.recv}%` }}
                        title={`Received: ${bar.rawRecv ?? bar.recv}`}
                      />
                      <div
                        className="w-2.5 bg-emerald-500 rounded-t"
                        style={{ height: `${bar.resv}%` }}
                        title={`Resolved: ${bar.rawResv ?? bar.resv}`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{bar.day}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" /> Received ({totalCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Resolved ({resolvedCount})
                  </span>
                </div>
                <button
                  onClick={() => setActiveNav('reports')}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Full Analytics →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {localToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{localToast}</span>
        </div>
      )}

      {/* ================= LEFT SIDEBAR NAVIGATION (268px Fixed on Desktop) ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-68 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform lg:translate-x-0 lg:static lg:shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div
              onClick={() => setActiveNav('dashboard')}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                CC
              </div>
              <div>
                <div className="font-extrabold text-base text-slate-900 leading-none">
                  Civic Connect
                </div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 mt-1">
                  IMC OPERATIONS PORTAL
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Dispatch Primary Button */}
          <button
            onClick={() => setIsQuickDispatchOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Quick Dispatch</span>
          </button>

          {/* Navigation Groups */}
          <nav className="space-y-5">
            {sidebarSections.map((section) => (
              <div key={section.heading} className="space-y-1">
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {section.heading}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeNav === item.id ||
                    (activeNav === 'complaint-detail' && item.id === 'all-complaints');
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveNav(item.id);
                        setMobileSidebarOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </span>

                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            item.badgeTone === 'rose'
                              ? 'bg-rose-600 text-white'
                              : item.badgeTone === 'blue'
                              ? 'bg-blue-100 text-blue-700'
                              : item.badgeTone === 'emerald'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar Footer: MeitY Verified Node + Support & Logout */}
        <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50/60">
          <div className="p-3 rounded-xl bg-white border border-slate-200/90 space-y-1">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                MeitY Verified Node
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              {officerProfile.clusterNode} · {officerProfile.nicNode}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsSupportOpen(true)}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Support</span>
            </button>

            <button
              onClick={() => {
                if (onLogout) onLogout();
                else onNavigate('login');
              }}
              className="py-2 px-3 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ================= RIGHT MAIN WORKSPACE VIEWPORT ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Hamburger + Breadcrumb + Live IMC Sync Pill */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="text-xs font-semibold text-slate-500 truncate">
              <span>Home</span>
              <span className="mx-1.5 text-slate-300">/</span>
              <span className="font-bold text-slate-900">{breadcrumbLabel}</span>
            </div>

            <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live IMC Sync · Ward 18–24</span>
            </div>
          </div>

          {/* Right: Global Search + Role Switcher + Notifications + Officer Profile Chip */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative hidden md:block w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  if (activeNav === 'dashboard') setActiveNav('all-complaints');
                }}
                placeholder="Search #ID, citizen, ward... Ctrl+K"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            {/* Verified Municipal Officer RBAC Badge */}
            <div
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-700"
              title="Role-Based Access Control: Municipal Officer Jurisdiction"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Municipal Officer Access</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setActiveNav('notifications')}
              className="relative p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Officer Profile Chip (Dynamic Logged-In User Details) */}
            <div
              onClick={() => setActiveNav('profile-settings')}
              className="flex items-center gap-2.5 pl-3 border-l border-slate-200 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs group-hover:bg-blue-700 transition-colors">
                {officerProfile.initials || 'RV'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-extrabold text-slate-900 leading-tight group-hover:text-blue-600">
                  {officerProfile.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {officerProfile.shortRole || `${officerProfile.department} · ${officerProfile.officerId}`}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
          {activeNav === 'dashboard' && renderDashboardHome()}

          {(activeNav === 'all-complaints' ||
            activeNav === 'new-complaints' ||
            activeNav === 'assigned-to-me' ||
            activeNav === 'in-progress' ||
            activeNav === 'resolved') &&
            renderComplaintManagementView()}

          {activeNav === 'complaint-detail' && (
            <OfficerComplaintDetailView
              complaint={activeComplaintObj}
              initialMode={detailMode}
              officerProfile={officerProfile}
              onBack={() => setActiveNav('all-complaints')}
              onUpdateComplaint={handleUpdateComplaint}
              onShowToast={showOfficerToast}
            />
          )}

          {activeNav === 'map-view' && (
            <OfficerMapView
              complaints={mergedComplaints}
              onSelectComplaint={handleOpenComplaintDetail}
              onNavigateTab={(tab) => setActiveNav(tab)}
              onShowToast={showOfficerToast}
            />
          )}

          {activeNav === 'departments' && (
            <OfficerDepartmentsView
              officerProfile={officerProfile}
              complaints={mergedComplaints}
              onShowToast={showOfficerToast}
            />
          )}

          {activeNav === 'reports' && (
            <OfficerReportsView
              officerProfile={officerProfile}
              complaints={mergedComplaints}
              onShowToast={showOfficerToast}
            />
          )}

          {activeNav === 'notifications' && (
            <OfficerNotificationsView
              complaints={mergedComplaints}
              liveNotifications={notifications}
              onRefreshData={onRefreshData}
              onSelectComplaint={handleOpenComplaintDetail}
              onNavigateTab={(tab) => setActiveNav(tab)}
              onShowToast={showOfficerToast}
            />
          )}

          {activeNav === 'profile-settings' && (
            <OfficerProfileSettingsView
              officerProfile={officerProfile}
              complaints={mergedComplaints}
              onUpdateUser={handleUpdateOfficerProfile}
              onShowToast={showOfficerToast}
            />
          )}
        </main>
      </div>

      {/* Quick Dispatch Modal */}
      {isQuickDispatchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Quick Field Squad Dispatch
                  </h3>
                  <p className="text-xs text-slate-500">
                    Instant radio & GPS work order mobilization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickDispatchOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {mergedComplaints.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 text-xs">
                <div className="font-extrabold text-slate-800 text-sm">
                  No Active Complaints Available for Dispatch
                </div>
                <p className="text-slate-500">
                  Please wait for a citizen to submit an issue or switch to Citizen View to report an incident first.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Target Complaint</label>
                  <select
                    value={quickTargetId || mergedComplaints[0]?.id || ''}
                    onChange={(e) => setQuickTargetId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    {mergedComplaints.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.id} — {c.shortTitle || c.title} ({c.location})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assign Field Unit</label>
                  <select
                    value={quickSquad}
                    onChange={(e) => setQuickSquad(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value="Indore PWD Road Maintenance Squad #04 (MP09-CZ-8821)">
                      Indore PWD Road Maintenance Squad #04 (MP09-CZ-8821)
                    </option>
                    <option value="Electrical Rapid Sky-Lift Unit #02 (MP09-EL-4410)">
                      Electrical Rapid Sky-Lift Unit #02 (MP09-EL-4410)
                    </option>
                    <option value="Swachh Indore Rapid Compactor #08 (MP09-SW-1108)">
                      Swachh Indore Rapid Compactor #08 (MP09-SW-1108)
                    </option>
                    <option value="Narmada Rapid Pipe Repair Unit #03 (MP09-WT-3309)">
                      Narmada Rapid Pipe Repair Unit #03 (MP09-WT-3309)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority Dispatch Instruction</label>
                  <textarea
                    rows={2}
                    value={quickInstructions}
                    onChange={(e) => setQuickInstructions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsQuickDispatchOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              {mergedComplaints.length > 0 && (
                <button
                  onClick={async () => {
                    const targetId = quickTargetId || mergedComplaints[0]?.id;
                    if (!targetId) return;
                    await civicDataService.dispatchSquad(targetId, {
                      assignedSquad: quickSquad,
                      department: officerProfile.department || 'Roads & Infrastructure',
                      instructions: quickInstructions,
                      priority: 'High Priority',
                      slaHours: 24
                    });
                    handleUpdateComplaint(targetId, {
                      status: 'In Progress',
                      assignedSquad: quickSquad,
                      dispatchInstructions: quickInstructions
                    });
                    setIsQuickDispatchOpen(false);
                    showOfficerToast(`Dispatched ${quickSquad} to #${targetId} in Supabase!`);
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  Confirm & Mobilize Squad
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">
                IMC Smart City Command Helpdesk
              </h3>
              <button
                onClick={() => setIsSupportOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connected to <strong>{officerProfile.clusterNode}</strong> ({officerProfile.nicNode}). For urgent GIS synchronization or SLA override authorization, contact the Zonal Control Room:
            </p>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1">
              <div>Control Room: <strong>0731-2543211 (Ext. 108)</strong></div>
              <div>NIC Support Email: <strong>itcell.imc@mp.gov.in</strong></div>
            </div>
            <button
              onClick={() => setIsSupportOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
