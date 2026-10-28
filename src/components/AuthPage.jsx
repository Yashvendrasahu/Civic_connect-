import React, { useState } from 'react';
import CivicLogo from './CivicLogo.jsx';
import Footer from './Footer.jsx';
import { civicDataService } from '../services/supabaseClient.js';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Building2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Clock,
  Check,
  Building,
  Info,
  BadgeCheck,
  Cpu,
  Smartphone,
  FileCheck
} from 'lucide-react';

export default function AuthPage({
  initialMode = 'login', // 'login' | 'register' | 'forgot'
  onNavigate,
  onLoginSuccess,
  onShowToast
}) {
  const [authMode, setAuthMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [selectedRole, setSelectedRole] = useState('citizen'); // 'citizen' | 'officer'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('rajesh.sharma@indore.gov.in');
  const [password, setPassword] = useState('CivicConnect#2026');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [cityArea, setCityArea] = useState('Indore, Sector 4');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Roads & Public Works');
  const [officerId, setOfficerId] = useState('IND-PWD-8429');
  const [municipality, setMunicipality] = useState('Indore Municipal Corporation');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState('');
  const [adminVerificationBlock, setAdminVerificationBlock] = useState(null);
  const [resetSentMessage, setResetSentMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setAdminVerificationBlock(null);
    setResetSentMessage('');
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        try {
          const user = await civicDataService.login(email, password);
          setIsSubmitting(false);
          onLoginSuccess(user);
        } catch (err) {
          setIsSubmitting(false);
          if (err.requiresAdminVerification) {
            setAdminVerificationBlock({
              status: err.verificationStatus || 'Pending',
              reason:
                err.reason ||
                err.message ||
                'Your Municipal Officer account is awaiting approval from the CIRRS Super Admin.'
            });
          } else {
            setFormError(err.message || 'Authentication failed');
          }
        }
      } else if (authMode === 'register') {
        if (!fullName || !email || !password) {
          setFormError('Please fill in all required fields');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setFormError('Passwords do not match');
          setIsSubmitting(false);
          return;
        }
        await civicDataService.register({
          name: fullName,
          email,
          password,
          phone,
          role: selectedRole,
          city: selectedRole === 'officer' ? municipality : cityArea,
          department: selectedRole === 'officer' ? department : undefined,
          officerId: selectedRole === 'officer' ? officerId : undefined
        });
        setIsSubmitting(false);
        setAuthMode('verify');
      } else {
        setIsSubmitting(false);
        const msg = `Password reset instructions sent to ${email || 'your registered email address'}.`;
        setResetSentMessage(msg);
        if (onShowToast) onShowToast(msg);
        setAuthMode('login');
      }
    } catch (err) {
      setIsSubmitting(false);
      setFormError(err.message || 'Authentication error occurred');
    }
  };

  const handleVerifyEmail = async () => {
    setIsSubmitting(true);
    setFormError('');
    try {
      const verifiedUser = await civicDataService.verifyEmail(email);
      if (verifiedUser?.role) {
        setSelectedRole(verifiedUser.role);
      }
      setIsSubmitting(false);
      setVerificationSuccess(true);
    } catch (err) {
      setIsSubmitting(false);
      setFormError(err.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header with Back to Home button */}
      <header className="w-full bg-white border-b border-slate-200 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <CivicLogo 
            subtitle="Report. Track. Resolve." 
            onClick={() => onNavigate('landing')}
          />

          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 w-full items-start">
          
          {/* ================= LEFT SIDE SUMMARY & STATS ================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Top Category Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-sky-50 border border-sky-200/80 text-sky-800">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>
                {authMode === 'login'
                  ? 'Municipal Unified Operations Hub'
                  : selectedRole === 'officer'
                  ? 'GOVTECH MUNICIPAL NETWORK'
                  : 'GovTech Transparency Platform'}
              </span>
            </div>

            {/* Headline & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {authMode === 'login' && 'Welcome back to Civic Connect'}
                {authMode === 'register' && selectedRole === 'citizen' && (
                  <>
                    Join <span className="text-[#2563eb]">Civic Connect</span>
                  </>
                )}
                {authMode === 'register' && selectedRole === 'officer' && (
                  'Empower Your City Administration'
                )}
                {authMode === 'forgot' && 'Account Recovery'}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                {authMode === 'login' &&
                  'Stay connected with your community, track reported issues, and help build better cities through transparent municipal workflows.'}
                {authMode === 'register' && selectedRole === 'citizen' &&
                  'Create your account and become part of a smarter, more connected community.'}
                {authMode === 'register' && selectedRole === 'officer' &&
                  'Streamlined complaint dispatch, automated AI triage, and cross-departmental coordination engineered exclusively for authorized civic officers.'}
                {authMode === 'forgot' &&
                  'Enter your official municipal or registered citizen email address to receive password reset instructions.'}
              </p>
            </div>

            {/* Card 1: Lifecycle / Pipeline Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="uppercase tracking-wider">
                  {selectedRole === 'officer' && authMode === 'register'
                    ? 'STANDARD RESOLUTION LIFECYCLE'
                    : authMode === 'login'
                    ? 'END-TO-END CIVIC FLOW'
                    : 'Automated Resolution Lifecycle'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  {selectedRole === 'officer' && authMode === 'register' ? 'Standard Protocol' : 'Live Pipeline'}
                </span>
              </div>

              {/* Steps visual */}
              {selectedRole === 'officer' && authMode === 'register' ? (
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-50 flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-1">
                      <FileCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-800">Citizen Report</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-1">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-800">AI Triage</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-1">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-800">Officer Action</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-800">Resolution</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-50 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900">Citizen</span>
                    <span className="text-[10px] text-slate-400">Origin</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900">AI Verify</span>
                    <span className="text-[10px] text-slate-400">Vision/GIS</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900">Resolved</span>
                    <span className="text-[10px] text-slate-400">Verified</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Indore Central Command Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">Indore Central Command</span>
                </div>
                {selectedRole === 'officer' && authMode === 'register' ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Queue
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>22.7196° N, 75.8577° E</span>
                  </div>
                )}
              </div>

              {/* Incidents or Officer stats */}
              {selectedRole === 'officer' && authMode === 'register' ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50">
                    <div className="text-[11px] text-slate-500">Assigned Wards</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">Ward 4 & 12</div>
                    <div className="text-[10px] text-rose-600 font-medium">High Priority Sector</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <div className="text-[11px] text-slate-500">Avg Turnaround</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">2.4h</div>
                    <div className="text-[10px] text-blue-600 font-medium">38% Faster than SLA</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <div className="text-[11px] text-slate-500">Resolution Rate</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">96.2%</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Verified by Citizens</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <div className="text-[11px] text-slate-500">Active Officers</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">1,420+</div>
                    <div className="text-[10px] text-slate-600 font-medium">On-Duty Across Zone</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900">Pothole Detected Sector 4-B</div>
                        <div className="text-[11px] text-slate-500">Geo-coordinates 22.7196° N, 75.8577° E</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                      AI Tagged
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div className="flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-sky-500 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900">Streetlight #842 Restored</div>
                        <div className="text-[11px] text-slate-500">Ward 18 • Public Works Dept</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Team Assigned
                    </span>
                  </div>

                  {/* 3 Metrics Footer */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">94.8%</div>
                      <div className="text-[10px] text-slate-500">Resolution Rate</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">2.4h</div>
                      <div className="text-[10px] text-slate-500">Avg Response</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">52.8k</div>
                      <div className="text-[10px] text-slate-500">Active Citizens</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Security Framework Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                {selectedRole === 'officer' && authMode === 'register'
                  ? 'Official Municipal Gateway. Protected by 256-bit encryption & ISO 27001 Certified GovTech compliance.'
                  : 'Protected under the Municipal Transparency Framework. End-to-end encrypted dispatch with ISO 27001 compliance.'}
              </p>
            </div>
          </div>

          {/* ================= RIGHT SIDE FORM CARD ================= */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-9 shadow-md space-y-6">
              
              {/* Top Segmented Tabs: [Login] [Register] [Forgot Password] (Screenshot exact style) */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setFormError('');
                    setAdminVerificationBlock(null);
                    if (!email) {
                      setEmail(
                        selectedRole === 'officer'
                          ? 'rajesh.sharma@indore.gov.in'
                          : 'priya.sharma@example.com'
                      );
                      setPassword(
                        selectedRole === 'officer' ? 'CivicConnect#2026' : 'PriyaSecure#2026'
                      );
                    }
                  }}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setFormError('');
                    setAdminVerificationBlock(null);
                    if (
                      email === 'rajesh.sharma@indore.gov.in' ||
                      email === 'priya.sharma@example.com'
                    ) {
                      setEmail('');
                      setPassword('');
                      setConfirmPassword('');
                    }
                  }}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Register
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    authMode === 'forgot'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Forgot Password
                </button>
              </div>

              {/* Form Heading & Subheading */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {authMode === 'login' && 'Welcome Back'}
                  {authMode === 'register' && 'Create Your Account'}
                  {authMode === 'verify' && 'Verify Your Email'}
                  {authMode === 'forgot' && 'Reset Your Password'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {authMode === 'login' && 'Sign in to continue to Civic Connect portal.'}
                  {authMode === 'register' && (
                    selectedRole === 'officer'
                      ? 'Register as a Municipal Officer to manage and resolve civic issues.'
                      : 'Choose your account type and get started with Civic Connect.'
                  )}
                  {authMode === 'verify' && 'Complete your email verification to activate access.'}
                  {authMode === 'forgot' && 'Enter your email address to receive password instructions.'}
                </p>
              </div>

              {resetSentMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{resetSentMessage}</span>
                </div>
              )}

              {adminVerificationBlock && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-3 ${
                    adminVerificationBlock.status === 'Rejected' ||
                    adminVerificationBlock.status === 'Suspended'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-extrabold text-sm">
                      <ShieldCheck
                        className={`w-4 h-4 ${
                          adminVerificationBlock.status === 'Rejected' ||
                          adminVerificationBlock.status === 'Suspended'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      />
                      <span>
                        Municipal Officer Two-Tier Verification:{' '}
                        {adminVerificationBlock.status === 'Pending'
                          ? 'Awaiting Admin Approval'
                          : adminVerificationBlock.status}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/80 border border-current text-[10px] font-bold uppercase">
                      {adminVerificationBlock.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-200 flex items-center gap-2 text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Step 1: Official Email Verified</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-2 text-slate-800 font-semibold">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Step 2: Admin Verification ({adminVerificationBlock.status})</span>
                    </div>
                  </div>

                  <p className="leading-relaxed font-medium">{adminVerificationBlock.reason}</p>
                </div>
              )}

              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>Verification / Authentication Notice</span>
                  </div>
                  <p>{formError}</p>
                  {formError.toLowerCase().includes('verify') && (
                    <button
                      type="button"
                      onClick={() => setAuthMode('verify')}
                      className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-all cursor-pointer"
                    >
                      Verify Email Now
                    </button>
                  )}
                </div>
              )}

              {/* VERIFY EMAIL MODE */}
              {authMode === 'verify' ? (
                <div className="space-y-6 py-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Mail className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">Email Verification Required</h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      We have sent an activation link to <strong className="text-slate-900">{email}</strong>.{' '}
                      {selectedRole === 'officer'
                        ? 'As a Municipal Officer, you must first verify your email address, after which your request will be routed to the CIRRS Super Admin for nodal approval.'
                        : 'Per security policy, your Citizen account requires email verification before login is permitted.'}
                    </p>
                  </div>

                  {verificationSuccess ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-3 text-left">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>
                          {selectedRole === 'officer'
                            ? 'Step 1 Complete: Official Email Verified!'
                            : 'Email Verified Successfully!'}
                        </span>
                      </div>
                      {selectedRole === 'officer' ? (
                        <div className="space-y-2 text-slate-700">
                          <p>
                            Your email has been verified and your Municipal Officer credentials have been queued in the <strong>CIRRS Super Admin Console (Municipality Management)</strong>.
                          </p>
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
                            Step 2 Required: Login will be enabled as soon as the Super Admin verifies and approves your municipal account.
                          </div>
                        </div>
                      ) : (
                        <p>Your Citizen account is now active. You can proceed to sign in immediately.</p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setVerificationSuccess(false);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all text-xs cursor-pointer text-center"
                      >
                        Proceed to Login
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <button
                        type="button"
                        onClick={handleVerifyEmail}
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-xs shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-70"
                      >
                        {isSubmitting ? 'Verifying...' : 'Verify Email & Complete Step 1 Now'}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await civicDataService.resendVerification(email);
                          if (onShowToast) onShowToast(res.message || `Verification link resent to ${email}`);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
                      >
                        Resend Verification Email
                      </button>
                      <p className="text-[11px] text-slate-400">
                        {selectedRole === 'officer'
                          ? 'Municipal Officers require both Email Verification and Super Admin approval before login.'
                          : 'Click Verify Email above to complete activation and unlock citizen portal login.'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* ACCOUNT ROLE SELECTOR TILES (Available on both Login and Register modes) */}
                  {(authMode === 'register' || authMode === 'login') && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">
                        {authMode === 'login' ? 'Select Account Role' : 'Select Registration Profile'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Citizen Tile */}
                        <div
                          onClick={() => {
                            setSelectedRole('citizen');
                            setFormError('');
                            setAdminVerificationBlock(null);
                            if (
                              authMode === 'login' &&
                              (!email || email === 'rajesh.sharma@indore.gov.in')
                            ) {
                              setEmail('priya.sharma@example.com');
                              setPassword('PriyaSecure#2026');
                            }
                          }}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                            selectedRole === 'citizen'
                              ? 'border-blue-600 bg-blue-50/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {selectedRole === 'citizen' && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-sm text-slate-900">Citizen</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Report civic issues, track complaints, and stay connected with municipal updates.
                          </p>
                        </div>

                        {/* Municipal Officer Tile */}
                        <div
                          onClick={() => {
                            setSelectedRole('officer');
                            setFormError('');
                            setAdminVerificationBlock(null);
                            if (
                              authMode === 'login' &&
                              (!email || email === 'priya.sharma@example.com')
                            ) {
                              setEmail('rajesh.sharma@indore.gov.in');
                              setPassword('CivicConnect#2026');
                            }
                          }}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                            selectedRole === 'officer'
                              ? 'border-blue-600 bg-blue-50/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {selectedRole === 'officer' && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-sm text-slate-900">Municipal Officer</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Manage assigned complaints, update resolutions, and improve civic services.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORM FIELDS */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Full Name (on Register) */}
                {authMode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={selectedRole === 'officer' ? 'e.g. Rajesh Sharma' : 'e.g. Priya Sharma'}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Email field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {authMode === 'login'
                      ? 'Official or Citizen Email Address *'
                      : selectedRole === 'officer'
                      ? 'Official Email Address *'
                      : 'Email Address *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        selectedRole === 'officer'
                          ? 'rajesh.sharma@indore.gov.in'
                          : 'priya.sharma@example.com'
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  {authMode === 'register' && selectedRole === 'officer' && (
                    <span className="text-[11px] text-slate-400">Use your official municipal email address.</span>
                  )}
                </div>

                {/* 3. Phone & Location / Dept on Register */}
                {authMode === 'register' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Department or City/Area */}
                    {selectedRole === 'officer' ? (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Department *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 bg-white"
                          >
                            <option value="Roads & Public Works">Roads & Public Works</option>
                            <option value="Sanitation & Solid Waste">Sanitation & Solid Waste</option>
                            <option value="Water Works & Drainage">Water Works & Drainage</option>
                            <option value="Electrical & Lighting">Electrical & Lighting</option>
                            <option value="Horticulture & Greenery">Horticulture & Greenery</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">City / Area *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            required
                            value={cityArea}
                            onChange={(e) => setCityArea(e.target.value)}
                            placeholder="Indore, Sector 4"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Officer Employee ID & Municipality (Officer Register Only) */}
                {authMode === 'register' && selectedRole === 'officer' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Employee / Officer ID *</label>
                      <input
                        type="text"
                        required
                        value={officerId}
                        onChange={(e) => setOfficerId(e.target.value)}
                        placeholder="e.g. IND-PWD-8429"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                      />
                      <span className="text-[10px] text-slate-400">Enter the ID issued by your municipality.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">City / Municipality *</label>
                      <input
                        type="text"
                        required
                        value={municipality}
                        onChange={(e) => setMunicipality(e.target.value)}
                        placeholder="e.g. Indore Municipal Corporation"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Password field */}
                {authMode !== 'forgot' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {authMode === 'login' ? 'Account Password *' : 'Password *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Password (on Register) */}
                {authMode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Confirm Password *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator (Exact screenshot match) */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                        <span className="text-slate-500">Password Strength</span>
                        <span className="text-emerald-600">Strong</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="h-1.5 rounded-full bg-blue-600"></div>
                        <div className="h-1.5 rounded-full bg-blue-600"></div>
                        <div className="h-1.5 rounded-full bg-emerald-500"></div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Use at least 8 characters with a mix of letters, numbers, and symbols.
                      </span>
                    </div>
                  </div>
                )}

                {/* Login Remember & Forgot row */}
                {authMode === 'login' && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Remember me on this device</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Officer Verification Notice Callout (Officer Register Only) */}
                {authMode === 'register' && selectedRole === 'officer' && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Officer Verification Required:</span> Municipal officer accounts may require verification before access is activated. You will be notified once your credentials have been reviewed.
                    </div>
                  </div>
                )}

                {/* Terms agreement checkbox (on Register) */}
                {authMode === 'register' && (
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                      />
                      <span>
                        I agree to the <button type="button" onClick={() => onNavigate('terms')} className="text-blue-600 font-semibold hover:underline">Terms of Service</button> and <button type="button" onClick={() => onNavigate('privacy')} className="text-blue-600 font-semibold hover:underline">Privacy Policy</button>.
                      </span>
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-xs shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span>Authenticating...</span>
                  ) : authMode === 'login' ? (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : authMode === 'register' ? (
                    selectedRole === 'officer' ? (
                      <>
                        <span>Request Officer Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Create Citizen Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )
                  ) : (
                    <span>Send Password Reset Link</span>
                  )}
                </button>

                {/* Blue Multi-Tier Notice (Citizen vs Municipal Verification Policy) */}
                {authMode === 'login' && (
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold">Two-Tier Role Verification Policy</div>
                      <p className="text-[11px] text-blue-800 leading-relaxed">
                        Citizens can sign in immediately after verifying their email. Municipal Officers require both official email verification and nodal approval from the platform administration.
                      </p>
                    </div>
                  </div>
                )}

                {/* Bottom switch link */}
                <div className="text-center pt-2 text-xs text-slate-500">
                  {authMode === 'login' ? (
                    <div>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('register')}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Create an account
                      </button>
                    </div>
                  ) : (
                    <div>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Login
                      </button>
                    </div>
                  )}
                </div>

                {/* Security footnote tag */}
                <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {selectedRole === 'officer' && authMode === 'register'
                      ? 'Official Municipal Credentials Protected by GovTech Security'
                      : '256-bit encryption & ISO 27001 Certified GovTech'}
                  </span>
                </div>
              </form>
            </>
          )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer variant="auth" onNavigate={onNavigate} />
    </div>
  );
}
