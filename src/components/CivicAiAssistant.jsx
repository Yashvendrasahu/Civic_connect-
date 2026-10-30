import React, { useState, useEffect, useRef } from 'react';
import { civicDataService } from '../services/supabaseClient.js';
import {
  Sparkles,
  Send,
  X,
  Database,
  MapPin,
  Navigation,
  ExternalLink,
  Bot,
  User,
  Maximize2,
  Minimize2,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Trash2
} from 'lucide-react';

export default function CivicAiAssistant({
  currentUser,
  complaints = [],
  onSelectTicket,
  onNavigate
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [useMapsGrounding, setUseMapsGrounding] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const threadEndRef = useRef(null);

  const totalCount = complaints.length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'Assigned'
  ).length;
  const pendingCount = Math.max(0, totalCount - resolvedCount - inProgressCount);

  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        'नमस्ते! मैं **Civic Connect AI Assistant** हूँ (Powered by **Live Supabase RAG + Google Maps Grounding**)।\n\nमैं आपके **Supabase Database** में मौजूद लाइव शिकायतों (Complaints), म्युनिसिपल ऑफिसर वेरिफिकेशन, वार्ड स्टेटस और आपके आस-पास की लोकेशन के आधार पर उत्तर देता हूँ। आप मुझसे हिंदी, Hinglish या English में पूछ सकते हैं!',
      model: 'gemini-3.8-flash (Supabase RAG)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ragSources: [],
      mapsLinks: []
    }
  ]);

  // Auto-detect user location when assistant opens so Maps Grounding & RAG have live GPS context
  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await civicDataService.detectUserLocation();
      if (loc) {
        setUserLocation(loc);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    if (isOpen && !userLocation) {
      handleDetectLocation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSending, isOpen]);

  const quickPrompts =
    currentUser?.role === 'admin'
      ? [
          'Supabase me abhi kitne complaints aur pending officers hain?',
          'Municipal officer login verification kaise kaam karta hai?',
          'High priority pending complaints ki list dikhao',
          'Nearest Municipal Corporation office on Google Maps'
        ]
      : currentUser?.role === 'officer'
      ? [
          'Mere zone me kaun-kaun se high priority complaints active hain?',
          'Active field squads aur workorders ka status batao',
          'Supabase database me total resolved vs pending kitne hain?',
          'Nearest PWD office & ward landmarks on Google Maps'
        ]
      : [
          'Mere complaints ka live status kya hai?',
          'Supabase me abhi kitne issues registered hain?',
          'Mere aas-paas nearest Municipal Office kaha hai?',
          'Report issue karne par SLA kitne ghante ka hota hai?'
        ];

  const handleSendMessage = async (textOverride) => {
    const queryText = (textOverride ?? inputValue).trim();
    if (!queryText || isSending) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextHistory = messages
      .filter((m) => m.id !== 'welcome-msg')
      .map((m) => ({
        role: m.role,
        content: m.content
      }));

    setMessages((prev) => [...prev, userMsg]);
    if (!textOverride) setInputValue('');
    setIsSending(true);

    try {
      const response = await civicDataService.sendRagChatMessage({
        message: queryText,
        history: nextHistory,
        model: selectedModel,
        useMapsGrounding,
        userLocation,
        currentUser,
        clientComplaints: complaints
      });

      const assistantMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content:
          response.reply ||
          'मैंने Supabase डेटाबेस की जाँच की। कृपया अपना प्रश्न थोड़ा और स्पष्ट करें।',
        model: response.model || selectedModel,
        mapsGroundingUsed: Boolean(response.mapsGroundingUsed),
        ragSources: Array.isArray(response.ragSources) ? response.ragSources : [],
        mapsLinks: Array.isArray(response.mapsLinks) ? response.mapsLinks : [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `माफ़ करें, उत्तर प्राप्त करने में समस्या आई: ${err.message || 'Network error'}`,
          model: selectedModel,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ragSources: [],
          mapsLinks: []
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleTicketSourceClick = (sourceId) => {
    if (!sourceId) return;
    const cleanId = String(sourceId).replace(/^#/, '').trim();
    const matched = complaints.find(
      (c) => String(c.id).replace(/^#/, '').toLowerCase() === cleanId.toLowerCase()
    );
    if (matched && onSelectTicket) {
      onSelectTicket(matched);
    }
  };

  // Simple markdown-like formatter for bold & bullet points
  const renderFormattedContent = (text) => {
    if (!text) return null;
    const lines = String(text).split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-1.5" />;

      const formatBold = (str) => {
        const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
        return parts.map((p, i) => {
          if (p.startsWith('**') && p.endsWith('**')) {
            return (
              <strong key={i} className="font-bold text-slate-900">
                {p.slice(2, -2)}
              </strong>
            );
          }
          if (p.startsWith('`') && p.endsWith('`')) {
            return (
              <code
                key={i}
                className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px]"
              >
                {p.slice(1, -1)}
              </code>
            );
          }
          return p;
        });
      };

      if (trimmed.startsWith('### ')) {
        return (
          <div key={idx} className="font-extrabold text-slate-900 text-xs pt-1.5 pb-0.5">
            {formatBold(trimmed.replace(/^###\s+/, ''))}
          </div>
        );
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 pl-1 py-0.5">
            <span className="text-blue-600 font-bold mt-0.5">•</span>
            <span className="flex-1">{formatBold(trimmed.slice(2))}</span>
          </div>
        );
      }

      return (
        <div key={idx} className="py-0.5 leading-relaxed">
          {formatBold(line)}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 pl-3.5 pr-4 py-3 rounded-2xl bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] hover:from-blue-700 hover:to-blue-800 text-white shadow-2xl shadow-blue-600/40 border border-blue-400/40 transition-all cursor-pointer group"
          title="Open Civic Connect Supabase RAG AI Assistant"
        >
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center relative">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-blue-700 animate-pulse"></span>
          </div>
          <div className="text-left">
            <div className="text-xs font-extrabold leading-tight flex items-center gap-1.5">
              <span>Civic AI Assistant</span>
              <span className="px-1.5 py-0.2 rounded bg-white/20 text-[9px] font-mono uppercase">
                Supabase RAG
              </span>
            </div>
            <div className="text-[10px] text-blue-100 leading-tight">
              Ask about live complaints, status & maps
            </div>
          </div>
        </button>
      )}

      {/* Multi-Turn Chat Drawer / Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden transition-all font-['Plus_Jakarta_Sans',sans-serif] ${
            isExpanded
              ? 'inset-4 sm:inset-8 rounded-3xl'
              : 'bottom-4 right-4 left-4 sm:left-auto sm:w-[430px] h-[630px] max-h-[88vh] rounded-3xl'
          }`}
        >
          {/* Top Header */}
          <div className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-[#1e3a8a] text-white px-4 py-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600/90 border border-blue-400/40 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold truncate">Civic Connect AI</h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[9px] font-bold">
                    <Database className="w-2.5 h-2.5" />
                    <span>RAG Live</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 truncate">
                  Supabase DB Context ({totalCount} Records) • Gemini Multi-Turn
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome-msg',
                      role: 'assistant',
                      content:
                        'चैट हिस्ट्री रीसेट कर दी गई है। आप Supabase डेटाबेस में मौजूद किसी भी शिकायत या लोकेशन के बारे में पूछ सकते हैं!',
                      model: selectedModel,
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      }),
                      ragSources: [],
                      mapsLinks: []
                    }
                  ])
                }
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model Selector + Maps Grounding & Live Supabase Telemetry Strip */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 space-y-2 text-[11px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600 text-[10px]">Model:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-800 focus:outline-hidden"
                >
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (General RAG)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast)</option>
                  <option value="gemini-4-argon">Gemini 4 Argon (Deep Analysis)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = !useMapsGrounding;
                  setUseMapsGrounding(next);
                  if (next && !userLocation) handleDetectLocation();
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                  useMapsGrounding
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title="Enable Google Maps Grounding with live GPS coordinates"
              >
                <MapPin className="w-3 h-3" />
                <span>Maps Grounding {useMapsGrounding ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Live Supabase RAG Stats + GPS Status */}
            <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  DB: {totalCount} Total
                </span>
                <span>•</span>
                <span className="text-blue-600 font-semibold">{inProgressCount} Active</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">{resolvedCount} Resolved</span>
              </div>

              <button
                type="button"
                onClick={handleDetectLocation}
                className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold cursor-pointer truncate max-w-[160px]"
                title="Refresh Live GPS Location for AI Context"
              >
                <Navigation className={`w-2.5 h-2.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span className="truncate">
                  {userLocation?.shortLocation
                    ? userLocation.shortLocation.split(',')[0]
                    : isLocating
                    ? 'Locating GPS...'
                    : 'Auto-GPS Active'}
                </span>
              </button>
            </div>
          </div>

          {/* Scrollable Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-start gap-2 max-w-[92%]">
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${
                      msg.role === 'user'
                        ? 'bg-[#2563eb] text-white rounded-br-xs'
                        : 'bg-white text-slate-700 border border-slate-200/90 rounded-bl-xs'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div className="leading-relaxed">{msg.content}</div>
                    ) : (
                      <div className="space-y-1">{renderFormattedContent(msg.content)}</div>
                    )}

                    {/* Retrieved Supabase RAG Sources */}
                    {msg.role === 'assistant' &&
                      Array.isArray(msg.ragSources) &&
                      msg.ragSources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1 text-blue-600">
                              <Database className="w-3 h-3" />
                              <span>Retrieved Supabase RAG Records ({msg.ragSources.length})</span>
                            </span>
                          </div>
                          <div className="space-y-1">
                            {msg.ragSources.slice(0, 3).map((src, sIdx) => (
                              <div
                                key={sIdx}
                                onClick={() => handleTicketSourceClick(src.id)}
                                className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 transition-colors cursor-pointer flex items-center justify-between gap-2 text-[11px]"
                              >
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 truncate">
                                    <span className="text-blue-600 font-mono mr-1">{src.id}</span>
                                    <span>{src.title}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate">
                                    📍 {src.location} • {src.assignedTeam}
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${
                                    src.status === 'Resolved'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : src.status === 'In Progress'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {src.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Google Maps Grounding Links & Review Snippets */}
                    {msg.role === 'assistant' &&
                      Array.isArray(msg.mapsLinks) &&
                      msg.mapsLinks.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                          <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>Google Maps Grounding Places</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.mapsLinks.map((lnk, lIdx) => (
                              <div key={lIdx} className="w-full space-y-1">
                                <a
                                  href={lnk.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 text-[11px] font-bold text-emerald-800 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                  <span className="truncate">{lnk.title}</span>
                                </a>
                                {Array.isArray(lnk.reviewSnippets) &&
                                  lnk.reviewSnippets.length > 0 && (
                                    <div className="text-[10px] text-slate-500 italic pl-2 border-l-2 border-emerald-200">
                                      "{lnk.reviewSnippets[0]}"
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    <div
                      className={`mt-1.5 flex items-center justify-between gap-2 text-[9px] ${
                        msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.model && <span className="font-mono">{msg.model}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-2xs">
                  <span>Querying Supabase RAG & generating answer...</span>
                </div>
              </div>
            )}

            <div ref={threadEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-3.5 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isSending}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[10px] font-semibold whitespace-nowrap border border-slate-200/80 transition-colors cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about Supabase complaints, status, officers, or nearby places..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="px-4 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
