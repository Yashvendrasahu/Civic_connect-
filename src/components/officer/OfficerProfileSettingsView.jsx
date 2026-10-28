import React, { useState, useRef } from 'react';
import { civicDataService } from '../../services/supabaseClient.js';
import {
  User,
  Building2,
  Lock,
  Bell,
  Sliders,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Camera,
  CheckCircle2,
  FileText,
  KeyRound,
  Smartphone,
  Globe,
  HelpCircle,
  Check
} from 'lucide-react';

export default function OfficerProfileSettingsView({
  officerProfile,
  onUpdateUser,
  onShowToast
}) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('personal');
  const [fullName, setFullName] = useState(officerProfile.name || 'Er. Rajesh Verma');
  const [phone, setPhone] = useState(officerProfile.phone || '+91 98260 41290');
  const [deskLocation, setDeskLocation] = useState(
    officerProfile.deskExtension || 'IMC HQ, Block B, 3rd Floor · Ext: 4092'
  );
  const [department, setDepartment] = useState(
    officerProfile.department || 'Roads & Infrastructure'
  );
  const [designation, setDesignation] = useState(
    officerProfile.designation || 'Superintending Engineer (Roads & Infrastructure)'
  );
  const [assignedZone, setAssignedZone] = useState(
    officerProfile.zone || 'Zone 04 - East Indore (Wards 18–24)'
  );

  // Security states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricSignOff, setBiometricSignOff] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(officerProfile.avatarUrl || '');
  const avatarInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await civicDataService.uploadEvidencePhoto('', file);
      if (res?.photoUrl) {
        setAvatarUrl(res.photoUrl);
        if (onUpdateUser) onUpdateUser({ avatarUrl: res.photoUrl });
        onShowToast('Official Officer ID photograph uploaded & synced.');
      }
    } catch {
      onShowToast('Could not upload profile photo.');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      onShowToast('New password must be at least 6 characters.');
      return;
    }
    const res = await civicDataService.updatePassword(currentPassword || 'officer123', newPassword);
    if (res?.error) {
      onShowToast(res.error);
    } else {
      setCurrentPassword('');
      setNewPassword('');
      onShowToast('GovCloud & Supabase Officer password updated successfully!');
    }
  };

  // Notification prefs states
  const [notifPrefs, setNotifPrefs] = useState({
    slaBreachSms: true,
    highPriorityPush: true,
    aiTriageDigest: true,
    citizenFeedbackAlert: false
  });

  // App prefs states
  const [appPrefs, setAppPrefs] = useState({
    defaultMapLayer: 'Standard GIS Vector',
    autoRefreshInterval: '30 Seconds (Real-time Telemetry)',
    language: 'English (Official GovTech) / हिन्दी'
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updates = {
      name: fullName,
      phone,
      department,
      deskExtension: deskLocation,
      designation,
      zone: assignedZone,
      initials: fullName
        .replace('Er. ', '')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    };
    await civicDataService.updateProfile(updates);
    if (onUpdateUser) {
      onUpdateUser(updates);
    }
    onShowToast('Official Municipal Officer profile changes saved and synced.');
  };

  const settingsTabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'official', label: 'Official Information', icon: Building2 },
    { id: 'security', label: 'Security & Password', icon: Lock },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell },
    { id: 'application', label: 'Application Preferences', icon: Sliders },
    { id: 'governance', label: 'Account Governance', icon: ShieldCheck }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-blue-600 mb-1">
            <span>MUNICIPAL OFFICER ACCOUNT & SECURITY</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
              Portal Ref: {officerProfile.portalRef || 'SEC-ADM-2026-IND'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your official municipal credentials, ward jurisdiction parameters, and security audit preferences.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveSettingsTab('governance')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>View Activity Log</span>
          </button>
          <button
            onClick={() => setActiveSettingsTab('personal')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
          >
            <User className="w-3.5 h-3.5" />
            <span>Edit Personal Details</span>
          </button>
        </div>
      </div>

      {/* Officer Banner Card (Exact screenshot layout with dynamic logged-in user details) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative w-20 h-20 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-sm">
            {officerProfile.initials || 'RV'}
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Official GovCloud Verified
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs font-bold">
                ID: {officerProfile.officerId || 'IMC-ENG-0842'}
              </span>
            </div>

            <div className="text-xs font-bold text-slate-700">
              {designation} · <span className="text-blue-600">{department}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {officerProfile.email}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {officerProfile.city || 'Indore Municipal Corporation (Zone 04 - East Indore)'}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Performance Metric Boxes */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center min-w-[110px]">
            <div className="font-mono text-lg font-extrabold text-emerald-600">
              {officerProfile.slaCompliance || '98.4%'}
            </div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">
              SLA Compliance
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center min-w-[110px]">
            <div className="font-mono text-lg font-extrabold text-slate-900">
              {officerProfile.totalResolved || '1,420'}
            </div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">
              Total Resolved
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center min-w-[110px]">
            <div className="font-mono text-lg font-extrabold text-blue-600">
              {officerProfile.citizenRating || '4.8 / 5'}
            </div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">
              Citizen Rating
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Settings Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Sub-Navigation (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSettingsTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSettingsTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
              );
            })}
          </div>

          {/* Need IT Support Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <HelpCircle className="w-4 h-4" />
              <span>Need Municipal IT Support?</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              For NIC GovCloud token resets, ward reassignment, or digital signature dongles, contact the IMC Smart City IT Helpdesk.
            </p>
            <div className="pt-1 font-mono text-xs font-bold text-emerald-400">
              Helpline: 0731-2543211 (Ext. 108)
            </div>
          </div>
        </div>

        {/* Right Settings Content Panel (8 Cols) */}
        <div className="lg:col-span-8">
          {activeSettingsTab === 'personal' && (
            <form
              onSubmit={handleSaveProfile}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6"
            >
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">Personal Information</h3>
                <p className="text-xs text-slate-500">
                  Update your official contact details and profile photograph displayed on municipal work orders.
                </p>
              </div>

              {/* Official Profile Photograph Row */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <div className="flex items-center gap-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center">
                      {officerProfile.initials || 'RV'}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      Official Profile Photograph
                    </div>
                    <p className="text-[11px] text-slate-500">
                      JPEG or PNG, max 5MB. Used on signed resolution certificates.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Upload New Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl('');
                      onShowToast('Reverted to default initials avatar.');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Official Email (Locked by NIC Directory)
                  </label>
                  <input
                    type="email"
                    readOnly
                    value={officerProfile.email}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Contact Phone (Emergency Dispatch SMS) *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono font-semibold focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Office Desk Extension & Location
                  </label>
                  <input
                    type="text"
                    value={deskLocation}
                    onChange={(e) => setDeskLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setFullName(officerProfile.name);
                    setPhone(officerProfile.phone);
                    onShowToast('Changes discarded.');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeSettingsTab === 'official' && (
            <form
              onSubmit={handleSaveProfile}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5"
            >
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">
                  Official Municipal Cadre & Jurisdiction
                </h3>
                <p className="text-xs text-slate-500">
                  Your assigned department, service cadre ID, and ward geofence authority.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Officer Employee ID</label>
                  <input
                    type="text"
                    readOnly
                    value={officerProfile.officerId || 'IMC-ENG-0842'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Operational Division</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                  >
                    <option value="Roads & Infrastructure">Roads & Infrastructure (#IMC-ENG-RDS)</option>
                    <option value="Water Supply & Sewerage">Water Supply & Sewerage (#IMC-ENG-WTR)</option>
                    <option value="Sanitation & Waste">Sanitation & Waste (#IMC-SAN-WST)</option>
                    <option value="Electrical & Street Lighting">Electrical & Street Lighting (#IMC-ELC-STR)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Official Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Assigned Zone & Wards</label>
                  <input
                    type="text"
                    value={assignedZone}
                    onChange={(e) => setAssignedZone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  Update Official Assignment
                </button>
              </div>
            </form>
          )}

          {activeSettingsTab === 'security' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">
                  Security, Password & GovCloud 2FA
                </h3>
                <p className="text-xs text-slate-500">
                  Configure multi-factor authentication and cryptographic resolution signing.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <div>
                    <div className="font-bold text-slate-900">NIC Parichay / SMS Two-Factor Authentication</div>
                    <div className="text-slate-500 mt-0.5">Require OTP verification on new workstation sign-ins</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => {
                      setTwoFactorEnabled(e.target.checked);
                      onShowToast('Two-Factor Authentication policy updated.');
                    }}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <div>
                    <div className="font-bold text-slate-900">Digital Signature Token for SLA Closure</div>
                    <div className="text-slate-500 mt-0.5">Stamp officer ID hash on all resolved complaint certificates</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={biometricSignOff}
                    onChange={(e) => {
                      setBiometricSignOff(e.target.checked);
                      onShowToast('Digital signature stamp preference updated.');
                    }}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </label>
              </div>

              <form onSubmit={handlePasswordUpdate} className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                <div className="font-bold text-slate-800">Rotate GovCloud / Supabase Password</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">New Password (min 6 chars)</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  Rotate GovCloud Password
                </button>
              </form>
            </div>
          )}

          {activeSettingsTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">Notification Preferences</h3>
                <p className="text-xs text-slate-500">
                  Control how statutory SLA warnings and squad dispatches alert your devices.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { key: 'slaBreachSms', title: 'Statutory SLA Breach SMS Alerts', desc: 'Send instant SMS when any assigned complaint enters <2h SLA window' },
                  { key: 'highPriorityPush', title: 'Critical & High Priority Dispatch Push', desc: 'Desktop & mobile push when AI flags Critical safety hazards' },
                  { key: 'aiTriageDigest', title: 'Morning Ward 18–24 AI Triage Summary', desc: 'Daily 08:00 AM digest of new complaints in your jurisdiction' },
                  { key: 'citizenFeedbackAlert', title: 'Citizen Resolution Rating Notifications', desc: 'Notify when citizens rate or reopen a resolved complaint' }
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs[item.key]}
                      onChange={async (e) => {
                        const updated = { ...notifPrefs, [item.key]: e.target.checked };
                        setNotifPrefs(updated);
                        await civicDataService.updatePreferences({ notificationPrefs: updated });
                        onShowToast('Notification channel preference saved.');
                      }}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeSettingsTab === 'application' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">Application Preferences</h3>
                <p className="text-xs text-slate-500">
                  Customize GIS map rendering, telemetry refresh intervals, and portal language.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Default GIS Map Layer</label>
                  <select
                    value={appPrefs.defaultMapLayer}
                    onChange={(e) => setAppPrefs({ ...appPrefs, defaultMapLayer: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option>Standard GIS Vector</option>
                    <option>Density Heatmap</option>
                    <option>High-Res Satellite Overlay</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Queue Telemetry Auto-Refresh</label>
                  <select
                    value={appPrefs.autoRefreshInterval}
                    onChange={(e) => setAppPrefs({ ...appPrefs, autoRefreshInterval: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option>30 Seconds (Real-time Telemetry)</option>
                    <option>1 Minute</option>
                    <option>5 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    await civicDataService.updatePreferences({ appPrefs });
                    onShowToast('Application workspace preferences saved.');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeSettingsTab === 'governance' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">
                  Account Governance & MeitY Audit Trail
                </h3>
                <p className="text-xs text-slate-500">
                  Immutable log of officer actions under the M.P. Public Service Guarantee Act.
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { action: 'Verified Complaint #CC10246 & Dispatched Squad #04', time: 'Today, 10:15 AM', ip: '10.24.18.104 (IMC Intranet)' },
                  { action: 'Signed Resolution Certificate for #CC10188', time: '18 Oct 2026, 04:10 PM', ip: '10.24.18.104 (IMC Intranet)' },
                  { action: 'Exported Zone 04 Monthly SLA Compliance Report', time: '16 Oct 2026, 11:30 AM', ip: '10.24.18.104 (IMC Intranet)' }
                ].map((log, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{log.action}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">{log.ip}</div>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
