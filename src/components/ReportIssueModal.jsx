import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  MapPin,
  AlertTriangle,
  Building,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  Eye
} from 'lucide-react';

const PRESET_ISSUES = [
  {
    title: 'Severe Road Pothole Near Vijay Nagar Square',
    category: 'Roads & Infrastructure',
    location: 'Vijay Nagar Square, Indore',
    geo: '22.7533° N, 75.8937° E',
    priority: 'High',
    severityLevel: 'Level 4 (High)',
    department: 'Road & Transport Directorate',
    confidence: '98.4%',
    aiDetected: 'Road Damage / Asphalt Fissure',
    dimensions: '48cm x 32cm',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    description: 'Deep road cavity causing severe traffic slowdown and risk of vehicle damage.'
  },
  {
    title: 'Street Light #842 Outage',
    category: 'Electricity',
    location: 'Rau Circle, Ward 18',
    geo: '22.6289° N, 75.8078° E',
    priority: 'Medium',
    severityLevel: 'Level 3 (Elevated)',
    department: 'Electrical & Lighting Department',
    confidence: '95.1%',
    aiDetected: 'LED Fixture Driver Failure',
    dimensions: 'Single Pole Unit',
    image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    description: 'Streetlight pole #842 completely unlit near the highway circle.'
  },
  {
    title: 'Garbage Collection Overflow',
    category: 'Sanitation',
    location: 'Palasia Square, Indore',
    geo: '22.7231° N, 75.8821° E',
    priority: 'High',
    severityLevel: 'Level 4 (High)',
    department: 'Sanitation & Solid Waste Directorate',
    confidence: '97.2%',
    aiDetected: 'Solid Waste Overflow',
    dimensions: '140kg estimated volume',
    image: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
    description: 'Municipal waste container overflow spilling onto sidewalk.'
  },
  {
    title: 'Water Pipeline Leakage',
    category: 'Water Supply',
    location: 'Bhanwarkuan Main Road',
    geo: '22.6912° N, 75.8672° E',
    priority: 'High',
    severityLevel: 'Level 4 (High)',
    department: 'Water Works & Drainage Directorate',
    confidence: '96.8%',
    aiDetected: 'Subsurface Pipe Rupture',
    dimensions: 'Moderate pressure leak',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
    description: 'Water leaking continuously from underground municipal valve.'
  }
];

export default function ReportIssueModal({ isOpen, onClose, onSubmitSuccess }) {
  const [step, setStep] = useState(1); // 1: Upload/Select -> 2: AI Triage -> 3: Confirmation
  const [selectedPreset, setSelectedPreset] = useState(PRESET_ISSUES[0]);
  const [customTitle, setCustomTitle] = useState(PRESET_ISSUES[0].title);
  const [customCategory, setCustomCategory] = useState(PRESET_ISSUES[0].category);
  const [customLocation, setCustomLocation] = useState(PRESET_ISSUES[0].location);
  const [customDescription, setCustomDescription] = useState(PRESET_ISSUES[0].description);
  const [customImage, setCustomImage] = useState(PRESET_ISSUES[0].image);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);

  if (!isOpen) return null;

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setCustomTitle(preset.title);
    setCustomCategory(preset.category);
    setCustomLocation(preset.location);
    setCustomDescription(preset.description);
    setCustomImage(preset.image);
  };

  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target.result);
        triggerAIScan();
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAIScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleFinalSubmit = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // fallback
    }

    const complaintData = {
      title: customTitle,
      category: customCategory,
      location: customLocation,
      geo: selectedPreset.geo || '22.7196° N, 75.8577° E',
      priority: selectedPreset.priority || 'High',
      severityLevel: selectedPreset.severityLevel || 'Level 4 (High)',
      department: selectedPreset.department || 'Road & Transport Directorate',
      confidence: selectedPreset.confidence || '98.4%',
      aiDetected: selectedPreset.aiDetected || 'Municipal Infrastructure Defect',
      dimensions: selectedPreset.dimensions || 'Standard Urban Defect',
      image: customImage,
      description: customDescription
    };

    onSubmitSuccess(complaintData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pb-5 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Fast-Triage Dispatch</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Report Civic Issue
          </h2>
          <p className="text-xs text-slate-500">
            Upload incident photo or select a scenario to verify AI auto-detection & instant municipal routing.
          </p>
        </div>

        {/* Content */}
        <div className="py-5 space-y-6">
          {/* Quick Preset Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">
              1. Choose Sample Issue or Upload Custom Photo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_ISSUES.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedPreset.title === preset.title
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <img
                    src={preset.image}
                    alt={preset.category}
                    className="w-full h-14 object-cover rounded-lg mb-2"
                  />
                  <div className="font-bold text-[11px] text-slate-900 truncate">{preset.category}</div>
                  <div className="text-[10px] text-slate-500 truncate">{preset.location.split(',')[0]}</div>
                </div>
              ))}
            </div>

            {/* Upload Button */}
            <div className="mt-3 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 text-xs font-semibold text-slate-700 cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload From Device / Camera</span>
                <input type="file" accept="image/*" onChange={handleCustomUpload} className="hidden" />
              </label>
              <span className="text-[11px] text-slate-400">JPG, PNG under 10MB</span>
            </div>
          </div>

          {/* AI Live Inspection Viewfinder */}
          <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 text-xs border-b border-slate-800">
              <span className="flex items-center gap-2 text-sky-300 font-mono">
                <Cpu className="w-4 h-4" />
                <span>AI COMPUTER VISION ENGINE</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                {selectedPreset.confidence} Match
              </span>
            </div>

            <div className="relative aspect-16/9 rounded-xl overflow-hidden my-3">
              <img
                src={customImage}
                alt="Scan preview"
                className="w-full h-full object-cover"
              />
              {/* Overlay Bounding box */}
              <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                <div className="w-4/5 h-3/4 border-2 border-dashed border-sky-400 bg-sky-500/10 rounded flex items-center justify-center relative">
                  <span className="absolute -top-3 left-2 bg-slate-950 text-white text-[10px] font-mono px-2 py-0.5 rounded border border-sky-400/40">
                    {selectedPreset.aiDetected} • Conf: {selectedPreset.confidence}
                  </span>
                  <span className="absolute -bottom-2 right-2 bg-slate-950 text-slate-300 text-[9px] font-mono px-1.5 py-0.5 rounded">
                    Dim: {selectedPreset.dimensions}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Findings Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-400 text-[10px] block">Detected Issue</span>
                <strong className="text-slate-200">{selectedPreset.aiDetected}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Severity</span>
                <span className="text-rose-400 font-bold">{selectedPreset.severityLevel}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 text-[10px] block">Assigned Directorate</span>
                <strong className="text-blue-300">{selectedPreset.department}</strong>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Issue Title</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                >
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Sanitation">Sanitation & Garbage</option>
                  <option value="Electricity">Electricity & Lighting</option>
                  <option value="Water Supply">Water Supply & Drainage</option>
                  <option value="Horticulture & Greenery">Horticulture & Greenery</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Location & Landmark</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Description / Notes</label>
              <textarea
                rows={2}
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleFinalSubmit}
            className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs shadow-blue-600/30 transition-all cursor-pointer"
          >
            <span>Submit Ticket & Dispatch</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
