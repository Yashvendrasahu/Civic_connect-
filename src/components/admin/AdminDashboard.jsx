import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  AlertTriangle,
  Building2,
  Users,
  Cpu,
  BarChart3,
  Bell,
  Settings,
  Search,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Lock
} from 'lucide-react';
import AdminOverviewView from './AdminOverviewView.jsx';
import AdminComplaintsView from './AdminComplaintsView.jsx';
import AdminComplaintDossierView from './AdminComplaintDossierView.jsx';
import AdminMunicipalityView from './AdminMunicipalityView.jsx';
import AdminCitizenView from './AdminCitizenView.jsx';
import AdminAiAnalyticsView from './AdminAiAnalyticsView.jsx';
import AdminReportsView from './AdminReportsView.jsx';
import {
  ADMIN_REFERENCE_MUNICIPALITIES,
  ADMIN_REFERENCE_COMPLAINTS,
  ADMIN_REFERENCE_CITIZENS
} from './adminReferenceData.js';
import { civicDataService } from '../../services/supabaseClient.js';

export default function AdminDashboard({
  currentUser,
  liveComplaints = [],
  liveNotifications = [],
  onLogout,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'complaints' | 'municipalities' | 'citizens' | 'ai-analytics' | 'reports' | 'notifications' | 'settings'
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');

  // State combining live database records + reference analytics dataset
  const [municipalities, setMunicipalities] = useState(ADMIN_REFERENCE_MUNICIPALITIES);
  const [officers, setOfficers] = useState([]);
  const [citizens, setCitizens] = useState(ADMIN_REFERENCE_CITIZENS);
  const [adminComplaints, setAdminComplaints] = useState(ADMIN_REFERENCE_COMPLAINTS);

  const loadAdminBackendState = async () => {
    try {
      const overviewData = await civicDataService.getAdminOverview();
      if (overviewData) {
        if (Array.isArray(overviewData.officers)) {
          setOfficers(overviewData.officers);
        }
        if (Array.isArray(overviewData.municipalities) && overviewData.municipalities.length > 0) {
          setMunicipalities(overviewData.municipalities);
        }
        if (Array.isArray(overviewData.citizens) && overviewData.citizens.length > 0) {
          setCitizens(overviewData.citizens);
        }
        if (Array.isArray(overviewData.complaints) && overviewData.complaints.length > 0) {
          setAdminComplaints(overviewData.complaints);
        }
      }
    } catch (e) {
      // Fallback merges liveComplaints with reference complaints
    }
  };

  useEffect(() => {
    loadAdminBackendState();
  }, [liveComplaints.length]);

  // Combine live user-submitted complaints with reference complaints
  const mergedComplaints = React.useMemo(() => {
    const existingIds = new Set(adminComplaints.map((c) => String(c.id).replace(/^#/, '')));
    const normalizedLive = (liveComplaints || [])
      .filter((lc) => !existingIds.has(String(lc.id).replace(/^#/, '')))
      .map((lc) => ({
        ...lc,
        id: lc.id.startsWith('CMP-') || lc.id.startsWith('CC') ? lc.id : `CMP-${lc.id}`,
        municipality: lc.municipality || lc.location?.split(',')[0] || 'Indore',
        municipalityFull: lc.municipalityFull || 'Indore Municipal Corporation',
        reportedDate: lc.reportedDate || lc.reported || 'Today',
        aiConfidence: parseInt(String(lc.confidence || '94'), 10) || 94
      }));
    return [...normalizedLive, ...adminComplaints];
  }, [liveComplaints, adminComplaints]);

  const pendingOfficerCount = officers.filter((o) => !o.adminVerified).length;

  const handleSelectComplaint = (complaint) => {
    setSelectedDossier(complaint);
    setActiveTab('complaints');
  };

  const handleSelectComplaintById = (complaintId) => {
    const clean = String(complaintId || '').replace(/^#/, '');
    const found =
      mergedComplaints.find(
        (c) => c.id === clean || c.id === `CMP-${clean}` || c.id.replace('CMP-', '') === clean
      ) || mergedComplaints[0];
    if (found) {
      setSelectedDossier(found);
      setActiveTab('complaints');
    }
  };

  const handleUpdateDossier = async (complaintId, patch) => {
    await civicDataService.updateAdminComplaintDossier(complaintId, patch);
    setAdminComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, ...patch } : c))
    );
    if (selectedDossier && selectedDossier.id === complaintId) {
      setSelectedDossier((prev) => ({ ...prev, ...patch }));
    }
    await loadAdminBackendState();
  };

  const handleStatusChange = async (complaintId, nextStatus) => {
    await handleUpdateDossier(complaintId, { status: nextStatus });
    if (onShowToast) {
      onShowToast(`Updated ${complaintId} status to ${nextStatus}`);
    }
  };

  const handleBatchUpdate = async ({ ids = [], department, status }) => {
    await civicDataService.batchUpdateComplaints({ ids, department, status });
    setAdminComplaints((prev) =>
      prev.map((c) =>
        ids.includes(c.id)
          ? {
              ...c,
              department: department || c.department,
              status: status || c.status
            }
          : c
      )
    );
  };

  const handleVerifyOfficer = async (officerId, payload) => {
    const res = await civicDataService.verifyMunicipalOfficer(officerId, payload);
    await loadAdminBackendState();
    if (onShowToast) {
      onShowToast(
        res?.message ||
          (payload.action === 'approve'
            ? 'Municipal Officer verified & approved! Officer can now log in.'
            : `Municipal Officer account ${payload.action}ed and active sessions revoked.`)
      );
    }
  };

  const handleAddMunicipality = async (munData) => {
    const created = await civicDataService.addMunicipality(munData);
    if (created) {
      setMunicipalities((prev) => [created, ...prev]);
    }
    if (onShowToast) {
      onShowToast(`Onboarded ${munData.name} into CIRRS network`);
    }
  };

  const handleUpdateMunicipalityStatus = async (munId, patch) => {
    setMunicipalities((prev) =>
      prev.map((m) => (m.id === munId ? { ...m, ...patch } : m))
    );
    if (onShowToast) {
      onShowToast(`Updated municipality ${munId} status to ${patch.verification}`);
    }
  };

  const handleUpdateCitizenStatus = async (citizenId, patch) => {
    await civicDataService.updateCitizenStatus(citizenId, patch);
    setCitizens((prev) =>
      prev.map((c) => (c.id === citizenId ? { ...c, ...patch } : c))
    );
    if (onShowToast) {
      onShowToast(`Citizen ${citizenId} account status updated to ${patch.accountStatus}`);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'complaints', label: 'Complaint Management', icon: AlertTriangle },
    {
      id: 'municipalities',
      label: 'Municipality Management',
      icon: Building2,
      badge: pendingOfficerCount > 0 ? pendingOfficerCount : null
    },
    { id: 'citizens', label: 'Citizen Management', icon: Users },
    { id: 'ai-analytics', label: 'AI Analytics', icon: Cpu },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: 5 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getBreadcrumbLabel = () => {
    if (activeTab === 'complaints' && selectedDossier) {
      return `Complaint Management / ${selectedDossier.id}`;
    }
    const found = navItems.find((n) => n.id === activeTab);
    return found ? found.label : 'Overview';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-['Plus_Jakarta_Sans',sans-serif]">
      {/* LEFT DARK NAVY SIDEBAR (#0F172A) matching all 7 reference images */}
      <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 select-none">
        <div>
          {/* Brand Header */}
          <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-extrabold shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white tracking-tight leading-none">
                CIRRS Admin
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Civic Connect Console</div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id !== 'complaints') {
                      setSelectedDossier(null);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1E293B] text-white border border-slate-700/80 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-blue-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Admin Profile Card */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-[#1E293B]/90 border border-slate-700/70 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                SA
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser?.name || 'System Administrator'}
                </div>
                <div className="text-[10px] text-emerald-400 truncate">Platform Admin</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="Sign Out of Admin Console"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Contextual Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
          {/* Zone 1: Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <span
              onClick={() => {
                setActiveTab('overview');
                setSelectedDossier(null);
              }}
              className="text-slate-400 hover:text-slate-700 font-medium cursor-pointer"
            >
              Admin
            </span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900">{getBreadcrumbLabel()}</span>
          </div>

          {/* Zone 2: Global Search + Live Network Sync Pill */}
          <div className="flex items-center gap-4 flex-1 max-w-2xl justify-end">
            <div className="hidden xl:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Live Network Sync · 14 Municipalities Online</span>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && globalSearch.trim()) {
                    setActiveTab('complaints');
                    setSelectedDossier(null);
                  }
                }}
                placeholder="Search complaints, municipalities, cit..."
                className="w-full pl-8 pr-10 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/60 focus:bg-white focus:outline-hidden focus:border-blue-600"
              />
              <span className="absolute right-2.5 top-1.5 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-400">
                ⌘K
              </span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
            </button>

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                A
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-none">
                  {currentUser?.name || 'System Admin'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {currentUser?.email || 'cirrs-hq@gov.in'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Viewport Canvas */}
        <main className="p-6 lg:p-8 flex-1 max-w-[1440px] w-full mx-auto">
          {activeTab === 'overview' && (
            <AdminOverviewView
              complaints={mergedComplaints}
              municipalities={municipalities}
              onSelectComplaint={handleSelectComplaint}
              onNavigateTab={(tab) => {
                setSelectedDossier(null);
                setActiveTab(tab);
              }}
              onExportCsv={(f, r) => civicDataService.exportToCsv(f, r)}
              onShowToast={onShowToast}
            />
          )}

          {activeTab === 'complaints' && !selectedDossier && (
            <AdminComplaintsView
              complaints={mergedComplaints}
              onSelectComplaint={handleSelectComplaint}
              onStatusChange={handleStatusChange}
              onBatchUpdate={handleBatchUpdate}
              onExportCsv={(f, r) => civicDataService.exportToCsv(f, r)}
              onRefresh={loadAdminBackendState}
              onShowToast={onShowToast}
            />
          )}

          {activeTab === 'complaints' && selectedDossier && (
            <AdminComplaintDossierView
              complaint={selectedDossier}
              onBack={() => setSelectedDossier(null)}
              onUpdateDossier={handleUpdateDossier}
              onExportCsv={(f, r) => civicDataService.exportToCsv(f, r)}
              onShowToast={onShowToast}
            />
          )}

          {activeTab === 'municipalities' && (
            <AdminMunicipalityView
              municipalities={municipalities}
              officers={officers}
              onVerifyOfficer={handleVerifyOfficer}
              onAddMunicipality={handleAddMunicipality}
              onUpdateMunicipalityStatus={handleUpdateMunicipalityStatus}
              onExportCsv={(f, r) => civicDataService.exportToCsv(f, r)}
              onRefresh={loadAdminBackendState}
              onShowToast={onShowToast}
            />
          )}

          {activeTab === 'citizens' && (
            <AdminCitizenView
              citizens={citizens}
              onUpdateCitizenStatus={handleUpdateCitizenStatus}
              onSelectComplaintId={handleSelectComplaintById}
              onExportCsv={(f, r) => civicDataService.exportToCsv(f, r)}
              onRefresh={loadAdminBackendState}
              onShowToast={onShowToast}
            />
          )}

          {activeTab === 'ai-analytics' && (
            <AdminAiAnalyticsView
              complaints={mergedComplaints}
              onSelectComplaintId={handleSelectComplaintById}
              onExportCsv={(f, r) => civicDataService.exportToCsv(f, r)}
              onShowToast={onShowToast}
            />
          )}

          {activeTab === 'reports' && (
            <AdminReportsView
              municipalities={municipalities}
              complaints={mergedComplaints}
              onExportCsv={(f, r) => civicDataService.exportToCsv(f, r)}
              onShowToast={onShowToast}
            />
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900">
                    Platform Admin Notifications &amp; Audit Feed
                  </h1>
                  <p className="text-xs text-slate-500">
                    Real-time alerts for Municipal Officer verification requests, SLA escalations, and AI anomalies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onShowToast && onShowToast('Marked all admin alerts as read')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
                >
                  Mark All Read
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {officers
                  .filter((o) => !o.adminVerified)
                  .map((off) => (
                    <div
                      key={off.id}
                      className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          New Municipal Officer Verification Pending: {off.name} ({off.email})
                        </div>
                        <div className="text-slate-600 mt-0.5">
                          Municipality: {off.city} · Department: {off.department} · Email Verified:{' '}
                          {off.isVerified ? 'Yes' : 'Pending'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('municipalities')}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shrink-0"
                      >
                        Review in Queue
                      </button>
                    </div>
                  ))}

                {[
                  {
                    id: 'AN-1',
                    title: 'High-Priority Road Hazard Escalated (CMP-10245)',
                    desc: 'Seoni Municipal Council · Ward 14 main bus stand pothole flagged at 92% AI confidence.',
                    time: '15 mins ago'
                  },
                  {
                    id: 'AN-2',
                    title: 'Municipal Officer Account Verification Enforced',
                    desc: 'Two-tier verification gate active across all 14 connected municipal nodes.',
                    time: '1 hour ago'
                  },
                  {
                    id: 'AN-3',
                    title: 'Daily MeitY GovCloud Snapshot Completed',
                    desc: 'Encrypted database backup and SLA audit ledger archived.',
                    time: '3 hours ago'
                  }
                ].map((n) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{n.title}</div>
                      <div className="text-slate-500 mt-0.5">{n.desc}</div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">
                  CIRRS Platform Governance &amp; Security Settings
                </h1>
                <p className="text-xs text-slate-500">
                  Manage two-tier Municipal Officer verification rules, isolated admin route policies, and SLA thresholds.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Two-Tier Municipal Officer Verification</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Mandatory email verification + Super Admin approval in Municipality Management before any Municipal Officer account can sign in.
                  </p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    Strictly Enforced
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span>Isolated Super Admin Gateway URL</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Admin login is hidden from public navigation and accessible exclusively via{' '}
                    <code className="font-mono text-blue-700">/civic-connect/admin/login</code>.
                  </p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                    Active Route Isolation
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
