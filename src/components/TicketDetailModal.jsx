import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Wrench,
  Users,
  CheckCircle2,
  Sparkles,
  Building2,
  Truck,
  Upload,
  Check,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function TicketDetailModal({
  ticket,
  currentUser,
  isOpen,
  onClose,
  onStatusChange,
  onUploadPhotos,
  onAddTicketComment,
  onUpvoteTicket
}) {
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  if (!isOpen || !ticket) return null;

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    if (onAddTicketComment) {
      await onAddTicketComment(ticket.id, feedback.trim(), 'Citizen Verification Note');
    }
    setFeedbackSent(true);
    setFeedback('');
    setTimeout(() => {
      setFeedbackSent(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 pb-5 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold">
              #{ticket.id}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200">
              {ticket.status}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-xs border border-rose-200">
              Priority: {ticket.priority}
            </span>
            {onUpvoteTicket && (
              <button
                type="button"
                onClick={() => onUpvoteTicket(ticket.id)}
                className="px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 cursor-pointer transition-colors"
              >
                ▲ Upvote ({ticket.upvotes || 1})
              </button>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {ticket.title}
          </h2>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {ticket.location}
            </span>
            <span>•</span>
            <span>{ticket.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Reported: {ticket.reported || ticket.timestamp}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="py-6 space-y-6">
          
          {/* Stepper Progress Bar */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              Real-Time Municipal Resolution Lifecycle
            </h4>

            <div className="grid grid-cols-5 relative">
              <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-slate-200 z-0">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{
                    width:
                      ticket.status === 'Resolved'
                        ? '100%'
                        : ticket.status === 'In Progress'
                        ? '75%'
                        : '50%'
                  }}
                ></div>
              </div>

              {ticket.steps?.map((stepItem, idx) => {
                const isCompleted = stepItem.status === 'completed';
                const isCurrent = stepItem.status === 'current';

                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-all ${
                        isCompleted
                          ? 'bg-blue-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                          : 'bg-white border-2 border-dashed border-slate-300 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] font-bold mt-2 ${isCurrent ? 'text-blue-600' : 'text-slate-800'}`}>
                      {stepItem.title}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {stepItem.subtitle}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incident Image & Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Image */}
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
              <img
                src={ticket.image}
                alt={ticket.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                GPS: {ticket.geo || '22.7196° N, 75.8577° E'}
              </div>
            </div>

            {/* Info Box */}
            <div className="space-y-3 text-xs bg-white p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">AI Detection</span>
                <span className="font-bold text-slate-900">{ticket.aiDetected || 'Asphalt Fissure'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Confidence Calibration</span>
                <span className="font-bold text-blue-600">{ticket.confidence || '98.4%'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Assigned Team</span>
                <span className="font-bold text-slate-900">{ticket.assignedTeam}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Department</span>
                <span className="font-semibold text-slate-700">{ticket.department}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block mb-1">Description</span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-2 rounded-lg">
                  {ticket.description}
                </p>
              </div>
            </div>
          </div>

          {/* Dispatch Note */}
          {ticket.dispatchNote && (
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
              <Truck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Latest Field Dispatch:</span> {ticket.dispatchNote}
              </div>
            </div>
          )}

          {/* Officer Action Bar (if officer or quick simulation) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800">Municipal Status Control</div>
              <div className="text-[11px] text-slate-500">Simulate workflow dispatch or mark resolved</div>
            </div>

            <div className="flex items-center gap-2">
              {ticket.status !== 'Resolved' && (
                <button
                  onClick={() => onStatusChange(ticket.id, 'Resolved')}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              )}

              {ticket.status !== 'In Progress' && (
                <button
                  onClick={() => onStatusChange(ticket.id, 'In Progress')}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Dispatch Crew</span>
                </button>
              )}

              <button
                onClick={() => onUploadPhotos(ticket.id)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Add Photo</span>
              </button>
            </div>
          </div>

          {/* Persisted Field & Citizen Activity Logs */}
          {Array.isArray(ticket.workLogs) && ticket.workLogs.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">Activity & Verification Notes ({ticket.workLogs.length})</div>
              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                {ticket.workLogs.map((log, i) => (
                  <div key={log.id || i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.author || 'Citizen'}</span>
                      <span className="text-[10px] text-slate-400">{log.time || 'Just now'}</span>
                    </div>
                    <p className="text-slate-600">{log.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citizen Feedback Form */}
          <form onSubmit={handleSendFeedback} className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700 block">
              Citizen Comments & Verification Notes
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add an update, landmark detail, or comment for the municipal squad..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Submit
              </button>
            </div>
            {feedbackSent && (
              <span className="text-[11px] text-emerald-600 font-semibold block">
                ✓ Comment logged and synced to Supabase & field team.
              </span>
            )}
          </form>

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
