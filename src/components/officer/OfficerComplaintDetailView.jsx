import React, { useState, useEffect, useRef } from 'react';
import { civicDataService } from '../../services/supabaseClient.js';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Cpu,
  ShieldCheck,
  User,
  Camera,
  Send,
  Truck,
  Printer,
  Plus,
  Wrench,
  FileText,
  Sparkles,
  Check,
  ChevronRight,
  Lock,
  Navigation,
  CloudSun,
  Layers,
  RefreshCw,
  MessageSquare,
  Building2
} from 'lucide-react';

export default function OfficerComplaintDetailView({
  complaint,
  initialMode = 'verification', // 'verification' | 'execution'
  officerProfile,
  onBack,
  onUpdateComplaint,
  onShowToast
}) {
  const [subMode, setSubMode] = useState(initialMode); // 'verification' | 'execution'
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Verification checklist states (Screen 3)
  const [checklist, setChecklist] = useState({
    photoClarity: true,
    geoBoundary: true,
    duplicateCheck: true,
    severityConfirm: false
  });

  // Department assignment states (Screen 3 & 4)
  const [selectedDept, setSelectedDept] = useState(complaint?.department || 'Roads & Infrastructure');
  const [selectedSquad, setSelectedSquad] = useState(
    complaint?.assignedSquad?.includes('Unassigned')
      ? 'Indore PWD Road Maintenance Squad #04'
      : complaint?.assignedSquad || 'Indore PWD Road Maintenance Squad #04'
  );
  const [dispatchNote, setDispatchNote] = useState(
    complaint?.dispatchInstructions ||
      'Deploy hot-mix bitumen roller crew. Prioritize arterial turning lane before evening peak hour.'
  );
  const [aiAccepted, setAiAccepted] = useState(true);

  // Work execution states (Screen 4)
  const [activeStage, setActiveStage] = useState(3); // 1: Verification, 2: Assignment, 3: On-Site Execution, 4: Resolution
  const [workStageInput, setWorkStageInput] = useState('On-Site Material Laying & Compaction');
  const [workNoteInput, setWorkNoteInput] = useState('');
  const [workLogs, setWorkLogs] = useState(
    complaint?.workLogs?.length > 0
      ? complaint.workLogs
      : [
          {
            id: 'WL-902',
            time: 'Today, 11:40 AM',
            author: 'Mohan Lal Patidar (Squad Foreman #04)',
            role: 'On-Site Execution',
            badge: 'Bitumen Laying',
            note: 'Site barricaded with 12 reflective cones. Loose gravel and stagnant water cleared using high-pressure air blower. Tack coat applied; hot-mix bitumen laying initiated.',
            gps: `${complaint?.geo || '22.7533° N, 75.8937° E'} (Verified On-Site)`,
            photos: [complaint?.image]
          },
          {
            id: 'WL-901',
            time: 'Today, 10:15 AM',
            author: 'Er. R. K. Verma (AE - Zone 4)',
            role: 'Crew Dispatched',
            badge: 'Fleet Telemetry',
            note: 'Squad #04 mobilized from Zone 4 Sub-Depot with Vehicle MP09-CZ-8821 and 2.5 tonnes hot-mix asphalt.',
            gps: '22.7489° N, 75.8890° E',
            photos: []
          }
        ]
  );

  // Live SLA Countdown timer for Screen 4
  const [slaSeconds, setSlaSeconds] = useState(complaint?.slaTimerSeconds || 5 * 3600 + 18 * 60 + 42);
  useEffect(() => {
    const timer = setInterval(() => {
      setSlaSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec) => {
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    return { hrs, mins, secs };
  };
  const timerParts = formatTimer(slaSeconds);

  const photoInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState('evidence'); // 'evidence' | 'worklog'
  const [extraEvidencePhotos, setExtraEvidencePhotos] = useState([]);
  const [pendingWorklogPhotos, setPendingWorklogPhotos] = useState([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const photos = [
    complaint?.image || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80',
    ...(complaint?.secondaryImage ? [complaint.secondaryImage] : []),
    ...extraEvidencePhotos
  ];

  const handleTriggerPhotoSelect = (target) => {
    setUploadTarget(target);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
      photoInputRef.current.click();
    }
  };

  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !complaint?.id) return;
    setIsUploadingPhoto(true);
    try {
      const res = await civicDataService.uploadEvidencePhoto(complaint.id, file, {
        author: `${officerProfile?.name || 'Officer'} (${officerProfile?.officerId || 'IMC'})`,
        role: uploadTarget === 'worklog' ? workStageInput : 'Field Inspection Evidence',
        note:
          uploadTarget === 'worklog'
            ? workNoteInput.trim() || `Geotagged site photo attached (${file.name})`
            : `Additional officer verification evidence uploaded (${file.name})`
      });
      const uploadedUrl = res?.photoUrl;
      if (uploadedUrl) {
        if (uploadTarget === 'worklog') {
          setPendingWorklogPhotos((prev) => [...prev, uploadedUrl]);
          if (res?.workLog) {
            setWorkLogs((prev) => [res.workLog, ...prev]);
          }
          onShowToast('Geotagged site photo uploaded to Supabase & attached to Field Log!');
        } else {
          setExtraEvidencePhotos((prev) => [...prev, uploadedUrl]);
          onUpdateComplaint(complaint.id, { image: uploadedUrl });
          onShowToast('Evidence photo uploaded to Supabase & linked to complaint!');
        }
      }
    } catch {
      onShowToast('Could not upload photo file.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (!complaint) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-2xs">
        <div className="text-base font-extrabold text-slate-900">
          No Complaint Selected
        </div>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          There are currently no complaints selected or your Supabase complaints table is empty. Submit a complaint from Citizen View first to inspect it here.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Complaints</span>
        </button>
      </div>
    );
  }

  const handleVerifyApprove = async () => {
    await civicDataService.dispatchSquad(complaint.id, {
      assignedSquad: selectedSquad,
      department: selectedDept,
      instructions: dispatchNote,
      priority: complaint?.priority || 'High',
      slaHours: 24
    });
    onUpdateComplaint(complaint.id, {
      status: 'In Progress',
      assignedSquad: selectedSquad,
      department: selectedDept,
      dispatchInstructions: dispatchNote
    });
    onShowToast(`Complaint #${complaint.id} verified and Workorder dispatched to ${selectedSquad}!`);
    setSubMode('execution');
  };

  const handleQuickAssignSquad = async () => {
    await civicDataService.dispatchSquad(complaint.id, {
      assignedSquad: selectedSquad,
      department: selectedDept,
      instructions: dispatchNote,
      priority: complaint?.priority || 'High',
      slaHours: 24
    });
    onUpdateComplaint(complaint.id, {
      status: 'In Progress',
      assignedSquad: selectedSquad,
      department: selectedDept,
      dispatchInstructions: dispatchNote
    });
    onShowToast(`Dispatched ${selectedSquad} to #${complaint.id}`);
  };

  const handleAddWorkLog = async (e) => {
    e.preventDefault();
    if (!workNoteInput.trim()) {
      onShowToast('Please enter field activity observations before submitting.');
      return;
    }
    const payload = {
      author: `${officerProfile.name} (${officerProfile.officerId})`,
      role: workStageInput,
      badge: 'Officer Field Log',
      note: workNoteInput.trim(),
      gps: `${complaint?.geo || '22.7533° N, 75.8937° E'} (Verified Telemetry)`,
      photos: pendingWorklogPhotos
    };
    const res = await civicDataService.addWorkLog(complaint.id, payload);
    const newEntry = res?.workLog || {
      id: `WL-${Math.floor(903 + Math.random() * 90)}`,
      time: 'Just now',
      ...payload
    };
    setWorkLogs([newEntry, ...workLogs]);
    setWorkNoteInput('');
    setPendingWorklogPhotos([]);
    onShowToast(`Field work update logged to MeitY Audit Ledger for #${complaint.id}`);
  };

  const handleMarkResolved = () => {
    setActiveStage(4);
    onUpdateComplaint(complaint.id, {
      status: 'Resolved',
      executionStatus: 'Audited & Certified'
    });
    onShowToast(`Complaint #${complaint.id} marked as Resolved & signed off!`);
  };

  // ============================================================================
  // SCREEN 4: MANAGE COMPLAINT: ASSIGNMENT & WORK UPDATES (unnamed__5__d8685321.png)
  // ============================================================================
  if (subMode === 'execution') {
    return (
      <div className="space-y-6">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoFileChange}
          className="hidden"
        />
        {/* Top Navigation & Action Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="space-y-1">
            <button
              onClick={() => setSubMode('verification')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Complaint Details (#{complaint.id})</span>
            </button>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Manage Complaint: Assignment & Work Updates
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Active Dispatch Console
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Coordinate assigned municipal squads, monitor statutory SLA countdown, and record geo-verified field work updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onShowToast(`Work Order #WO-${complaint.id} sent to municipal printer queue.`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Work Order</span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('field-log-form');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Field Log</span>
            </button>
          </div>
        </div>

        {/* Summary Strip Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 border border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono text-xs font-bold">
              #{complaint.id}
            </span>
            <span className="font-bold text-sm sm:text-base text-white">
              {complaint.shortTitle || complaint.title} (14cm depth)
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {complaint.fullLocation || complaint.location}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold">
              {complaint.priority} (SLA: 6h remaining)
            </span>
            <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {complaint.status === 'Resolved' ? 'Resolved & Audited' : 'In Progress (Assigned & Active)'}
            </span>
          </div>
        </div>

        {/* 4-Stage Horizontal Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { step: 1, code: '01 VERIFICATION', status: 'DONE', title: 'AI & Officer Verified', sub: '20 Oct, 09:42 AM · 94% Conf.', done: true },
            { step: 2, code: '02 ASSIGNMENT', status: 'DONE', title: 'Routed to PWD Squad #04', sub: 'Lead: Er. R. K. Verma', done: true },
            { step: 3, code: '03 ACTIVE STAGE', status: 'LIVE', title: 'On-Site Execution', sub: 'Hot-mix bitumen laying active', active: activeStage === 3, done: activeStage > 3 },
            { step: 4, code: '04 RESOLUTION SUBMISSION', status: activeStage === 4 ? 'DONE' : 'NEXT', title: 'Quality Check & Closure', sub: 'Requires after-photo & GPS lock', active: activeStage === 4, done: activeStage === 4 }
          ].map((st) => (
            <div
              key={st.step}
              onClick={() => setActiveStage(st.step)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                st.active
                  ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/15'
                  : st.done
                  ? 'bg-white border-emerald-200'
                  : 'bg-white border-slate-200 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <span className={st.active ? 'text-blue-700' : st.done ? 'text-emerald-700' : 'text-slate-400'}>
                  {st.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    st.active
                      ? 'bg-blue-600 text-white'
                      : st.done
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {st.status}
                </span>
              </div>
              <div className="font-bold text-slate-900 text-sm">{st.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{st.sub}</div>
            </div>
          ))}
        </div>

        {/* Main 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Current Department Assignment & Crew Dispatch Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Current Department Assignment & Crew Dispatch
                    </h2>
                    <p className="text-xs text-slate-500">
                      Authorized under IMC Zone 04 Public Works Division
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Dispatched & On-Site
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    DEPARTMENT & ZONE
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-1">
                    {selectedDept} · Zone 04
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Division Code: #IMC-ENG-RDS</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    ASSIGNED TEAM / SQUAD
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-1">{selectedSquad}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    GPS Transponder Active · 100% Crew Present
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    LEAD FIELD ENGINEER
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-1">
                    {complaint.leadEngineer || 'Er. R. K. Verma (AE - Zone 4)'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Direct Radio: IMC-CH-04</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    SQUAD FOREMAN & STAFF
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-1">
                    {complaint.foreman || 'Mohan Lal Patidar (8 Crew)'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Assigned Vehicle: {complaint.vehicle || 'MP09-CZ-8821'}
                  </div>
                </div>
              </div>

              {/* Amber Dispatch Instructions Callout */}
              <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200/90 text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Internal Officer Dispatch Instructions (Priority 1)</span>
                </div>
                <p className="text-amber-800 leading-relaxed pl-5">{dispatchNote}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => {
                      setSlaSeconds((s) => s + 2 * 3600);
                      onShowToast('Statutory SLA extension (+2 hours) logged with Zonal Commissioner office.');
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Extend SLA Request
                  </button>
                  <button
                    onClick={() => {
                      const nextSquad =
                        selectedSquad === 'Indore PWD Road Maintenance Squad #04'
                          ? 'PWD Hot-Mix Patchwork Squad #01'
                          : 'Indore PWD Road Maintenance Squad #04';
                      setSelectedSquad(nextSquad);
                      onShowToast(`Reassigned ticket #${complaint.id} to ${nextSquad}`);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Reassign Squad
                  </button>
                </div>

                <button
                  onClick={handleMarkResolved}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Final Resolution & Close</span>
                </button>
              </div>
            </div>

            {/* Work Progress & On-Site Updates Card */}
            <div id="field-log-form" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Work Progress & On-Site Updates
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time field telemetry logs and engineer inspection notes synced with citizen tracker
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {workLogs.length} Field Updates
                </span>
              </div>

              {/* Log New Field Activity Form */}
              <form onSubmit={handleAddWorkLog} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Log New Field Activity Update
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    GPS Geo-Fence Lock Enabled
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Execution Stage / Activity Type
                    </label>
                    <select
                      value={workStageInput}
                      onChange={(e) => setWorkStageInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      <option>On-Site Material Laying & Compaction</option>
                      <option>Site Barricading & Surface Excavation</option>
                      <option>Quality Core Testing & Level Verification</option>
                      <option>Final Clean-Sweep & Traffic Restoration</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Logging Officer / Inspector
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`${officerProfile.name} (${officerProfile.officerId})`}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Field Observation & Technical Note
                  </label>
                  <textarea
                    rows={2}
                    value={workNoteInput}
                    onChange={(e) => setWorkNoteInput(e.target.value)}
                    placeholder="Enter bitumen temperature, compaction pass count, or on-site progress details..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => handleTriggerPhotoSelect('worklog')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {isUploadingPhoto && uploadTarget === 'worklog'
                        ? 'Uploading Photo...'
                        : pendingWorklogPhotos.length > 0
                        ? `Attached (${pendingWorklogPhotos.length}) Photo`
                        : 'Attach Site Photo'}
                    </span>
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Field Update</span>
                  </button>
                </div>
              </form>

              {/* Timeline Feed of Work Logs */}
              <div className="space-y-4">
                {workLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
                          {log.id}
                        </span>
                        <span className="font-bold text-xs text-slate-900">{log.author}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {log.badge}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{log.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{log.note}</p>
                    {Array.isArray(log.photos) && log.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {log.photos.filter(Boolean).map((pUrl, pIdx) => (
                          <img
                            key={pIdx}
                            src={pUrl}
                            alt="Site log"
                            className="w-20 h-14 rounded-lg object-cover border border-slate-200"
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{log.gps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (4 Cols): Statutory SLA Timer & Field Telemetry */}
          <div className="lg:col-span-4 space-y-6">
            {/* Statutory SLA Compliance Live Countdown Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">
                  STATUTORY SLA COMPLIANCE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Priority 1 (24h Window)
                </span>
              </div>

              {/* Segmented Digital Readout */}
              <div className="grid grid-cols-3 gap-2 text-center py-2">
                <div className="bg-slate-800/90 border border-slate-700 rounded-xl py-3">
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                    {timerParts.hrs}h
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase mt-0.5">Hours</div>
                </div>
                <div className="bg-slate-800/90 border border-slate-700 rounded-xl py-3">
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-400 tabular-nums">
                    {timerParts.mins}m
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase mt-0.5">Minutes</div>
                </div>
                <div className="bg-slate-800/90 border border-slate-700 rounded-xl py-3">
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400 tabular-nums">
                    {timerParts.secs}s
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase mt-0.5">Seconds</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Elapsed SLA Window</span>
                  <span className="font-mono font-bold text-amber-300">{complaint.slaProgress || 62}% Elapsed</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-rose-500 rounded-full"
                    style={{ width: `${complaint.slaProgress || 62}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-white block mb-0.5">M.P. Public Service Guarantee Act</strong>
                Mandatory resolution sign-off required before <strong>Today, 05:00 PM IST</strong> to maintain Zone 4 zero-penalty rating.
              </div>
            </div>

            {/* Field Telemetry & GPS Lock Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm">Field Telemetry & GPS Lock</h3>
                <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  ±2.4m Lock
                </span>
              </div>

              {/* Simulated Live GIS Telemetry Map */}
              <div className="relative h-48 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                <div
                  className="absolute inset-0 opacity-35"
                  style={{
                    backgroundImage:
                      'radial-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
                    backgroundSize: '20px 20px, 40px 40px, 40px 40px'
                  }}
                />
                {/* Road Corridor SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 180">
                  <path
                    d="M 10 150 Q 130 90 290 30"
                    stroke="#334155"
                    strokeWidth="22"
                    fill="none"
                  />
                  <path
                    d="M 10 150 Q 130 90 290 30"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    fill="none"
                  />
                  <circle cx="170" cy="78" r="26" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1.5" />
                  <circle cx="170" cy="78" r="6" fill="#ef4444" />
                  <circle cx="135" cy="96" r="6" fill="#10b981" />
                </svg>

                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-400">
                  TRUCK MP09-CZ-8821 · ON SITE
                </div>

                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700 p-2.5 rounded-lg flex items-center justify-between text-[11px] text-white">
                  <span>{complaint.location}</span>
                  <span className="font-mono text-sky-400">{complaint.geo}</span>
                </div>
              </div>

              {/* Weather & Bitumen Suitability */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">AMBIENT WEATHER</div>
                  <div className="font-bold text-slate-900 text-xs mt-1 flex items-center gap-1.5">
                    <CloudSun className="w-4 h-4 text-amber-500" />
                    <span>28°C · Clear Sky</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                  <div className="text-[10px] font-bold uppercase text-emerald-700">BITUMEN LAYING</div>
                  <div className="font-bold text-emerald-900 text-xs mt-1">Optimal Dry Surface</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // SCREEN 3: COMPLAINT DETAILS & VERIFICATION (unnamed__4__0be7385e.png)
  // ============================================================================
  return (
    <div className="space-y-6">
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoFileChange}
        className="hidden"
      />
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-blue-600 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Complaints</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono font-bold text-blue-600">#{complaint.id}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-700 font-semibold">Inspection & Verification</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubMode('execution')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-blue-400" />
            <span>Manage Assignment & Work Updates</span>
          </button>
        </div>
      </div>

      {/* Main Complaint Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {complaint.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {complaint.priority}
              </span>
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg">
                #{complaint.id}
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                {complaint.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {complaint.shortTitle || complaint.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Reported: <strong className="text-slate-700">{complaint.reported}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <strong className="text-slate-700">{complaint.fullLocation || complaint.location}</strong>
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleVerifyApprove}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify Complaint</span>
            </button>
            <button
              onClick={() => onShowToast(`Clarification prompt sent via SMS/App to Citizen ${complaint.citizenName}.`)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Request More Info
            </button>
            <button
              onClick={handleQuickAssignSquad}
              className="px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-700 text-xs font-bold cursor-pointer"
            >
              Assign Department
            </button>
          </div>
        </div>

        {/* Statutory SLA Verification Required Banner */}
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-amber-950">
                Verification Required · AI Triage Confidence {complaint.aiConfidence}
              </div>
              <div className="text-[11px] text-amber-800">
                Please validate photographic evidence and confirm squad routing to initiate on-site works.
              </div>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-xs font-mono font-bold text-amber-900 shrink-0">
            Statutory SLA: {complaint.slaStatus || 'Due in 6 hours'}
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Citizen Reporter Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                  {(complaint.citizenName || 'Priya Sharma')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {complaint.citizenName || 'Priya Sharma'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {complaint.citizenBadge || 'Aadhaar Verified Citizen'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Citizen ID: {complaint.citizenId || 'CIT-IND-88412'} · Ward 18 Resident
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Via Civic Connect App</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CITIZEN&apos;S STATEMENT
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                &ldquo;{complaint.citizenStatement || complaint.description}&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Reported Category</span>
                <strong className="text-slate-900 mt-0.5 block">{complaint.category}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Citizen Severity</span>
                <strong className="text-rose-600 mt-0.5 block">{complaint.priority}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Timestamp</span>
                <strong className="text-slate-900 font-mono mt-0.5 block">{complaint.reported}</strong>
              </div>
            </div>
          </div>

          {/* 2. Reported Evidence (2 Photos Attached) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Reported Evidence ({photos.length} {photos.length === 1 ? 'Photo' : 'Photos'} Attached)
                </h3>
                <p className="text-xs text-slate-500">
                  EXIF metadata & GPS coordinates cryptographically verified at upload
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTriggerPhotoSelect('evidence')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>{isUploadingPhoto && uploadTarget === 'evidence' ? 'Uploading...' : 'Upload More'}</span>
              </button>
            </div>

            {/* Primary Evidence Viewer with Bounding Box & Geotag Overlay */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-72">
              <img
                src={photos[activePhotoIndex]}
                alt={complaint.title}
                className="w-full h-full object-cover"
              />
              {/* Simulated AI Bounding Box Overlay */}
              <div className="absolute top-1/4 left-1/4 w-48 h-28 border-2 border-rose-500 bg-rose-500/10 rounded-lg pointer-events-none flex items-start justify-between p-1.5">
                <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold">
                  {complaint.aiDetectedClass || 'Road Surface Damage'} · {complaint.aiConfidence}
                </span>
              </div>

              {/* Bottom Geotag Overlay Bar */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-xs text-white px-3.5 py-2 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono flex items-center gap-1.5 text-emerald-400">
                  <MapPin className="w-3.5 h-3.5" />
                  GPS: {complaint.geo} (±2.8m Accuracy)
                </span>
                <span className="font-mono text-[11px] text-slate-300">
                  SHA-256: 8f94c2...e19b · Verified Original
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex items-center gap-3">
              {photos.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activePhotoIndex === idx ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 opacity-70'
                  }`}
                >
                  <img src={imgUrl} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* 3. Issue Location & Geofence */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Issue Location & Geofence</h3>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                Geofence Match: {complaint.geofenceMatch || 'Ward 18 (100%)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">STREET ADDRESS & LANDMARK</span>
                <div className="font-bold text-slate-900">
                  {complaint.address || 'Vijay Nagar Square, AB Road, Indore'}
                </div>
                <div className="text-slate-500">{complaint.landmark || 'Near Metro Pillar #114'}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">GIS COORDINATE FIX</span>
                <div className="font-mono font-bold text-blue-600 text-sm">{complaint.geo}</div>
                <div className="text-slate-500">IMC Zone 04 · Arterial Road Network</div>
              </div>
            </div>
          </div>

          {/* 4. AI Computer Vision Assessment */}
          <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 rounded-2xl border border-blue-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    AI Computer Vision Assessment
                  </h3>
                  <div className="text-[11px] font-mono text-slate-500">
                    Pipeline ID: {complaint.aiPipelineId || 'CV-INSPECTOR-2026-X8'}
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-mono text-xs font-bold">
                {complaint.aiConfidence} Model Confidence
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-blue-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">DETECTED DEFECT</span>
                <strong className="text-slate-900 text-sm mt-0.5 block">
                  {complaint.aiDetectedClass || 'Road Surface Damage'}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-blue-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">ESTIMATED DIMENSIONS</span>
                <strong className="text-rose-600 font-mono text-sm mt-0.5 block">
                  {complaint.aiDimensions || '~14cm Depth · ~1.2m Dia'}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-blue-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">RECOMMENDED ROUTING</span>
                <strong className="text-blue-700 text-sm mt-0.5 block">{complaint.department}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/90 border border-blue-100 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-0.5">Why AI suggested this classification:</strong>
              {complaint.aiReasoning}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => {
                  setAiAccepted(true);
                  onShowToast('AI Computer Vision classification accepted & locked.');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  aiAccepted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{aiAccepted ? 'AI Assessment Accepted' : 'Accept AI Assessment'}</span>
              </button>
              <button
                onClick={() => {
                  setAiAccepted(false);
                  onShowToast('Manual classification override enabled. Select target department on the right.');
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Override Classification
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Verification Action Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Verification Action Checklist</h3>
              <span className="text-xs font-mono font-bold text-blue-600">
                {Object.values(checklist).filter(Boolean).length}/4 Checked
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { key: 'photoClarity', label: 'Photographic evidence is clear & unmanipulated' },
                { key: 'geoBoundary', label: 'GPS coordinates fall within IMC Ward 18–24 boundary' },
                { key: 'duplicateCheck', label: 'No duplicate active work order within 50m radius' },
                { key: 'severityConfirm', label: 'Confirmed High Priority SLA (24-Hour Statutory Target)' }
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleVerifyApprove}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Approve Complaint</span>
              </button>
              <button
                onClick={() => onShowToast('Citizen clarification request dispatched via SMS & App notification.')}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Request More Citizen Information
              </button>
            </div>
          </div>

          {/* 2. Department Assignment Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Department Assignment</h3>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                Smart Dispatch
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Municipal Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                >
                  <option value="Roads & Infrastructure">Roads & Infrastructure (PWD Zone 4)</option>
                  <option value="Water Supply & Sewerage">Water Supply & Sewerage (Narmada Cell)</option>
                  <option value="Sanitation & Waste">Sanitation & Solid Waste Management</option>
                  <option value="Electrical & Street Lighting">Electrical & Street Lighting</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Recommended Field Squad</label>
                <select
                  value={selectedSquad}
                  onChange={(e) => setSelectedSquad(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                >
                  <option value="Indore PWD Road Maintenance Squad #04">
                    Indore PWD Road Maintenance Squad #04 (1.2 km away)
                  </option>
                  <option value="PWD Hot-Mix Patchwork Squad #01">
                    PWD Hot-Mix Patchwork Squad #01 (2.8 km away)
                  </option>
                  <option value="Structural & Culvert Repair Unit #02">
                    Structural & Culvert Repair Unit #02 (Zone Depot)
                  </option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Lead Field Engineer</span>
                  <strong className="text-slate-900">Er. R. K. Verma (AE - Zone 4)</strong>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  On Duty
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Internal Officer Dispatch Note</label>
                <textarea
                  rows={2}
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <button
                onClick={() => {
                  handleQuickAssignSquad();
                  setSubMode('execution');
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Truck className="w-4 h-4 text-blue-400" />
                <span>Quick Assign Squad & Open Execution Console</span>
              </button>
            </div>
          </div>

          {/* 3. Complaint Lifecycle Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Complaint Lifecycle</h3>
            <div className="space-y-3 text-xs">
              {[
                { title: '1. Citizen Complaint Logged', time: complaint.reported, done: true },
                { title: '2. AI Computer Vision Triage (94% Conf.)', time: '20 Oct 2026, 09:16 AM', done: true },
                { title: '3. Officer Verification & SLA Lock', time: 'Active Step', active: true },
                { title: '4. Field Squad Mobilization (Squad #04)', time: 'Pending Verification', done: false },
                { title: '5. On-Site Execution & Geo-Photo Upload', time: 'Upcoming', done: false },
                { title: '6. Quality Audit & Citizen Closure', time: 'Upcoming', done: false }
              ].map((st, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                      st.done
                        ? 'bg-emerald-600 text-white'
                        : st.active
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {st.done ? '✓' : i + 1}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className={`font-bold ${st.active ? 'text-blue-600' : 'text-slate-800'}`}>
                      {st.title}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{st.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Citizen Privacy Safe (DPDP Act Compliant) */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-start gap-3 text-xs">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Citizen Privacy Safe</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  DPDP Act Compliant
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Citizen phone number ({complaint.citizenPhoneMasked || '+91 98260 ••••0'}) is masked via IMC IVR proxy bridge. All communications are logged under MeitY Secured Ledger.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
