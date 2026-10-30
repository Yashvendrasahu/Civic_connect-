import React, { useState } from 'react';
import CivicLogo from './CivicLogo.jsx';
import {
  Sun,
  Bell,
  MapPin,
  ChevronDown,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  Users,
  Folder,
  AlertCircle,
  Truck,
  RotateCw,
  Camera,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  MessageSquare,
  Award,
  LogOut,
  ArrowRight,
  Phone,
  Check,
  Cpu,
  User,
  Shield
} from 'lucide-react';

export default function MyComplaintsPage({
  currentUser,
  complaints,
  timelineUpdates,
  notifications,
  onNavigate,
  onOpenReportModal,
  onSelectTicket,
  onOpenCertificate,
  onSwitchUserRole,
  onUploadPhotos,
  onAddTicketComment,
  onUpvoteTicket,
  onMarkNotificationsRead,
  onShowToast,
  onLogout
}) {
  // State
  const [featuredId, setFeaturedId] = useState('CC10246');
  const [selectedInspectId, setSelectedInspectId] = useState('CC10246');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'in-progress' | 'resolved'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  // Dynamic KPI counts
  const totalCount = complaints.length;
  const activeCount = complaints.filter(c => c.status !== 'Resolved').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  // Active featured complaint (null-safe when complaints is empty)
  const featuredComplaint = complaints.find(c => c.id === featuredId) || complaints[0] || null;
  const inspectComplaint = complaints.find(c => c.id === selectedInspectId) || featuredComplaint || null;

  // Other active complaints (excluding the featured one)
  const otherActiveComplaints = complaints
    .filter(c => featuredComplaint && c.id !== featuredComplaint.id && c.status !== 'Resolved')
    .slice(0, 3);

  // Filtered all complaints list
  const filteredComplaints = complaints
    .filter(c => {
      // Tab filter
      if (filterTab === 'active' && c.status === 'Resolved') return false;
      if (filterTab === 'in-progress' && c.status !== 'In Progress') return false;
      if (filterTab === 'resolved' && c.status !== 'Resolved') return false;

      // Category filter
      if (categoryFilter !== 'all' && !c.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = c.title.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const rank = p => (p?.includes('High') ? 1 : p?.includes('Medium') ? 2 : 3);
        return rank(a.priority) - rank(b.priority);
      }
      if (sortBy === 'status') {
        return (a.status || '').localeCompare(b.status || '');
      }
      return 0;
    });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. TOP NAVBAR (100% Match with Html → Body.png) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between">
          {/* Logo */}
          <CivicLogo 
            subtitle="" 
            onClick={() => onNavigate('landing')}
          />

          {/* Center Tabs */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Dashboard
            </button>

            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold text-blue-600 bg-blue-50/80 border border-blue-200/60 transition-all cursor-pointer"
            >
              <span>My Complaints</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Report Issue
            </button>

            <button
              onClick={() => {
                setFilterTab('resolved');
                const el = document.getElementById('all-complaints-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              History
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Sun */}
            <button
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
              title="Theme: Pure Light"
            >
              <Sun className="w-4 h-4 text-amber-500" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all cursor-pointer relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#2563eb] text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotificationPopup && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-900">Notifications</span>
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
                  <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 text-xs space-y-1">
                        <div className="font-bold text-slate-900 flex justify-between">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{n.message}</p>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowNotificationPopup(false)}
                    className="w-full mt-2 text-center text-xs font-semibold text-blue-600 py-1 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* + Report Issue CTA */}
            <button
              onClick={onOpenReportModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>

            {/* Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#2563eb] text-white font-bold text-xs flex items-center justify-center">
                  {currentUser?.initials || 'PS'}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser?.name || 'Priya Sharma'}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{currentUser?.city ? `${currentUser.city.split(',')[0]}, MP` : 'Indore, MP'} • {currentUser?.ward?.split(',')[0] || 'Ward 18'}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                  <div className="p-3 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{currentUser?.name || 'Priya Sharma'}</div>
                    <div className="text-[11px] text-slate-500">{currentUser?.email || 'priya.sharma@example.com'}</div>
                    <div className="text-[10px] text-blue-600 font-mono mt-1 font-semibold">{currentUser?.ward || 'Ward 18, Zone 4'} • {currentUser?.citizenId || '#IND-8841'}</div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('profile-settings');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Profile & Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenCertificate();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Download Civic Certificate</span>
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
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* SUBHEADER: Your Complaints */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-blue-700 bg-blue-50 mb-2 border border-blue-200/60 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span>MY COMPLAINTS</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Your Complaints
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your reported issues, follow their progress, and see what happens next.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('profile-settings')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Report an Issue</span>
            </button>
          </div>
        </div>

        {/* 4 SUMMARY METRIC CARDS (Exact match with Html → Body.png) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Needs Attention */}
          <div 
            onClick={() => setFilterTab('active')}
            className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all ${
              filterTab === 'active'
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">NEEDS ATTENTION</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900">{activeCount}</span>
              <span className="text-xs font-semibold text-rose-600">Critical focus</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Require citizen input or review</p>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs font-bold text-blue-600 inline-flex items-center gap-1">
              <span>Filter Active</span>
              <span>→</span>
            </div>
          </div>

          {/* 2. In Progress */}
          <div 
            onClick={() => setFilterTab('in-progress')}
            className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all ${
              filterTab === 'in-progress'
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">IN PROGRESS</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900">{inProgressCount}</span>
              <span className="text-xs font-semibold text-blue-600">Under field repair</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Municipal crew dispatched</p>
          </div>

          {/* 3. Resolved */}
          <div 
            onClick={() => setFilterTab('resolved')}
            className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all ${
              filterTab === 'resolved'
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">RESOLVED</span>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900">{resolvedCount}</span>
              <span className="text-xs font-semibold text-teal-600">Closed this month</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Successfully completed</p>
          </div>

          {/* 4. Total */}
          <div 
            onClick={() => setFilterTab('all')}
            className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all ${
              filterTab === 'all'
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">TOTAL</span>
              <Folder className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900">{totalCount}</span>
              <span className="text-xs font-semibold text-slate-600">All logged</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">All reports in your ward</p>
          </div>
        </div>

        {/* CURRENTLY BEING HANDLED SECTION */}
        {featuredComplaint ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="inline-flex items-center gap-2 font-bold text-slate-800 tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>CURRENTLY BEING HANDLED</span>
              </div>
              <span className="text-slate-400">Selected Active Priority Issue</span>
            </div>

            {/* Featured Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Top Tag Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200/80">
                    #{featuredComplaint.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                    {featuredComplaint.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                    ! {featuredComplaint.priority || 'High Priority'}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  {featuredComplaint.status}
                </span>
              </div>

              {/* Title & Location */}
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {featuredComplaint.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{featuredComplaint.location}</span>
                  <span>•</span>
                  <span>Reported {featuredComplaint.reported || featuredComplaint.timestamp}</span>
                </div>
              </div>

              {/* Resolution Pipeline Stepper (5 Blocks) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Resolution Pipeline</span>
                  <span className="font-semibold text-blue-600">
                    {featuredComplaint.status === 'Resolved' ? 'Stage 5 of 5 Complete' : 'Stage 4 of 5 Active'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {/* Step 1 */}
                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/70 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span>1. Submitted</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2">{featuredComplaint.reported || 'Confirmed'}</span>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/70 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span>2. AI Verified</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2">{featuredComplaint.confidence || '98%'} Verified</span>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/70 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span>3. Assigned</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2">{featuredComplaint.assignedTeam}</span>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3.5 rounded-xl bg-white border-2 border-blue-600 shadow-xs flex flex-col justify-between relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span>4. In Progress</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-600 text-white">LIVE</span>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-600 mt-2">Crew Dispatched</span>
                  </div>

                  {/* Step 5 */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col justify-between opacity-60">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block"></span>
                      <span>5. Resolved</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2">
                      {featuredComplaint.status === 'Resolved' ? 'Completed' : 'SLA Target: 24h'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dispatch update callout */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <RotateCw className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">Municipal Execution Dispatch Update</span>
                    <span className="text-[11px] text-slate-500">{featuredComplaint.timestamp || 'Active'}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {featuredComplaint.dispatchNote || `Ticket routed to ${featuredComplaint.assignedTeam} (${featuredComplaint.department}). Field squad mobilized for site resolution.`}
                  </p>
                </div>
              </div>

              {/* Action buttons row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onSelectTicket(featuredComplaint)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <span>View Complaint Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('recent-updates-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>View Activity Updates</span>
                </button>

                <button
                  onClick={() => onUploadPhotos(featuredComplaint.id)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Submit Supplementary Photo</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Complaints Logged Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your municipal complaint registry is empty. Click &ldquo;+ Report an Issue&rdquo; to submit your first geo-verified civic complaint.
            </p>
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Report an Issue</span>
            </button>
          </div>
        )}

        {/* OTHER ACTIVE COMPLAINTS */}
        {otherActiveComplaints.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Other Active Complaints ({otherActiveComplaints.length})</h3>
              <span className="text-xs text-blue-600 font-semibold">Click card to switch view</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {otherActiveComplaints.map(complaint => (
                <div
                  key={complaint.id}
                  onClick={() => setFeaturedId(complaint.id)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-2xs transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600">#{complaint.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        complaint.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : complaint.status === 'Assigned'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {complaint.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {complaint.title}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{complaint.location}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{complaint.timestamp}</span>
                    <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">
                      Make Featured ⇄
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECENT UPDATES SECTION (Exact match with Html → Body.png) */}
        <div id="recent-updates-section" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Recent Updates</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Live municipal timeline across all your reported issues
              </p>
            </div>

            <button 
              onClick={() => {
                if (onMarkNotificationsRead) onMarkNotificationsRead();
              }}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {timelineUpdates.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No timeline updates yet. Submit a complaint or dispatch a field crew to see live progress logs here.
              </div>
            ) : (
              timelineUpdates.map(update => (
                <div
                  key={update.id}
                  onClick={() => {
                    const target = complaints.find(c => c.id === update.ticketId);
                    if (target) setSelectedInspectId(target.id);
                  }}
                  className="py-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 rounded-xl px-2 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {update.icon === 'users' && <Users className="w-4 h-4" />}
                      {update.icon === 'user' && <User className="w-4 h-4" />}
                      {update.icon === 'cpu' && <Cpu className="w-4 h-4" />}
                      {update.icon === 'check' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {!['users', 'user', 'cpu', 'check'].includes(update.icon) && <Camera className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {update.title || update.action}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                          #{update.ticketId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {update.detail || update.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
                    <span>{update.time}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ALL COMPLAINTS & INSPECTION PANE */}
        <div id="all-complaints-section" className="space-y-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">All Complaints</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              View and manage all your reported issues across the Indore Municipal Jurisdiction.
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search complaints, ID or location..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    filterTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => setFilterTab('active')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    filterTab === 'active' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setFilterTab('in-progress')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    filterTab === 'in-progress' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  In Progress ({inProgressCount})
                </button>
                <button
                  onClick={() => setFilterTab('resolved')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    filterTab === 'resolved' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Resolved ({resolvedCount})
                </button>
              </div>

              {/* Category Dropdown */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700"
              >
                <option value="all">Category: All</option>
                <option value="road">Roads & Infrastructure</option>
                <option value="sanitation">Sanitation</option>
                <option value="electric">Electricity</option>
                <option value="water">Water Works</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 cursor-pointer"
              >
                <option value="recent">Sort: Most Recent</option>
                <option value="priority">Sort: Priority</option>
                <option value="status">Sort: Status</option>
              </select>
            </div>
          </div>

          {/* Split View: Left List + Right Inspection Pane */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Complaints List */}
            <div className="lg:col-span-7 space-y-4">
              {filteredComplaints.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                  No matching complaints found. Create a new complaint ticket to inspect it here.
                </div>
              ) : (
                filteredComplaints.map(complaint => {
                  const isSelected = inspectComplaint && complaint.id === inspectComplaint.id;
                  return (
                    <div
                      key={complaint.id}
                      onClick={() => setSelectedInspectId(complaint.id)}
                      className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600">#{complaint.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            complaint.priority?.includes('High')
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : complaint.priority === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {complaint.priority}
                          </span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          complaint.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700'
                            : complaint.status === 'Resolved'
                            ? 'bg-teal-50 text-teal-700'
                            : 'bg-sky-50 text-sky-700'
                        }`}>
                          {complaint.status}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 mt-2">
                        {complaint.title}
                      </h4>

                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {complaint.shortDescription || complaint.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {complaint.location.split(',')[0]}
                        </span>

                        {isSelected ? (
                          <span className="text-blue-600 font-bold inline-flex items-center gap-1">
                            <span>Viewing Details in Side Panel</span>
                            <span>→</span>
                          </span>
                        ) : complaint.status === 'Resolved' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCertificate();
                            }}
                            className="text-teal-600 font-bold hover:underline"
                          >
                            View Certificate ⎘
                          </button>
                        ) : (
                          <span className="text-slate-400 group-hover:text-blue-600">
                            View Details &gt;
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: INSPECTION PANE */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  INSPECTION PANE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  Live Feed
                </span>
              </div>

              {inspectComplaint ? (
                <>
                  <h3 className="text-lg font-bold text-slate-900">
                    Ticket #{inspectComplaint.id} Details
                  </h3>

                  {/* Evidence & Photos */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700">Evidence & Photos</span>
                    <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-900">
                      <img
                        src={inspectComplaint.image}
                        alt={inspectComplaint.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                        📷 AI Tagged: {inspectComplaint.dimensions || '45cm Asphalt Crater'}
                      </div>
                    </div>
                  </div>

                  {/* Location & Geofence */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Location & Geofence</span>
                      <span className="font-mono text-slate-500 text-[11px]">Lat {inspectComplaint.geo}</span>
                    </div>

                    {/* Styled Map Box */}
                    <div className="h-28 rounded-2xl bg-sky-50 border border-sky-100 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(#bae6fd_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md animate-bounce">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-900 bg-white/90 px-2 py-0.5 rounded shadow-xs mt-1">
                          {inspectComplaint.location.split(',')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Guaranteed SLA Target */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">Guaranteed SLA Target</span>
                      <span className="text-blue-600">{inspectComplaint.slaOnTrack || '92% On-Track'}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#2563eb] h-full rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>Estimated: {inspectComplaint.slaEstimate || 'Today, 04:30 PM'}</span>
                      <span>Ward 18 Public Guarantee</span>
                    </div>
                  </div>

                  {/* Citizen Charter note */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-xs text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Protected by Indore Municipal Citizen Charter. Work verified by AI computer vision & municipal supervisor review.
                    </p>
                  </div>

                  {/* Contact Assigned Officer CTA */}
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="w-full py-3 rounded-xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/40 text-blue-600 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Contact Assigned Officer ({inspectComplaint.assignedSquad || 'Squad #04'})</span>
                  </button>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  Select or create a complaint ticket to view live geofence, photo evidence, and SLA metrics.
                </div>
              )}
            </div>

          </div>
        </div>

      </main>

      {/* FOOTER (Exact match with Html → Body.png) */}
      <footer className="w-full border-t border-slate-200 bg-white pt-12 pb-10 px-4 sm:px-8 mt-12 text-slate-600">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-8 border-b border-slate-100">
            {/* Col 1 */}
            <div className="lg:col-span-2 space-y-3">
              <CivicLogo subtitle="" onClick={() => onNavigate('landing')} />
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Empowering citizens and municipal administrations with transparent, AI-verified civic resolution workflows across urban wards.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                  Indore Smart City
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                  ISO 27001 Certified
                </span>
              </div>
            </div>

            {/* Col 2: Platform */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">PLATFORM</span>
              <ul className="space-y-2 text-slate-500">
                <li><button onClick={() => onNavigate('landing')} className="hover:text-blue-600">Platform Overview</button></li>
                <li><button onClick={() => onNavigate('landing')} className="hover:text-blue-600">AI Computer Vision</button></li>
                <li><button onClick={() => onNavigate('dashboard')} className="hover:text-blue-600">Complaint Tracking</button></li>
                <li><button onClick={() => onNavigate('landing')} className="hover:text-blue-600">Resolution Workflows</button></li>
              </ul>
            </div>

            {/* Col 3: Governance */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">GOVERNANCE</span>
              <ul className="space-y-2 text-slate-500">
                <li><button onClick={() => onNavigate('partnerships')} className="hover:text-blue-600 cursor-pointer">City Partnerships</button></li>
                <li><button onClick={() => onNavigate('impact-report')} className="hover:text-blue-600 cursor-pointer">Civic Impact Report</button></li>
                <li><button onClick={() => onNavigate('security')} className="hover:text-blue-600 cursor-pointer">Security & Compliance</button></li>
                <li><button onClick={() => onNavigate('privacy')} className="hover:text-blue-600 cursor-pointer">Privacy Policy</button></li>
              </ul>
            </div>

            {/* Col 4: Citizen Support */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">CITIZEN SUPPORT</span>
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1">
                <span className="text-[10px] text-slate-500 block">Toll-Free Helpline</span>
                <span className="font-extrabold text-blue-700 text-sm">1800-233-5555</span>
                <span className="text-[10px] text-slate-400 block">Available 24/7 across Madhya Pradesh</span>
              </div>
              <button
                onClick={() => onNavigate('support')}
                className="text-blue-600 font-semibold text-xs inline-flex items-center gap-1 hover:underline pt-1 cursor-pointer"
              >
                <Phone className="w-3 h-3" />
                <span>Contact Support Desk</span>
              </button>
            </div>
          </div>

          {/* Bottom copyright row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              © 2025 Civic Connect Inc. Built with Purpose. Built for the Community. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('terms')} className="hover:text-slate-600 cursor-pointer">Terms of Service</button>
              <span>•</span>
              <button onClick={() => onNavigate('governance')} className="hover:text-slate-600 cursor-pointer">Citizen Charter</button>
              <span>•</span>
              <button onClick={() => onNavigate('security')} className="hover:text-slate-600 cursor-pointer">MeitY Guidelines</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Officer Contact Modal */}
      {showContactModal && inspectComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="font-bold text-base text-slate-900">Contact Assigned Officer</div>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                <div className="font-bold text-slate-900">Officer Rajesh Sharma (Lead Supervisor)</div>
                <div className="text-slate-500">{inspectComplaint.assignedTeam}</div>
                <div className="text-blue-600 font-mono text-[11px]">Direct Wireless: +91 731-255-8429</div>
              </div>
              <textarea
                value={contactMessage}
                onChange={e => setContactMessage(e.target.value)}
                placeholder="Write urgent notes or priority request for the squad lead..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (contactMessage.trim() && onAddTicketComment) {
                    await onAddTicketComment(inspectComplaint.id, contactMessage.trim(), 'Citizen Inquiry');
                  } else if (onShowToast) {
                    onShowToast(`Message transmitted to ${inspectComplaint.assignedSquad || 'Squad #04'} terminal.`);
                  }
                  setContactMessage('');
                  setShowContactModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
