import React, { useState } from 'react';
import CivicLogo from './CivicLogo.jsx';
import Footer from './Footer.jsx';
import {
  Bell,
  MapPin,
  ChevronDown,
  Sparkles,
  Camera,
  ClipboardList,
  Folder,
  Hourglass,
  Users,
  CheckCircle2,
  Wrench,
  Clock,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Award,
  Download,
  Upload,
  AlertCircle,
  FileCheck,
  Building2,
  ExternalLink,
  LogOut,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';

export default function CitizenDashboard({
  currentUser,
  complaints,
  notifications,
  onNavigate,
  onOpenReportModal,
  onSelectTicket,
  onOpenCertificate,
  onSwitchUserRole,
  onUploadPhotos,
  onMarkNotificationsRead,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tableFilter, setTableFilter] = useState('all'); // 'all' | 'active' | 'resolved'
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // Filter complaints for recent table
  const filteredComplaints = complaints.filter(item => {
    if (tableFilter === 'active') return item.status !== 'Resolved';
    if (tableFilter === 'resolved') return item.status === 'Resolved';
    return true;
  });

  // Dynamic KPI counters from live complaints array
  const totalCount = complaints.length;
  const activeCount = complaints.filter(c => c.status !== 'Resolved').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const resolutionRatio = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;
  const impactScore = totalCount > 0 ? Math.min(100, 80 + resolvedCount * 5 + totalCount * 2) : 0;

  // Featured ticket is latest active or first complaint
  const featuredTicket = complaints.find(c => c.status !== 'Resolved') || complaints[0] || null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. TOP NAVBAR (100% Match with Citizen - Dashboard.png) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between">
          {/* Logo with full subtitle */}
          <CivicLogo 
            subtitle="Civic Issue Reporting & Resolution System" 
            onClick={() => onNavigate('landing')}
          />

          {/* Center Tabs */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'text-blue-600 bg-blue-50/80 border border-blue-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('my-complaints')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'complaints'
                  ? 'text-blue-600 bg-blue-50/80 border border-blue-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>My Complaints</span>
            </button>

            <button
              onClick={() => onNavigate('report-issue')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Report Issue</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('history');
                setTableFilter('resolved');
                const el = document.getElementById('recent-complaints-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'text-blue-600 bg-blue-50/80 border border-blue-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>History</span>
            </button>
          </nav>

          {/* Right Controls: Notification & Profile Pill */}
          <div className="flex items-center gap-3 relative">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all cursor-pointer relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#2563eb] text-white rounded-full text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown popover */}
              {showNotificationPopup && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="font-bold text-sm text-slate-900">Notifications</div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && onMarkNotificationsRead && (
                        <button
                          onClick={onMarkNotificationsRead}
                          className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {unreadCount} unread
                      </span>
                    </div>
                  </div>
                  <div className="py-2 space-y-2.5 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No notifications yet. Submit a report to receive real-time updates.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-colors text-xs space-y-1">
                          <div className="font-bold text-slate-900 flex justify-between">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <button 
                    onClick={() => setShowNotificationPopup(false)}
                    className="w-full mt-2 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 py-1 cursor-pointer"
                  >
                    Close panel
                  </button>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white font-bold text-xs flex items-center justify-center">
                  {currentUser?.initials || 'PS'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser?.name || 'Priya Sharma'}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-0.5 leading-tight">
                    <MapPin className="w-2.5 h-2.5 text-slate-400" />
                    <span>{currentUser?.city ? currentUser.city.split(',')[0] + ', MP' : 'Indore, MP'}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                  <div className="p-3 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{currentUser?.name || 'Priya Sharma'}</div>
                    <div className="text-[11px] text-slate-500">{currentUser?.email || 'priya.sharma@example.com'}</div>
                    <div className="text-[10px] text-blue-600 font-mono mt-1 font-semibold">{currentUser?.ward || 'Ward 18, Zone 4'}</div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('profile-settings');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Profile & Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenCertificate();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Download Civic Certificate</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('landing');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      <span>Public Landing Page</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onLogout) onLogout();
                        else onNavigate('login');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-100 bg-slate-50/80 text-[11px] font-semibold text-slate-600 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'dashboard' ? 'text-blue-600 bg-white shadow-2xs font-bold' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('my-complaints')}
            className="px-3 py-1.5 rounded-lg whitespace-nowrap text-slate-700 hover:text-blue-600 font-semibold"
          >
            My Complaints
          </button>
          <button
            onClick={() => onNavigate('report-issue')}
            className="px-3 py-1.5 rounded-lg text-blue-600 bg-blue-50 font-bold whitespace-nowrap"
          >
            + Report
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setTableFilter('resolved');
              const el = document.getElementById('recent-complaints-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'history' ? 'text-blue-600 bg-white shadow-2xs font-bold' : ''
            }`}
          >
            History
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* 2. WELCOME BANNER + CITY BADGE (Screenshot exact replica) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Welcome back, {currentUser?.name || 'Priya Sharma'}</span>
              <span>👋</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your reported issues, stay updated in real time, and help build a smarter, safer community.
            </p>
          </div>

          {/* Right City Ward Badge */}
          <div className="self-start md:self-auto flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser?.city || 'Indore, Madhya Pradesh'}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                {currentUser?.ward || 'Ward 18, Zone 4'} • Citizen ID {currentUser?.citizenId || '#IND-8841'}
              </div>
            </div>
          </div>
        </div>

        {/* 3. AI CALLOUT HERO CARD */}
        <div className="relative rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/60 border border-blue-100 p-6 sm:p-8 overflow-hidden shadow-2xs">
          {/* Faded watermark gear / magnifier illustration on right */}
          <div className="absolute -right-6 -bottom-8 w-48 h-48 opacity-10 pointer-events-none text-blue-900">
            <svg viewBox="0 0 200 200" fill="currentColor">
              <circle cx="90" cy="90" r="50" fill="none" stroke="currentColor" strokeWidth="18" />
              <rect x="120" y="120" width="60" height="20" rx="10" transform="rotate(45 120 120)" />
              <circle cx="90" cy="90" r="22" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="10 10" />
            </svg>
          </div>

          <div className="relative z-10 max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-blue-200 text-xs font-semibold text-blue-700 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI-Powered Municipal Dispatch & Verification</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              See something in your neighborhood that needs attention?
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Report a pothole, street light outage, sanitation issue, or water leakage. Our computer vision AI verifies and auto-routes tickets to municipal crews in minutes.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-xs shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Report an Issue</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  Avg response time: <strong className="text-slate-900">2.4 hours</strong> • Verified by Indore Municipal Corporation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. THREE QUICK ACTION TILES (Screenshot accurate) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tile 1 */}
          <div 
            onClick={() => onNavigate('report-issue')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Report Issue</h3>
                <p className="text-xs text-slate-500 mt-0.5">Capture photo & report new issue</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>

          {/* Tile 2 */}
          <div 
            onClick={() => onNavigate('my-complaints')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">My Complaints</h3>
                <p className="text-xs text-slate-500 mt-0.5">View {activeCount} active municipal tickets</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>

          {/* Tile 3 */}
          <div 
            onClick={() => setShowNotificationPopup(true)}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                <p className="text-xs text-slate-500 mt-0.5">Check latest progress updates ({unreadCount} unread)</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* 5. FOUR SUMMARY STAT CARDS (Dynamic values) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Complaints */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Total Complaints</span>
              <Folder className="w-4 h-4 text-slate-400" />
            </div>
            <div className="my-3 flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {String(totalCount).padStart(2, '0')}
              </span>
              <span className="text-xs font-medium text-slate-400">All Time</span>
            </div>
            <div className="w-full bg-slate-900 h-1 rounded-full"></div>
          </div>

          {/* Active */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Active</span>
              <Hourglass className="w-4 h-4 text-sky-500" />
            </div>
            <div className="my-3 flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#0284c7] tracking-tight">
                {String(activeCount).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                In Queue
              </span>
            </div>
            <div className="w-full bg-[#0284c7] h-1 rounded-full"></div>
          </div>

          {/* In Progress */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>In Progress</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="my-3 flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#2563eb] tracking-tight">
                {String(inProgressCount).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Crew on site
              </span>
            </div>
            <div className="w-full bg-[#2563eb] h-1 rounded-full"></div>
          </div>

          {/* Resolved */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="my-3 flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#0d9488] tracking-tight">
                {String(resolvedCount).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                {resolutionRatio}% Ratio
              </span>
            </div>
            <div className="w-full bg-[#0d9488] h-1 rounded-full"></div>
          </div>
        </div>

        {/* 6. FEATURED ACTIVE TICKET CARD with 5-Step Stepper or Empty State */}
        {featuredTicket ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              {/* Left Ticket Title & Details */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                      #{featuredTicket.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-100">
                      {featuredTicket.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-xs border border-rose-100">
                      Priority: {featuredTicket.priority}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {featuredTicket.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {featuredTicket.location}
                    </span>
                    <span>•</span>
                    <span>{featuredTicket.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Reported: {featuredTicket.reported || featuredTicket.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-700 pt-0.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-medium">Assigned: {featuredTicket.assignedTeam}</span>
                  </div>
                </div>
              </div>

              {/* Right Buttons: Upload Photos & View Ticket Details */}
              <div className="flex items-center gap-3 self-start lg:self-center">
                <button
                  onClick={() => onUploadPhotos(featuredTicket.id)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photos</span>
                </button>

                <button
                  onClick={() => onSelectTicket(featuredTicket)}
                  className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <span>View Ticket Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stepper Progress Timeline (5 Steps: 1. Submitted, 2. AI Verified, 3. Assigned, 4. In Progress, 5. Resolved) */}
            <div className="pt-8 pb-3 overflow-x-auto">
              <div className="min-w-[620px] grid grid-cols-5 relative">
                {/* Solid Blue Line for steps 1-4 */}
                <div className="absolute top-4 left-[10%] right-[30%] h-0.5 bg-blue-600 z-0"></div>
                {/* Dotted Gray Line for step 4 to 5 */}
                <div className="absolute top-4 left-[70%] right-[10%] h-0.5 border-t-2 border-dotted border-slate-300 z-0"></div>

                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2.5">1. Submitted</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Confirmed</span>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2.5">2. AI Verified</span>
                  <span className="text-[11px] text-blue-600 font-medium mt-0.5">{featuredTicket.confidence || '98.4%'} Confidence</span>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2.5">3. Assigned</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">{featuredTicket.department}</span>
                </div>

                {/* Step 4 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs ring-4 ring-blue-100">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 mt-2.5">4. In Progress</span>
                  <span className="text-[11px] text-blue-600 font-semibold mt-0.5">Crew Dispatched on Site</span>
                </div>

                {/* Step 5 */}
                <div className={`relative z-10 flex flex-col items-center text-center ${featuredTicket.status === 'Resolved' ? '' : 'opacity-60'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    featuredTicket.status === 'Resolved'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border-2 border-dashed border-slate-300 text-slate-400'
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 mt-2.5">5. Resolved</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    {featuredTicket.status === 'Resolved' ? 'Verified & Closed' : 'Awaiting Final Verification'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Active Civic Tickets Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your database starts completely clean. Report your first neighborhood issue to trigger AI verification, SLA tracking, and live municipal dispatch.
            </p>
            <button
              onClick={() => onNavigate('report-issue')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
            >
              <Camera className="w-4 h-4" />
              <span>Report Your First Issue</span>
            </button>
          </div>
        )}

        {/* 7. RECENT COMPLAINTS TABLE */}
        <div id="recent-complaints-section" className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Table Header Row */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Complaints</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of your municipal tickets and verification logs
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100/70 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setTableFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  tableFilter === 'all'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setTableFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  tableFilter === 'active'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setTableFilter('resolved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  tableFilter === 'resolved'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Resolved ({resolvedCount})
              </button>
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">TICKET ID</th>
                  <th className="py-3 px-6">ISSUE TITLE & CATEGORY</th>
                  <th className="py-3 px-6">LOCATION</th>
                  <th className="py-3 px-6">REPORTED</th>
                  <th className="py-3 px-6">STATUS</th>
                  <th className="py-3 px-6 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 px-6 text-center text-xs text-slate-400">
                      No complaints found in this view. Click &ldquo;Report an Issue&rdquo; to submit a new municipal ticket.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.slice(0, 6).map((item) => (
                    <tr 
                      key={item.id} 
                      onClick={() => onSelectTicket(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Ticket ID */}
                      <td className="py-4 px-6 font-mono font-bold text-blue-600">
                        #{item.id}
                      </td>

                      {/* Title & Category */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.category}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-6 text-slate-600 flex items-center gap-1.5 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span>{item.location}</span>
                      </td>

                      {/* Reported */}
                      <td className="py-4 px-6 text-slate-500">
                        {item.reported || item.timestamp}
                      </td>

                      {/* Status Pill */}
                      <td className="py-4 px-6">
                        {item.status === 'In Progress' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            In Progress
                          </span>
                        )}
                        {item.status === 'Resolved' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                            Resolved
                          </span>
                        )}
                        {item.status === 'Assigned' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                            Assigned
                          </span>
                        )}
                        {item.status !== 'In Progress' && item.status !== 'Resolved' && item.status !== 'Assigned' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            {item.status || 'Submitted'}
                          </span>
                        )}
                      </td>

                      {/* Action Arrow */}
                      <td className="py-4 px-6 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all inline-block" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Link */}
          <div className="p-4 border-t border-slate-100 text-center bg-slate-50/30">
            <button 
              onClick={() => onNavigate('my-complaints')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>View All {totalCount} Complaints</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 8. BOTTOM SPLIT: ACTIVITY & ALERTS + YOUR CIVIC IMPACT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Card: Activity & Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Activity & Alerts</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {unreadCount} Unread
                </span>
              </div>

              {/* Notifications Timeline List */}
              <div className="py-5 space-y-5">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No activity alerts yet. New ticket dispatches and status updates will appear here automatically.
                  </div>
                ) : (
                  notifications.slice(0, 3).map((n) => (
                    <div key={n.id} className="flex items-start gap-3.5">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${n.read ? 'bg-slate-300' : 'bg-blue-600'}`}></div>
                      <div className="space-y-0.5 text-xs">
                        <div className="font-bold text-slate-900">{n.title}</div>
                        <p className="text-slate-600">{n.message}</p>
                        <span className="text-[10px] text-slate-400 block pt-0.5">{n.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowNotificationPopup(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>View All Notifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Card: Your Civic Impact */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Your Civic Impact</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {currentUser?.badge || 'Top 5% Citizen'}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Your Voice Is Making a Real Difference.
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Every report helps identify civic issues faster and builds a more transparent Indore. Your direct submissions have improved road safety and sanitation across Ward 18.
                </p>
              </div>

              {/* 3 Metric counters */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div>
                  <div className="text-xl font-extrabold text-blue-600">{String(totalCount).padStart(2, '0')}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Reported</div>
                </div>
                <div className="border-x border-slate-200">
                  <div className="text-xl font-extrabold text-teal-600">{String(resolvedCount).padStart(2, '0')}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Resolved</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{impactScore}%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Impact Score</div>
                </div>
              </div>

              {/* Quote block with blue left border */}
              <div className="border-l-4 border-blue-600 pl-3.5 py-1 text-xs italic text-slate-600">
                "Active civic reporters like you helped Indore resolve over 85,000 public sanitation and infrastructure tickets this quarter."
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={onOpenCertificate}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Download Citizen Civic Certificate</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <Footer variant="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
