import React, { useState } from 'react';
import CivicLogo from './CivicLogo.jsx';
import {
  ShieldCheck,
  Check,
  Edit2,
  Camera,
  Mail,
  Phone,
  Building2,
  MapPin,
  Save,
  Bell,
  Sun,
  ChevronDown,
  Globe,
  Sliders,
  Lock,
  Smartphone,
  Laptop,
  Trash2,
  Download,
  AlertTriangle,
  HelpCircle,
  FileText,
  LogOut
} from 'lucide-react';

import { civicDataService } from '../services/supabaseClient.js';

export default function ProfileSettingsPage({
  currentUser,
  notifications = [],
  onNavigate,
  onSwitchUserRole,
  onUpdateCurrentUser,
  onShowToast,
  onLogout
}) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states dynamically initialized from currentUser
  const [fullName, setFullName] = useState(currentUser?.name || 'Priya Sharma');
  const [email, setEmail] = useState(currentUser?.email || 'priya.sharma@indorecitizen.org');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [cityCorp, setCityCorp] = useState(currentUser?.city || 'Indore Municipal Corporation (IMC)');
  const [ward, setWard] = useState(currentUser?.ward || 'Ward 18 - Scheme No. 54 / Vijay Nagar');
  
  // Preferences
  const [defaultCity, setDefaultCity] = useState(currentUser?.appPrefs?.defaultCity || 'Indore (IMC)');
  const [defaultWard, setDefaultWard] = useState(currentUser?.appPrefs?.defaultWard || 'Ward 18 (Vijay Nagar / Scheme 54)');
  const [preferredLandmark, setPreferredLandmark] = useState(currentUser?.appPrefs?.preferredLandmark || 'Orbit Mall Crossing / AB Road');
  const [autoGps, setAutoGps] = useState(currentUser?.appPrefs?.autoGps ?? true);

  // Notifications
  const [notifChannels, setNotifChannels] = useState(
    currentUser?.notificationPrefs?.status
      ? currentUser.notificationPrefs
      : {
          status: { inApp: true, email: true, sms: true },
          assignment: { inApp: true, email: true, sms: false },
          resolution: { inApp: true, email: true, sms: true },
          announcements: { inApp: true, email: false, sms: false }
        }
  );

  // Security & Password Change
  const [twoFactor, setTwoFactor] = useState(true);
  const [otherSessionActive, setOtherSessionActive] = useState(true);
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const userInitials = (fullName || 'Priya Sharma')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSubTabClick = (tab) => {
    setActiveSubTab(tab);
    const el = document.getElementById(`section-${tab}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSave = async () => {
    setSavedSuccess(true);
    await civicDataService.updatePreferences({
      notificationPrefs: notifChannels,
      appPrefs: {
        defaultCity,
        defaultWard,
        preferredLandmark,
        autoGps
      }
    });
    if (onUpdateCurrentUser) {
      onUpdateCurrentUser({
        ...(currentUser || {}),
        name: fullName,
        initials: userInitials,
        email,
        phone,
        city: cityCorp,
        ward,
        notificationPrefs: notifChannels,
        appPrefs: {
          defaultCity,
          defaultWard,
          preferredLandmark,
          autoGps
        }
      });
    }
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await civicDataService.updatePassword(currentPasswordInput, newPasswordInput);
      setIsPasswordFormOpen(false);
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      if (onShowToast) onShowToast('Account password updated successfully!');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Password update failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CivicLogo subtitle="" onClick={() => onNavigate('landing')} />
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              IMC Citizen Portal
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('my-complaints')}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              My Complaints
            </button>
            <button
              onClick={() => onNavigate('report-issue')}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Report Issue
            </button>
            <button
              onClick={() => onNavigate('history')}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              History
            </button>
            <button
              onClick={() => onNavigate('notifications')}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="w-4 h-4 bg-blue-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('notifications')}
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('profile-settings')}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-blue-600 bg-blue-50/50 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#2563eb] text-white font-bold text-xs flex items-center justify-center">
                {userInitials}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">{fullName}</div>
                <div className="text-[10px] text-slate-500 leading-tight">{cityCorp.split(' ')[0]}, MP • {ward.split('-')[0].trim()}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        
        {/* SUBHEADER: Profile & Settings */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-blue-700 bg-blue-50 mb-2 border border-blue-200/60 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span>MY ACCOUNT • PREFERENCES & SECURITY</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Profile & Settings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your personal identity, municipal area preferences, notification channels, and security settings.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Connected to IMC Urban Portal</span>
          </div>
        </div>

        {/* SUBNAV PILL TABS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex flex-wrap items-center gap-1 text-xs font-semibold shadow-2xs">
          <button
            onClick={() => handleSubTabClick('overview')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'overview' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            🪪 Overview & Info
          </button>
          <button
            onClick={() => handleSubTabClick('location')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'location' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            📍 Location Preferences
          </button>
          <button
            onClick={() => handleSubTabClick('notifications')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'notifications' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            🔔 Notification Channels
          </button>
          <button
            onClick={() => handleSubTabClick('security')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'security' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            🔒 Security & Sessions
          </button>
          <button
            onClick={() => handleSubTabClick('privacy')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'privacy' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            🛡 Privacy & Data
          </button>
        </div>

        {/* CITIZEN PROFILE HERO CARD (Exact match with Html → Body (1).png) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 font-black text-2xl flex items-center justify-center border-4 border-white shadow-md">
                {userInitials}
              </div>
              <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs border-2 border-white">
                ✓
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ Verified Citizen
                </span>
              </div>

              <div className="text-xs text-slate-500">
                Citizen ID: <strong className="text-slate-800 font-mono">{currentUser?.citizenId || 'CC-IND-88214'}</strong> • 📍 {cityCorp} ({ward.split('-')[0].trim()})
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-700 font-mono text-[11px] border border-slate-200">
                  ✉ {email} ✓
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-700 font-mono text-[11px] border border-slate-200">
                  📱 {phone} <span className="text-emerald-600 font-semibold">Aadhaar Linked ✓</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center gap-2.5 text-xs text-blue-900">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                🛡
              </div>
              <div>
                <span className="font-bold block">Aadhaar & Smart City Verified</span>
                <span className="text-[10px] text-blue-700">e-KYC verified via Indore One City Registry</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleSave}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => onShowToast && onShowToast('Avatar upload verified with IMC e-KYC profile.')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Update Profile Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN SETTINGS GRID (Exact match with Html → Body (1).png) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Personal Information + Notification Channels */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Personal Information */}
            <div id="section-overview" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Official citizen contact details used for complaint verification and status updates.</p>
                </div>
                <span className="text-slate-400">👤</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium"
                    />
                    <span className="absolute right-3 top-3 text-slate-400">🪪</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 justify-between">
                      <span className="text-slate-900 font-mono">{email}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-bold">Verified</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 justify-between">
                      <span className="text-slate-900 font-mono">{phone}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-bold">Verified</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">City / Municipal Corporation</label>
                    <input
                      type="text"
                      value={cityCorp}
                      onChange={e => setCityCorp(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ward / Sub-district</label>
                    <input
                      type="text"
                      value={ward}
                      onChange={e => setWard(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {savedSuccess ? '✓ Changes saved to IMC Registry' : '☁ All changes saved automatically or click to update'}
                </span>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shadow-blue-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

            {/* 2. Notification Channels & Alerts */}
            <div id="section-notifications" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Notification Channels & Alerts</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Control how and when Indore Municipal Corporation and Civic Connect notify you.</p>
                </div>
                <Bell className="w-4 h-4 text-slate-400" />
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {/* Row 1 */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block">Complaint Status Updates</span>
                    <span className="text-slate-500 text-[11px]">Receive instant notifications when your complaint changes stage.</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={notifChannels.status.inApp} onChange={e => setNotifChannels({ ...notifChannels, status: { ...notifChannels.status, inApp: e.target.checked } })} className="rounded text-blue-600" />
                      <span>In-App</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={notifChannels.status.email} onChange={e => setNotifChannels({ ...notifChannels, status: { ...notifChannels.status, email: e.target.checked } })} className="rounded text-blue-600" />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={notifChannels.status.sms} onChange={e => setNotifChannels({ ...notifChannels, status: { ...notifChannels.status, sms: e.target.checked } })} className="rounded text-blue-600" />
                      <span>SMS</span>
                    </label>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block">Field Crew & Department Assignment</span>
                    <span className="text-slate-500 text-[11px]">Get notified when an engineer or municipal squad is assigned.</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={notifChannels.assignment.inApp} onChange={e => setNotifChannels({ ...notifChannels, assignment: { ...notifChannels.assignment, inApp: e.target.checked } })} className="rounded text-blue-600" />
                      <span>In-App</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={notifChannels.assignment.email} onChange={e => setNotifChannels({ ...notifChannels, assignment: { ...notifChannels.assignment, email: e.target.checked } })} className="rounded text-blue-600" />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-400">
                      <input type="checkbox" checked={notifChannels.assignment.sms} onChange={e => setNotifChannels({ ...notifChannels, assignment: { ...notifChannels.assignment, sms: e.target.checked } })} className="rounded text-blue-600" />
                      <span>SMS</span>
                    </label>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block">Resolution & Verification</span>
                    <span className="text-slate-500 text-[11px]">Alerts when field work is finished and before/after verification is ready.</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={notifChannels.resolution.inApp} onChange={e => setNotifChannels({ ...notifChannels, resolution: { ...notifChannels.resolution, inApp: e.target.checked } })} className="rounded text-blue-600" />
                      <span>In-App</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={notifChannels.resolution.email} onChange={e => setNotifChannels({ ...notifChannels, resolution: { ...notifChannels.resolution, email: e.target.checked } })} className="rounded text-blue-600" />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={notifChannels.resolution.sms} onChange={e => setNotifChannels({ ...notifChannels, resolution: { ...notifChannels.resolution, sms: e.target.checked } })} className="rounded text-blue-600" />
                      <span>SMS</span>
                    </label>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block">Municipal & GovCloud Announcements</span>
                    <span className="text-slate-500 text-[11px]">City emergency alerts, water pipeline shutdowns, or maintenance notices.</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={notifChannels.announcements.inApp} onChange={e => setNotifChannels({ ...notifChannels, announcements: { ...notifChannels.announcements, inApp: e.target.checked } })} className="rounded text-blue-600" />
                      <span>In-App</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-400">
                      <input type="checkbox" checked={notifChannels.announcements.email} onChange={e => setNotifChannels({ ...notifChannels, announcements: { ...notifChannels.announcements, email: e.target.checked } })} className="rounded text-blue-600" />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-400">
                      <input type="checkbox" checked={notifChannels.announcements.sms} onChange={e => setNotifChannels({ ...notifChannels, announcements: { ...notifChannels.announcements, sms: e.target.checked } })} className="rounded text-blue-600" />
                      <span>SMS</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Location Preferences + Security + Privacy */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Location Preferences */}
            <div id="section-location" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Location Preferences</h3>
                  <p className="text-[11px] text-slate-500">Help Civic Connect provide more relevant civic updates and localized dispatch routing.</p>
                </div>
                <MapPin className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Default Municipal City</label>
                  <select
                    value={defaultCity}
                    onChange={e => setDefaultCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option>Indore (IMC)</option>
                    <option>Bhopal (BMC)</option>
                    <option>Ujjain (UMC)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Default Ward & Zone</label>
                  <input
                    type="text"
                    value={defaultWard}
                    onChange={e => setDefaultWard(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Preferred Reporting Landmark</label>
                  <input
                    type="text"
                    value={preferredLandmark}
                    onChange={e => setPreferredLandmark(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                {/* Automatic GPS telemetry toggle */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Automatic GPS telemetry</span>
                    <span className="text-[10px] text-slate-500">Use current GPS location automatically when reporting civic issues</span>
                  </div>
                  <button
                    onClick={() => setAutoGps(!autoGps)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      autoGps ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      autoGps ? 'right-1' : 'left-1'
                    }`}></span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-2 text-[11px] text-blue-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Your geolocation telemetry is used strictly for municipal complaint routing and civic verification. It is never shared with third parties.</span>
                </div>
              </div>
            </div>

            {/* 2. Security */}
            <div id="section-security" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Security</h3>
                  <p className="text-[11px] text-slate-500">Keep your account secure with multi-factor authentication.</p>
                </div>
                <Lock className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Password</span>
                      <span className="text-[11px] text-slate-500">Last changed: 14 days ago (Strong)</span>
                    </div>
                    <button
                      onClick={() => setIsPasswordFormOpen(!isPasswordFormOpen)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      {isPasswordFormOpen ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>
                  {isPasswordFormOpen && (
                    <form onSubmit={handlePasswordUpdate} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Password</label>
                        <input
                          type="password"
                          value={currentPasswordInput}
                          onChange={(e) => setCurrentPasswordInput(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">New Password (min 6 chars)</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="Enter new strong password"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                      >
                        Update Password
                      </button>
                    </form>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Aadhaar OTP / 2-Step Verification</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-50 text-emerald-700 font-bold">
                        {twoFactor ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">Protect your citizen account with OTP verification upon sign-in.</span>
                  </div>
                  <button
                    onClick={() => setTwoFactor(!twoFactor)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      twoFactor ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      twoFactor ? 'right-1' : 'left-1'
                    }`}></span>
                  </button>
                </div>

                {/* Active Sessions */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>Active Sessions</span>
                    <span>{otherSessionActive ? '2 Devices Active' : '1 Device Active'}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-blue-600" />
                      <div>
                        <strong className="text-slate-900 block">Chrome on macOS</strong>
                        <span className="text-[10px] text-slate-500">Indore, MP (IP: 103.21.78.44)</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">Active now</span>
                  </div>

                  {otherSessionActive && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-slate-500" />
                        <div>
                          <strong className="text-slate-900 block">Civic Connect Citizen App (Android 14)</strong>
                          <span className="text-[10px] text-slate-500">Samsung Galaxy S23 • Active 2 hrs ago</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setOtherSessionActive(false);
                      if (onShowToast) onShowToast('Signed out of all other mobile and web sessions.');
                    }}
                    className="w-full py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Log Out of Other Sessions
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Privacy & Municipal Data Governance */}
            <div id="section-privacy" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Privacy & Municipal Data Governance</h3>
                  <p className="text-[11px] text-slate-500">Compliant with Digital Personal Data Protection (DPDP) Act.</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Community Feed Visibility</span>
                    <span className="text-[10px] text-slate-500">Manage public visibility of community reports in open data feeds.</span>
                  </div>
                  <button
                    onClick={() => onNavigate('privacy')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Configure
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Download My Civic Data</span>
                    <span className="text-[10px] text-slate-500">Export all complaint history, telemetry, and activity in PDF/JSON.</span>
                  </div>
                  <button
                    onClick={() => onShowToast && onShowToast('Civic data archive (PDF + JSON) prepared and downloaded.')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Request Export
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Permanently Delete Citizen Account</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Remove all personal identifiers and deactivate portal access according to MeitY data governance. Historical resolved civic reports will be anonymized.
                  </p>
                  <button
                    onClick={() => onShowToast && onShowToast('Account deletion request logged for 14-day statutory cooling period.')}
                    className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 text-[11px] font-bold hover:bg-rose-100 cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM QUICK ACTIONS BAR (Exact match with Html → Body (1).png) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('support')} className="hover:text-blue-600 flex items-center gap-1 cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help & Support</span>
            </button>
            <button onClick={() => onNavigate('terms')} className="hover:text-blue-600 flex items-center gap-1 cursor-pointer">
              <FileText className="w-3.5 h-3.5" />
              <span>Terms & Municipal Governance Charter</span>
            </button>
            <button onClick={() => onNavigate('privacy')} className="hover:text-blue-600 flex items-center gap-1 cursor-pointer">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (onLogout) onLogout();
              else onNavigate('login');
            }}
            className="text-rose-600 font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out of Portal</span>
          </button>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200 bg-white pt-10 pb-8 px-4 sm:px-8 text-slate-600">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs pb-6 border-b border-slate-100">
            <div>
              <CivicLogo subtitle="" onClick={() => onNavigate('landing')} />
              <p className="text-slate-500 mt-2 text-[11px]">Empowering citizens and municipal authorities with real-time AI-assisted civic complaint tracking, transparent resolution workflows, and open governance.</p>
              <span className="text-[11px] text-slate-400 block mt-2">Toll-Free Helpline: <strong className="text-slate-800">1800-233-5555</strong></span>
            </div>
            <div>
              <span className="font-bold text-slate-900 block mb-2 uppercase tracking-wider">PLATFORM</span>
              <ul className="space-y-1.5 text-slate-500">
                <li>Platform Overview</li>
                <li>AI Computer Vision</li>
                <li>Complaint Tracking</li>
                <li>Resolution Workflows</li>
              </ul>
            </div>
            <div>
              <span className="font-bold text-slate-900 block mb-2 uppercase tracking-wider">CIVIC NETWORK</span>
              <ul className="space-y-1.5 text-slate-500">
                <li>City Partnerships</li>
                <li>Civic Impact Report</li>
                <li>Security & Compliance</li>
                <li>Contact Support</li>
              </ul>
            </div>
            <div>
              <span className="font-bold text-slate-900 block mb-2 uppercase tracking-wider">COMPLIANCE</span>
              <ul className="space-y-1.5 text-slate-500">
                <li>✓ ISO 27001 Certified Portal</li>
                <li>✓ MeitY GovCloud Compliant</li>
                <li>✓ Indore Smart City Limited</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <div>© 2025 Civic Connect Inc. Built with Purpose. Built for the Community. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Security & Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
