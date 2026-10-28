import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage.jsx';
import CitizenDashboard from './components/CitizenDashboard.jsx';
import MyComplaintsPage from './components/MyComplaintsPage.jsx';
import ReportIssuePage from './components/ReportIssuePage.jsx';
import ProfileSettingsPage from './components/ProfileSettingsPage.jsx';
import OfficerDashboard from './components/OfficerDashboard.jsx';
import AuthPage from './components/AuthPage.jsx';
import ReportIssueModal from './components/ReportIssueModal.jsx';
import TicketDetailModal from './components/TicketDetailModal.jsx';
import CertificateModal from './components/CertificateModal.jsx';
import AdminLoginPage from './components/admin/AdminLoginPage.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import { civicDataService } from './services/supabaseClient.js';
import { CheckCircle2, ShieldCheck, Phone, FileText, X } from 'lucide-react';

function resolveInitialViewFromUrl(storedUser) {
  if (typeof window === 'undefined') return 'landing';
  const pathname = (window.location.pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';
  const hash = (window.location.hash || '').toLowerCase();

  const isAdminLoginRoute =
    pathname === '/civic-connect/admin/login' ||
    pathname === '/admin/login' ||
    hash.includes('/admin/login');
  const isAdminConsoleRoute =
    pathname === '/civic-connect/admin' ||
    pathname === '/admin' ||
    pathname.startsWith('/civic-connect/admin/') ||
    pathname.startsWith('/admin/') ||
    hash.includes('/admin');

  if (isAdminLoginRoute) {
    return 'admin-login';
  }
  if (isAdminConsoleRoute) {
    return storedUser?.role === 'admin' ? 'admin-dashboard' : 'admin-login';
  }
  return 'landing';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(civicDataService.getCurrentUser());
  const [activeView, setActiveView] = useState(() =>
    resolveInitialViewFromUrl(civicDataService.getCurrentUser())
  );
  const [authMode, setAuthMode] = useState('login');
  const [complaints, setComplaints] = useState([]);
  const [timelineUpdates, setTimelineUpdates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [uploadTargetTicketId, setUploadTargetTicketId] = useState('');
  const photoInputRef = useRef(null);

  // Sync browser URL changes (popstate) for isolated /civic-connect/admin/login route
  useEffect(() => {
    const handlePopState = () => {
      const nextView = resolveInitialViewFromUrl(civicDataService.getCurrentUser());
      setActiveView(nextView);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load dynamic data on mount & subscribe to background updates
  useEffect(() => {
    async function loadData() {
      const allComplaints = await civicDataService.getComplaints();
      const allNotifications = await civicDataService.getNotifications();
      const allUpdates = await civicDataService.getTimelineUpdates();
      setComplaints(allComplaints);
      setNotifications(allNotifications);
      setTimelineUpdates(allUpdates);
    }
    loadData();

    // Background Supabase realtime changes listener (silent, no UI badges)
    const unsubRealtime = civicDataService.subscribeToComplaints(() => {
      loadData();
    });

    return () => {
      if (typeof unsubRealtime === 'function') unsubRealtime();
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleSwitchUserRole = () => {
    if (currentUser?.role === 'officer' || activeView === 'officer-dashboard') {
      const citizen = civicDataService.switchToCitizen();
      setCurrentUser(citizen);
      setActiveView('my-complaints');
      showToast(`Switched to Citizen Profile: ${citizen?.name || 'Priya Sharma'}`);
    } else {
      const officer = civicDataService.switchToOfficer();
      setCurrentUser(officer);
      setActiveView('officer-dashboard');
      showToast(`Switched to Municipal Officer Profile: ${officer?.name || 'Rajesh Sharma'}`);
    }
  };

  const handleNavigate = (view) => {
    if (view === 'login') {
      setAuthMode('login');
      setActiveView('login');
    } else if (view === 'register') {
      setAuthMode('register');
      setActiveView('register');
    } else if (view === 'report-issue') {
      setActiveView('report-issue');
    } else if (view === 'profile-settings' || view === 'settings') {
      if (!currentUser) {
        const citizen = civicDataService.switchToCitizen();
        setCurrentUser(citizen);
      }
      setActiveView('profile-settings');
    } else if (view === 'history' || view === 'tracker') {
      setActiveView('my-complaints');
    } else if (view === 'notifications') {
      setActiveView(currentUser?.role === 'officer' ? 'officer-dashboard' : 'dashboard');
      showToast('Showing latest municipal notifications & alerts.');
    } else if (view === 'municipal-portal') {
      const officer = civicDataService.switchToOfficer();
      setCurrentUser(officer);
      setActiveView('officer-dashboard');
      showToast(`Entered Municipal Officer Portal: ${officer?.name || 'Rajesh Sharma'}`);
    } else if (['privacy', 'terms', 'governance', 'security', 'support', 'contact', 'help'].includes(view)) {
      setInfoModalType(view);
      return;
    } else if (['about', 'vision-engine', 'workflows', 'partnerships', 'impact-report'].includes(view)) {
      setActiveView('landing');
      setTimeout(() => {
        const targetId = view === 'impact-report' || view === 'partnerships' ? 'impact' : 'how-it-works';
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    } else if (
      [
        'landing',
        'dashboard',
        'my-complaints',
        'officer-dashboard',
        'admin-dashboard',
        'admin-login'
      ].includes(view)
    ) {
      setActiveView(view);
    } else {
      setActiveView('landing');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    civicDataService.setCurrentUser(user);
    showToast(`Welcome back, ${user?.name || 'User'}!`);
    if (user?.role === 'admin') {
      window.history.pushState({}, '', '/civic-connect/admin');
      setActiveView('admin-dashboard');
    } else if (user?.role === 'officer') {
      setActiveView('officer-dashboard');
    } else {
      setActiveView('dashboard');
    }
  };

  const handleAdminLoginSuccess = (adminUser) => {
    setCurrentUser(adminUser);
    civicDataService.setCurrentUser(adminUser);
    window.history.pushState({}, '', '/civic-connect/admin');
    setActiveView('admin-dashboard');
  };

  const handleLogout = () => {
    const wasAdmin =
      currentUser?.role === 'admin' ||
      activeView === 'admin-dashboard' ||
      activeView === 'admin-login';
    civicDataService.logout();
    setCurrentUser(null);
    if (wasAdmin) {
      window.history.pushState({}, '', '/civic-connect/admin/login');
      setActiveView('admin-login');
      showToast('Signed out of CIRRS Admin Console.');
    } else {
      window.history.pushState({}, '', '/');
      setActiveView('landing');
      showToast('Signed out successfully.');
    }
  };

  const handleUpdateCurrentUser = async (updatedUser) => {
    const syncedUser = await civicDataService.updateProfile(updatedUser);
    setCurrentUser(syncedUser);
    showToast('Profile & preferences updated successfully.');
  };

  const handleMarkAllNotificationsRead = async () => {
    const updated = await civicDataService.markAllNotificationsRead();
    setNotifications(updated);
    showToast('All notifications and updates marked as read.');
  };

  const handleReportSubmitSuccess = async (complaintData) => {
    const newComplaint = await civicDataService.submitComplaint(complaintData);
    const updatedComplaints = await civicDataService.getComplaints();
    const updatedNotifications = await civicDataService.getNotifications();
    const updatedTimeline = await civicDataService.getTimelineUpdates();
    setComplaints(updatedComplaints);
    setNotifications(updatedNotifications);
    setTimelineUpdates(updatedTimeline);
    showToast(`Ticket #${newComplaint.id} submitted! Auto-routed to ${newComplaint.assignedTeam}`);
    setActiveView('my-complaints');
  };

  const refreshAllCivicData = async (focusTicketId = '') => {
    const [updatedComplaints, updatedNotifications, updatedTimeline] = await Promise.all([
      civicDataService.getComplaints(),
      civicDataService.getNotifications(),
      civicDataService.getTimelineUpdates()
    ]);
    setComplaints(updatedComplaints);
    setNotifications(updatedNotifications);
    setTimelineUpdates(updatedTimeline);
    const targetId = focusTicketId || selectedTicket?.id;
    if (targetId && selectedTicket) {
      const clean = String(targetId).replace(/^#/, '');
      const refreshed = updatedComplaints.find((c) => c.id === clean);
      if (refreshed) setSelectedTicket(refreshed);
    }
    return updatedComplaints;
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    await civicDataService.updateTicketStatus(ticketId, newStatus);
    await refreshAllCivicData(ticketId);
    showToast(`Ticket #${String(ticketId).replace(/^#/, '')} status updated to ${newStatus}`);
  };

  const handleUpvoteTicket = async (ticketId) => {
    const cleanId = String(ticketId || '').replace(/^#/, '');
    if (!cleanId) return;
    const res = await civicDataService.upvoteComplaint(cleanId);
    await refreshAllCivicData(cleanId);
    showToast(`Upvoted Ticket #${cleanId} (${res?.upvotes || 'Verified'} citizen votes)`);
  };

  const handleAddTicketComment = async (ticketId, noteText, roleLabel = 'Citizen Comment') => {
    const cleanId = String(ticketId || '').replace(/^#/, '');
    if (!cleanId || !noteText?.trim()) return;
    await civicDataService.addWorkLog(cleanId, {
      author: currentUser?.name || 'Priya Sharma (Citizen)',
      role: roleLabel,
      badge: roleLabel === 'Citizen Inquiry' ? 'Officer Contact' : 'Citizen Feedback',
      note: noteText.trim()
    });
    await refreshAllCivicData(cleanId);
    showToast(`Note added & synced to Ticket #${cleanId}`);
  };

  const handleTrackTicket = (ticketId) => {
    const cleanId = (ticketId || '').replace(/^#/, '').trim().toUpperCase();
    const ticket = complaints.find(
      (c) => c.id.toUpperCase() === cleanId || c.title.toLowerCase().includes(cleanId.toLowerCase())
    );
    if (ticket) {
      setSelectedTicket(ticket);
    } else if (complaints.length > 0) {
      setSelectedTicket(complaints[0]);
      showToast(`Showing active Ticket #${complaints[0].id}`);
    } else {
      showToast('No tickets created yet. Report an issue to start tracking!');
    }
  };

  const handleUploadPhotos = (ticketId) => {
    const cleanId = String(ticketId || selectedTicket?.id || complaints[0]?.id || '').replace(/^#/, '');
    if (!cleanId) {
      showToast('Create or select a complaint ticket first before attaching photos.');
      return;
    }
    setUploadTargetTicketId(cleanId);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
      photoInputRef.current.click();
    }
  };

  const handlePhotoFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetTicketId) return;
    try {
      showToast(`Uploading geotagged photo for Ticket #${uploadTargetTicketId}...`);
      await civicDataService.uploadEvidencePhoto(uploadTargetTicketId, file, {
        author: currentUser?.name || 'Priya Sharma',
        role: currentUser?.role === 'officer' ? 'Municipal Field Engineer' : 'Citizen Reporter',
        note: `Uploaded new evidence photo (${file.name}) with EXIF verification.`
      });
      await refreshAllCivicData(uploadTargetTicketId);
      showToast(`Photo uploaded & attached to Ticket #${uploadTargetTicketId}!`);
    } catch (err) {
      showToast(`Photo upload error: ${err.message || 'Could not process image'}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* Hidden Global Evidence Photo File Picker */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoFileSelected}
      />
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main View Router */}
      {activeView === 'my-complaints' && (
        <MyComplaintsPage
          currentUser={currentUser}
          complaints={complaints}
          timelineUpdates={timelineUpdates}
          notifications={notifications}
          onNavigate={handleNavigate}
          onOpenReportModal={() => setActiveView('report-issue')}
          onSelectTicket={(ticket) => setSelectedTicket(ticket)}
          onOpenCertificate={() => setIsCertificateModalOpen(true)}
          onSwitchUserRole={handleSwitchUserRole}
          onUploadPhotos={handleUploadPhotos}
          onAddTicketComment={handleAddTicketComment}
          onUpvoteTicket={handleUpvoteTicket}
          onMarkNotificationsRead={handleMarkAllNotificationsRead}
          onShowToast={showToast}
          onLogout={handleLogout}
        />
      )}

      {activeView === 'report-issue' && (
        <ReportIssuePage
          currentUser={currentUser}
          notifications={notifications}
          onNavigate={handleNavigate}
          onSubmitSuccess={handleReportSubmitSuccess}
          onShowToast={showToast}
        />
      )}

      {activeView === 'profile-settings' && (
        <ProfileSettingsPage
          currentUser={currentUser}
          notifications={notifications}
          onNavigate={handleNavigate}
          onSwitchUserRole={handleSwitchUserRole}
          onUpdateCurrentUser={handleUpdateCurrentUser}
          onShowToast={showToast}
          onLogout={handleLogout}
        />
      )}

      {activeView === 'landing' && (
        <LandingPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onOpenReportModal={() => setActiveView('report-issue')}
          onTrackTicket={handleTrackTicket}
        />
      )}

      {activeView === 'dashboard' && (
        <CitizenDashboard
          currentUser={currentUser}
          complaints={complaints}
          notifications={notifications}
          onNavigate={handleNavigate}
          onOpenReportModal={() => setActiveView('report-issue')}
          onSelectTicket={(ticket) => setSelectedTicket(ticket)}
          onOpenCertificate={() => setIsCertificateModalOpen(true)}
          onSwitchUserRole={handleSwitchUserRole}
          onUploadPhotos={handleUploadPhotos}
          onMarkNotificationsRead={handleMarkAllNotificationsRead}
          onLogout={handleLogout}
        />
      )}

      {activeView === 'officer-dashboard' && (
        <OfficerDashboard
          currentUser={currentUser}
          complaints={complaints}
          notifications={notifications}
          onNavigate={handleNavigate}
          onSelectTicket={(ticket) => setSelectedTicket(ticket)}
          onStatusChange={handleStatusChange}
          onRefreshData={refreshAllCivicData}
          onSwitchUserRole={handleSwitchUserRole}
          onLogout={handleLogout}
          onUpdateCurrentUser={handleUpdateCurrentUser}
        />
      )}

      {(activeView === 'login' || activeView === 'register') && (
        <AuthPage
          initialMode={authMode}
          onNavigate={handleNavigate}
          onLoginSuccess={handleLoginSuccess}
          onShowToast={showToast}
        />
      )}

      {activeView === 'admin-login' && (
        <AdminLoginPage
          onAdminLoginSuccess={handleAdminLoginSuccess}
          onShowToast={showToast}
        />
      )}

      {activeView === 'admin-dashboard' && (
        <AdminDashboard
          currentUser={currentUser}
          liveComplaints={complaints}
          liveNotifications={notifications}
          onLogout={handleLogout}
          onShowToast={showToast}
        />
      )}

      {/* Modals */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitSuccess={handleReportSubmitSuccess}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        currentUser={currentUser}
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        onStatusChange={handleStatusChange}
        onUploadPhotos={handleUploadPhotos}
        onAddTicketComment={handleAddTicketComment}
        onUpvoteTicket={handleUpvoteTicket}
      />

      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        user={currentUser}
        complaints={complaints}
      />

      {/* Official Governance, Privacy, Terms & Citizen Support Modal */}
      {infoModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  {['support', 'contact', 'help'].includes(infoModalType) ? (
                    <Phone className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {infoModalType === 'privacy' && 'Municipal Privacy & Data Protection Policy'}
                    {infoModalType === 'terms' && 'Terms of Service & Citizen Charter'}
                    {(infoModalType === 'governance' || infoModalType === 'security') && 'ISO 27001 & MeitY GovCloud Governance'}
                    {['support', 'contact', 'help'].includes(infoModalType) && '24/7 Municipal Citizen Support Desk'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Indore Municipal Corporation • Civic Connect Portal</p>
                </div>
              </div>
              <button
                onClick={() => setInfoModalType(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              {['support', 'contact', 'help'].includes(infoModalType) ? (
                <>
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1.5">
                    <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Toll-Free Municipal Helpline</div>
                    <div className="text-xl font-extrabold text-slate-900">1800-233-5555</div>
                    <div className="text-[11px] text-slate-600">Available 24/7 across all 85 Wards • Direct Control Room Dispatch</div>
                  </div>
                  <p>
                    For urgent civic hazards (open manholes, live electrical wire faults, or main pipeline bursts), our central command desk routes priority alerts directly to zonal field engineers within 15 minutes.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700">
                    Control Room Email: helpdesk@indoremunicipal.gov.in
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Civic Connect operates under the <strong>Digital Personal Data Protection (DPDP) Act</strong> and the <strong>Municipal Citizen Charter</strong>. All citizen reports, EXIF geolocation coordinates, and photographic evidence are encrypted end-to-end.
                  </p>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Statutory SLA Commitments</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600">
                      <li>Priority 1 (Public Safety & Hazards): 24-Hour Resolution Target</li>
                      <li>Priority 2 (Sanitation, Streetlights & Water): 48-Hour Resolution Target</li>
                      <li>Mandatory Before/After Geotagged Photo Verification prior to ticket closure</li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setInfoModalType(null)}
                className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
