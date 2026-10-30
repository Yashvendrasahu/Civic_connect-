import React, { useState, useMemo } from 'react';
import { civicDataService } from '../../services/supabaseClient.js';
import {
  Bell,
  CheckCheck,
  Settings,
  Search,
  AlertTriangle,
  Clock
} from 'lucide-react';

export default function OfficerNotificationsView({
  complaints = [],
  liveNotifications = [],
  onRefreshData,
  onSelectComplaint,
  onNavigateTab,
  onShowToast
}) {
  const [readIds, setReadIds] = useState([]);
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'Unread' | 'Read' | 'Action Required'
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');

  // Derive officer notifications from live notifications + newly created complaints (starts empty when database is empty)
  const items = useMemo(() => {
    const rawList = Array.isArray(liveNotifications) ? liveNotifications : [];
    return rawList.map((n, idx) => {
      const rawUnread = n.unread !== undefined ? Boolean(n.unread) : !n.read;
      const isUnread = readIds.includes(n.id) ? false : rawUnread;
      const isUrgent =
        (n.title || '').toLowerCase().includes('critical') ||
        (n.title || '').toLowerCase().includes('sla') ||
        (n.title || '').toLowerCase().includes('logged');
      return {
        id: n.id || `NOTIF-${idx + 1}`,
        group: 'TODAY',
        type: isUrgent ? 'Assignments' : 'Work Updates',
        badge: isUrgent ? 'Action Required' : 'System Update',
        badgeTone: isUrgent ? 'blue' : 'emerald',
        borderTone: isUrgent ? 'border-l-blue-600' : 'border-l-emerald-500',
        ticketId: n.ticketId || complaints[0]?.id || 'CC10000',
        ward: 'Zone 04 (Ward 18)',
        time: n.time || 'Just now',
        title: n.title || 'Municipal Complaint Notification',
        description: n.message || n.description || 'Real-time update recorded in Supabase ledger.',
        unread: isUnread,
        actionRequired: isUrgent,
        primaryAction: isUrgent ? 'Verify & Accept' : 'Inspect Ticket',
        primaryActionTone: isUrgent ? 'blue' : 'default',
        secondaryAction: isUrgent ? 'Extend Request' : null
      };
    });
  }, [liveNotifications, readIds, complaints]);

  const totalCount = items.length;
  const unreadCount = items.filter((i) => i.unread).length;
  const readCount = Math.max(0, totalCount - unreadCount);
  const actionCount = items.filter((i) => i.actionRequired).length;

  const handleMarkAllRead = async () => {
    setReadIds(items.map((i) => i.id));
    await civicDataService.markAllNotificationsRead();
    if (onRefreshData) onRefreshData();
    onShowToast('All notifications marked as read in Supabase.');
  };

  const handleNotificationAction = (notif, isSecondary = false) => {
    setReadIds((prev) => (prev.includes(notif.id) ? prev : [...prev, notif.id]));

    const matchedComplaint =
      complaints.find((c) => c.id === notif.ticketId) || complaints[0];

    if (notif.primaryAction === 'Dispatch Crew' && !isSecondary) {
      onShowToast(`Emergency dispatch order sent to Squad #02 for #${notif.ticketId}`);
      if (matchedComplaint) onSelectComplaint(matchedComplaint, 'execution');
      return;
    }

    if (notif.primaryAction === 'Verify & Accept' && !isSecondary) {
      onShowToast(`Complaint #${notif.ticketId} accepted into your active queue.`);
      if (matchedComplaint) onSelectComplaint(matchedComplaint, 'verification');
      return;
    }

    if (notif.secondaryAction === 'Extend Request' && isSecondary) {
      onShowToast(`Statutory SLA extension (+4 hours) requested for #${notif.ticketId}.`);
      return;
    }

    if (matchedComplaint) {
      onSelectComplaint(
        matchedComplaint,
        notif.primaryAction.includes('Work') ? 'execution' : 'verification'
      );
    } else {
      onShowToast('No matching complaint record found yet.');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesTab =
      filterTab === 'All' ||
      (filterTab === 'Unread' && item.unread) ||
      (filterTab === 'Read' && !item.unread) ||
      (filterTab === 'Action Required' && item.actionRequired);
    const matchesType = typeFilter === 'All Types' || item.type === typeFilter;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesType && matchesSearch;
  });

  const groups = ['TODAY', 'YESTERDAY', 'EARLIER THIS WEEK'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-blue-600 mb-1">
            <span>SYSTEM ALERTS & WORKFLOW DISPATCH</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {unreadCount} Unread Notifications
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time statutory SLA breach alerts, new AI complaint assignments, and field squad execution logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Mark All as Read</span>
          </button>
          <button
            onClick={() => onNavigateTab('profile-settings')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Notification Preferences</span>
          </button>
        </div>
      </div>

      {/* 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">All Notifications</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{totalCount} Total</div>
            <span className="text-[11px] text-slate-400">Live Supabase activity stream</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600">Unread</span>
            <div className="text-2xl font-extrabold text-blue-600 font-mono mt-1">
              {unreadCount} Unread
            </div>
            <span className="text-[11px] text-slate-500">Requires officer attention</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-600">Action Required</span>
            <div className="text-2xl font-extrabold text-rose-600 font-mono mt-1">
              {actionCount} Urgent
            </div>
            <span className="text-[11px] text-rose-600 font-medium">
              SLA breaches & pending sign-offs
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'All', label: `All (${totalCount})` },
            { id: 'Unread', label: `Unread (${unreadCount})` },
            { id: 'Read', label: `Read (${readCount})` },
            { id: 'Action Required', label: `Action Required (${actionCount})` }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterTab(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === t.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search #ID, ward, alert..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option>All Types</option>
            <option>SLA Alerts</option>
            <option>Assignments</option>
            <option>Work Updates</option>
            <option>Citizen Input</option>
            <option>Resolved</option>
          </select>
        </div>
      </div>

      {/* Grouped Notification Feed */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2 shadow-2xs">
          <div className="text-sm font-extrabold text-slate-900">
            No Notifications Yet
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your notifications table starts empty. As soon as citizens report issues or squads log field updates, real-time alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((grp) => {
            const groupItems = filteredItems.filter((i) => i.group === grp);
            if (groupItems.length === 0) return null;

            return (
              <div key={grp} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    {grp}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="space-y-3">
                  {groupItems.map((notif) => (
                    <div
                      key={notif.id}
                      className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${notif.borderTone} p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all ${
                        notif.unread ? 'ring-1 ring-blue-500/15' : 'opacity-90'
                      }`}
                    >
                      <div className="space-y-1.5 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          {notif.unread && (
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              notif.badgeTone === 'red'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : notif.badgeTone === 'amber'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : notif.badgeTone === 'blue'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : notif.badgeTone === 'emerald'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {notif.badge}
                          </span>
                          <span className="font-mono text-xs font-bold text-blue-600">
                            #{notif.ticketId}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-600">
                            {notif.ward}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {notif.time}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                          {notif.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {notif.description}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleNotificationAction(notif, false)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                            notif.primaryActionTone === 'red'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                              : notif.primaryActionTone === 'blue'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                              : notif.primaryActionTone === 'amber'
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs'
                              : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {notif.primaryAction}
                        </button>

                        {notif.secondaryAction && (
                          <button
                            onClick={() => handleNotificationAction(notif, true)}
                            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            {notif.secondaryAction}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
