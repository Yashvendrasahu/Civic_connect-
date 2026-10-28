import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_COMPLAINTS,
  INITIAL_NOTIFICATIONS,
  DEFAULT_CITIZEN_USER,
  DEFAULT_OFFICER_USER,
  TIMELINE_UPDATES
} from './mockData.js';

// Local storage keys
const STORAGE_KEY_URL = 'civic_supabase_url_v1';
const STORAGE_KEY_KEY = 'civic_supabase_anon_key_v1';
const STORAGE_KEY_COMPLAINTS = 'civic_connect_complaints_v5';
const STORAGE_KEY_NOTIFICATIONS = 'civic_connect_notifications_v5';
const STORAGE_KEY_USER = 'civic_connect_current_user_v4';
const STORAGE_KEY_TOKEN = 'civic_connect_auth_token_v4';
const STORAGE_KEY_UPDATES = 'civic_connect_updates_v5';
const LEGACY_SEED_IDS = new Set(['CC10245', 'CC10244', 'CC10243', 'CC10242']);

// Helper to determine active credentials (Native Anon Key only)
function getActiveCredentials() {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const customKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const url = (customUrl || envUrl || '').trim();
  const key = (customKey || envKey || '').trim();

  const isRealCloud = Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    !url.includes('your-project-id.supabase.co') &&
    !url.includes('civic-connect-indore.supabase.co') &&
    key !== 'your-anon-public-api-key'
  );

  return { url, key, isRealCloud };
}

let activeCredentials = getActiveCredentials();

export function createSupabaseInstance(url, key) {
  if (!url || !key) {
    return null;
  }
  try {
    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export let supabase = activeCredentials.isRealCloud
  ? createSupabaseInstance(activeCredentials.url, activeCredentials.key)
  : null;

// Token Getters/Setters
export function getStoredToken() {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_TOKEN) : null;
  } catch (e) {
    return null;
  }
}

export function saveStoredToken(token) {
  try {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  } catch (e) {
    console.warn('Token storage error:', e);
  }
}

// Authenticated Fetch Helper for Express Backend (/api/*)
async function apiFetch(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(endpoint, {
    ...options,
    headers
  });
}

// Local Storage Cache Getters/Setters (Starts empty until users create records)
export function getStoredComplaints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((c) => !LEGACY_SEED_IDS.has(String(c?.id || '').replace(/^#/, '')));
      }
    }
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return [];
}

export function saveStoredComplaints(complaints) {
  try {
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints || []));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

export function getStoredTimelineUpdates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UPDATES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return [];
}

export function saveStoredTimelineUpdates(updates) {
  try {
    localStorage.setItem(STORAGE_KEY_UPDATES, JSON.stringify(updates || []));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

export function getStoredNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return [];
}

export function saveStoredNotifications(notifs) {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifs || []));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return null;
}

export function saveStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

function normalizeComplaintRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title || 'Civic Issue',
    category: row.category || 'Roads & Infrastructure',
    location: row.location || 'Indore Municipal Area',
    ward: row.ward || 'Ward 18',
    geo: row.geo || '22.7196° N, 75.8577° E',
    reported: row.reported || 'Recently',
    timestamp: row.timestamp || 'Today',
    status: row.status || 'In Progress',
    priority: row.priority || 'Medium',
    assignedTeam: row.assigned_team || row.assignedTeam || 'Municipal Response Squad',
    assignedSquad: row.assigned_team || row.assignedSquad || row.assignedTeam || 'Municipal Response Squad',
    confidence: row.confidence || '98.0%',
    aiDetected: row.ai_detected || row.aiDetected || 'Civic Defect',
    dimensions: row.dimensions || 'Standard Urban Scope',
    severityLevel: row.severity_level || row.severityLevel || 'Medium',
    department: row.department || 'Public Works Department',
    image: row.image || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    description: row.description || '',
    citizenName: row.citizen_name || row.citizenName || 'Priya Sharma',
    citizenEmail: row.citizen_email || row.citizenEmail || 'priya.sharma@example.com',
    upvotes: typeof row.upvotes === 'number' ? row.upvotes : 1,
    slaHours: row.sla_hours || row.slaHours || 24,
    slaDeadline: row.sla_deadline || row.slaDeadline,
    slaStatus: row.sla_status || row.slaStatus || 'On Track',
    steps: Array.isArray(row.steps)
      ? row.steps
      : typeof row.steps === 'string'
      ? JSON.parse(row.steps)
      : [
          { step: 1, title: '1. Submitted', subtitle: 'Confirmed', status: 'completed' },
          { step: 2, title: '2. AI Verified', subtitle: 'Verified', status: 'completed' },
          { step: 3, title: '3. Assigned', subtitle: 'Crew Assigned', status: 'completed' },
          { step: 4, title: '4. In Progress', subtitle: 'Work in progress', status: 'current' },
          { step: 5, title: '5. Resolved', subtitle: 'Pending Inspection', status: 'upcoming' }
        ],
    workLogs: Array.isArray(row.work_logs)
      ? row.work_logs
      : Array.isArray(row.workLogs)
      ? row.workLogs
      : [],
    dispatchNote: row.dispatch_note || row.dispatchNote || ''
  };
}

