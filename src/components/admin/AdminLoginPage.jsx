import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Terminal,
  Server
} from 'lucide-react';
import { civicDataService } from '../../services/supabaseClient.js';

export default function AdminLoginPage({ onAdminLoginSuccess, onShowToast }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('cirrs-hq@gov.in');
  const [password, setPassword] = useState('Admin#CIRRS2026');
  const [name, setName] = useState('System Administrator');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const adminUser = await civicDataService.adminLogin(email, password);
        setIsLoading(false);
        if (onShowToast) {
          onShowToast(`Authenticated as CIRRS Platform Admin (${adminUser.email})`);
        }
        onAdminLoginSuccess(adminUser);
      } else {
        if (!name.trim() || !email.trim() || !password.trim() || !adminSecretKey.trim()) {
          setError('All fields including the Master Admin Security Key are required.');
          setIsLoading(false);
          return;
        }
        const adminUser = await civicDataService.adminRegister({
          name: name.trim(),
          email: email.trim(),
          password,
          adminSecretKey: adminSecretKey.trim()
        });
        setIsLoading(false);
        if (onShowToast) {
          onShowToast(`Super Admin account provisioned & signed in: ${adminUser.email}`);
        }
        onAdminLoginSuccess(adminUser);
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Admin authentication failed. Unauthorized access attempt logged.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif] selection:bg-blue-600 selection:text-white">
      {/* Top Restricted Gateway Bar */}
      <header className="w-full border-b border-slate-800/80 bg-[#0F172A]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-blue-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white leading-none">
                CIRRS Admin
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Civic Connect Console · Restricted Nodal Gateway
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="hidden sm:inline font-mono text-[11px] text-slate-400">
              Route: /civic-connect/admin/login
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-emerald-400 font-semibold">ISO 27001 / MeitY GovCloud</span>
          </div>
        </div>
      </header>

      {/* Main Split Viewport */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full items-stretch">
          {/* Left Governance & Municipal Verification Briefing */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-[#0F172A] border border-slate-800 rounded-2xl p-7 sm:p-9">
            <div className="space-y-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Centralized Platform Administration
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  CIRRS Super Admin &amp; Nodal Verification Authority
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  This isolated administrative gateway governs multi-municipality onboarding, two-tier Municipal Officer credential verification, AI telemetry review, and statutory SLA enforcement.
                </p>
              </div>

              {/* Verification Protocol Architecture */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Two-Tier Access Control Protocol
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">01. Citizen Accounts</span>
                    <span className="text-emerald-400 font-mono text-[11px]">Email Verification Only</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Citizens verify their email address and receive immediate access to report civic issues and track resolutions.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-900/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-300">02. Municipal Officer Accounts</span>
                    <span className="text-amber-400 font-mono text-[11px]">Email + Super Admin Approval</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Municipal Officers must verify their official email <strong className="text-slate-200">and</strong> receive explicit verification approval from the CIRRS Super Admin in <strong className="text-slate-200">Municipality Management</strong> before login is unlocked.
                  </p>
                </div>
              </div>
            </div>

            {/* Pre-configured Credentials Quick-Fill Helper */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Authorized Super Admin Credentials</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setEmail('cirrs-hq@gov.in');
                    setPassword('Admin#CIRRS2026');
                    setError('');
                  }}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  Auto-Fill Default Admin
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] font-mono bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/90 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Admin ID:</span>
                  <span>cirrs-hq@gov.in</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Passkey:</span>
                  <span>Admin#CIRRS2026</span>
                </div>
                <div className="sm:col-span-2 pt-1 border-t border-slate-800/80 text-slate-400">
                  Master Provisioning Secret Key: <span className="text-blue-400">CIRRS-ADMIN-2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Authentication Card */}
          <div className="lg:col-span-6 bg-[#0F172A] border border-slate-800 rounded-2xl p-7 sm:p-9 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Segmented Mode Switcher */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    mode === 'login'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Super Admin Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    mode === 'register'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Secret Key Provisioning
                </button>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-white">
                  {mode === 'login'
                    ? 'Sign in to CIRRS Admin Console'
                    : 'Provision New Super Admin Account'}
                </h2>
                <p className="text-xs text-slate-400">
                  {mode === 'login'
                    ? 'Enter your platform administrator credentials to access the console.'
                    : 'Requires the platform Master Security Key (CIRRS-ADMIN-2026) to authorize.'}
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Administrator Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Dr. Arvind Kulkarni (Chief Nodal Admin)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Official Admin Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="cirrs-hq@gov.in"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Admin Passkey *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Master Security Provisioning Key *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={adminSecretKey}
                        onChange={(e) => setAdminSecretKey(e.target.value)}
                        placeholder="Enter CIRRS-ADMIN-2026"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/50 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/25 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-60"
                >
                  <span>
                    {isLoading
                      ? 'Verifying Security Clearance...'
                      : mode === 'login'
                      ? 'Access CIRRS Admin Console'
                      : 'Verify Key & Provision Super Admin'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-Bit Encrypted Admin Audit Ledger</span>
              </div>
              <span className="font-mono text-slate-500">v4.2.8-prod</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/70 py-4 px-6 text-center text-xs text-slate-500">
        CIRRS Civic Connect Operating Console · Unauthorized access is strictly prohibited under IT Act Section 66.
      </footer>
    </div>
  );
}
