import React, { useState } from 'react';
import { civicDataService } from '../../services/supabaseClient.js';
import {
  MapPin,
  RefreshCw,
  List,
  Truck,
  Search,
  AlertTriangle,
  Cpu,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter
} from 'lucide-react';

export default function OfficerMapView({
  complaints = [],
  onSelectComplaint,
  onNavigateTab,
  onShowToast
}) {
  const [mapMode, setMapMode] = useState('standard'); // 'standard' | 'heatmap' | 'satellite'
  const [wardFilter, setWardFilter] = useState('Zone 4 (Wards 18–24)');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchText, setSearchText] = useState('');
  const [selectedPinId, setSelectedPinId] = useState(complaints[0]?.id || 'CC10246');
  const [zoomLevel, setZoomLevel] = useState(14);

  const filteredComplaints = complaints.filter((c) => {
    const matchesPriority =
      priorityFilter === 'All Priorities' ||
      c.priority?.toLowerCase().includes(priorityFilter.toLowerCase()) ||
      c.priorityLevel?.toLowerCase().includes(priorityFilter.toLowerCase());
    const matchesCat =
      categoryFilter === 'All Categories' ||
      c.category?.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesStatus =
      statusFilter === 'All Statuses' ||
      c.status?.toLowerCase().includes(statusFilter.toLowerCase());
    const matchesSearch =
      !searchText ||
      c.id.toLowerCase().includes(searchText.toLowerCase()) ||
      c.title.toLowerCase().includes(searchText.toLowerCase()) ||
      c.location.toLowerCase().includes(searchText.toLowerCase());
    return matchesPriority && matchesCat && matchesStatus && matchesSearch;
  });

  const activePinComplaint =
    filteredComplaints.find((c) => c.id === selectedPinId) ||
    complaints.find((c) => c.id === selectedPinId) ||
    complaints[0] ||
    null;

  const mappedCount = complaints.length;
  const highCriticalCount = complaints.filter(
    (c) => c.priorityLevel === 'Critical' || c.priorityLevel === 'High'
  ).length;
  const unassignedCount = complaints.filter(
    (c) => !c.assignedSquad || c.assignedSquad.includes('Unassigned') || c.status === 'Unassigned'
  ).length;
  const overdueCount = complaints.filter((c) => c.isOverdue && c.status !== 'Resolved').length;

  const handleMassDispatch = async (squadName) => {
    const targetIds = filteredComplaints.map((c) => c.id);
    if (targetIds.length === 0) {
      onShowToast('No mapped complaints in area to dispatch yet.');
      return;
    }
    await civicDataService.batchUpdateComplaints({
      ids: targetIds,
      status: 'In Progress',
      assignedSquad: squadName,
      note: `GIS Mass Dispatch to ${squadName}`
    });
    onShowToast(`Mass Dispatch initiated for ${targetIds.length} mapped complaints (${squadName}).`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-blue-600 mb-1">
            <span>OPERATIONS · GIS COMPLAINT TRIAGE</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Spatial Feed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Complaint Map (Hotspots & Geofence)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time spatial clustering, ward boundary geofencing, and field squad GPS telemetry across Zone 04.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onShowToast('GIS spatial layer & squad GPS transponders refreshed.')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh Map</span>
          </button>
          <button
            onClick={() => onNavigateTab('all-complaints')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
          >
            <List className="w-3.5 h-3.5 text-slate-500" />
            <span>List View</span>
          </button>
          <button
            onClick={() => handleMassDispatch('Indore PWD Road Maintenance Squad #04')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Mass Dispatch</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              MAPPED COMPLAINTS
            </span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{mappedCount}</div>
            <span className="text-[11px] font-semibold text-blue-600">100% GPS Geo-Tagged</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              HIGH & CRITICAL
            </span>
            <div className="text-2xl font-extrabold text-rose-600 font-mono mt-1">{highCriticalCount}</div>
            <span className="text-[11px] font-semibold text-rose-600">Active Hotspots</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              UNASSIGNED CASES
            </span>
            <div className="text-2xl font-extrabold text-amber-600 font-mono mt-1">{unassignedCount}</div>
            <span className="text-[11px] font-semibold text-amber-700">Needs Squad Routing</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              OVERDUE / SLA ALERT
            </span>
            <div className="text-2xl font-extrabold text-rose-600 font-mono mt-1">{overdueCount}</div>
            <span className="text-[11px] text-rose-600 font-semibold">Immediate Escalation</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Navigation className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar & Map Layer Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search ward, landmark, #ID..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option>Zone 4 (Wards 18–24)</option>
            <option>Ward 18 (Vijay Nagar)</option>
            <option>Ward 19 (Palasia)</option>
            <option>Ward 21 (Scheme 54)</option>
            <option>Ward 22 (Bhawarkua)</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option>All Priorities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option>All Categories</option>
            <option>Road Damage</option>
            <option>Streetlight</option>
            <option>Garbage</option>
            <option>Water</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option>All Statuses</option>
            <option>Needs Verification</option>
            <option>Unassigned</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
        </div>

        {/* Map Mode Segmented Switch */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl self-start xl:self-auto">
          {[
            { id: 'standard', label: 'Standard GIS' },
            { id: 'heatmap', label: 'Density Heatmap' },
            { id: 'satellite', label: 'Satellite Overlay' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMapMode(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapMode === m.id
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Interactive GIS Canvas (8 Cols) + Area Sidebar (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive GIS Map Viewport */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs relative h-[560px]">
          {/* Map Background Layer */}
          <div
            className={`absolute inset-0 transition-colors duration-300 ${
              mapMode === 'satellite'
                ? 'bg-[#0f172a]'
                : mapMode === 'heatmap'
                ? 'bg-[#1e293b]'
                : 'bg-[#eef2f6]'
            }`}
          >
            {/* Grid & Arterial Roads SVG */}
            <svg className="w-full h-full" viewBox="0 0 800 560" preserveAspectRatio="none">
              <defs>
                <pattern id="gis-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke={mapMode === 'standard' ? '#cbd5e1' : '#334155'}
                    strokeWidth="0.7"
                  />
                </pattern>
                <radialGradient id="hotspot-red" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(239,68,68,0.55)" />
                  <stop offset="100%" stopColor="rgba(239,68,68,0)" />
                </radialGradient>
                <radialGradient id="hotspot-amber" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(245,158,11,0.45)" />
                  <stop offset="100%" stopColor="rgba(245,158,11,0)" />
                </radialGradient>
              </defs>

              <rect width="800" height="560" fill="url(#gis-grid)" />

              {/* Zone 4 Geofence Polygon */}
              <polygon
                points="140,90 660,70 720,280 580,480 210,460 110,260"
                fill={mapMode === 'standard' ? 'rgba(37, 99, 235, 0.06)' : 'rgba(56, 189, 248, 0.08)'}
                stroke="#2563eb"
                strokeWidth="2"
                strokeDasharray="8 5"
              />

              {/* Heatmap Blobs when Heatmap or Standard */}
              {(mapMode === 'heatmap' || mapMode === 'standard') && (
                <>
                  <circle cx="510" cy="160" r={mapMode === 'heatmap' ? '120' : '75'} fill="url(#hotspot-red)" />
                  <circle cx="390" cy="265" r={mapMode === 'heatmap' ? '100' : '60'} fill="url(#hotspot-amber)" />
                </>
              )}

              {/* Arterial Road Network (AB Road, Ring Road, MG Road) */}
              <path
                d="M 80 480 Q 380 280 710 60"
                stroke={mapMode === 'standard' ? '#ffffff' : '#475569'}
                strokeWidth="16"
                fill="none"
              />
              <path
                d="M 80 480 Q 380 280 710 60"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="10 6"
                fill="none"
              />
              <path
                d="M 120 140 Q 420 260 690 420"
                stroke={mapMode === 'standard' ? '#ffffff' : '#475569'}
                strokeWidth="12"
                fill="none"
              />
              {/* Active Squad #04 Route Line */}
              <path
                d="M 420 230 L 512 156"
                stroke="#2563eb"
                strokeWidth="3.5"
                strokeDasharray="6 4"
                fill="none"
              />
            </svg>

            {/* Zone & Landmark Labels on Map */}
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>GEOFENCE ACTIVE: {wardFilter} · Zoom {zoomLevel}x</span>
            </div>

            <div className="absolute top-[22%] left-[58%] text-[11px] font-extrabold uppercase tracking-wider text-slate-600 bg-white/80 px-2 py-0.5 rounded shadow-2xs pointer-events-none">
              Vijay Nagar Corridor (Ward 18)
            </div>
            <div className="absolute top-[48%] left-[44%] text-[11px] font-extrabold uppercase tracking-wider text-slate-600 bg-white/80 px-2 py-0.5 rounded shadow-2xs pointer-events-none">
              Palasia Square (Ward 19)
            </div>
            <div className="absolute top-[59%] left-[20%] text-[11px] font-extrabold uppercase tracking-wider text-slate-600 bg-white/80 px-2 py-0.5 rounded shadow-2xs pointer-events-none">
              Rajwada Heritage Precinct
            </div>
            <div className="absolute top-[74%] left-[33%] text-[11px] font-extrabold uppercase tracking-wider text-slate-600 bg-white/80 px-2 py-0.5 rounded shadow-2xs pointer-events-none">
              Bhawarkua Junction
            </div>

            {/* Squad #04 Live GPS Truck Marker */}
            <div
              style={{ left: '52%', top: '38%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5 bg-blue-600 text-white px-2.5 py-1 rounded-full shadow-md text-[10px] font-bold border-2 border-white"
            >
              <Truck className="w-3 h-3" />
              <span>Squad #04 Route</span>
            </div>

            {/* Interactive Complaint Pins */}
            {filteredComplaints.map((item) => {
              const coords = item.mapCoords || { x: 50, y: 50 };
              const isSelected = activePinComplaint?.id === item.id;
              const pinColor =
                item.status === 'Resolved'
                  ? 'bg-emerald-600 border-emerald-200'
                  : item.priorityLevel === 'Critical' || item.isOverdue
                  ? 'bg-rose-600 border-rose-200'
                  : item.priorityLevel === 'High'
                  ? 'bg-amber-500 border-amber-200'
                  : 'bg-blue-600 border-blue-200';

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedPinId(item.id)}
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-full text-white font-mono text-[11px] font-bold shadow-md border-2 ${pinColor} ${
                    isSelected ? 'scale-125 ring-4 ring-blue-500/30 z-30' : 'hover:scale-110'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>#{item.id}</span>
                </button>
              );
            })}

            {/* Active Pin Floating Inspection Card (Matches screenshot popover) */}
            {activePinComplaint && (
              <div className="absolute top-16 right-5 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-extrabold text-xs text-blue-600">
                      #{activePinComplaint.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {activePinComplaint.priority}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800">
                    {activePinComplaint.status}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <img
                    src={activePinComplaint.image}
                    alt={activePinComplaint.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2">
                      {activePinComplaint.shortTitle || activePinComplaint.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {activePinComplaint.location}
                    </p>
                    <p className="text-[10px] font-mono text-blue-600 font-semibold mt-0.5">
                      AI: {activePinComplaint.aiAssessment}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onSelectComplaint(activePinComplaint, 'verification')}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onSelectComplaint(activePinComplaint, 'execution')}
                    className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold cursor-pointer"
                  >
                    Track Squad
                  </button>
                </div>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-5 right-5 flex flex-col gap-1.5 z-20">
              <button
                onClick={() => setZoomLevel((z) => Math.min(18, z + 1))}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(10, z - 1))}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* GIS Legend Overlay (Bottom Left) */}
            <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3 shadow-sm z-20 space-y-1.5 text-[11px]">
              <div className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px]">
                GIS LEGEND
              </div>
              <div className="flex flex-wrap items-center gap-3 font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Critical / Overdue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High Priority
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> In Progress / Squad
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Resolved
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Complaints in Area + Area AI Hotspot Insights */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Complaints in Area ({filteredComplaints.length})
                </h3>
                <p className="text-[11px] text-slate-500">Click any pin or card to inspect</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-bold">
                Zone 04
              </span>
            </div>

            <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
              {filteredComplaints.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center space-y-1">
                  <div className="text-xs font-extrabold text-slate-700">
                    No geo-tagged complaints in area
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Submitted citizen complaints will automatically plot on the Zone 04 GIS layer.
                  </p>
                </div>
              ) : (
                filteredComplaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedPinId(c.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      activePinComplaint?.id === c.id
                        ? 'border-blue-600 bg-blue-50/40'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-blue-600">#{c.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.isOverdue || c.priorityLevel === 'Critical'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {c.slaRemaining}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 line-clamp-1">
                      {c.shortTitle || c.title}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{c.location}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(c, 'verification');
                        }}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Inspect →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Area AI Hotspot Insights Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">
                  Area AI Hotspot Insights
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-400/30">
                High Cluster Alert
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Spatial density engine monitors road & drainage defects along the <strong className="text-white">Vijay Nagar – Palasia AB Road Corridor</strong> following heavy monsoon runoff.
            </p>

            <button
              onClick={() => handleMassDispatch('Batch Inspection Squad #04')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Dispatch Batch Inspection Squad</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
