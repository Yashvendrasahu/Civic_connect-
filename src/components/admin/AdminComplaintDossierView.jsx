import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Copy,
  ExternalLink,
  Cpu,
  User,
  Building2,
  SlidersHorizontal,
  Plus,
  Camera,
  Phone,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function AdminComplaintDossierView({
  complaint,
  onBack,
  onUpdateDossier,
  onExportCsv,
  onShowToast
}) {
  const item = complaint || {};
  const displayId = item.id?.startsWith('CMP-') ? item.id : `CMP-${item.id || '10245'}`;

  const [department, setDepartment] = useState(
    item.department || 'Public Works & Roads (PWD)'
  );
  const [assignedOfficer, setAssignedOfficer] = useState(
    item.assignedOfficer || 'Rajesh Kumar — Field Engineer (Zone 2)'
  );
  const [selectedStatus, setSelectedStatus] = useState(item.status || 'Pending');
  const [adminNote, setAdminNote] = useState('');
  const [notifyCitizen, setNotifyCitizen] = useState(true);
  const [newInternalNote, setNewInternalNote] = useState('');
  const [showAddNoteInput, setShowAddNoteInput] = useState(false);

  const [internalNotes, setInternalNotes] = useState(
    Array.isArray(item.internalNotes) && item.internalNotes.length > 0
      ? item.internalNotes
      : [
          {
            id: 'NOTE-1',
            author: 'R.K. Deshmukh',
            role: 'Zonal Nodal Officer',
            time: '28 Oct, 11:30 AM',
            text: 'Spoke with Seoni Traffic Police Inspector. Temporary reflective barricades have been placed around the crater while cold-mix asphalt unit is being mobilized from Depot #2.'
          },
          {
            id: 'NOTE-2',
            author: 'System Audit',
            role: 'SLA Monitor',
            time: '28 Oct, 01:00 PM',
            text: 'Duplicate report #CMP-10249 merged into this primary dossier. Total affected citizen upvote count increased to 18.'
          }
        ]
  );

  const timelineItems =
    Array.isArray(item.timeline) && item.timeline.length > 0
      ? item.timeline
      : [
          {
            id: 'TL-1',
            title: 'Complaint Submitted by Citizen',
            subtitle: 'Reported via Mobile App with 2 verified GPS photos.',
            time: '28 Oct 2026 · 10:42 AM'
          },
          {
            id: 'TL-2',
            title: 'AI Triage & Classification Completed',
            subtitle: `Auto-classified as ${item.category || 'Road Damage'} (${
              item.aiConfidence || 92
            }% confidence) and flagged as ${item.priority || 'High'} Priority.`,
            time: '28 Oct 2026 · 10:43 AM'
          },
          {
            id: 'TL-3',
            title: `Routed to ${item.municipalityFull || 'Seoni Municipal Council'}`,
            subtitle: `Assigned to ${department} queue for nodal verification.`,
            time: '28 Oct 2026 · 11:05 AM'
          },
          {
            id: 'TL-4',
            title: 'Field Officer Assigned',
            subtitle: `Assigned to ${assignedOfficer} by Nodal Admin.`,
            time: '28 Oct 2026 · 02:15 PM'
          }
        ];

  const handleSaveAssignment = async () => {
    if (onUpdateDossier) {
      await onUpdateDossier(item.id, {
        department,
        assignedOfficer,
        assignedTeam: assignedOfficer
      });
    }
    if (onShowToast) {
      onShowToast(`Saved Municipal Responsibility: ${department} → ${assignedOfficer}`);
    }
  };

  const handleConfirmStatusUpdate = async () => {
    if (onUpdateDossier) {
      await onUpdateDossier(item.id, {
        status: selectedStatus,
        note: adminNote || `Status updated to ${selectedStatus} by Platform Admin.`,
        notifyCitizen
      });
    }
    if (onShowToast) {
      onShowToast(
        `Complaint ${displayId} status updated to ${selectedStatus}${
          notifyCitizen ? ' (Citizen notified via SMS & Push)' : ''
        }`
      );
    }
    setAdminNote('');
  };

  const handleAddInternalNote = async () => {
    if (!newInternalNote.trim()) return;
    const noteObj = {
      id: `NOTE-${Date.now()}`,
      author: 'System Admin',
      role: 'Platform Admin',
      time: 'Just now',
      text: newInternalNote.trim()
    };
    const updatedNotes = [noteObj, ...internalNotes];
    setInternalNotes(updatedNotes);
    setNewInternalNote('');
    setShowAddNoteInput(false);
    if (onUpdateDossier) {
      await onUpdateDossier(item.id, { internalNotes: updatedNotes });
    }
    if (onShowToast) onShowToast('Added internal nodal note to dossier');
  };

  const confScore = item.aiConfidence || 92;

  return (
    <div className="space-y-6">
      {/* Top Action & Title Header matching Image 14 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Complaints</span>
            </button>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {item.title || 'Pothole on main road'}
            </h1>

            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-bold">
              {displayId}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>{selectedStatus}</span>
            </span>

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
              {item.priority || 'High'} Priority
            </span>

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              {item.category || 'Road Damage'}
            </span>

            <span className="text-slate-400">·</span>
            <span className="text-slate-500">
              Reported on <strong className="text-slate-700">{item.reportedDate || '28 Oct 2026'}</strong> ·{' '}
              {item.municipalityFull || 'Seoni Municipal Council'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              onExportCsv(`Dossier_${displayId}.csv`, [item]);
              if (onShowToast) onShowToast(`Exported complete dossier ${displayId}`);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Dossier</span>
          </button>

          <button
            type="button"
            onClick={handleConfirmStatusUpdate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Update Status</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Complaint Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-extrabold text-slate-900">Complaint Information</h2>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">
                SLA Target: Within 48 Hours (32h remaining)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Complaint ID</div>
                <div className="font-bold text-slate-900 mt-0.5 tabular-nums">{displayId}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Category</div>
                <div className="font-bold text-slate-900 mt-0.5">{item.category || 'Road Damage'}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Priority Level</div>
                <div className="font-bold text-rose-600 mt-0.5">
                  {item.priority || 'High'} (Requires Action)
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Channel / Source</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {item.channel || 'Civic Connect Mobile App'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Reported Date &amp; Time</div>
                <div className="font-semibold text-slate-800 mt-0.5 tabular-nums">
                  {item.reportedDate || '28 Oct 2026'} · {item.reportedTime || '10:42 AM IST'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Last Updated</div>
                <div className="font-semibold text-slate-800 mt-0.5 tabular-nums">
                  {item.lastUpdated || '28 Oct 2026 · 02:15 PM IST'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Municipality Jurisdiction</div>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {item.municipalityFull || 'Seoni Municipal Council (MP)'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Administrative Ward</div>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {item.ward || 'Ward 14 — Central Market South'}
                </div>
              </div>
            </div>

            {/* Citizen Statement Quote Box */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                Detailed Description &amp; Citizen Statement
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                &ldquo;
                {item.description ||
                  'Large pothole near the main bus stand intersection is causing severe traffic slowdowns and poses a serious risk to two-wheeler commuters, especially during evening hours when visibility drops.'}
                &rdquo;
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span className="font-bold uppercase text-[10px] text-slate-400 mr-1">Tags:</span>
              {(
                item.tags || ['#RoadSafety', '#MainArterial', '#MonsoonErosion', '#TwoWheelerHazard']
              ).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 2. Photo Evidence */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-extrabold text-slate-900">Photo Evidence (2)</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onShowToast) onShowToast(`Downloading original EXIF evidence package for ${displayId}`);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Download Originals (ZIP)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo 1 */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <div className="relative h-44 bg-slate-800">
                  <img
                    src={
                      item.image ||
                      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=900&q=80'
                    }
                    alt="Primary Evidence"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                    Primary Evidence
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-slate-800">IMG_20261028_103912.jpg</div>
                    <div className="text-slate-400">EXIF Verified · GPS Match (99.4%)</div>
                  </div>
                  <span className="text-emerald-600 font-bold">✓ Authentic</span>
                </div>
              </div>

              {/* Photo 2 */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <div className="relative h-44 bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=900&q=80"
                    alt="Detail Scale Macro"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                    Detail Scale Macro
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-slate-800">IMG_20261028_104005.jpg</div>
                    <div className="text-slate-400">Est. Diameter: 1.4m · Depth: ~14cm</div>
                  </div>
                  <span className="text-emerald-600 font-bold">✓ Authentic</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Complaint Location */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-extrabold text-slate-900">Complaint Location</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(item.geo || '22.0869° N, 79.5435° E');
                    if (onShowToast) onShowToast('Copied GPS coordinates to clipboard');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Coordinates</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onShowToast) onShowToast('Opened Ward 14 GIS Telemetry Overlay');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open in GIS Portal</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Street Address</div>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {item.location || 'Main Road, Near Bus Stand, Seoni, MP — 480661'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Landmark / Zone</div>
                <div className="font-semibold text-slate-800 mt-0.5">
                  Opposite State Bank Main Branch (50m North)
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">GPS Coordinates</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">
                  {item.geo || '22.0869° N, 79.5435° E'} (±3m)
                </div>
              </div>
            </div>

            {/* Interactive Stylized GIS Map */}
            <div className="relative h-48 rounded-xl border border-slate-200 bg-[#EEF2F6] overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 600 200" className="w-full h-full">
                <rect width="600" height="200" fill="#E2E8F0" />
                <path d="M0,40 L600,150" stroke="#CBD5E1" strokeWidth="18" />
                <path d="M140,0 L280,200" stroke="#FFFFFF" strokeWidth="14" />
                <path d="M0,110 L600,95" stroke="#FDE68A" strokeWidth="12" />
                <circle cx="300" cy="102" r="36" fill="#EF4444" fillOpacity="0.18" />
                <circle cx="300" cy="102" r="8" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2.5" />
              </svg>
              <div className="absolute top-12 bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-md">
                {displayId} · Main Road
              </div>
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700">
                Active Hazard Zone: 150m Radius · Heavy Traffic Corridor
              </div>
            </div>
          </div>

          {/* 4. AI-Assisted Analysis */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-extrabold text-slate-900">AI-Assisted Analysis</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold">
                CIRRS Vision Engine v3.2
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">AI Classification Confidence Score</span>
                <span className="font-extrabold text-blue-600 tabular-nums">{confScore}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${confScore}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold uppercase text-slate-400">Predicted Category</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {item.aiPredictedCategory || 'Road & Infrastructure Damage'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold uppercase text-slate-400">Severity Detection</div>
                <div className="font-bold text-rose-600 mt-0.5">
                  {item.aiSeverity || 'High — Deep Surface Fracture (Est. 14cm)'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold uppercase text-slate-400">Suggested Priority</div>
                <div className="font-bold text-amber-700 mt-0.5">
                  {item.aiSuggestedPriority || 'High (Urgent Dispatch Recommended)'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold uppercase text-slate-400">Suggested Department</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {item.aiSuggestedDept || 'Public Works & Road Maintenance (PWD)'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Potential Safety Concern Flagged</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Visual telemetry indicates sharp asphalt edges and water accumulation on a primary bus corridor. High probability of two-wheeler skidding or axle damage. Immediate barricading advised.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Reported By Citizen Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-extrabold text-slate-900">Reported By</h2>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center">
                  {(item.citizenName || 'Rahul Verma')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {item.citizenName || 'Rahul Verma'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.citizenEmail || 'rahul.verma@gmail.com'}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                ✓ Verified
              </span>
            </div>

            <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Citizen ID</span>
                <span className="font-mono font-bold text-slate-800">{item.citizenId || 'CIT-20481'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-semibold text-slate-800">{item.citizenPhone || '+91 98765 43210'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Municipality / Ward</span>
                <span className="font-semibold text-slate-800">
                  {item.citizenWard || 'Seoni Municipal Council · Ward 14'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Method</span>
                <span className="font-semibold text-emerald-600">Aadhaar eKYC &amp; Mobile OTP</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-base font-extrabold text-slate-900 tabular-nums">8</div>
                <div className="text-[10px] text-slate-500">Total Filed</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-base font-extrabold text-emerald-600 tabular-nums">6</div>
                <div className="text-[10px] text-slate-500">Resolved</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-base font-extrabold text-blue-600 tabular-nums">94%</div>
                <div className="text-[10px] text-slate-500">Trust Rating</div>
              </div>
            </div>
          </div>

          {/* 2. Municipal Responsibility Assignment */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-extrabold text-slate-900">Municipal Responsibility</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Assigned Municipality
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 flex items-center justify-between">
                  <span>{item.municipalityFull || 'Seoni Municipal Council'}</span>
                  <span className="text-[10px] font-mono text-slate-500">MUN-MP-042</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Responsible Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white"
                >
                  <option>Public Works &amp; Roads (PWD)</option>
                  <option>Sanitation &amp; Solid Waste</option>
                  <option>Water Works &amp; Drainage</option>
                  <option>Electrical &amp; Street Lighting</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Assign Officer / Field Engineer
                </label>
                <select
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white"
                >
                  <option>Rajesh Kumar — Field Engineer (Zone 2)</option>
                  <option>Er. Rajesh Verma — Superintending Engineer</option>
                  <option>Er. Aniruddh Tiwari — Zonal Nodal Officer</option>
                  <option>Er. Siddharth Kulkarni — Executive Engineer</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">Current Dispatch State</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                  Awaiting Field Inspection
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveAssignment}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Save Assignment
              </button>
            </div>
          </div>

          {/* 3. Status Management */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-extrabold text-slate-900">Status Management</h2>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {['Pending', 'In Progress', 'Resolved', 'Rejected'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`py-2 px-3 rounded-xl font-bold border text-left flex items-center gap-2 cursor-pointer transition-all ${
                    selectedStatus === st
                      ? 'border-blue-600 bg-blue-50/60 text-blue-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      st === 'Resolved'
                        ? 'bg-emerald-500'
                        : st === 'In Progress'
                        ? 'bg-blue-600'
                        : st === 'Rejected'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span>{st}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Administrative Note / Reason
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Enter official remarks, dispatch instructions, or resolution verification details..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyCitizen}
                onChange={(e) => setNotifyCitizen(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Notify Citizen via SMS &amp; Push</span>
            </label>

            <button
              type="button"
              onClick={handleConfirmStatusUpdate}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Confirm Status Update
            </button>
          </div>

          {/* 4. Activity Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-extrabold text-slate-900">Activity Timeline</h2>
            </div>

            <div className="space-y-4 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timelineItems.map((tl, idx) => (
                <div key={tl.id || idx} className="relative pl-7 text-xs">
                  <span
                    className={`w-5 h-5 rounded-full border-2 border-white shadow-xs absolute left-0 top-0.5 flex items-center justify-center ${
                      idx === 0 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                  />
                  <div className="font-bold text-slate-900">{tl.title}</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">{tl.subtitle}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">{tl.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Internal Notes (Admins & Nodal Officers Only) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900">Internal Notes</h2>
              <span className="text-[10px] font-semibold text-slate-400">
                Admins &amp; Nodal Officers Only
              </span>
            </div>

            <div className="space-y-3">
              {internalNotes.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {n.author} ({n.role})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">{n.text}</p>
                </div>
              ))}
            </div>

            {showAddNoteInput ? (
              <div className="space-y-2 pt-1">
                <textarea
                  rows={2}
                  value={newInternalNote}
                  onChange={(e) => setNewInternalNote(e.target.value)}
                  placeholder="Write an internal administrative note..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddNoteInput(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddInternalNote}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddNoteInput(true)}
                className="w-full py-2 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