// ============================================================================
// FULL-SERVICE CIVIC DATA & NATIVE SUPABASE BaaS CONTROLLER
// ============================================================================
export const civicDataService = {
  getSupabaseConfig() {
    activeCredentials = getActiveCredentials();
    return {
      url: activeCredentials.url,
      key: activeCredentials.key,
      isRealCloud: activeCredentials.isRealCloud,
      isConfigured: Boolean(supabase)
    };
  },

  // Realtime complaint subscription via Native Supabase Channels
  subscribeToComplaints(onUpdate) {
    if (!supabase || !activeCredentials.isRealCloud) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel('public:complaints:realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'complaints' },
          (payload) => {
            if (onUpdate) onUpdate(payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime channel error:', err);
      return () => {};
    }
  },

  // 1. Fetch complaints (Express + Native Supabase API -> Local Cache fallback)
  async getComplaints(filter = 'all') {
    try {
      const res = await apiFetch(`/api/complaints${filter !== 'all' ? `?filter=${filter}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        const normalized = Array.isArray(data) ? data.map(normalizeComplaintRow) : [];
        saveStoredComplaints(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('API fetch complaints fallback:', err);
    }

    if (supabase && activeCredentials.isRealCloud) {
      try {
        let query = supabase.from('complaints').select('*').order('created_at', { ascending: false });
        if (filter === 'active') {
          query = query.in('status', ['In Progress', 'Assigned', 'Submitted', 'Needs Verification']);
        } else if (filter === 'resolved') {
          query = query.eq('status', 'Resolved');
        }
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          const normalized = data
            .map(normalizeComplaintRow)
            .filter((c) => c && !LEGACY_SEED_IDS.has(String(c.id).replace(/^#/, '')));
          saveStoredComplaints(normalized);
          return normalized;
        }
      } catch (err) {
        console.warn('Direct Supabase query fallback:', err);
      }
    }

    const complaints = getStoredComplaints();
    if (filter === 'active') {
      return complaints.filter(
        (c) => c.status === 'In Progress' || c.status === 'Assigned' || c.status === 'Submitted'
      );
    }
    if (filter === 'resolved') {
      return complaints.filter((c) => c.status === 'Resolved');
    }
    return complaints;
  },

  // 2. Get single ticket by ID
  async getComplaintById(ticketId) {
    const cleanId = (ticketId || '').replace('#', '');
    try {
      const res = await apiFetch(`/api/complaints/${cleanId}`);
      if (res.ok) {
        return normalizeComplaintRow(await res.json());
      }
    } catch (err) {
      console.warn('API get complaint by ID fallback:', err);
    }

    const complaints = getStoredComplaints();
    return complaints.find((c) => c.id === cleanId || c.id === ticketId) || null;
  },

  // 3. Submit new complaint (Express + Supabase Storage & Database)
  async submitComplaint(complaintData) {
    const currentUser = getStoredUser();
    const payload = {
      ...complaintData,
      citizenName: currentUser?.name || complaintData.citizenName || 'Priya Sharma',
      citizenEmail: currentUser?.email || complaintData.citizenEmail || 'priya.sharma@example.com'
    };

    try {
      const res = await apiFetch('/api/complaints', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const apiTicket = normalizeComplaintRow(await res.json());
        const stored = getStoredComplaints();
        saveStoredComplaints([apiTicket, ...stored.filter((c) => c.id !== apiTicket.id)]);
        return apiTicket;
      }
    } catch (err) {
      console.warn('API submit complaint fallback:', err);
    }

    const newId = `CC${Math.floor(10250 + Math.random() * 900)}`;
    const fallbackComplaint = normalizeComplaintRow({
      id: newId,
      ...payload,
      reported: 'Just now',
      timestamp: 'Today, Just now',
      status: 'In Progress'
    });
    const stored = getStoredComplaints();
    saveStoredComplaints([fallbackComplaint, ...stored]);
    return fallbackComplaint;
  },

  // 4. Update ticket status (Officer / Citizen view)
  async updateTicketStatus(ticketId, newStatus, note = '', extra = {}) {
    const cleanId = (ticketId || '').replace('#', '');

    try {
      const res = await apiFetch(`/api/complaints/${cleanId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, note, ...extra })
      });
      if (res.ok) {
        const updated = normalizeComplaintRow(await res.json());
        const stored = getStoredComplaints().map((c) => (c.id === cleanId ? updated : c));
        saveStoredComplaints(stored);
        return updated;
      }
    } catch (err) {
      console.warn('API update ticket status fallback:', err);
    }

    const complaints = getStoredComplaints();
    const index = complaints.findIndex((c) => c.id === cleanId);
    if (index === -1) return null;
    complaints[index] = {
      ...complaints[index],
      status: newStatus,
      dispatchNote: note || complaints[index].dispatchNote,
      ...extra
    };
    saveStoredComplaints(complaints);
    return complaints[index];
  },

  // 4b. Dispatch Field Crew & Create Workorder (Officer Module)
  async dispatchSquad(ticketId, dispatchData) {
    const cleanId = (ticketId || '').replace('#', '');
    try {
      const res = await apiFetch(`/api/complaints/${cleanId}/dispatch`, {
        method: 'POST',
        body: JSON.stringify(dispatchData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API dispatch squad fallback:', err);
    }
    return {
      message: `Dispatched ${dispatchData.assignedSquad || 'Field Squad'} to #${cleanId}`,
      workorder: {
        id: `WO-2026-${Math.floor(850 + Math.random() * 90)}`,
        complaintId: cleanId,
        ...dispatchData
      }
    };
  },

  // 4c. Add Officer Field Work Log
  async addWorkLog(ticketId, workLogData) {
    const cleanId = (ticketId || '').replace('#', '');
    try {
      const res = await apiFetch(`/api/complaints/${cleanId}/worklog`, {
        method: 'POST',
        body: JSON.stringify(workLogData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API add worklog fallback:', err);
    }
    return {
      workLog: {
        id: `WL-${Math.floor(903 + Math.random() * 90)}`,
        time: 'Just now',
        ...workLogData
      }
    };
  },

  // 4d. Upvote Complaint
  async upvoteComplaint(ticketId) {
    const cleanId = (ticketId || '').replace('#', '');
    try {
      const res = await apiFetch(`/api/complaints/${cleanId}/upvote`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        const stored = getStoredComplaints().map((c) =>
          c.id === cleanId ? { ...c, upvotes: data.upvotes ?? (c.upvotes || 0) + 1 } : c
        );
        saveStoredComplaints(stored);
        return data;
      }
    } catch (err) {
      console.warn('API upvote fallback:', err);
    }
    return null;
  },

  // 4d-2. Convert Browser File to Base64 Data URL
  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve('');
      if (typeof file === 'string') return resolve(file);
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  // 4d-3. Upload Evidence Photo (Supabase Storage with Base64 fallback + Express sync)
  async uploadEvidencePhoto(ticketId, fileOrDataUrl, options = {}) {
    const cleanId = (ticketId || '').replace('#', '');
    const dataUrl = typeof fileOrDataUrl === 'string'
      ? fileOrDataUrl
      : await this.fileToDataUrl(fileOrDataUrl);

    if (!dataUrl) {
      throw new Error('No image selected for upload');
    }

    let uploadedStorageUrl = '';
    if (supabase && activeCredentials.isRealCloud && typeof fileOrDataUrl === 'object' && fileOrDataUrl instanceof Blob) {
      try {
        const ext = (fileOrDataUrl.name || 'photo.jpg').split('.').pop() || 'jpg';
        const filePath = `tickets/${cleanId || 'draft'}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('complaint-images')
          .upload(filePath, fileOrDataUrl, { upsert: true });
        if (!uploadErr) {
          const { data: pubData } = supabase.storage.from('complaint-images').getPublicUrl(filePath);
          if (pubData?.publicUrl) {
            uploadedStorageUrl = pubData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.warn('Client Supabase Storage fallback to Base64:', storageErr);
      }
    }

    const finalImagePayload = uploadedStorageUrl || dataUrl;
    if (!cleanId) {
      return { photoUrl: finalImagePayload };
    }

    try {
      const res = await apiFetch(`/api/complaints/${cleanId}/photos`, {
        method: 'POST',
        body: JSON.stringify({
          image: finalImagePayload,
          author: options.author,
          role: options.role,
          note: options.note,
          replacePrimary: options.replacePrimary
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.complaint) {
          const normalized = normalizeComplaintRow(data.complaint);
          const stored = getStoredComplaints().map((c) => (c.id === cleanId ? normalized : c));
          saveStoredComplaints(stored);
          return { ...data, complaint: normalized };
        }
        return data;
      }
    } catch (err) {
      console.warn('API photo upload fallback:', err);
    }

    const stored = getStoredComplaints().map((c) =>
      c.id === cleanId ? { ...c, image: finalImagePayload } : c
    );
    saveStoredComplaints(stored);
    return {
      photoUrl: finalImagePayload,
      complaint: stored.find((c) => c.id === cleanId) || null
    };
  },

  // 4d-4. Batch Update Complaints (Assign Department, Status, or Mark for Inspection)
  async batchUpdateComplaints(payload) {
    try {
      const res = await apiFetch('/api/complaints/batch', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.complaints)) {
          const normalized = data.complaints.map(normalizeComplaintRow);
          saveStoredComplaints(normalized);
        }
        return data;
      }
    } catch (err) {
      console.warn('API batch update fallback:', err);
    }
    return null;
  },

  // 4d-5. Real CSV File Download Helper
  exportToCsv(filename, rows) {
    if (typeof window === 'undefined' || !Array.isArray(rows)) return false;
    const safeRows = rows.length > 0 ? rows : [{ Notice: 'No records available to export' }];
    const headers = Object.keys(safeRows[0]);
    const escapeCell = (val) => {
      if (val === null || val === undefined) return '""';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };
    const csvLines = [
      headers.map(escapeCell).join(','),
      ...safeRows.map((row) => headers.map((h) => escapeCell(row[h])).join(','))
    ];
    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  },

  // 4e. Officer Workorders & Field Crews
  async getOfficerWorkorders() {
    try {
      const res = await apiFetch('/api/officer/workorders');
      if (res.ok) return await res.json();
    } catch (e) {
      // ignore
    }
    return [];
  },

  async getFieldCrews() {
    try {
      const res = await apiFetch('/api/officer/crews');
      if (res.ok) return await res.json();
    } catch (e) {
      // ignore
    }
    return [];
  },

  // 4f. Analytics & Ward Heatmaps
  async getAnalyticsOverview() {
    try {
      const res = await apiFetch('/api/analytics/overview');
      if (res.ok) return await res.json();
    } catch (e) {
      // ignore
    }
    return null;
  },

  async getDepartmentAnalytics() {
    try {
      const res = await apiFetch('/api/analytics/departments');
      if (res.ok) return await res.json();
    } catch (e) {
      // ignore
    }
    return [];
  },

  async getWardAnalytics() {
    try {
      const res = await apiFetch('/api/analytics/wards');
      if (res.ok) return await res.json();
    } catch (e) {
      // ignore
    }
    return [];
  },

  // 5. Notifications
  async getNotifications() {
    try {
      const res = await apiFetch('/api/notifications');
      if (res.ok) {
        const notifs = await res.json();
        saveStoredNotifications(notifs);
        return notifs;
      }
    } catch (err) {
      console.warn('API get notifications fallback:', err);
    }
    return getStoredNotifications();
  },

  async markAllNotificationsRead() {
    try {
      const res = await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        saveStoredNotifications(updated);
        return updated;
      }
    } catch (err) {
      console.warn('API mark read fallback:', err);
    }
    const list = getStoredNotifications().map((n) => ({ ...n, read: true }));
    saveStoredNotifications(list);
    return list;
  },

  // 6. Timeline updates
  async getTimelineUpdates(ticketId = '') {
    const normalizeEntry = (u, idx = 0) => ({
      id: u.id || `tl_${idx}`,
      ticketId: String(u.ticketId || u.ticket_id || '').replace(/^#/, ''),
      title: u.title || u.action || 'Ticket Update',
      action: u.action || u.title || 'Ticket Update',
      detail: u.detail || u.description || '',
      description: u.description || u.detail || '',
      time: u.time || 'Just now',
      type: u.type || 'status',
      icon: u.icon || (u.type === 'resolved' ? 'check' : u.type === 'dispatch' ? 'truck' : 'camera')
    });
    try {
      const url = ticketId ? `/api/timeline?ticketId=${encodeURIComponent(ticketId)}` : '/api/timeline';
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        const normalized = Array.isArray(data) ? data.map(normalizeEntry) : [];
        if (!ticketId) saveStoredTimelineUpdates(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('API get timeline fallback:', err);
    }
    return getStoredTimelineUpdates().map(normalizeEntry);
  },

  // 7. Auth: Login (Enforces Email Verification & Role-Based Profile)
  async login(email, password) {
    // Also sign in on client-side Supabase instance if configured
    if (supabase && activeCredentials.isRealCloud) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data?.session?.access_token) {
          saveStoredToken(data.session.access_token);
        }
      } catch (e) {
        // Handled by backend API
      }
    }

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        const authErr = new Error(data.error || 'Failed to authenticate');
        authErr.isApiAuthError = true;
        authErr.notVerified = data.notVerified;
        authErr.requiresAdminVerification = data.requiresAdminVerification;
        authErr.verificationStatus = data.verificationStatus;
        authErr.reason = data.reason;
        throw authErr;
      }
      if (data.token) {
        saveStoredToken(data.token);
      }
      saveStoredUser(data.user);
      return data.user;
    } catch (err) {
      if (err.isApiAuthError) {
        throw err;
      }
      if (email.includes('rajesh') || email.includes('.gov.in')) {
        saveStoredUser(DEFAULT_OFFICER_USER);
        return DEFAULT_OFFICER_USER;
      }
      saveStoredUser(DEFAULT_CITIZEN_USER);
      return DEFAULT_CITIZEN_USER;
    }
  },

  // 8. Auth: Register
  async register(formData) {
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        const regErr = new Error(data.error || 'Failed to register');
        regErr.isApiAuthError = true;
        throw regErr;
      }
      return data.user;
    } catch (err) {
      if (err.isApiAuthError) {
        throw err;
      }
      const isOfficer = formData.role === 'officer';
      return {
        id: isOfficer ? `officer_${Date.now()}` : `usr_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '+91 98000 00000',
        role: formData.role || 'citizen',
        city: formData.city || 'Indore, Madhya Pradesh',
        ward: 'Ward 18, Zone 4',
        citizenId: isOfficer ? undefined : `#IND-${Math.floor(1000 + Math.random() * 9000)}`,
        department: isOfficer ? (formData.department || 'Roads & Infrastructure') : undefined,
        officerId: isOfficer ? (formData.officerId || 'IMC-ENG-0842') : undefined,
        initials: (formData.name || 'User')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        isVerified: false,
        adminVerified: !isOfficer,
        verificationStatus: isOfficer ? 'Pending' : 'Verified'
      };
    }
  },

  // 8b. Auth: Verify Email
  async verifyEmail(email, otp = '') {
    try {
      const res = await apiFetch('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify email');
      }
      return data.user;
    } catch (err) {
      console.warn('Verify email API fallback:', err);
      return { email, isVerified: true };
    }
  },

  // 8c. Auth: Resend Verification Email
  async resendVerification(email) {
    try {
      const res = await apiFetch('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { message: `Verification email resent to ${email}` };
    }
  },

  // 8d. CIRRS Super Admin Authentication & Management APIs
  async adminLogin(email, password) {
    const res = await apiFetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid Super Admin credentials');
    }
    if (data.token) {
      saveStoredToken(data.token);
    }
    saveStoredUser(data.user);
    return data.user;
  },

  async adminRegister(payload) {
    const res = await apiFetch('/api/admin/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to provision Super Admin account');
    }
    if (data.token) {
      saveStoredToken(data.token);
    }
    saveStoredUser(data.user);
    return data.user;
  },

  async getAdminOverview() {
    try {
      const res = await apiFetch('/api/admin/overview');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // ignore
    }
    return null;
  },

  async verifyMunicipalOfficer(officerId, payload) {
    const res = await apiFetch(`/api/admin/officers/${encodeURIComponent(officerId)}/verify`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update officer verification state');
    }
    return data;
  },

  async addMunicipality(munData) {
    try {
      const res = await apiFetch('/api/admin/municipalities', {
        method: 'POST',
        body: JSON.stringify(munData)
      });
      if (res.ok) {
        const data = await res.json();
        return data.municipality;
      }
    } catch (e) {
      // fallback
    }
    return {
      id: `MUN-00${Math.floor(8 + Math.random() * 90)}`,
      name: munData.name,
      subLabel: munData.subLabel || 'Municipal Corporation',
      state: munData.state || 'Madhya Pradesh',
      zone: 'Zone 1 · Central',
      registeredCitizens: 0,
      totalComplaints: 0,
      resolvedComplaints: 0,
      pendingComplaints: 0,
      resolutionRate: 100,
      avgResolutionDays: 2.0,
      slaTarget: 90.0,
      slaStatus: 'Good',
      verification: 'Verified',
      status: 'Active',
      ...munData
    };
  },

  async updateCitizenStatus(citizenId, patch) {
    try {
      const res = await apiFetch(`/api/admin/citizens/${encodeURIComponent(citizenId)}/status`, {
        method: 'POST',
        body: JSON.stringify(patch)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // fallback
    }
    return patch;
  },

  async updateAdminComplaintDossier(complaintId, patch) {
    try {
      const clean = String(complaintId || '').replace(/^#/, '');
      const res = await apiFetch(`/api/admin/complaints/${encodeURIComponent(clean)}/dossier`, {
        method: 'PATCH',
        body: JSON.stringify(patch)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // fallback
    }
    return patch;
  },

  // 9. Profile, Password & Notification Preferences Management
  async updateProfile(updates) {
    const currentUser = getStoredUser() || {};
    const payload = {
      email: currentUser.email,
      ...updates
    };
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const merged = { ...currentUser, ...(data.user || updates) };
        saveStoredUser(merged);
        return merged;
      }
    } catch (err) {
      console.warn('API update profile fallback:', err);
    }
    const merged = { ...currentUser, ...updates };
    saveStoredUser(merged);
    return merged;
  },

  async updatePassword(currentPassword, newPassword) {
    const currentUser = getStoredUser() || {};
    const res = await apiFetch('/api/profile/password', {
      method: 'PUT',
      body: JSON.stringify({
        email: currentUser.email,
        currentPassword,
        newPassword
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update password');
    }
    return data;
  },

  async updatePreferences(prefs) {
    const currentUser = getStoredUser() || {};
    try {
      const res = await apiFetch('/api/profile/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          email: currentUser.email,
          ...prefs
        })
      });
      if (res.ok) {
        const data = await res.json();
        const merged = {
          ...currentUser,
          notificationPrefs: data.notificationPrefs || prefs.notificationPrefs || currentUser.notificationPrefs,
          appPrefs: data.appPrefs || prefs.appPrefs || currentUser.appPrefs
        };
        saveStoredUser(merged);
        return data;
      }
    } catch (err) {
      console.warn('API update preferences fallback:', err);
    }
    return prefs;
  },

  // User Session Management
  getCurrentUser() {
    return getStoredUser();
  },

  setCurrentUser(user) {
    saveStoredUser(user);
    return user;
  },

  logout() {
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    if (supabase) {
      try {
        supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    saveStoredToken(null);
    saveStoredUser(null);
  },

  switchToCitizen() {
    saveStoredUser(DEFAULT_CITIZEN_USER);
    return DEFAULT_CITIZEN_USER;
  },

  switchToOfficer() {
    saveStoredUser(DEFAULT_OFFICER_USER);
    return DEFAULT_OFFICER_USER;
  }
};

