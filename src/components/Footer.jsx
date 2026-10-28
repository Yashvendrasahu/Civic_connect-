import React from 'react';
import CivicLogo from './CivicLogo.jsx';
import { ShieldCheck, Building2, ExternalLink } from 'lucide-react';

export default function Footer({ variant = 'landing', onNavigate }) {
  if (variant === 'auth') {
    return (
      <footer className="w-full py-6 px-4 sm:px-8 border-t border-slate-100 bg-white/70 backdrop-blur-xs text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-slate-700">Civic Connect</span>
            <span className="text-slate-300">•</span>
            <span>© 2026 Civic Connect. Built with Purpose. Built for the Community.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <button onClick={() => onNavigate && onNavigate('privacy')} className="hover:text-blue-600 transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate && onNavigate('terms')} className="hover:text-blue-600 transition-colors">Terms of Service</button>
            <button onClick={() => onNavigate && onNavigate('governance')} className="hover:text-blue-600 transition-colors">Municipal Data Governance</button>
            <button onClick={() => onNavigate && onNavigate('support')} className="hover:text-blue-600 transition-colors">Contact Support</button>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Digital India GovTech</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  if (variant === 'dashboard') {
    return (
      <footer className="w-full border-t border-slate-200 bg-white py-8 px-4 sm:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <CivicLogo subtitle="Civic Issue Reporting & Resolution System" onClick={() => onNavigate && onNavigate('landing')} />
            <span className="text-[11px] text-slate-400 font-medium mt-1">Municipal Open Data</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-slate-600 text-[13px]">
            <button onClick={() => onNavigate && onNavigate('about')} className="hover:text-blue-600 transition-colors">About</button>
            <button onClick={() => onNavigate && onNavigate('help')} className="hover:text-blue-600 transition-colors">Help & Support</button>
            <button onClick={() => onNavigate && onNavigate('privacy')} className="hover:text-blue-600 transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate && onNavigate('terms')} className="hover:text-blue-600 transition-colors">Terms of Service</button>
          </div>

          <div className="text-center md:text-right text-[12px] text-slate-400">
            © 2026 Civic Connect Inc. Built for the Community. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }

  // Full Landing Page Footer
  return (
    <footer className="w-full border-t border-slate-200 bg-white pt-16 pb-12 px-4 sm:px-8 text-slate-600">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-slate-100">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <CivicLogo showTag tagText="AI-CIVIC" onClick={() => onNavigate && onNavigate('landing')} />
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              AI-powered civic issue reporting and resolution platform. Connecting citizens, intelligent routing, and public administrations for thriving neighborhoods.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Civic Open-Data Initiative • Active System
            </div>
          </div>

          {/* Platform Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><button onClick={() => onNavigate && onNavigate('landing')} className="hover:text-blue-600 transition-colors">Platform Overview</button></li>
              <li><button onClick={() => onNavigate && onNavigate('vision-engine')} className="hover:text-blue-600 transition-colors">AI Computer Vision</button></li>
              <li><button onClick={() => onNavigate && onNavigate('tracker')} className="hover:text-blue-600 transition-colors">Complaint Tracking</button></li>
              <li><button onClick={() => onNavigate && onNavigate('workflows')} className="hover:text-blue-600 transition-colors">Resolution Workflows</button></li>
            </ul>
          </div>

          {/* Governance Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Governance</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><button onClick={() => onNavigate && onNavigate('partnerships')} className="hover:text-blue-600 transition-colors">City Partnerships</button></li>
              <li><button onClick={() => onNavigate && onNavigate('impact-report')} className="hover:text-blue-600 transition-colors">Civic Impact Report</button></li>
              <li><button onClick={() => onNavigate && onNavigate('security')} className="hover:text-blue-600 transition-colors">Security & Compliance</button></li>
              <li><button onClick={() => onNavigate && onNavigate('contact')} className="hover:text-blue-600 transition-colors">Contact Support</button></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Legal</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><button onClick={() => onNavigate && onNavigate('privacy')} className="hover:text-blue-600 transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate && onNavigate('terms')} className="hover:text-blue-600 transition-colors">Terms of Service</button></li>
              <li><button onClick={() => onNavigate && onNavigate('municipal-portal')} className="hover:text-blue-600 transition-colors">Municipal Integration</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 Civic Connect Inc. Built with Purpose. Built for the Community. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate && onNavigate('privacy')} className="hover:text-slate-600">Privacy</button>
            <span>•</span>
            <button onClick={() => onNavigate && onNavigate('security')} className="hover:text-slate-600">Security</button>
            <span>•</span>
            <button onClick={() => onNavigate && onNavigate('municipal-portal')} className="hover:text-slate-600">Municipal Integration Portal</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
