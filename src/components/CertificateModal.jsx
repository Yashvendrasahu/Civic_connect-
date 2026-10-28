import React, { useRef } from 'react';
import { X, Download, Printer, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import CivicLogo from './CivicLogo.jsx';

export default function CertificateModal({ isOpen, onClose, user, complaints = [] }) {
  const printRef = useRef(null);

  if (!isOpen) return null;

  const totalReported = complaints.length;
  const totalResolved = complaints.filter((c) => c.status === 'Resolved').length;
  const impactScore = totalReported > 0 ? Math.min(100, 80 + totalResolved * 5 + totalReported * 2) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 print:shadow-none print:border-none print:m-0">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Printable Area */}
        <div ref={printRef} className="border-4 border-double border-blue-900/30 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-50/50 via-white to-blue-50/30 text-center relative overflow-hidden">
          {/* Watermark seal */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <ShieldCheck className="w-96 h-96 text-blue-900" />
          </div>

          <div className="relative z-10 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <CivicLogo subtitle="Civic Issue Reporting & Resolution System" />
              <div className="text-right text-[11px] text-slate-500 font-mono">
                <div>CERT-ID: IND-CIVIC-2026-8841</div>
                <div>Issued: Oct 2026</div>
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Official Citizen Civic Recognition</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
              Certificate of Civic Impact
            </h1>

            <p className="text-xs text-slate-500 uppercase tracking-widest">
              This is proudly presented to
            </p>

            {/* Recipient Name */}
            <div className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight font-serif py-1 border-b-2 border-blue-200 max-w-sm mx-auto">
              {user?.name || 'Priya Sharma'}
            </div>

            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed pt-2">
              In recognition of active citizenship, community vigilance, and dedicated participation in the Indore Municipal Civic Connect Initiative.
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-3 bg-white/80 rounded-xl border border-slate-200/90 shadow-2xs">
              <div>
                <div className="text-xl font-extrabold text-blue-600">{String(totalReported).padStart(2, '0')}</div>
                <div className="text-[10px] text-slate-500">Verified Reports</div>
              </div>
              <div className="border-x border-slate-200">
                <div className="text-xl font-extrabold text-emerald-600">{String(totalResolved).padStart(2, '0')}</div>
                <div className="text-[10px] text-slate-500">Resolved Issues</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900">{impactScore}%</div>
                <div className="text-[10px] text-slate-500">Civic Impact Score</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              Assigned Ward: <strong className="text-slate-700">{user?.ward || 'Ward 18, Zone 4'}</strong> • Indore, Madhya Pradesh
            </div>

            {/* Signatures */}
            <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs border-t border-slate-200">
              <div>
                <div className="font-serif italic text-base text-slate-800">Yashvendra Sahu</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Founding Architect, Civic Connect</div>
              </div>
              <div>
                <div className="font-serif italic text-base text-slate-800">Rajesh Sharma</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Chief Municipal Operations Officer, IMC</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-6 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs shadow-blue-600/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
