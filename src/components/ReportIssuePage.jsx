import React, { useState } from 'react';
import CivicLogo from './CivicLogo.jsx';
import { civicDataService } from '../services/supabaseClient.js';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Check,
  CheckCircle2,
  RotateCcw,
  Edit2,
  ShieldCheck,
  MapPin,
  Lock,
  ArrowRight,
  ArrowLeft,
  Camera,
  Upload,
  Cpu,
  Layers,
  FileText,
  AlertTriangle,
  Building2,
  Clock,
  Send,
  Eye,
  Sliders,
  Sun,
  Bell,
  ChevronDown
} from 'lucide-react';

export default function ReportIssuePage({
  currentUser,
  notifications = [],
  onNavigate,
  onSubmitSuccess,
  onShowToast
}) {
  // Step state: 1: Details Entry, 2: AI Analysis, 3: Review, 4: Confirmed
  const [currentStep, setCurrentStep] = useState(2); // default to step 2 to showcase the exact screen!
  const [isConfirmedCheckbox, setIsConfirmedCheckbox] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleEditStep = (sectionName) => {
    setCurrentStep(1);
    if (onShowToast && sectionName) {
      onShowToast(`Editing ${sectionName} in Step 1`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Form values
  const [formData, setFormData] = useState({
    title: 'Large Pothole on Main Road',
    category: 'Roads & Infrastructure',
    issueType: 'Pothole / Road Damage',
    subType: 'Asphalt Void',
    severity: 'High (Traffic & Public Safety Hazard)',
    priorityTier: 'Priority 1 (Urgent 24h)',
    department: 'Roads & Infrastructure Department (PWD Indore)',
    assignedTeam: 'PWD Indore Field Team #04 (Indore Central)',
    ward: 'Ward 18, Zone 4',
    address: 'Vijay Nagar Main Rd, Scheme 54, Indore, Madhya Pradesh 452010',
    geo: '22.7533° N, 75.8937° E',
    precision: '±3.2m (High Reliability)',
    citizenStatement: 'Deep hazardous road pothole with exposed gravel near Vijay Nagar Square right next to the metro pillar. Causing serious two-wheeler skids and bottleneck during peak hours.',
    confidence: '94%',
    aiModel: 'Neural Model v4.2',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
    macroImage: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    reportedOn: '07 October 2026, 10:42 AM (IST)',
    slaTarget: 'Standard 24-Hour Municipal Resolution SLA'
  });

  const handleRerunAI = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 800);
  };

  const handleSubmitComplaint = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    const complaintPayload = {
      title: formData.title,
      category: formData.category,
      location: 'Vijay Nagar Square, Near Orbit Mall, Indore',
      address: formData.address,
      geo: formData.geo,
      priority: 'High Priority',
      severityLevel: formData.severity,
      department: formData.department,
      assignedTeam: formData.assignedTeam,
      confidence: formData.confidence,
      aiDetected: 'Road Damage / Asphalt Crater',
      dimensions: '45cm Asphalt Crater',
      image: formData.image,
      description: formData.citizenStatement
    };

    onSubmitSuccess(complaintPayload);
    onNavigate('my-complaints');
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. TOP NAVBAR (Shared navbar matching screenshots) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between">
          <CivicLogo 
            subtitle="Civic Issue Reporting & Resolution System" 
            onClick={() => onNavigate('landing')}
          />

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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold text-blue-600 bg-blue-50/80 border border-blue-200/60 transition-all cursor-pointer"
            >
              <span>Report Issue</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            </button>
            <button
              onClick={() => onNavigate('my-complaints')}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              History
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('notifications')}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('profile-settings')}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 transition-all cursor-pointer"
              title="Profile & Settings"
            >
              <div className="w-7 h-7 rounded-full bg-[#2563eb] text-white font-bold text-xs flex items-center justify-center">
                {currentUser?.initials || 'PS'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser?.name || 'Priya Sharma'}</div>
                <div className="text-[10px] text-slate-500 leading-tight">{currentUser?.city ? `${currentUser.city.split(',')[0]}, MP` : 'Indore, MP'} • {currentUser?.ward?.split(',')[0] || 'Ward 18'}</div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* STEPPER HEADER (Exact Match with Step 2 & Step 3 screenshots) */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {currentStep === 3 ? 'Pre-Submission Verification Gate' : 'AI-Assisted Fast-Track Municipal Routing'}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Automated Classification Engine • High Precision</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {currentStep === 1 && 'Step 1 of 4: Details Entry'}
            {currentStep === 2 && 'Step 2 of 4: AI Analysis'}
            {currentStep === 3 && 'Step 3 of 4: Active Review & Verify'}
            {currentStep === 4 && 'Step 4 of 4: Submit & SLA'}
          </h1>

          {/* 4 Step Progress Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Step 1 */}
            <div 
              onClick={() => setCurrentStep(1)}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                currentStep > 1
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : currentStep === 1
                  ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Step 1</span>
                <span className="text-xs font-bold text-slate-900">Details Entry</span>
              </div>
            </div>

            {/* Step 2 */}
            <div 
              onClick={() => setCurrentStep(2)}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                currentStep === 2
                  ? 'bg-white border-2 border-blue-600 shadow-sm'
                  : currentStep > 2
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep > 2
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}>
                {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
              </div>
              <div>
                <span className="text-[10px] text-blue-600 block font-semibold">
                  {currentStep === 2 ? 'Current Step' : 'Step 2'}
                </span>
                <span className="text-xs font-bold text-slate-900">AI Analysis</span>
              </div>
            </div>

            {/* Step 3 */}
            <div 
              onClick={() => setCurrentStep(3)}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                currentStep === 3
                  ? 'bg-white border-2 border-blue-600 shadow-sm'
                  : currentStep > 3
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                3
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {currentStep === 3 ? 'Active' : 'Upcoming'}
                </span>
                <span className="text-xs font-bold text-slate-900">Review</span>
              </div>
            </div>

            {/* Step 4 */}
            <div 
              onClick={() => setCurrentStep(4)}
              className="p-3.5 rounded-xl border border-slate-200 bg-white opacity-60 flex items-center gap-3 transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                4
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Upcoming</span>
                <span className="text-xs font-bold text-slate-900">Submit & SLA</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: STEP 2 (AI ANALYSIS) - Exact Match with Civic Connect - Report Issue Step 2_ AI Analysis.png
        ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Title & Subtitle Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Analysis</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ● AI Computer Vision & NLP Engine Active
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Our AI is analyzing your report to identify the issue, assess its severity, and route it to the right department.
                </p>
              </div>

              <button
                onClick={handleRerunAI}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>Re-run AI Analysis</span>
              </button>
            </div>

            {/* 4 Green Verification Status Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Report Comprehension</span>
                  <span className="text-slate-500 text-[11px]">Understood citizen description text</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Visual Feature Extraction</span>
                  <span className="text-slate-500 text-[11px]">EXIF verified, asphalt crack mapped</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Severity & Priority Scored</span>
                  <span className="text-slate-500 text-[11px]">Identified category & hazard score</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Dispatch Route Assigned</span>
                  <span className="text-slate-500 text-[11px]">Indore PWD Ward 18 geolocated</span>
                </div>
              </div>
            </div>

            {/* Two Column Layout (AI Result vs Explainable AI & Evidence) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: AI Analysis Result Card */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
                  {/* Card Header with Confidence Dial */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <h3 className="text-base font-bold text-slate-900">AI Analysis Result</h3>
                      </div>
                      <p className="text-xs text-slate-500">
                        AI suggests, citizen reviews. You can edit any parameter before proceeding.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 bg-blue-50/60 border border-blue-100 px-3 py-1.5 rounded-2xl flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                        94%
                      </div>
                      <div className="text-[11px] text-left">
                        <span className="font-bold text-slate-900 block">94% Confidence</span>
                        <span className="text-slate-500 text-[10px]">Neural Model v4.2</span>
                      </div>
                    </div>
                  </div>

                  {/* Parameter rows with Edit buttons */}
                  <div className="space-y-3.5">
                    {/* Category */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CATEGORY</span>
                          <span className="text-xs font-bold text-slate-900">{formData.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditStep('Category')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Edit</span>
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Issue Type */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ISSUE TYPE</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{formData.issueType}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 font-semibold">{formData.subType}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditStep('Issue Type')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Edit</span>
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Assessed Severity */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                          <Sliders className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ASSESSED SEVERITY</span>
                          <span className="text-xs font-bold text-amber-700">● {formData.severity}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditStep('Assessed Severity')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Edit</span>
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Recommended Dispatch */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RECOMMENDED DISPATCH</span>
                          <span className="text-xs font-bold text-slate-900">{formData.department}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditStep('Recommended Dispatch')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Edit</span>
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Jurisdiction Ward */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">JURISDICTION WARD</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{formData.ward}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">Geo-verified</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditStep('Jurisdiction Ward')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Edit</span>
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Citizen Sovereignty Guarantee */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Citizen Sovereignty Guarantee:</span> AI suggestions can be edited before submission. You retain complete control over your official report, department target, and severity classification.
                    </div>
                  </div>
                </div>

                {/* Want to file manually card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Sliders className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Want to file manually without AI suggestions?</span>
                      <span className="text-[11px] text-slate-500">Your complaint can proceed smoothly with manual categorization at any time.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={handleRerunAI}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Re-run AI Analysis
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      Continue Manually
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Explainable AI & Evidence Cards */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* Why AI Classified It This Way */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">Why AI Classified It This Way</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Explainable AI</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Based on the uploaded image <strong className="text-slate-900 font-mono">IMG_2026_0411.JPG</strong> and your description, the computer vision model detected deep asphalt surface depression and exposed gravel consistent with a hazardous road pothole. The GPS telemetry matches AB Road Metro Corridor under Indore PWD jurisdiction.
                  </p>

                  <div className="space-y-2.5 pt-1 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-600">Visual Match</span>
                        <span className="font-bold text-emerald-600">98.4%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98.4%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-600">Context Semantic Match</span>
                        <span className="font-bold text-emerald-600">91.2%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '91.2%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-600">Jurisdiction Geofence</span>
                        <span className="font-bold text-blue-600">100% Locked</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analyzed Information Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-900">Analyzed Information</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Citizen Evidence</span>
                  </div>

                  {/* Photo with BBox overlay */}
                  <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-900">
                    <img
                      src={formData.image}
                      alt="AI analyzed evidence"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1.5 border border-white/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Detected: Road Pothole (98.4%)</span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-slate-300 text-[9px] font-mono px-2 py-0.5 rounded">
                      Model: ResNet-Road-v4 • BBox [0.34, 0.48]
                    </div>
                  </div>

                  {/* Citizen Statement */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CITIZEN STATEMENT</span>
                    <p className="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                      "{formData.citizenStatement}"
                    </p>
                  </div>

                  {/* Verified Geotagged Location */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>VERIFIED GEOTAGGED LOCATION</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">Vijay Nagar Main Rd, Scheme 54, Indore, MP</div>
                    <div className="text-[10px] font-mono text-slate-500">22.7533° N, 75.8937° E • Precision: ±3.2m</div>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Details</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit Municipal SSL Telemetry • Direct PWD Dispatch Queue</span>
              </div>

              <button
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-600/30 transition-all cursor-pointer"
              >
                <span>Continue to Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: STEP 3 (REVIEW YOUR COMPLAINT) - Exact Match with Civic Connect - Report Issue Step 3_ Review.png
        ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Title & Subtitle Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Review Your Complaint</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Please review the details below before submitting your complaint. You can edit any information if needed.
                </p>
              </div>

              <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Almost there — your complaint is ready for official dispatch.</span>
              </span>
            </div>

            {/* Two Column Layout (Details Sections vs Submit Checklist) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: 5 Review Sections */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* 1. Issue Details */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">Issue Details</h3>
                    </div>
                    <button
                      onClick={() => handleEditStep('Issue Details')}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Details</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ISSUE TYPE</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-slate-900">{formData.issueType}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">{formData.subType}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CATEGORY</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-slate-900">{formData.category}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">98.4% Match</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <span>CITIZEN DESCRIPTION</span>
                      <span>24 Words • Original Entry</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{formData.citizenStatement}"
                    </p>
                  </div>
                </div>

                {/* 2. Photos & Evidence */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">Photos & Evidence</h3>
                    </div>
                    <button
                      onClick={() => handleEditStep('Photos & Evidence')}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Evidence</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Primary Photo */}
                    <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-900">
                      <img src={formData.image} alt="Primary" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Primary Photo</span>
                      </div>
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Geo-Tagged
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-3">
                        <div className="w-3/4 h-2/3 border border-dashed border-sky-400 rounded flex items-center justify-center">
                          <span className="bg-slate-950/80 text-white text-[8px] font-mono px-1 rounded">
                            [AI Bounding Box #01: Void 1.4m x 0.9m]
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Angle 2 Macro Photo */}
                    <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-900">
                      <img src={formData.macroImage} alt="Angle 2" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                        Angle 2 • Macro Depth
                      </div>
                      <div className="absolute bottom-2 left-2 bg-slate-950/80 text-slate-300 text-[8px] font-mono px-1.5 py-0.5 rounded">
                        Sub-base structural damage verified
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">2 Photos Attached</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">EXIF Geotag Matched</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">EXIF Timestamp Verified</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">3.8 MB Compressed Lossless</span>
                  </div>
                </div>

                {/* 3. Location & Jurisdiction */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">Location & Jurisdiction</h3>
                    </div>
                    <button
                      onClick={() => handleEditStep('Location & Jurisdiction')}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Location</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-7 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">STREET ADDRESS</span>
                        <div className="text-xs font-bold text-slate-900 mt-0.5">{formData.address}</div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ADMINISTRATIVE JURISDICTION</span>
                        <div className="text-xs font-bold text-slate-900 mt-0.5">{formData.ward} • Administrative Circle: PWD Indore (Public Works)</div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GEOCOORDINATES & ACCURACY</span>
                        <div className="text-xs font-mono font-bold text-blue-600 mt-0.5">{formData.geo} • Precision: ±3.2m (High Reliability)</div>
                      </div>
                    </div>

                    <div className="sm:col-span-5 rounded-2xl bg-sky-50 border border-sky-100 p-3 flex flex-col justify-between text-center relative overflow-hidden">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-700">Indore Urban Grid</span>
                        <span className="text-blue-600 font-bold bg-white px-1.5 py-0.5 rounded">GPS Active</span>
                      </div>
                      <div className="py-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 block mt-1">Scheme 54 / AB Road Metro Corridor</span>
                      </div>
                      <button
                        onClick={() => handleEditStep('Location Pin')}
                        className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Adjust Pin on Map
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Severity & Department Routing */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">Severity & Department Routing</h3>
                    </div>
                    <button
                      onClick={() => handleEditStep('Severity & Department Routing')}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Routing</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ASSESSED SEVERITY</span>
                      <div className="text-xs font-bold text-rose-600 mt-0.5">● {formData.severity}</div>
                      <span className="text-[11px] text-slate-500 block mt-1">Assessed based on vehicle volume index on Vijay Nagar Main Road corridor and exposed metal edge.</span>
                      <div className="mt-2 text-[11px]">
                        <span className="text-slate-400">Priority Tier: </span>
                        <strong className="text-slate-800">{formData.priorityTier}</strong>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RECOMMENDED DISPATCH TARGET</span>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">{formData.department}</div>
                      <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">{formData.assignedTeam}</span>
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] font-semibold mb-1">
                          <span className="text-slate-500">AI Engine Confidence:</span>
                          <span className="text-blue-600">94% Confidence (Neural Model v4.2)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: '94%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] text-blue-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Citizen Sovereignty Notice:</strong> AI-generated suggestions can be changed before submission. You retain 100% control over the final report category and routing before dispatch.
                    </span>
                  </div>
                </div>

                {/* 5. Filing Schedule & Timestamp */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">Filing Schedule & Timestamp</h3>
                    </div>
                    <button
                      onClick={() => handleEditStep('Filing Schedule')}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">REPORTED ON</span>
                      <div className="font-bold text-slate-900 mt-0.5">{formData.reportedOn}</div>
                      <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Captured via Certified Mobile Clock</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TARGET RESOLUTION SLA</span>
                      <div className="font-bold text-blue-600 mt-0.5">{formData.slaTarget}</div>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">Statutory Citizen Charter Guarantee</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Verification & Submission Action Card */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* Before You Submit Checklist */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Before You Submit</h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Issue details & description are verified and accurate.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Photos & visual evidence are relevant, clear, and unblurred.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Location pin matches the physical incident site on Vijay Nagar Rd.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Category (Roads & Infrastructure) and High Severity confirmed.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Official Indore PWD field unit in Ward 18 targeted for instant assignment.</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>All 5 verification gates passed</span>
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      100% Ready
                    </span>
                  </div>
                </div>

                {/* What Happens Next */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">What Happens Next?</h3>
                  </div>

                  <p className="text-xs text-slate-500">
                    Upon submission, our automated municipal engine initiates rapid dispatch:
                  </p>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <strong className="text-slate-900 block">Instant Ticket ID Generation</strong>
                        <span className="text-slate-500 text-[11px]">Allocates unique incident tracking token (e.g. #CC-10245).</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <strong className="text-slate-900 block">Direct Push to PWD Field Unit</strong>
                        <span className="text-slate-500 text-[11px]">Sent directly to Indore PWD Squad #04 mobile terminal.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <strong className="text-slate-900 block">Citizen Live Tracking</strong>
                        <span className="text-slate-500 text-[11px]">Real-time status updates delivered via WhatsApp & SMS.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        4
                      </div>
                      <div>
                        <strong className="text-slate-900 block">Resolution with Photo Proof</strong>
                        <span className="text-slate-500 text-[11px]">Before/after geotagged completion proof before ticket close.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Submission Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isConfirmedCheckbox}
                      onChange={e => setIsConfirmedCheckbox(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <span>
                      I confirm that the information provided is accurate and represents a genuine civic incident under municipal jurisdiction.
                    </span>
                  </label>

                  <button
                    onClick={handleSubmitComplaint}
                    disabled={!isConfirmedCheckbox}
                    className="w-full py-3.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <span>Submit Complaint</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to AI Analysis</span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-bit Municipal SSL Telemetry • Direct PWD Dispatch Queue</span>
                  </div>
                </div>

                {/* Green Ready Banner */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold">
                    All required fields are complete and verified. Ready for submission.
                  </span>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* STEP 1: Details Entry (Complete Interactive Editor) */}
        {currentStep === 1 && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Step 1: Enter or Edit Issue Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">Customize your civic issue parameters, location, department routing, and evidence.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Citizen Sovereignty Editor
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Issue Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                  >
                    <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                    <option value="Sanitation & Solid Waste">Sanitation & Solid Waste</option>
                    <option value="Electricity & Streetlights">Electricity & Streetlights</option>
                    <option value="Water Works & Drainage">Water Works & Drainage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Issue Type</label>
                  <input
                    type="text"
                    value={formData.issueType}
                    onChange={e => setFormData({ ...formData, issueType: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assessed Severity</label>
                  <select
                    value={formData.severity}
                    onChange={e => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                  >
                    <option value="High (Traffic & Public Safety Hazard)">High (Traffic & Public Safety Hazard)</option>
                    <option value="Medium (Neighborhood Service Disruption)">Medium (Neighborhood Service Disruption)</option>
                    <option value="Low (Routine Civic Maintenance)">Low (Routine Civic Maintenance)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Citizen Description</label>
                <textarea
                  rows={3}
                  value={formData.citizenStatement}
                  onChange={e => setFormData({ ...formData, citizenStatement: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Jurisdiction Ward</label>
                  <input
                    type="text"
                    value={formData.ward}
                    onChange={e => setFormData({ ...formData, ward: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Evidence Photo Upload (Supabase Storage + Base64 Fallback) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>Primary Incident Photo</span>
                    </label>
                    <label className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer inline-flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const { photoUrl } = await civicDataService.uploadEvidencePhoto('', file);
                          if (photoUrl) {
                            setFormData((prev) => ({ ...prev, image: photoUrl }));
                            if (onShowToast) onShowToast(`Primary photo (${file.name}) attached with EXIF geotag.`);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <img
                    src={formData.image}
                    alt="Primary Incident Preview"
                    className="w-full h-28 object-cover rounded-xl border border-slate-200"
                  />
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Close-up / Macro Photo</span>
                    </label>
                    <label className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold cursor-pointer inline-flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload Macro</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const { photoUrl } = await civicDataService.uploadEvidencePhoto('', file);
                          if (photoUrl) {
                            setFormData((prev) => ({ ...prev, macroImage: photoUrl }));
                            if (onShowToast) onShowToast(`Close-up photo (${file.name}) attached.`);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <img
                    src={formData.macroImage}
                    alt="Close-up Preview"
                    className="w-full h-28 object-cover rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Skip to Review
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                >
                  Proceed to AI Analysis →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Submit & SLA Guarantee View */}
        {currentStep === 4 && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Step 4: Statutory SLA & Final Dispatch</h2>
                  <p className="text-xs text-slate-500">Guaranteed resolution timeline under the Indore Municipal Citizen Charter</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {formData.priorityTier}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">TARGET SLA WINDOW</span>
                <div className="font-extrabold text-slate-900 text-sm">24 Hours Max</div>
                <span className="text-[11px] text-emerald-600 font-semibold block">Auto-Escalation Enabled</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">ASSIGNED FIELD UNIT</span>
                <div className="font-extrabold text-slate-900 text-sm">PWD Squad #04</div>
                <span className="text-[11px] text-blue-600 font-semibold block">{formData.ward}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">AI VERIFICATION</span>
                <div className="font-extrabold text-slate-900 text-sm">{formData.confidence} Match</div>
                <span className="text-[11px] text-slate-500 block">{formData.aiModel}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs text-slate-700">
              <div className="font-bold text-slate-900">Summary of Official Dispatch Packet</div>
              <p><strong>Issue:</strong> {formData.title} ({formData.category})</p>
              <p><strong>Location:</strong> {formData.address} ({formData.geo})</p>
              <p><strong>Statement:</strong> "{formData.citizenStatement}"</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Review</span>
              </button>

              <button
                onClick={handleSubmitComplaint}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs shadow-xs shadow-blue-600/30 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Confirm & Dispatch Ticket Now</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200 bg-white pt-12 pb-10 px-4 sm:px-8 mt-12 text-slate-600">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
            <div className="space-y-3">
              <CivicLogo subtitle="" onClick={() => onNavigate('landing')} />
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Empowering transparent municipal workflows and citizen reporting through high-assurance artificial intelligence and automated civil dispatch.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>ISO 27001 Certified Municipal Portal</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">PLATFORM</span>
              <ul className="space-y-2 text-slate-500">
                <li><button onClick={() => onNavigate('landing')} className="hover:text-blue-600 cursor-pointer">Platform Overview</button></li>
                <li><button onClick={() => onNavigate('vision-engine')} className="hover:text-blue-600 cursor-pointer">AI Computer Vision</button></li>
                <li><button onClick={() => onNavigate('my-complaints')} className="hover:text-blue-600 cursor-pointer">Complaint Tracking</button></li>
                <li><button onClick={() => onNavigate('workflows')} className="hover:text-blue-600 cursor-pointer">Resolution Workflows</button></li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">GOVERNANCE</span>
              <ul className="space-y-2 text-slate-500">
                <li><button onClick={() => onNavigate('partnerships')} className="hover:text-blue-600 cursor-pointer">City Partnerships</button></li>
                <li><button onClick={() => onNavigate('impact-report')} className="hover:text-blue-600 cursor-pointer">Civic Impact Report</button></li>
                <li><button onClick={() => onNavigate('security')} className="hover:text-blue-600 cursor-pointer">Security & Compliance</button></li>
                <li><button onClick={() => onNavigate('support')} className="hover:text-blue-600 cursor-pointer">Contact Support</button></li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">POLICIES</span>
              <ul className="space-y-2 text-slate-500">
                <li><button onClick={() => onNavigate('privacy')} className="hover:text-blue-600 cursor-pointer">Privacy Policy</button></li>
                <li><button onClick={() => onNavigate('terms')} className="hover:text-blue-600 cursor-pointer">Terms of Service</button></li>
                <li><button onClick={() => onNavigate('governance')} className="hover:text-blue-600 cursor-pointer">Citizen Rights Charter</button></li>
                <li><button onClick={() => onNavigate('security')} className="hover:text-blue-600 cursor-pointer">RTI Telemetry Logs</button></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              © 2025 Civic Connect Inc. Built with Purpose. Built for the Community. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span className="text-emerald-600 font-semibold">● All Municipal Dispatch Services Operational</span>
              <span>•</span>
              <button onClick={() => onNavigate('governance')} className="hover:text-slate-600 cursor-pointer">Accessibility</button>
              <span>•</span>
              <button onClick={() => onNavigate('terms')} className="hover:text-slate-600 cursor-pointer">SLA Guidelines</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
