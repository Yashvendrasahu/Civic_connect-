import React from 'react';

export default function CivicLogo({ 
  subtitle = "Civic Issue Reporting & Resolution System", 
  showTag = false, 
  variant = "default", // "default" | "tagline" | "minimal" | "compact"
  tagText = "AI-CIVIC",
  onClick = null
}) {
  return (
    <div 
      className={`inline-flex items-center gap-2.5 ${onClick ? 'cursor-pointer select-none group' : ''}`}
      onClick={onClick}
    >
      {/* Precision layered vector logo mark */}
      <div className="relative w-8 h-8 md:w-9 md:h-9 flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
          <circle cx="20" cy="20" r="19" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1.5" />
          {/* Interlocking modern civic network rings */}
          <path 
            d="M12 19C12 14.5817 15.5817 11 20 11C23.6338 11 26.7027 13.4187 27.6719 16.7358" 
            stroke="#059669" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
          />
          <path 
            d="M28 21C28 25.4183 24.4183 29 20 29C16.3662 29 13.2973 26.5813 12.3281 23.2642" 
            stroke="#2563EB" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
          />
          {/* Inner geo-node pin */}
          <circle cx="20" cy="20" r="3.2" fill="#0284C7" />
          <circle cx="27.5" cy="16.5" r="2.2" fill="#10B981" />
          <circle cx="12.5" cy="23.5" r="2.2" fill="#3B82F6" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[17px] md:text-[18px] text-slate-900 tracking-tight leading-none font-['Plus_Jakarta_Sans',sans-serif]">
            Civic Connect
          </span>
          {showTag && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-700 tracking-wide border border-sky-200/80">
              {tagText}
            </span>
          )}
        </div>
        
        {subtitle && (
          <span className="text-[11px] font-normal text-slate-500 tracking-normal mt-0.5 leading-none">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
