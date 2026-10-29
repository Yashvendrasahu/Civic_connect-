import React, { useState } from 'react';
import CivicLogo from './CivicLogo.jsx';
import Footer from './Footer.jsx';
import himYasImg from '../assets/Him-yas.png';
import {
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  MapPin,
  Cpu,
  FileText,
  Send,
  Check,
  Eye,
  Sliders,
  TrendingUp,
  Bell,
  CheckCheck,
  Building,
  Truck,
  Sun,
  Activity,
  UserCheck,
  Layers,
  Wrench,
  Camera,
  FolderOpen
} from 'lucide-react';

export default function LandingPage({
  onNavigate,
  onOpenReportModal,
  onTrackTicket,
  currentUser,
  complaints = [],
  onLogout
}) {
  const [activeNav, setActiveNav] = useState('platform');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalLogged = complaints.length;
  const totalResolved = complaints.filter((c) => c.status === 'Resolved').length;
  const resolutionRate =
    totalLogged > 0 ? `${Math.round((totalResolved / totalLogged) * 100)}%` : '0%';

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. TOP NAVBAR (100% Screenshot Accurate) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <CivicLogo 
            showTag 
            tagText="AI-CIVIC" 
            onClick={() => onNavigate('landing')}
          />

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-slate-600">
            <button 
              onClick={() => scrollToSection('platform')}
              className="hover:text-blue-600 transition-colors cursor-pointer text-blue-600 font-semibold"
            >
              Platform
            </button>
            <button 
              onClick={() => scrollToSection('workflow')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('impact')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Impact
            </button>
            <button 
              onClick={() => scrollToSection('mission')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-50 border border-slate-200/90 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              title="Current theme: Pure Light"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Pure Light</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() =>
                    onNavigate(
                      currentUser.role === 'admin'
                        ? 'admin-dashboard'
                        : currentUser.role === 'officer'
                        ? 'officer-dashboard'
                        : 'dashboard'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser.initials || 'U'}
                  </span>
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 transition-colors cursor-pointer font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('login')}
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 px-2.5 sm:px-3 py-2 transition-colors cursor-pointer"
              >
                Login
              </button>
            )}

            <button 
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#2563eb] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-lg shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>Report Issue</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 shadow-lg">
            <button 
              onClick={() => scrollToSection('platform')}
              className="block w-full text-left py-2 text-sm font-semibold text-blue-600"
            >
              Platform
            </button>
            <button 
              onClick={() => scrollToSection('workflow')}
              className="block w-full text-left py-2 text-sm font-medium text-slate-700"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('impact')}
              className="block w-full text-left py-2 text-sm font-medium text-slate-700"
            >
              Impact
            </button>
            <button 
              onClick={() => scrollToSection('mission')}
              className="block w-full text-left py-2 text-sm font-medium text-slate-700"
            >
              About
            </button>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Theme: Pure Light</span>
              <button 
                onClick={() => onNavigate('dashboard')}
                className="text-xs text-blue-600 font-semibold"
              >
                Go to Citizen Dashboard →
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section id="platform" className="relative pt-12 pb-20 overflow-hidden">
        {/* Subtle dot matrix grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-6 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-[12px] font-semibold text-blue-700 tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI-POWERED CIVIC PLATFORM</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Report. Track. Resolve. <br />
                <span className="text-[#2563eb]">Build Better Communities.</span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Civic Connect makes civic issue reporting smarter, faster, and more transparent — helping citizens report problems and track their resolution from anywhere.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button 
                  onClick={onOpenReportModal}
                  className="inline-flex items-center gap-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-[15px] px-6 py-3.5 rounded-lg shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <span>Report an Issue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => onTrackTicket('CC10245')}
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-[15px] px-6 py-3.5 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4 text-slate-500" />
                  <span>Track My Complaint</span>
                </button>
              </div>

              {/* Feature 3-point checklist */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs sm:text-sm font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Simple reporting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Smart AI analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Real-time tracking</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Live AI Card (Screenshot exact replica) */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-lg lg:max-w-none bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                {/* Card Top GPS status header */}
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/60 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-semibold text-slate-700">Live GPS: Sector 4, Indore, MP</span>
                  </div>
                  <div className="font-semibold text-slate-600">
                    99.8% Uplink
                  </div>
                </div>

                {/* Road Image Container with AI bounding box */}
                <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80" 
                    alt="Indore street road inspection" 
                    className="w-full h-full object-cover opacity-90 contrast-105"
                  />

                  {/* High accuracy SVG AI Bounding Box overlay */}
                  <div className="absolute inset-0 pointer-events-none p-6 flex items-center justify-center">
                    <div className="relative w-4/5 h-3/5 border-2 border-dashed border-sky-400 bg-sky-500/10 rounded-sm">
                      {/* Top left tag */}
                      <div className="absolute -top-3 left-2 bg-slate-900/90 text-white text-[11px] font-mono px-2 py-0.5 rounded flex items-center gap-2 border border-sky-400/50">
                        <span className="text-sky-300 font-bold">Pothole / Asphalt Fissure</span>
                        <span className="text-emerald-400">Conf: 0.948</span>
                      </div>
                      {/* Dimension tag bottom right */}
                      <div className="absolute -bottom-2.5 right-2 bg-slate-900/85 text-slate-300 text-[10px] font-mono px-1.5 py-0.5 rounded">
                        Dim: 48cm x 32cm
                      </div>
                      {/* Corner crosshairs */}
                      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-sky-300" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-sky-300" />
                      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-sky-300" />
                      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-sky-300" />
                    </div>
                  </div>
                </div>

                {/* AI Analysis Details beneath photo */}
                <div className="p-5 space-y-3.5 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">AI Analysis: Road Damage Detected</span>
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">96% Confident</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Automated classification: Asphalt Fissure / Pothole
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dispatch Unit Info Tag */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center">
                        IMW
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800">Indore Municipal Works Dept</div>
                        <div className="text-[11px] text-slate-500">Ticket: #CC-10245 • Priority High</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      In Progress
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. WORKFLOW SIMPLIFIED: From Report to Resolution */}
      <section id="workflow" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-14">
            <span className="text-[12px] font-bold tracking-wider text-blue-600 uppercase">WORKFLOW SIMPLIFIED</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">From Report to Resolution</h2>
            <p className="text-slate-600 text-[15px]">
              A simple process designed to turn citizen reports into meaningful action.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 01 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-blue-600">01</span>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Report</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Describe the issue, upload a photo, and share its location with pinpoint accuracy.
                </p>
              </div>
              <div className="pt-6">
                <button onClick={onOpenReportModal} className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Instant geocoding →
                </button>
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-blue-600">02</span>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">AI Analyzes</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  AI identifies the issue, category, and severity within seconds to prioritize urgency.
                </p>
              </div>
              <div className="pt-6">
                <button onClick={() => scrollToSection('vision')} className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Instant triage →
                </button>
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-blue-600">03</span>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Get Assigned</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The complaint is routed directly to the appropriate municipal or civic department.
                </p>
              </div>
              <div className="pt-6">
                <button onClick={() => scrollToSection('transparency')} className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Smart dispatch →
                </button>
              </div>
            </div>

            {/* Step 04 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-blue-600">04</span>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Track & Resolve</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Follow the progress transparently with real-time status alerts until the issue is resolved.
                </p>
              </div>
              <div className="pt-6">
                <button onClick={() => onTrackTicket('CC10245')} className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Photo verification →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR CORE MISSION: Built with Purpose. Built for the Community. */}
      <section id="mission" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-[12px] font-bold tracking-wider text-blue-600 uppercase">OUR CORE MISSION</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Built with Purpose. Built for the Community.
            </h2>
            <p className="text-slate-600 text-[15px]">
              Civic Connect brings technology and civic responsibility together to create a better way for communities to connect with their city.
            </p>
          </div>

          {/* Creators Portrait Card (Screenshot match) */}
          <div className="max-w-2xl mx-auto bg-white p-3.5 rounded-2xl border border-slate-200 shadow-md">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 shadow-inner">
              <img 
                src={himYasImg} 
                alt="Himanshu Tamrakar & Yashvendra Sahu" 
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="text-center py-4">
              <h4 className="text-base font-bold text-slate-900">
                Himanshu Tamrakar • Yashvendra Sahu
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Founding Architects & Civic Technology Innovators
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ENGINEERED FOR IMPACT: Everything You Need to Make a Difference */}
      <section id="impact" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-14">
            <span className="text-[12px] font-bold tracking-wider text-blue-600 uppercase">ENGINEERED FOR IMPACT</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Everything You Need to Make a Difference</h2>
            <p className="text-slate-600 text-[15px]">
              Powerful tools that make civic issue reporting simple, transparent, and effective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI-Powered Detection</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automatically identify and categorize civic issues using advanced machine learning models trained on urban incidents.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Easy Issue Reporting</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Report problems seamlessly using natural descriptions, quick photo uploads, and automatic location tagging in under 60 seconds.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Smart Location Tracking</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Precisely identify where a civic issue needs attention using geolocation sensors and reverse-geocoded street coordinates.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Real-Time Status</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Know exactly where your complaint stands at any time with an interactive tracker updated immediately upon field inspection.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Smart Notifications</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive instant SMS and web updates whenever municipal officers accept, inspect, or resolve your reported ticket.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Transparent Resolution</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Follow the complete journey from initial upload to civic sign-off with verifiable after-repair photographic proof.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SMARTER REPORTING: Computer Vision Engine */}
      <section id="vision" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Box: Computer Vision Engine Card */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 tracking-wider">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>COMPUTER VISION ENGINE</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  94.8% AI Match
                </span>
              </div>

              {/* Viewfinder visual */}
              <div className="relative my-4 aspect-16/9 bg-slate-900 rounded-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80" 
                  alt="AI scanning defect" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="w-4/5 h-3/4 border-2 border-dashed border-sky-400 bg-sky-500/10 rounded flex items-center justify-center relative">
                    <span className="absolute -top-3 left-2 bg-slate-950 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      Pothole / Asphalt Fissure • Conf: 0.948
                    </span>
                    <span className="absolute -bottom-2 right-2 bg-slate-950 text-slate-300 text-[9px] font-mono px-1.5 py-0.5 rounded">
                      Dim: 48cm x 32cm
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail fields */}
              <div className="space-y-3 text-xs pt-1">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Detected Issue</span>
                  <span className="font-bold text-slate-800">Road Damage / Pothole</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Category</span>
                  <span className="font-semibold text-slate-800">Infrastructure</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 items-center">
                  <span className="text-slate-500">Severity Assessment</span>
                  <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    ⚠ Level 4 (High)
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Target Department</span>
                  <span className="font-bold text-slate-900">Road & Transport Directorate</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] mb-1 font-semibold">
                    <span className="text-slate-500">Confidence Calibration</span>
                    <span className="text-blue-600">94.8%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#2563eb] h-full rounded-full" style={{ width: '94.8%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Copy & Bullet checkpoints */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[12px] font-bold tracking-wider text-blue-600 uppercase">SMARTER REPORTING</span>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Let AI Understand the Problem.</h2>
                <p className="text-slate-600 text-[15px] leading-relaxed">
                  Civic Connect uses AI to analyze reported issues, identify their category and severity, and help route them to the appropriate department.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Faster categorization</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Automatic sorting eliminates human review delays in municipal triage centers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Better routing</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Dispatches complaints straight to the correct specialized squad on the first try.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Reduced manual effort</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Frees municipal staff from manual sorting so field teams can focus on repairs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">More accurate reporting</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Ensures objective damage classification based on size, depth, and hazard levels.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. COMPLETE TRANSPARENCY: Know What Happens Next */}
      <section id="transparency" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-[12px] font-bold tracking-wider text-blue-600 uppercase">COMPLETE TRANSPARENCY</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Know What Happens Next.</h2>
            <p className="text-slate-600 text-[15px]">
              Stay informed from the moment you submit a complaint until the issue is resolved.
            </p>
          </div>

          {/* Interactive Live Ticket Tracker Card */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-extrabold text-slate-900 font-mono">#CC10245</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Tracking Active
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Location: Indore, Madhya Pradesh • Category: Road Damage
                </div>
              </div>

              <div className="text-right text-xs text-slate-400">
                <div>Reported</div>
                <div className="font-bold text-slate-700">Today, 10:42 AM</div>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="py-8">
              <div className="grid grid-cols-5 relative">
                {/* Connecting lines */}
                <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-slate-200 z-0">
                  <div className="h-full bg-blue-600 transition-all duration-500 w-[75%]"></div>
                </div>

                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2">Submitted</span>
                  <span className="text-[10px] text-slate-500">10:42 AM</span>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2">AI Verified</span>
                  <span className="text-[10px] text-slate-500">10:43 AM</span>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2">Assigned</span>
                  <span className="text-[10px] text-slate-500">11:15 AM</span>
                </div>

                {/* Step 4 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-blue-100 shadow-xs animate-pulse">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 mt-2">In Progress</span>
                  <span className="text-[10px] text-blue-600 font-medium">Field Unit Out</span>
                </div>

                {/* Step 5 */}
                <div className="relative z-10 flex flex-col items-center text-center opacity-60">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center">
                    <span className="text-xs font-bold">5</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 mt-2">Resolved</span>
                  <span className="text-[10px] text-slate-400">Est 4:30 PM</span>
                </div>
              </div>
            </div>

            {/* Bottom Activity Dispatch Box */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
              <Truck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold">Latest Activity Dispatch:</span> Field inspection team #04 dispatched with rapid cold-mix asphalt repair vehicle. On-site resolution estimated within 3 hours.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MEASURABLE TRANSFORMATION: Making Communities Better, One Report at a Time */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-14">
            <span className="text-[12px] font-bold tracking-wider text-blue-600 uppercase">MEASURABLE TRANSFORMATION</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Making Communities Better, One Report at a Time.
            </h2>
            <p className="text-slate-600 text-[15px]">
              Real numbers reflecting real civic change across municipal wards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>TOTAL LOGGED</span>
                <FolderOpen className="w-4 h-4" />
              </div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {totalLogged}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700">Issues Reported</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Logged by active citizens across wards</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>COMPLETED</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {totalResolved}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700">Issues Resolved</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Verified with post-fix imagery & sign-off</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>EFFICIENCY</span>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {resolutionRate}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700">Resolution Rate</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Within standard municipal SLA windows</div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>AVAILABILITY</span>
                <Activity className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">24/7</div>
              <div>
                <div className="text-xs font-bold text-slate-700">Complaint Tracking</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Uninterrupted civic monitoring engine</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. THE VALUE WE PROVIDE: Why Civic Connect? */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-14">
            <span className="text-[12px] font-bold tracking-wider text-blue-600 uppercase">THE VALUE WE PROVIDE</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Why Civic Connect?</h2>
            <p className="text-slate-600 text-[15px]">
              Redefining the relationship between citizens and local governance through smart tech.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Faster */}
            <div className="p-6 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Faster</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Reduce the time between reporting and resolution with automated classification and instant department routing.
              </p>
            </div>

            {/* Transparent */}
            <div className="p-6 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Transparent</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Keep citizens informed at every stage with verifiable updates, assigned team tags, and before/after verification.
              </p>
            </div>

            {/* Data-Driven */}
            <div className="p-6 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Data-Driven</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Help authorities understand recurring civic problems, detect incident clusters, and allocate resources efficiently.
              </p>
            </div>

            {/* Citizen-Centric */}
            <div className="p-6 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Citizen-Centric</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Give communities a direct voice in improving their surroundings, cultivating active participation and trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. CALL TO ACTION BANNER */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/70 to-indigo-50/80 border border-blue-100 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <span className="text-[12px] font-bold tracking-wider text-blue-700 uppercase">EMPOWERING EVERY CITIZEN</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Your City. Your Voice. <span className="text-blue-600">Your Impact.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Report a civic issue today and help build a smarter, cleaner, and more connected community.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button 
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3.5 rounded-lg shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onTrackTicket('CC10245')}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-lg shadow-xs transition-all cursor-pointer"
              >
                Track Complaint
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <Footer variant="landing" onNavigate={onNavigate} />
    </div>
  );
}
