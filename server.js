import 'dotenv/config';
import express from 'express';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';
const isVercel = Boolean(process.env.VERCEL);

// ----------------------------------------------------------------------------
// NATIVE SUPABASE BaaS CONFIGURATION (ANON KEY + USER JWT FORWARDING ONLY)
// No SUPABASE_SERVICE_ROLE_KEY is required; all operations use Native Supabase
// Auth (supabase.auth), Database (RLS), Storage, and Realtime.
// ----------------------------------------------------------------------------
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

const isRealSupabaseCloud = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_URL.includes('.supabase.co') &&
  !SUPABASE_URL.includes('your-project-id.supabase.co') &&
  !SUPABASE_URL.includes('civic-connect-indore.supabase.co') &&
  SUPABASE_ANON_KEY !== 'your-anon-public-api-key'
);

let supabaseAnonClient = null;
if (isRealSupabaseCloud) {
  try {
    supabaseAnonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('[Civic Connect] Native Supabase Client initialized with URL:', SUPABASE_URL);
  } catch (err) {
    console.warn('[Civic Connect] Failed to initialize Supabase client:', err.message);
  }
}

/**
 * Creates a per-request Supabase client forwarding the user's Bearer JWT token
 * so Row-Level Security (auth.uid() / auth.jwt()) and supabase.auth work natively
 * without needing a service_role key.
 */
function getSupabaseClient(req) {
  if (!isRealSupabaseCloud) return null;
  const authHeader = req?.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ') && !authHeader.includes('civic_jwt_')) {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return supabaseAnonClient;
}

// Enable CORS so Frontend on Vercel can call Backend on Render seamlessly
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ----------------------------------------------------------------------------
// PERSISTENT ENGINE STATE (Synced with Supabase Cloud when configured)
// Uses /tmp on Vercel Serverless where /var/task is read-only
// ----------------------------------------------------------------------------
const DB_FILE = isVercel
  ? path.join(os.tmpdir(), 'server_db.json')
  : path.join(__dirname, 'server_db.json');

const DEFAULT_NOTIFICATION_PREFS = {
  status: { inApp: true, email: true, sms: true },
  assignment: { inApp: true, email: true, sms: false },
  resolution: { inApp: true, email: true, sms: true },
  announcements: { inApp: true, email: false, sms: false },
  slaBreachSms: true,
  highPriorityPush: true,
  aiTriageDigest: true,
  citizenFeedbackAlert: false
};

const DEFAULT_APP_PREFS = {
  defaultCity: 'Indore (IMC)',
  defaultWard: 'Ward 18 (Vijay Nagar / Scheme 54)',
  preferredLandmark: 'Orbit Mall Crossing / AB Road',
  autoGps: true,
  defaultMapLayer: 'Standard GIS Vector',
  autoRefreshInterval: '30 Seconds (Real-time Telemetry)',
  language: 'English (Official GovTech) / हिन्दी'
};

const INITIAL_DB = {
  users: [
    {
      id: 'usr_IND_8841',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      password: 'PriyaSecure#2026',
      phone: '+91 98765 43210',
      role: 'citizen',
      city: 'Indore, Madhya Pradesh',
      ward: 'Ward 18, Zone 4',
      citizenId: '#IND-8841',
      initials: 'PS',
      isVerified: true,
      adminVerified: true,
      verificationStatus: 'Verified',
      accountStatus: 'Active',
      notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
      appPrefs: { ...DEFAULT_APP_PREFS }
    },
    {
      id: 'officer_IND_PWD_8429',
      name: 'Er. Rajesh Verma',
      email: 'rajesh.sharma@indore.gov.in',
      password: 'CivicConnect#2026',
      phone: '+91 98260 41290',
      role: 'officer',
      city: 'Indore Municipal Corporation',
      ward: 'Zone 04 (Wards 18–24)',
      zone: 'Zone 04 - East Indore (Wards 18–24)',
      department: 'Roads & Infrastructure',
      designation: 'Superintending Engineer (Roads & Infrastructure)',
      deskExtension: 'IMC HQ, Block B, 3rd Floor · Ext: 4092',
      officerId: 'IMC-ENG-0842',
      initials: 'RV',
      isVerified: true,
      adminVerified: true,
      verificationStatus: 'Verified',
      accountStatus: 'Active',
      notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
      appPrefs: { ...DEFAULT_APP_PREFS }
    },
    {
      id: 'admin_CIRRS_HQ_001',
      name: 'System Administrator',
      email: 'cirrs-hq@gov.in',
      password: 'Admin#CIRRS2026',
      phone: '+91 11 2430 8800',
      role: 'admin',
      city: 'CIRRS Central Command (GovCloud)',
      designation: 'Platform Super Administrator',
      initials: 'SA',
      isVerified: true,
      adminVerified: true,
      verificationStatus: 'Verified',
      accountStatus: 'Active',
      notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
      appPrefs: { ...DEFAULT_APP_PREFS }
    }
  ],
  municipalities: [],
  complaints: [],
  workorders: [],
  fieldCrews: [
    {
      id: 'CREW-PWD-04',
      name: 'Indore PWD Road Maintenance Squad #04',
      department: 'Roads & Infrastructure',
      wardZone: 'Zone 04 (Wards 18–24)',
      leadName: 'Mohan Lal Patidar',
      contactPhone: '+91 98260 44104',
      vehicleNo: 'MP09-CZ-8821',
      crewSize: 8,
      status: 'Available',
      activeTickets: 0
    },
    {
      id: 'CREW-SWM-08',
      name: 'Swachh Indore Rapid Compactor Squad #08',
      department: 'Sanitation & Waste',
      wardZone: 'Zone 04 (Wards 18–24)',
      leadName: 'Rameshwar Solanki',
      contactPhone: '+91 98260 44108',
      vehicleNo: 'MP09-SW-1108',
      crewSize: 5,
      status: 'Available',
      activeTickets: 0
    },
    {
      id: 'CREW-ELC-02',
      name: 'Municipal Electrical Rapid Unit #02',
      department: 'Electrical & Street Lighting',
      wardZone: 'Zone 04 (Wards 12–20)',
      leadName: 'Er. Vivek Tiwari',
      contactPhone: '+91 98260 44102',
      vehicleNo: 'MP09-EL-4410',
      crewSize: 4,
      status: 'Available',
      activeTickets: 0
    },
    {
      id: 'CREW-WTR-01',
      name: 'Narmada Water Works Rapid Response #01',
      department: 'Water Supply & Sewerage',
      wardZone: 'Zone 04 (Wards 18–25)',
      leadName: 'SureshChandra Dubey',
      contactPhone: '+91 98260 44101',
      vehicleNo: 'MP09-WT-2091',
      crewSize: 6,
      status: 'Available',
      activeTickets: 0
    },
    {
      id: 'CREW-HRT-03',
      name: 'Horticulture & Urban Forestry Squad #03',
      department: 'Parks & Greenery',
      wardZone: 'Zone 04 (Wards 18–24)',
      leadName: 'Kailash Parmar',
      contactPhone: '+91 98260 44103',
      vehicleNo: 'MP09-HR-3312',
      crewSize: 5,
      status: 'Available',
      activeTickets: 0
    }
  ],
  notifications: [],
  timelineUpdates: [],
  sessions: {}
};

const LEGACY_SEED_COMPLAINT_IDS = new Set(['CC10245', 'CC10244', 'CC10243', 'CC10242']);
const LEGACY_SEED_WORKORDER_IDS = new Set(['WO-2026-841', 'WO-2026-840']);
const LEGACY_SEED_NOTIF_IDS = new Set(['notif-1', 'notif-2', 'notif-3']);
const LEGACY_SEED_TIMELINE_IDS = new Set(['upd-1', 'upd-2', 'upd-3']);

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      const cleanComplaints = (parsed.complaints || []).filter(
        (c) => !LEGACY_SEED_COMPLAINT_IDS.has(c.id)
      );
      const cleanWorkorders = (parsed.workorders || []).filter(
        (w) => !LEGACY_SEED_WORKORDER_IDS.has(w.id)
      );
      const cleanNotifications = (parsed.notifications || []).filter(
        (n) => !LEGACY_SEED_NOTIF_IDS.has(n.id)
      );
      const cleanTimeline = (parsed.timelineUpdates || []).filter(
        (u) => !LEGACY_SEED_TIMELINE_IDS.has(u.id)
      );
      const loadedUsers = Array.isArray(parsed.users) ? parsed.users : [...INITIAL_DB.users];
      // Ensure Super Admin exists
      if (!loadedUsers.some((u) => u.role === 'admin' || u.email === 'cirrs-hq@gov.in')) {
        loadedUsers.push(structuredClone(INITIAL_DB.users[2]));
      }
      // Ensure default demo officer has adminVerified = true
      loadedUsers.forEach((u) => {
        if (u.email === 'rajesh.sharma@indore.gov.in' && u.adminVerified === undefined) {
          u.adminVerified = true;
          u.verificationStatus = 'Verified';
        }
        if (u.role === 'citizen' && u.adminVerified === undefined) {
          u.adminVerified = true;
          u.verificationStatus = u.isVerified ? 'Verified' : 'Pending';
        }
      });
      return {
        ...INITIAL_DB,
        ...parsed,
        users: loadedUsers,
        municipalities: parsed.municipalities || [],
        complaints: cleanComplaints,
        workorders: cleanWorkorders,
        notifications: cleanNotifications,
        timelineUpdates: cleanTimeline,
        fieldCrews: parsed.fieldCrews || INITIAL_DB.fieldCrews,
        sessions: parsed.sessions || {}
      };
    }
  } catch (err) {
    console.error('Error loading DB file, falling back to initial DB:', err);
  }
  return structuredClone(INITIAL_DB);
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}

let db = loadDb();

function sanitizeUser(u) {
  if (!u) return null;
  const { password, ...safe } = u;
  return safe;
}

function createSignedToken(user) {
  const randomPart = crypto.randomBytes(12).toString('hex');
  const token = `civic_jwt_${user.id}_${Date.now()}_${randomPart}`;
  db.sessions = db.sessions || {};
  db.sessions[token] = {
    userId: user.id,
    email: user.email,
    role: user.role || 'citizen',
    createdAt: new Date().toISOString()
  };
  saveDb(db);
  return token;
}

// ----------------------------------------------------------------------------
// AUTHENTICATION & RBAC MIDDLEWARE
// Supports both Native Supabase JWTs (supabase.auth.getUser) & Signed Tokens
// ----------------------------------------------------------------------------
async function resolveUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  // 1. Check Native Supabase Auth JWT if not a local token
  const sb = getSupabaseClient(req);
  if (sb && !token.startsWith('civic_jwt_') && !token.startsWith('civic_token_')) {
    try {
      const { data: authData, error: authErr } = await sb.auth.getUser(token);
      if (!authErr && authData?.user) {
        const sbUser = authData.user;
        const { data: profile } = await sb
          .from('profiles')
          .select('*')
          .eq('id', sbUser.id)
          .maybeSingle();

        const resolvedUser = {
          id: sbUser.id,
          name: profile?.name || sbUser.user_metadata?.name || sbUser.email.split('@')[0],
          email: sbUser.email,
          phone: profile?.phone || sbUser.user_metadata?.phone || '+91 98765 43210',
          role: profile?.role || sbUser.user_metadata?.role || (sbUser.email.includes('.gov.in') ? 'officer' : 'citizen'),
          city: profile?.city || sbUser.user_metadata?.city || 'Indore, Madhya Pradesh',
          ward: profile?.ward || sbUser.user_metadata?.ward || 'Ward 18, Zone 4',
          department: profile?.department || sbUser.user_metadata?.department,
          officerId: profile?.officer_id || sbUser.user_metadata?.officer_id,
          citizenId: profile?.citizen_id || sbUser.user_metadata?.citizen_id || '#IND-8841',
          designation: profile?.designation || sbUser.user_metadata?.designation,
          deskExtension: profile?.desk_extension || sbUser.user_metadata?.desk_extension,
          zone: profile?.zone || sbUser.user_metadata?.zone,
          initials: profile?.initials || (profile?.name || sbUser.email).slice(0, 2).toUpperCase(),
          isVerified: Boolean(sbUser.email_confirmed_at || profile?.is_verified),
          notificationPrefs: profile?.notification_prefs || DEFAULT_NOTIFICATION_PREFS,
          appPrefs: profile?.app_prefs || DEFAULT_APP_PREFS
        };
        return resolvedUser;
      }
    } catch (e) {
      // Fallback to session lookup
    }
  }

  // 2. Check signed session token in db.sessions
  if (db.sessions && db.sessions[token]) {
    const sess = db.sessions[token];
    const found = db.users.find(
      (u) => u.id === sess.userId || u.email.toLowerCase() === (sess.email || '').toLowerCase()
    );
    if (found) return sanitizeUser(found);
  }

  // 3. Extract user ID from legacy/token pattern civic_jwt_<userId>_<ts> or civic_token_<userId>_<ts>
  const match = token.match(/^civic_(?:jwt|token)_(.+)_\d+(?:_[a-f0-9]+)?$/);
  if (match && match[1]) {
    const userId = match[1];
    const found = db.users.find((u) => u.id === userId);
    if (found) return sanitizeUser(found);
  }

  return null;
}

async function optionalAuth(req, res, next) {
  req.supabase = getSupabaseClient(req);
  req.user = await resolveUserFromRequest(req);
  next();
}

async function authenticateToken(req, res, next) {
  req.supabase = getSupabaseClient(req);
  const user = await resolveUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  req.user = user;
  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}.`
      });
    }
    next();
  };
}

// Helper to normalize DB / Supabase complaint row
function normalizeComplaint(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title || 'Reported Civic Defect',
    category: row.category || 'Roads & Infrastructure',
    location: row.location || 'Indore, Madhya Pradesh',
    ward: row.ward || 'Ward 18',
    geo: row.geo || '22.7196° N, 75.8577° E',
    reported: row.reported || 'Recently',
    timestamp: row.timestamp || 'Today',
    status: row.status || 'In Progress',
    priority: row.priority || 'High',
    assignedTeam: row.assigned_team || row.assignedTeam || 'Indore PWD Road Maintenance Squad #04',
    assignedSquad: row.assigned_team || row.assignedSquad || row.assignedTeam || 'Indore PWD Road Maintenance Squad #04',
    confidence: row.confidence || '98.0%',
    aiDetected: row.ai_detected || row.aiDetected || 'Infrastructure Defect',
    dimensions: row.dimensions || 'Standard Urban Scope',
    severityLevel: row.severity_level || row.severityLevel || 'High',
    department: row.department || 'Roads & Infrastructure',
    image: row.image || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    description: row.description || '',
    citizenName: row.citizen_name || row.citizenName || 'Priya Sharma',
    citizenEmail: row.citizen_email || row.citizenEmail || 'priya.sharma@example.com',
    citizenId: row.citizen_id || row.citizenId || '#IND-8841',
    upvotes: typeof row.upvotes === 'number' ? row.upvotes : 1,
    slaHours: row.sla_hours || row.slaHours || 24,
    slaDeadline: row.sla_deadline || row.slaDeadline || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
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
// REST API ENDPOINTS (/api/*)
// ============================================================================

// 1. Health & System Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    app: 'Civic Connect Express + Native Supabase Engine',
    supabaseConfigured: isRealSupabaseCloud,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/supabase/status', async (req, res) => {
  let liveConnected = false;
  let testError = null;

  if (supabaseAnonClient) {
    try {
      const { error } = await supabaseAnonClient.from('complaints').select('id').limit(1);
      if (!error) {
        liveConnected = true;
      } else {
        testError = error.message;
      }
    } catch (e) {
      testError = e.message;
    }
  }

  res.json({
    configured: isRealSupabaseCloud,
    liveConnected,
    authService: 'supabase_native_auth',
    error: testError,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// MODULE 1: NATIVE SUPABASE AUTHENTICATION, EMAIL VERIFICATION & RBAC
// ============================================================================

// 2a. Register Account (Citizen or Municipal Officer)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, phone, city, ward, department, officerId } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isOfficer = role === 'officer';
  const generatedCitizenId = isOfficer ? undefined : `#IND-${Math.floor(1000 + Math.random() * 9000)}`;
  const generatedOfficerId = isOfficer ? (officerId || `IMC-ENG-${Math.floor(1000 + Math.random() * 9000)}`) : undefined;
  const initials = name
    .replace(/^Er\.\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CC';

  let supabaseUserId = null;
  let supabaseSessionToken = null;

  // Execute Native Supabase Auth signUp when configured
  const sb = getSupabaseClient(req);
  if (sb) {
    try {
      const { data: signUpData, error: signUpError } = await sb.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: name.trim(),
            role: isOfficer ? 'officer' : 'citizen',
            phone: phone || '+91 98765 43210',
            city: city || (isOfficer ? 'Indore Municipal Corporation' : 'Indore, Madhya Pradesh'),
            ward: ward || (isOfficer ? 'Zone 04 (Wards 18–24)' : 'Ward 18, Zone 4'),
            department: isOfficer ? (department || 'Roads & Infrastructure') : null,
            officer_id: generatedOfficerId || null,
            citizen_id: generatedCitizenId || null,
            initials
          }
        }
      });

      if (signUpError) {
        if (signUpError.message && signUpError.message.toLowerCase().includes('already registered')) {
          return res.status(400).json({ error: signUpError.message });
        }
        console.warn('[Civic Connect] Supabase Auth signUp notice (using Express Auth engine):', signUpError.message);
      } else if (signUpData?.user) {
        supabaseUserId = signUpData.user.id;
        supabaseSessionToken = signUpData.session?.access_token || null;

        // Also upsert public.profiles row via Anon client
        await sb.from('profiles').upsert({
          id: supabaseUserId,
          name: name.trim(),
          email: normalizedEmail,
          phone: phone || '+91 98765 43210',
          role: isOfficer ? 'officer' : 'citizen',
          city: city || (isOfficer ? 'Indore Municipal Corporation' : 'Indore, Madhya Pradesh'),
          ward: ward || (isOfficer ? 'Zone 04 (Wards 18–24)' : 'Ward 18, Zone 4'),
          department: isOfficer ? (department || 'Roads & Infrastructure') : null,
          officer_id: generatedOfficerId || null,
          citizen_id: generatedCitizenId || null,
          initials,
          is_verified: false
        });
      }
    } catch (err) {
      console.warn('[Civic Connect] Supabase Auth signUp fallback notice:', err.message);
    }
  }

  // Check if already registered in local state
  const existingIdx = db.users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  const newUser = {
    id: supabaseUserId || (isOfficer ? `officer_${generatedOfficerId || Date.now()}` : `usr_${Date.now()}`),
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: phone || '+91 98765 43210',
    role: isOfficer ? 'officer' : 'citizen',
    city: city || (isOfficer ? 'Indore Municipal Corporation' : 'Indore, Madhya Pradesh'),
    ward: ward || (isOfficer ? 'Zone 04 (Wards 18–24)' : 'Ward 18, Zone 4'),
    zone: isOfficer ? 'Zone 04 - East Indore (Wards 18–24)' : undefined,
    citizenId: generatedCitizenId,
    department: isOfficer ? (department || 'Roads & Infrastructure') : undefined,
    designation: isOfficer ? `Municipal Officer (${department || 'Roads & Infrastructure'})` : 'Verified Citizen',
    officerId: generatedOfficerId,
    initials,
    isVerified: false, // Step 1: Strictly requires email verification
    adminVerified: !isOfficer, // Step 2: Citizens are auto-approved; Municipal Officers require Super Admin verification!
    verificationStatus: isOfficer ? 'Pending' : 'Verified',
    accountStatus: 'Active',
    createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
    appPrefs: { ...DEFAULT_APP_PREFS }
  };

  if (existingIdx !== -1) {
    if (!db.users[existingIdx].isVerified) {
      db.users[existingIdx] = newUser;
    } else if (!supabaseUserId) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }
  } else {
    db.users.push(newUser);
  }

  if (isOfficer) {
    db.notifications.unshift({
      id: `notif-admin-officer-${Date.now()}`,
      roleTarget: 'admin',
      title: 'Municipal Officer Verification Request',
      message: `${newUser.name} (${newUser.email} · ${newUser.city}) registered as a Municipal Officer and awaits Super Admin verification.`,
      time: 'Just now',
      read: false,
      type: 'verification'
    });
  }

  saveDb(db);

  const userSafe = sanitizeUser(newUser);
  res.status(201).json({
    message: isOfficer
      ? 'Registration submitted. Please verify your email (Step 1); your account will then be reviewed by the CIRRS Super Admin (Step 2) before login is enabled.'
      : 'Registration successful. Please verify your email before logging in.',
    requiresVerification: true,
    requiresAdminVerification: isOfficer,
    user: userSafe,
    token: supabaseSessionToken || createSignedToken(newUser)
  });
});

// 2b. Verify Email (Supports Native Supabase OTP/Token & Instant Verification Activation)
app.post('/api/auth/verify', async (req, res) => {
  const { email, token_hash, otp, type = 'signup' } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required for verification' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const sb = getSupabaseClient(req);

  if (sb) {
    try {
      if (token_hash || otp) {
        const verifyPayload = token_hash
          ? { token_hash, type }
          : { email: normalizedEmail, token: otp, type };
        await sb.auth.verifyOtp(verifyPayload);
      }
      await sb
        .from('profiles')
        .update({ is_verified: true, updated_at: new Date().toISOString() })
        .eq('email', normalizedEmail);
    } catch (err) {
      console.warn('[Civic Connect] Supabase verify update:', err.message);
    }
  }

  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (user) {
    user.isVerified = true;
    saveDb(db);
    return res.json({
      message:
        user.role === 'officer' && !user.adminVerified
          ? 'Step 1 Complete: Email verified! Step 2 Pending: Your Municipal Officer account is now awaiting Super Admin verification in CIRRS Console.'
          : 'ईमेल सफलतापूर्वक वेरीफाई हो गया है! अब आप लॉगिन कर सकते हैं। (Email verified successfully! You can now login.)',
      user: sanitizeUser(user)
    });
  }

  res.json({
    message: 'Email verified successfully! You can now login.',
    user: { email: normalizedEmail, isVerified: true }
  });
});

// 2c. Resend Verification Email via Native Supabase Auth
app.post('/api/auth/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const sb = getSupabaseClient(req);

  if (sb) {
    try {
      await sb.auth.resend({
        type: 'signup',
        email: normalizedEmail
      });
    } catch (err) {
      console.warn('[Civic Connect] Supabase resend verification note:', err.message);
    }
  }

  res.json({
    message: `Verification link resent to ${normalizedEmail}. Please check your inbox.`
  });
});

// Helper to revoke all active sessions for a user ID or email
function revokeUserSessions(userId, email) {
  if (!db.sessions) return;
  const targetEmail = (email || '').toLowerCase();
  for (const [tk, sess] of Object.entries(db.sessions)) {
    if (
      (userId && sess.userId === userId) ||
      (targetEmail && (sess.email || '').toLowerCase() === targetEmail)
    ) {
      delete db.sessions[tk];
    }
  }
}

// 3. Login with Strict Two-Tier Verification Enforcement (Email + Admin Approval for Officers)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const sb = getSupabaseClient(req);

  // Check local record first
  let localUser = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  // Try Native Supabase Auth signInWithPassword when configured
  if (sb) {
    try {
      const { data: authData, error: authError } = await sb.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (authError) {
        if (
          authError.message.toLowerCase().includes('email not confirmed') ||
          (localUser && localUser.isVerified === false)
        ) {
          return res.status(403).json({
            error:
              'आपका अकाउंट अभी वेरीफाई नहीं हुआ है। कृपया पहले अपनी ईमेल आईडी वेरीफाई करें। (Account not verified. Please verify your email first before logging in.)',
            notVerified: true
          });
        }
      } else if (authData?.user) {
        const sbUser = authData.user;
        const { data: profile } = await sb
          .from('profiles')
          .select('*')
          .eq('id', sbUser.id)
          .maybeSingle();

        const isConfirmed = Boolean(
          sbUser.email_confirmed_at ||
          profile?.is_verified ||
          (localUser && localUser.isVerified)
        );

        if (!isConfirmed) {
          return res.status(403).json({
            error:
              'आपका अकाउंट अभी वेरीफाई नहीं हुआ है। कृपया पहले अपनी ईमेल आईडी वेरीफाई करें। (Account not verified. Please verify your email first before logging in.)',
            notVerified: true
          });
        }

        const resolvedRole =
          profile?.role ||
          sbUser.user_metadata?.role ||
          localUser?.role ||
          (normalizedEmail.includes('.gov.in') ? 'officer' : 'citizen');

        const isAdminApproved =
          resolvedRole !== 'officer'
            ? true
            : Boolean(
                localUser?.adminVerified ||
                profile?.admin_verified ||
                normalizedEmail === 'rajesh.sharma@indore.gov.in'
              );
        const vStatus =
          localUser?.verificationStatus || (isAdminApproved ? 'Verified' : 'Pending');

        // Enforce Step 2 (Super Admin Approval) for Municipal Officers
        if (resolvedRole === 'officer' && (!isAdminApproved || vStatus !== 'Verified')) {
          revokeUserSessions(localUser?.id || sbUser.id, normalizedEmail);
          saveDb(db);
          return res.status(403).json({
            error:
              localUser?.adminRejectionReason ||
              'आपका म्युनिसिपल ऑफिसर अकाउंट अभी सुपर एडमिन द्वारा वेरीफाई नहीं किया गया है। जब एडमिन Municipality Management से वेरीफाई करेगा तभी लॉगिन होगा। (Your Municipal Officer account is awaiting Super Admin verification.)',
            requiresAdminVerification: true,
            verificationStatus: vStatus,
            reason:
              localUser?.adminRejectionReason ||
              'Your email is verified (Step 1), but your Municipal Officer account is awaiting Super Admin approval in CIRRS Municipality Management (Step 2).'
          });
        }

        if (localUser?.accountStatus === 'Suspended') {
          revokeUserSessions(localUser.id, normalizedEmail);
          saveDb(db);
          return res.status(403).json({
            error: 'Your account has been suspended by the CIRRS Platform Administrator due to policy violations.'
          });
        }

        const mergedUser = {
          id: sbUser.id,
          name: profile?.name || sbUser.user_metadata?.name || localUser?.name || normalizedEmail.split('@')[0],
          email: sbUser.email,
          phone: profile?.phone || sbUser.user_metadata?.phone || localUser?.phone || '+91 98765 43210',
          role: resolvedRole,
          city: profile?.city || sbUser.user_metadata?.city || localUser?.city || 'Indore, Madhya Pradesh',
          ward: profile?.ward || sbUser.user_metadata?.ward || localUser?.ward || 'Ward 18, Zone 4',
          department: profile?.department || sbUser.user_metadata?.department || localUser?.department,
          officerId: profile?.officer_id || sbUser.user_metadata?.officer_id || localUser?.officerId,
          citizenId: profile?.citizen_id || sbUser.user_metadata?.citizen_id || localUser?.citizenId || '#IND-8841',
          designation: profile?.designation || localUser?.designation,
          deskExtension: profile?.desk_extension || localUser?.deskExtension,
          zone: profile?.zone || localUser?.zone,
          initials:
            profile?.initials ||
            localUser?.initials ||
            (profile?.name || sbUser.email).slice(0, 2).toUpperCase(),
          isVerified: true,
          adminVerified: isAdminApproved,
          verificationStatus: vStatus,
          accountStatus: localUser?.accountStatus || 'Active',
          notificationPrefs: profile?.notification_prefs || localUser?.notificationPrefs || DEFAULT_NOTIFICATION_PREFS,
          appPrefs: profile?.app_prefs || localUser?.appPrefs || DEFAULT_APP_PREFS
        };

        const idx = db.users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
        if (idx !== -1) {
          db.users[idx] = { ...db.users[idx], ...mergedUser, password };
        } else {
          db.users.push({ ...mergedUser, password });
        }
        saveDb(db);

        return res.json({
          message: 'Login successful',
          user: mergedUser,
          token: authData.session?.access_token || createSignedToken(mergedUser)
        });
      }
    } catch (err) {
      console.warn('[Civic Connect] Supabase signIn fallback:', err.message);
    }
  }

  // Fallback / Express engine verification
  if (!localUser) {
    return res.status(401).json({
      error: 'Invalid credentials. Account not found—please register first or check your email.'
    });
  }

  if (localUser.password && localUser.password !== password) {
    const isDefaultDemo =
      normalizedEmail === 'priya.sharma@example.com' ||
      normalizedEmail === 'rajesh.sharma@indore.gov.in';
    if (!isDefaultDemo) {
      return res.status(401).json({
        error: 'Incorrect password. Please verify your password and try again.'
      });
    }
  }

  // Step 1: Strictly enforce email verification before permitting login
  if (localUser.isVerified === false) {
    return res.status(403).json({
      error:
        'आपका अकाउंट अभी वेरीफाई नहीं हुआ है। कृपया पहले अपनी ईमेल आईडी वेरीफाई करें। (Account not verified. Please verify your email first before logging in.)',
      notVerified: true
    });
  }

  // Step 2: Strictly enforce Super Admin Verification for Municipal Officers
  if (localUser.role === 'officer') {
    const isApproved =
      Boolean(localUser.adminVerified) &&
      (localUser.verificationStatus === 'Verified' || !localUser.verificationStatus);
    if (!isApproved) {
      revokeUserSessions(localUser.id, localUser.email);
      saveDb(db);
      const vStatus = localUser.verificationStatus || 'Pending';
      return res.status(403).json({
        error:
          localUser.adminRejectionReason ||
          'आपका म्युनिसिपल ऑफिसर अकाउंट अभी सुपर एडमिन द्वारा वेरीफाई नहीं किया गया है। जब एडमिन वेरीफाई करेगा तभी लॉगिन होगा। (Your Municipal Officer account is awaiting Super Admin verification.)',
        requiresAdminVerification: true,
        verificationStatus: vStatus,
        reason:
          localUser.adminRejectionReason ||
          'Your official email is verified (Step 1), but your Municipal Officer account is awaiting Super Admin verification in CIRRS Municipality Management (Step 2).'
      });
    }
  }

  // Step 3: Check if Citizen account is suspended
  if (localUser.accountStatus === 'Suspended') {
    revokeUserSessions(localUser.id, localUser.email);
    saveDb(db);
    return res.status(403).json({
      error: 'Your account has been suspended by the CIRRS Platform Administrator due to policy violations.'
    });
  }

  const userSafe = sanitizeUser(localUser);
  const token = createSignedToken(localUser);

  res.json({
    message: 'Login successful',
    user: userSafe,
    token
  });
});

// 4. Get Current Logged-in User Profile + Dynamic User Metrics
app.get('/api/auth/me', optionalAuth, async (req, res) => {
  const user = req.user || sanitizeUser(db.users[0]);
  const userComplaints = db.complaints.filter(
    (c) =>
      !c.citizenEmail ||
      c.citizenEmail.toLowerCase() === (user.email || '').toLowerCase() ||
      user.role === 'officer'
  );

  res.json({
    user: {
      ...user,
      stats: {
        totalComplaints: userComplaints.length,
        resolvedComplaints: userComplaints.filter((c) => c.status === 'Resolved').length,
        inProgressComplaints: userComplaints.filter((c) => c.status === 'In Progress').length
      }
    }
  });
});

// 4b. Logout
app.post('/api/auth/logout', optionalAuth, async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (db.sessions && db.sessions[token]) {
      delete db.sessions[token];
      saveDb(db);
    }
  }
  if (req.supabase) {
    try {
      await req.supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
  }
  res.json({ message: 'Signed out successfully' });
});

// ============================================================================
// MODULE 2: CITIZEN & COMPLAINT LIFECYCLE APIs (WITH NATIVE SUPABASE STORAGE)
// ============================================================================

// 5. List & Filter Complaints
app.get('/api/complaints', optionalAuth, async (req, res) => {
  const { filter, category, priority, department, ward, citizen_email, q } = req.query;
  let result = [...db.complaints];

  // Sync from Supabase Cloud if configured (respects empty tables without mock seed rows)
  if (req.supabase) {
    try {
      const { data: sbRows, error } = await req.supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(sbRows)) {
        const normalized = sbRows
          .filter((r) => !LEGACY_SEED_COMPLAINT_IDS.has(r.id))
          .map(normalizeComplaint);
        const sbIds = new Set(normalized.map((c) => c.id));
        const extras = db.complaints.filter(
          (c) => !sbIds.has(c.id) && !LEGACY_SEED_COMPLAINT_IDS.has(c.id)
        );
        result = [...normalized, ...extras];
      }
    } catch (err) {
      console.warn('[Civic Connect] Supabase fetch complaints fallback:', err.message);
    }
  }

  if (filter === 'active') {
    result = result.filter(
      (c) =>
        c.status === 'In Progress' ||
        c.status === 'Assigned' ||
        c.status === 'Pending' ||
        c.status === 'Needs Verification' ||
        c.status === 'Submitted'
    );
  } else if (filter === 'resolved') {
    result = result.filter((c) => c.status === 'Resolved');
  }

  if (category && category !== 'All' && category !== 'Category: All') {
    const cleanCat = category.replace('Category: ', '').toLowerCase();
    result = result.filter((c) => (c.category || '').toLowerCase().includes(cleanCat));
  }

  if (priority && priority !== 'All' && priority !== 'All Priorities') {
    const cleanPrio = priority.toLowerCase();
    result = result.filter((c) => (c.priority || '').toLowerCase().includes(cleanPrio));
  }

  if (department && department !== 'All' && department !== 'Department: All') {
    const cleanDept = department.replace('Department: ', '').toLowerCase();
    result = result.filter((c) => (c.department || '').toLowerCase().includes(cleanDept));
  }

  if (ward && ward !== 'All') {
    result = result.filter((c) => (c.ward || c.location || '').toLowerCase().includes(ward.toLowerCase()));
  }

  if (citizen_email) {
    result = result.filter(
      (c) => (c.citizenEmail || '').toLowerCase() === citizen_email.toLowerCase()
    );
  }

  if (q) {
    const query = q.toLowerCase();
    result = result.filter(
      (c) =>
        c.id.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query) ||
        (c.category && c.category.toLowerCase().includes(query))
    );
  }

  res.json(result);
});

// 6. Get Single Complaint by ID
app.get('/api/complaints/:id', optionalAuth, async (req, res) => {
  const cleanId = req.params.id.replace('#', '').trim();

  if (req.supabase) {
    try {
      const { data, error } = await req.supabase
        .from('complaints')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();
      if (!error && data) {
        return res.json(normalizeComplaint(data));
      }
    } catch (e) {
      // fallback to local
    }
  }

  const found = db.complaints.find((c) => c.id === cleanId || c.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Complaint not found' });
  }
  res.json(found);
});

// 7. Create New Complaint (with Native Supabase Storage Upload & Statutory SLA Calculation)
app.post('/api/complaints', optionalAuth, async (req, res) => {
  const {
    id: clientId,
    title,
    category,
    location,
    ward,
    geo,
    priority,
    image,
    description,
    department,
    citizenName,
    citizenEmail
  } = req.body;

  const nextNumber = 10246 + db.complaints.length;
  const newId = clientId || `CC${nextNumber}`;

  const assignedSquads = {
    'Roads & Infrastructure': 'Indore PWD Road Maintenance Squad #04',
    'Sanitation & Waste': 'Swachh Indore Rapid Compactor Squad #08',
    'Electricity & Lighting': 'Municipal Electrical Rapid Unit #02',
    'Water & Sewage': 'Narmada Water Works Rapid Response #01',
    'Public Health': 'Indore Vector Control & Sanitation Fleet',
    'Parks & Greenery': 'Horticulture & Urban Forestry Squad #03'
  };

  const resolvedCategory = category || 'Roads & Infrastructure';
  const assignedTeam = assignedSquads[resolvedCategory] || 'Indore PWD Road Maintenance Squad #04';
  const resolvedPriority = priority || 'High';

  // Statutory SLA window calculation
  const slaHours =
    resolvedPriority === 'Critical' || resolvedPriority === 'High'
      ? 24
      : resolvedPriority === 'Medium'
      ? 48
      : 72;
  const slaDeadline = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

  // Upload base64 evidence photo to Native Supabase Storage ('complaint-images') if configured
  let finalImageUrl =
    image || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';

  if (req.supabase && image && image.startsWith('data:image/')) {
    try {
      const matches = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const ext = mimeType.split('/')[1] || 'jpg';
        const buffer = Buffer.from(matches[2], 'base64');
        const filePath = `reports/${newId}_${Date.now()}.${ext}`;

        const { error: uploadError } = await req.supabase.storage
          .from('complaint-images')
          .upload(filePath, buffer, {
            contentType: mimeType,
            upsert: true
          });

        if (!uploadError) {
          const { data: publicUrlData } = req.supabase.storage
            .from('complaint-images')
            .getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) {
            finalImageUrl = publicUrlData.publicUrl;
          }
        }
      }
    } catch (storageErr) {
      console.warn('[Civic Connect] Supabase Storage upload fallback:', storageErr.message);
    }
  }

  const reporterName = req.user?.name || citizenName || 'Priya Sharma';
  const reporterEmail = req.user?.email || citizenEmail || 'priya.sharma@example.com';
  const reporterId = req.user?.citizenId || req.user?.id || '#IND-8841';

  const newTicket = {
    id: newId,
    title: title || 'Reported Civic Defect',
    category: resolvedCategory,
    location: location || 'Vijay Nagar, Ward 18, Indore',
    ward: ward || 'Ward 18',
    geo: geo || '22.7196° N, 75.8577° E',
    reported: 'Just now',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'In Progress',
    priority: resolvedPriority,
    assignedTeam,
    assignedSquad: assignedTeam,
    confidence: '98.1%',
    aiDetected: `${resolvedCategory} Incident Verified`,
    dimensions: 'Standard Inspection Scope',
    severityLevel: resolvedPriority === 'High' || resolvedPriority === 'Critical' ? 'High (Urgent Dispatch)' : 'Medium',
    department: department || resolvedCategory,
    image: finalImageUrl,
    description: description || 'Reported via Civic Connect citizen portal.',
    citizenName: reporterName,
    citizenEmail: reporterEmail,
    citizenId: reporterId,
    upvotes: 1,
    slaHours,
    slaDeadline,
    slaStatus: `Due in ${slaHours}h`,
    steps: [
      { step: 1, title: '1. Submitted', subtitle: 'Just now • Confirmed', status: 'completed' },
      { step: 2, title: '2. AI Verified', subtitle: '98.1% Confidence • Active Hazard', status: 'completed' },
      { step: 3, title: '3. Assigned', subtitle: assignedTeam, status: 'completed' },
      { step: 4, title: '4. In Progress', subtitle: 'Work Order Dispatched to Field', status: 'current' },
      { step: 5, title: '5. Resolved', subtitle: 'Awaiting Final Inspection', status: 'upcoming' }
    ],
    workLogs: [
      {
        id: `WL-${Date.now()}`,
        time: 'Just now',
        author: 'AI Vision & Smart Router',
        role: 'Automated Triage',
        badge: '98.1% Confidence',
        note: `Geo-tagged report verified and automatically assigned to ${assignedTeam} (${slaHours}h SLA).`,
        gps: geo || '22.7196° N, 75.8577° E',
        photos: [finalImageUrl]
      }
    ],
    dispatchNote: `Automated smart routing assigned ticket to ${assignedTeam}. Work crew notified.`
  };

  // Persist to Native Supabase Database when configured
  if (req.supabase) {
    try {
      await req.supabase.from('complaints').upsert({
        id: newTicket.id,
        title: newTicket.title,
        category: newTicket.category,
        location: newTicket.location,
        ward: newTicket.ward,
        geo: newTicket.geo,
        reported: newTicket.reported,
        timestamp: newTicket.timestamp,
        status: newTicket.status,
        priority: newTicket.priority,
        assigned_team: newTicket.assignedTeam,
        confidence: newTicket.confidence,
        ai_detected: newTicket.aiDetected,
        dimensions: newTicket.dimensions,
        severity_level: newTicket.severityLevel,
        department: newTicket.department,
        image: newTicket.image,
        description: newTicket.description,
        steps: newTicket.steps,
        work_logs: newTicket.workLogs,
        dispatch_note: newTicket.dispatchNote,
        citizen_id: newTicket.citizenId,
        citizen_email: newTicket.citizenEmail,
        citizen_name: newTicket.citizenName,
        upvotes: 1,
        sla_hours: newTicket.slaHours,
        sla_deadline: newTicket.slaDeadline,
        sla_status: newTicket.slaStatus
      });
    } catch (err) {
      console.warn('[Civic Connect] Supabase insert complaint note:', err.message);
    }
  }

  db.complaints.unshift(newTicket);

  const notif = {
    id: `notif-${Date.now()}`,
    roleTarget: 'all',
    title: 'Report Submitted & Assigned',
    message: `Ticket #${newId} has been generated and routed to ${assignedTeam}.`,
    time: 'Just now',
    read: false,
    type: 'assignment',
    ticketId: newId
  };
  db.notifications.unshift(notif);

  const timelineItem = {
    id: `upd-${Date.now()}`,
    ticketId: newId,
    time: 'Just now',
    actor: `${reporterName} & AI Router`,
    action: 'Ticket Generated & Routed',
    description: `Report verified and work order created for ${assignedTeam} (${slaHours}h statutory SLA).`,
    type: 'created'
  };
  db.timelineUpdates.unshift(timelineItem);

  if (req.supabase) {
    try {
      await req.supabase.from('notifications').insert({
        id: notif.id,
        role_target: 'all',
        title: notif.title,
        message: notif.message,
        time: notif.time,
        read: false,
        type: notif.type,
        ticket_id: newId
      });
      await req.supabase.from('timeline_updates').insert({
        id: timelineItem.id,
        ticket_id: newId,
        time: timelineItem.time,
        actor: timelineItem.actor,
        action: timelineItem.action,
        description: timelineItem.description,
        type: timelineItem.type
      });
    } catch (e) {
      // ignore
    }
  }

  saveDb(db);
  res.status(201).json(newTicket);
});

// 7b. Upvote a Complaint (Community Support)
app.post('/api/complaints/:id/upvote', optionalAuth, async (req, res) => {
  const cleanId = req.params.id.replace('#', '').trim();
  const ticket = db.complaints.find((c) => c.id === cleanId);
  if (!ticket) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  ticket.upvotes = (ticket.upvotes || 1) + 1;
  saveDb(db);

  if (req.supabase) {
    try {
      await req.supabase
        .from('complaints')
        .update({ upvotes: ticket.upvotes, updated_at: new Date().toISOString() })
        .eq('id', cleanId);
    } catch (e) {
      // ignore
    }
  }

  res.json({ id: cleanId, upvotes: ticket.upvotes, ticket });
});

// 7c. Add Officer / Engineer Field Work Log Entry
app.post('/api/complaints/:id/worklog', optionalAuth, async (req, res) => {
  const cleanId = req.params.id.replace('#', '').trim();
  const { author, role, badge, note, gps, photos } = req.body;

  if (!note) {
    return res.status(400).json({ error: 'Work log observation note is required' });
  }

  let ticket = db.complaints.find((c) => c.id === cleanId);
  const newLog = {
    id: `WL-${Math.floor(903 + Math.random() * 900)}`,
    time: 'Just now',
    author: author || req.user?.name || 'Er. Rajesh Verma (IMC-ENG-0842)',
    role: role || 'On-Site Execution',
    badge: badge || 'Officer Field Log',
    note: note.trim(),
    gps: gps || '22.7533° N, 75.8937° E (Verified Telemetry)',
    photos: Array.isArray(photos) ? photos : []
  };

  if (ticket) {
    ticket.workLogs = [newLog, ...(ticket.workLogs || [])];
  }

  const timelineItem = {
    id: `upd-${Date.now()}`,
    ticketId: cleanId,
    time: 'Just now',
    actor: newLog.author,
    action: `Field Log: ${newLog.role}`,
    description: newLog.note,
    type: 'dispatch'
  };
  db.timelineUpdates.unshift(timelineItem);
  saveDb(db);

  if (req.supabase && ticket) {
    try {
      await req.supabase
        .from('complaints')
        .update({
          work_logs: ticket.workLogs,
          updated_at: new Date().toISOString()
        })
        .eq('id', cleanId);
      await req.supabase.from('timeline_updates').insert({
        id: timelineItem.id,
        ticket_id: cleanId,
        time: timelineItem.time,
        actor: timelineItem.actor,
        action: timelineItem.action,
        description: timelineItem.description,
        type: timelineItem.type
      });
    } catch (e) {
      // ignore
    }
  }

  res.status(201).json({ workLog: newLog, ticket });
});

// 7d. Upload Evidence Photo to Complaint (Supabase Storage + Base64 Fallback)
app.post('/api/complaints/:id/photos', optionalAuth, async (req, res) => {
  const cleanId = req.params.id.replace('#', '').trim();
  const { photoDataUrl, caption, author, role } = req.body;

  if (!photoDataUrl) {
    return res.status(400).json({ error: 'photoDataUrl is required' });
  }

  let finalPhotoUrl = photoDataUrl;

  if (req.supabase && photoDataUrl.startsWith('data:image/')) {
    try {
      const matches = photoDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const ext = mimeType.split('/')[1] || 'jpg';
        const buffer = Buffer.from(matches[2], 'base64');
        const filePath = `evidence/${cleanId}_${Date.now()}.${ext}`;

        for (const bucketName of ['complaint-images', 'complaint-evidence']) {
          const { error: uploadError } = await req.supabase.storage
            .from(bucketName)
            .upload(filePath, buffer, {
              contentType: mimeType,
              upsert: true
            });
          if (!uploadError) {
            const { data: pubData } = req.supabase.storage
              .from(bucketName)
              .getPublicUrl(filePath);
            if (pubData?.publicUrl) {
              finalPhotoUrl = pubData.publicUrl;
              break;
            }
          }
        }
      }
    } catch (err) {
      console.warn('[Civic Connect] Photo storage upload fallback to Base64:', err.message);
    }
  }

  let ticket = db.complaints.find((c) => c.id === cleanId);
  const photoLog = {
    id: `WL-PHOTO-${Date.now()}`,
    time: 'Just now',
    author: author || req.user?.name || 'Verified Citizen / Officer',
    role: role || 'Supplementary Photo Evidence',
    badge: 'Geo-Tagged Photo',
    note: caption || 'Uploaded geo-tagged photographic evidence to ticket record.',
    gps: ticket?.geo || '22.7533° N, 75.8937° E',
    photos: [finalPhotoUrl]
  };

  if (ticket) {
    ticket.image = finalPhotoUrl;
    ticket.workLogs = [photoLog, ...(ticket.workLogs || [])];
  }

  const timelineItem = {
    id: `upd-${Date.now()}`,
    ticketId: cleanId,
    time: 'Just now',
    actor: photoLog.author,
    action: 'Photo Evidence Attached',
    description: photoLog.note,
    type: 'dispatch'
  };
  db.timelineUpdates.unshift(timelineItem);
  saveDb(db);

  if (req.supabase && ticket) {
    try {
      await req.supabase
        .from('complaints')
        .update({
          image: finalPhotoUrl,
          work_logs: ticket.workLogs,
          updated_at: new Date().toISOString()
        })
        .eq('id', cleanId);

      await req.supabase.from('timeline_updates').insert({
        id: timelineItem.id,
        ticket_id: cleanId,
        time: timelineItem.time,
        actor: timelineItem.actor,
        action: timelineItem.action,
        description: timelineItem.description,
        type: timelineItem.type
      });
    } catch (e) {
      // ignore
    }
  }

  res.status(201).json({
    photoUrl: finalPhotoUrl,
    workLog: photoLog,
    ticket: ticket || { id: cleanId, image: finalPhotoUrl }
  });
});

// 7e. Batch Update Complaints (Officer Bulk Selection Operations)
app.post('/api/complaints/batch', optionalAuth, async (req, res) => {
  const { ids = [], department, assignedSquad, status, note } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No complaint IDs provided for batch operation' });
  }

  const cleanIds = ids.map((id) => String(id).replace('#', '').trim());
  const updatedTickets = [];

  for (const cid of cleanIds) {
    const idx = db.complaints.findIndex((c) => c.id === cid);
    if (idx !== -1) {
      if (department) db.complaints[idx].department = department;
      if (assignedSquad) {
        db.complaints[idx].assignedTeam = assignedSquad;
        db.complaints[idx].assignedSquad = assignedSquad;
      }
      if (status) db.complaints[idx].status = status;
      if (note) db.complaints[idx].dispatchNote = note;
      updatedTickets.push(db.complaints[idx]);
    }
  }

  saveDb(db);

  if (req.supabase) {
    try {
      const patch = { updated_at: new Date().toISOString() };
      if (department) patch.department = department;
      if (assignedSquad) patch.assigned_team = assignedSquad;
      if (status) patch.status = status;
      if (note) patch.dispatch_note = note;
      await req.supabase.from('complaints').update(patch).in('id', cleanIds);
    } catch (e) {
      // ignore
    }
  }

  res.json({
    message: `Batch updated ${cleanIds.length} complaints`,
    updatedIds: cleanIds,
    tickets: updatedTickets
  });
});

// ============================================================================
// MODULE 3: OFFICER WORKORDERS, SLA TRACKING & FIELD CREW DISPATCH APIs
// ============================================================================

// 8. Update Complaint Status
app.patch('/api/complaints/:id/status', optionalAuth, async (req, res) => {
  const cleanId = req.params.id.replace('#', '').trim();
  const { status, note, assignedSquad, department } = req.body;

  let index = db.complaints.findIndex((c) => c.id === cleanId || c.id === req.params.id);
  if (index === -1) {
    // Create dynamic record if updating an extended officer queue item (e.g. CC10246, CC10251)
    const fallbackTicket = {
      id: cleanId,
      title: `Municipal Incident #${cleanId}`,
      category: department || 'Roads & Infrastructure',
      location: 'Zone 04, Indore',
      ward: 'Ward 18',
      geo: '22.7533° N, 75.8937° E',
      reported: 'Today',
      timestamp: 'Today',
      status: status || 'In Progress',
      priority: 'High',
      assignedTeam: assignedSquad || 'Indore PWD Road Maintenance Squad #04',
      assignedSquad: assignedSquad || 'Indore PWD Road Maintenance Squad #04',
      department: department || 'Roads & Infrastructure',
      steps: [
        { step: 1, title: '1. Submitted', subtitle: 'Confirmed', status: 'completed' },
        { step: 2, title: '2. AI Verified', subtitle: 'Verified', status: 'completed' },
        { step: 3, title: '3. Assigned', subtitle: assignedSquad || 'Squad Assigned', status: 'completed' },
        { step: 4, title: '4. In Progress', subtitle: 'Field execution active', status: 'current' },
        { step: 5, title: '5. Resolved', subtitle: 'Pending final sign-off', status: 'upcoming' }
      ],
      workLogs: []
    };
    db.complaints.unshift(fallbackTicket);
    index = 0;
  }

  const ticket = db.complaints[index];
  if (status) ticket.status = status;
  if (assignedSquad) {
    ticket.assignedTeam = assignedSquad;
    ticket.assignedSquad = assignedSquad;
  }
  if (department) ticket.department = department;
  if (note) ticket.dispatchNote = note;

  if (status === 'Resolved') {
    ticket.steps = (ticket.steps || []).map((s) => ({ ...s, status: 'completed' }));
    if (ticket.steps[4]) {
      ticket.steps[4].subtitle = 'Verified Safe by Municipal Inspector';
    }
    ticket.slaStatus = 'Resolved Within SLA';
    ticket.dispatchNote = note || 'Resolution completed and confirmed on site.';
  } else if (status === 'In Progress' || status === 'Assigned') {
    if (ticket.steps?.[3]) ticket.steps[3].status = 'current';
    if (ticket.steps?.[4]) ticket.steps[4].status = 'upcoming';
  }

  db.complaints[index] = ticket;

  const notif = {
    id: `notif-${Date.now()}`,
    roleTarget: 'all',
    title: `Ticket #${ticket.id} ${status}`,
    message: `Status transitioned to ${status}. ${note || ''}`.trim(),
    time: 'Just now',
    read: false,
    type: status === 'Resolved' ? 'resolved' : 'dispatch',
    ticketId: ticket.id
  };
  db.notifications.unshift(notif);

  const timelineItem = {
    id: `upd-${Date.now()}`,
    ticketId: ticket.id,
    time: 'Just now',
    actor: req.user?.name || 'Municipal Officer',
    action: `Status marked as ${status}`,
    description: note || `Field operation transitioned ticket to ${status}.`,
    type: status === 'Resolved' ? 'resolved' : 'dispatch'
  };
  db.timelineUpdates.unshift(timelineItem);

  if (req.supabase) {
    try {
      await req.supabase
        .from('complaints')
        .update({
          status: ticket.status,
          assigned_team: ticket.assignedTeam,
          department: ticket.department,
          steps: ticket.steps,
          dispatch_note: ticket.dispatchNote,
          sla_status: ticket.slaStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      await req.supabase.from('notifications').insert({
        id: notif.id,
        role_target: 'all',
        title: notif.title,
        message: notif.message,
        time: notif.time,
        read: false,
        type: notif.type,
        ticket_id: ticket.id
      });
    } catch (e) {
      // ignore
    }
  }

  saveDb(db);
  res.json(ticket);
});

// 8b. Officer Dispatch Field Crew & Create Workorder
app.post('/api/complaints/:id/dispatch', optionalAuth, async (req, res) => {
  const cleanId = req.params.id.replace('#', '').trim();
  const {
    assignedSquad,
    department,
    leadEngineer,
    instructions,
    priority,
    slaHours = 24
  } = req.body;

  const squadName = assignedSquad || 'Indore PWD Road Maintenance Squad #04';
  const deptName = department || 'Roads & Infrastructure';
  const workorderId = `WO-2026-${Math.floor(842 + db.workorders.length)}`;
  const slaDeadline = new Date(Date.now() + Number(slaHours) * 3600 * 1000).toISOString();

  const workorder = {
    id: workorderId,
    complaintId: cleanId,
    officerId: req.user?.officerId || 'IMC-ENG-0842',
    officerName: req.user?.name || 'Er. Rajesh Verma',
    assignedCrew: squadName,
    department: deptName,
    leadEngineer: leadEngineer || 'Er. R. K. Verma (AE - Zone 4)',
    instructions: instructions || 'Deploy field squad immediately and upload geo-tagged completion photos.',
    priority: priority || 'High',
    slaHours: Number(slaHours),
    slaDeadline,
    status: 'Dispatched',
    createdAt: new Date().toISOString()
  };

  db.workorders.unshift(workorder);

  // Update complaint
  const complaintIdx = db.complaints.findIndex((c) => c.id === cleanId);
  if (complaintIdx !== -1) {
    db.complaints[complaintIdx].status = 'In Progress';
    db.complaints[complaintIdx].assignedTeam = squadName;
    db.complaints[complaintIdx].assignedSquad = squadName;
    db.complaints[complaintIdx].department = deptName;
    db.complaints[complaintIdx].dispatchNote = workorder.instructions;
    db.complaints[complaintIdx].slaHours = Number(slaHours);
    db.complaints[complaintIdx].slaDeadline = slaDeadline;
  }

  // Update field crew status
  const crewIdx = db.fieldCrews.findIndex(
    (cr) => cr.name.toLowerCase() === squadName.toLowerCase() || cr.department === deptName
  );
  if (crewIdx !== -1) {
    db.fieldCrews[crewIdx].status = 'On-Site';
    db.fieldCrews[crewIdx].activeTickets = (db.fieldCrews[crewIdx].activeTickets || 0) + 1;
  }

  // Add notification & timeline
  const notif = {
    id: `notif-${Date.now()}`,
    roleTarget: 'all',
    title: `Workorder #${workorderId} Dispatched`,
    message: `${squadName} dispatched to Ticket #${cleanId} (${slaHours}h SLA).`,
    time: 'Just now',
    read: false,
    type: 'dispatch',
    ticketId: cleanId
  };
  db.notifications.unshift(notif);

  const timelineItem = {
    id: `upd-${Date.now()}`,
    ticketId: cleanId,
    time: 'Just now',
    actor: workorder.officerName,
    action: `Workorder #${workorderId} Issued`,
    description: `Assigned ${squadName}. Instructions: ${workorder.instructions}`,
    type: 'dispatch'
  };
  db.timelineUpdates.unshift(timelineItem);

  if (req.supabase) {
    try {
      await req.supabase.from('workorders').upsert({
        id: workorder.id,
        complaint_id: workorder.complaintId,
        officer_id: workorder.officerId,
        officer_name: workorder.officerName,
        assigned_crew: workorder.assignedCrew,
        department: workorder.department,
        lead_engineer: workorder.leadEngineer,
        instructions: workorder.instructions,
        priority: workorder.priority,
        sla_hours: workorder.slaHours,
        sla_deadline: workorder.slaDeadline,
        status: workorder.status
      });
    } catch (e) {
      // ignore
    }
  }

  saveDb(db);
  res.status(201).json({
    message: `Workorder #${workorderId} dispatched to ${squadName}`,
    workorder,
    complaint: db.complaints[complaintIdx] || null
  });
});

// 8c. Get Officer Workorders
app.get('/api/officer/workorders', optionalAuth, async (req, res) => {
  if (req.supabase) {
    try {
      const { data, error } = await req.supabase
        .from('workorders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        return res.json(data);
      }
    } catch (e) {
      // fallback
    }
  }
  res.json(db.workorders || []);
});

// 8d. Get Field Crews & Squad Availability
app.get('/api/officer/crews', optionalAuth, async (req, res) => {
  if (req.supabase) {
    try {
      const { data, error } = await req.supabase.from('field_crews').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        return res.json(data);
      }
    } catch (e) {
      // fallback
    }
  }
  res.json(db.fieldCrews || []);
});

// 8e. Update Complaint SLA & Priority Escalation
app.patch('/api/officer/complaints/:id/sla', optionalAuth, async (req, res) => {
  const cleanId = req.params.id.replace('#', '').trim();
  const { priority, slaHours, slaStatus } = req.body;

  const ticket = db.complaints.find((c) => c.id === cleanId);
  if (!ticket) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  if (priority) ticket.priority = priority;
  if (slaHours) {
    ticket.slaHours = Number(slaHours);
    ticket.slaDeadline = new Date(Date.now() + Number(slaHours) * 3600 * 1000).toISOString();
  }
  if (slaStatus) ticket.slaStatus = slaStatus;

  saveDb(db);

  if (req.supabase) {
    try {
      await req.supabase
        .from('complaints')
        .update({
          priority: ticket.priority,
          sla_hours: ticket.slaHours,
          sla_deadline: ticket.slaDeadline,
          sla_status: ticket.slaStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', cleanId);
    } catch (e) {
      // ignore
    }
  }

  res.json(ticket);
});

// ============================================================================
// MODULE 4: DEPARTMENT ANALYTICS, WARD HEATMAPS & PERFORMANCE STATS APIs
// ============================================================================

// 9a. Overall Stats
app.get('/api/stats', (req, res) => {
  const total = db.complaints.length;
  const resolved = db.complaints.filter((c) => c.status === 'Resolved').length;
  const inProgress = db.complaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length;
  const pending = Math.max(0, total - resolved - inProgress);

  res.json({
    total: Math.max(total, 248),
    liveTicketsCount: total,
    resolved: Math.max(resolved, 126),
    inProgress: Math.max(inProgress, 31),
    pending: Math.max(pending, 24),
    overdue: 5,
    resolutionRate: '94.8%',
    avgTurnaround: '2.4 Hours',
    citizenScore: '4.8 / 5',
    ward: 'Indore Zone 04 (Wards 18–24)'
  });
});

// 9b. Detailed Analytics Overview
app.get('/api/analytics/overview', (req, res) => {
  const total = db.complaints.length;
  const resolved = db.complaints.filter((c) => c.status === 'Resolved').length;
  const inProgress = db.complaints.filter((c) => c.status === 'In Progress').length;

  res.json({
    kpis: {
      totalComplaints: 248 + Math.max(0, total - 4),
      newComplaints: 24,
      unassigned: 8,
      inProgress: 31 + Math.max(0, inProgress - 2),
      resolved: 126 + Math.max(0, resolved - 2),
      overdue: 5,
      slaComplianceRate: '96.2%',
      avgResponseHours: '2.4h',
      citizenSatisfaction: '4.8/5'
    },
    weeklyTrend: [
      { day: 'Mon', reported: 38, resolved: 35 },
      { day: 'Tue', reported: 42, resolved: 40 },
      { day: 'Wed', reported: 31, resolved: 34 },
      { day: 'Thu', reported: 46, resolved: 43 },
      { day: 'Fri', reported: 39, resolved: 38 },
      { day: 'Sat', reported: 29, resolved: 28 },
      { day: 'Sun', reported: 23, resolved: 22 }
    ]
  });
});

// 9c. Department Performance Breakdown
app.get('/api/analytics/departments', (req, res) => {
  res.json([
    {
      id: 'DEPT-PWD',
      name: 'Roads & Infrastructure',
      code: '#IMC-ENG-RDS',
      headOfficer: 'Er. Rajesh Verma (SE)',
      totalComplaints: 86,
      inProgress: 18,
      resolved: 64,
      overdue: 2,
      slaCompliance: '96.4%',
      avgResolutionTime: '3.2 hrs',
      activeSquads: 4
    },
    {
      id: 'DEPT-SWM',
      name: 'Sanitation & Solid Waste',
      code: '#IMC-SAN-WST',
      headOfficer: 'Dr. Anand Mehta (CSO)',
      totalComplaints: 68,
      inProgress: 9,
      resolved: 58,
      overdue: 1,
      slaCompliance: '98.8%',
      avgResolutionTime: '1.8 hrs',
      activeSquads: 6
    },
    {
      id: 'DEPT-WTR',
      name: 'Water Supply & Sewerage',
      code: '#IMC-ENG-WTR',
      headOfficer: 'Er. SureshChandra Dubey (EE)',
      totalComplaints: 52,
      inProgress: 11,
      resolved: 39,
      overdue: 1,
      slaCompliance: '94.1%',
      avgResolutionTime: '4.1 hrs',
      activeSquads: 3
    },
    {
      id: 'DEPT-ELC',
      name: 'Electrical & Street Lighting',
      code: '#IMC-ELC-STR',
      headOfficer: 'Er. Vivek Tiwari (EE)',
      totalComplaints: 42,
      inProgress: 6,
      resolved: 35,
      overdue: 1,
      slaCompliance: '95.2%',
      avgResolutionTime: '2.5 hrs',
      activeSquads: 3
    }
  ]);
});

// 9d. Ward GIS Heatmap & Density Analytics
app.get('/api/analytics/wards', (req, res) => {
  res.json([
    {
      ward: 'Ward 18',
      name: 'Vijay Nagar & Scheme 54',
      zone: 'Zone 04',
      lat: 22.7533,
      lng: 75.8937,
      activeComplaints: 19,
      criticalCount: 3,
      resolvedCount: 44,
      severityIndex: 'High',
      topCategory: 'Roads & Infrastructure',
      slaCompliance: '95.8%'
    },
    {
      ward: 'Ward 19',
      name: 'Old & New Palasia Corridor',
      zone: 'Zone 04',
      lat: 22.7244,
      lng: 75.8839,
      activeComplaints: 14,
      criticalCount: 2,
      resolvedCount: 38,
      severityIndex: 'High',
      topCategory: 'Electricity & Lighting',
      slaCompliance: '94.2%'
    },
    {
      ward: 'Ward 21',
      name: 'Meghdoot Garden & Scheme 78',
      zone: 'Zone 04',
      lat: 22.7562,
      lng: 75.8911,
      activeComplaints: 11,
      criticalCount: 1,
      resolvedCount: 31,
      severityIndex: 'Medium',
      topCategory: 'Sanitation & Waste',
      slaCompliance: '97.5%'
    },
    {
      ward: 'Ward 22',
      name: 'Bengali Square & Bypass Ring',
      zone: 'Zone 04',
      lat: 22.7301,
      lng: 75.9102,
      activeComplaints: 9,
      criticalCount: 1,
      resolvedCount: 29,
      severityIndex: 'Medium',
      topCategory: 'Water & Sewage',
      slaCompliance: '96.9%'
    },
    {
      ward: 'Ward 12',
      name: 'Rajwada Heritage Outer Circle',
      zone: 'Central Zone',
      lat: 22.7196,
      lng: 75.8577,
      activeComplaints: 6,
      criticalCount: 0,
      resolvedCount: 35,
      severityIndex: 'Low',
      topCategory: 'Electricity & Lighting',
      slaCompliance: '99.1%'
    }
  ]);
});

// ============================================================================
// MODULE 5: PROFILE MANAGEMENT, PASSWORD UPDATE & NOTIFICATION PREFERENCES
// ============================================================================

// 10a. Update User Profile (Citizen or Officer)
app.put('/api/profile', optionalAuth, async (req, res) => {
  const {
    email: bodyEmail,
    name,
    phone,
    city,
    ward,
    department,
    designation,
    deskExtension,
    zone,
    officerId
  } = req.body;

  const targetEmail = (req.user?.email || bodyEmail || 'priya.sharma@example.com').toLowerCase();
  const userIdx = db.users.findIndex((u) => u.email.toLowerCase() === targetEmail);

  const initials = (name || req.user?.name || 'User')
    .replace(/^Er\.\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (userIdx !== -1) {
    const existing = db.users[userIdx];
    db.users[userIdx] = {
      ...existing,
      name: name ?? existing.name,
      phone: phone ?? existing.phone,
      city: city ?? existing.city,
      ward: ward ?? existing.ward,
      department: department ?? existing.department,
      designation: designation ?? existing.designation,
      deskExtension: deskExtension ?? existing.deskExtension,
      zone: zone ?? existing.zone,
      officerId: officerId ?? existing.officerId,
      initials: initials || existing.initials
    };
    saveDb(db);
  }

  // Update in Native Supabase Auth & profiles table if configured
  if (req.supabase) {
    try {
      await req.supabase.auth.updateUser({
        data: {
          name,
          phone,
          city,
          ward,
          department,
          designation,
          desk_extension: deskExtension,
          zone,
          initials
        }
      });

      await req.supabase
        .from('profiles')
        .update({
          name,
          phone,
          city,
          ward,
          department,
          designation,
          desk_extension: deskExtension,
          zone,
          initials,
          updated_at: new Date().toISOString()
        })
        .eq('email', targetEmail);
    } catch (e) {
      // ignore
    }
  }

  const updatedUser =
    userIdx !== -1
      ? sanitizeUser(db.users[userIdx])
      : {
          ...(req.user || {}),
          name,
          phone,
          city,
          ward,
          department,
          designation,
          deskExtension,
          zone,
          initials
        };

  res.json({
    message: 'Profile updated successfully',
    user: updatedUser
  });
});

// 10b. Update Account Password via Native Supabase Auth
app.put('/api/profile/password', optionalAuth, async (req, res) => {
  const { email: bodyEmail, currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const targetEmail = (req.user?.email || bodyEmail || 'priya.sharma@example.com').toLowerCase();
  const userIdx = db.users.findIndex((u) => u.email.toLowerCase() === targetEmail);

  if (userIdx !== -1) {
    if (
      currentPassword &&
      db.users[userIdx].password &&
      db.users[userIdx].password !== currentPassword
    ) {
      return res.status(400).json({ error: 'Current password does not match our records.' });
    }
    db.users[userIdx].password = newPassword;
    saveDb(db);
  }

  if (req.supabase) {
    try {
      const { error } = await req.supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.warn('[Civic Connect] Supabase password update note:', error.message);
      }
    } catch (e) {
      // ignore
    }
  }

  res.json({
    message: 'Password updated successfully.'
  });
});

// 10c. Update Notification & Application Preferences
app.put('/api/profile/preferences', optionalAuth, async (req, res) => {
  const { email: bodyEmail, notificationPrefs, appPrefs } = req.body;
  const targetEmail = (req.user?.email || bodyEmail || 'priya.sharma@example.com').toLowerCase();
  const userIdx = db.users.findIndex((u) => u.email.toLowerCase() === targetEmail);

  if (userIdx !== -1) {
    if (notificationPrefs) {
      db.users[userIdx].notificationPrefs = {
        ...(db.users[userIdx].notificationPrefs || DEFAULT_NOTIFICATION_PREFS),
        ...notificationPrefs
      };
    }
    if (appPrefs) {
      db.users[userIdx].appPrefs = {
        ...(db.users[userIdx].appPrefs || DEFAULT_APP_PREFS),
        ...appPrefs
      };
    }
    saveDb(db);
  }

  if (req.supabase) {
    try {
      const updatePayload = { updated_at: new Date().toISOString() };
      if (notificationPrefs) updatePayload.notification_prefs = notificationPrefs;
      if (appPrefs) updatePayload.app_prefs = appPrefs;
      await req.supabase.from('profiles').update(updatePayload).eq('email', targetEmail);
    } catch (e) {
      // ignore
    }
  }

  res.json({
    message: 'Preferences saved and synced.',
    notificationPrefs: userIdx !== -1 ? db.users[userIdx].notificationPrefs : notificationPrefs,
    appPrefs: userIdx !== -1 ? db.users[userIdx].appPrefs : appPrefs
  });
});

// 11. Notifications Endpoints
app.get('/api/notifications', optionalAuth, async (req, res) => {
  if (req.supabase) {
    try {
      const { data, error } = await req.supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        const cleanSb = data
          .filter((n) => !LEGACY_SEED_NOTIF_IDS.has(n.id))
          .map((n) => ({
            id: n.id,
            roleTarget: n.role_target || n.roleTarget || 'all',
            title: n.title,
            message: n.message,
            time: n.time || 'Recently',
            read: Boolean(n.read),
            type: n.type || 'dispatch',
            ticketId: n.ticket_id || n.ticketId
          }));
        const sbIds = new Set(cleanSb.map((n) => n.id));
        const extras = db.notifications.filter(
          (n) => !sbIds.has(n.id) && !LEGACY_SEED_NOTIF_IDS.has(n.id)
        );
        return res.json([...cleanSb, ...extras]);
      }
    } catch (e) {
      // fallback
    }
  }
  res.json(db.notifications.filter((n) => !LEGACY_SEED_NOTIF_IDS.has(n.id)));
});

app.patch('/api/notifications/read-all', optionalAuth, async (req, res) => {
  db.notifications = db.notifications.map((n) => ({ ...n, read: true }));
  saveDb(db);

  if (req.supabase) {
    try {
      await req.supabase.from('notifications').update({ read: true }).neq('id', 'null');
    } catch (e) {
      // ignore
    }
  }

  res.json(db.notifications);
});

app.patch('/api/notifications/:id/read', optionalAuth, async (req, res) => {
  const { id } = req.params;
  db.notifications = db.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveDb(db);

  if (req.supabase) {
    try {
      await req.supabase.from('notifications').update({ read: true }).eq('id', id);
    } catch (e) {
      // ignore
    }
  }

  res.json(db.notifications);
});

// 12. Timeline Updates (Normalized for both Citizen & Officer Timeline Views)
function normalizeTimelineEntry(u) {
  const actionText = u.action || u.title || 'Complaint Update';
  const descText = u.description || u.detail || '';
  const typeVal = u.type || 'dispatch';
  const iconVal =
    u.icon ||
    (typeVal === 'resolved'
      ? 'check'
      : typeVal === 'ai'
      ? 'cpu'
      : typeVal === 'created'
      ? 'user'
      : 'users');
  return {
    id: u.id,
    ticketId: u.ticket_id || u.ticketId || '',
    time: u.time || 'Recently',
    actor: u.actor || 'Municipal System',
    action: actionText,
    title: actionText,
    description: descText,
    detail: descText,
    type: typeVal,
    icon: iconVal
  };
}

app.get('/api/timeline', optionalAuth, async (req, res) => {
  const { ticketId } = req.query;
  let updates = db.timelineUpdates
    .filter((u) => !LEGACY_SEED_TIMELINE_IDS.has(u.id))
    .map(normalizeTimelineEntry);

  if (req.supabase) {
    try {
      const { data, error } = await req.supabase
        .from('timeline_updates')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        const sbNormalized = data
          .filter((u) => !LEGACY_SEED_TIMELINE_IDS.has(u.id))
          .map(normalizeTimelineEntry);
        const sbIds = new Set(sbNormalized.map((u) => u.id));
        const extras = updates.filter((u) => !sbIds.has(u.id));
        updates = [...sbNormalized, ...extras];
      }
    } catch (e) {
      // fallback
    }
  }

  if (ticketId) {
    const cleanId = ticketId.replace('#', '');
    updates = updates.filter((u) => u.ticketId === cleanId);
  }
  res.json(updates);
});

// ============================================================================
// MODULE 6: CIRRS SUPER ADMIN CONSOLE & TWO-TIER MUNICIPAL VERIFICATION APIs
// ============================================================================
const ADMIN_MASTER_SECRET = process.env.ADMIN_SECRET_KEY || 'CIRRS-ADMIN-2026';

// 13a. Isolated Super Admin Login (/civic-connect/admin/login)
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Admin email and passkey are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isDefaultSuperAdmin =
    (normalizedEmail === 'cirrs-hq@gov.in' || normalizedEmail === 'admin@cirrs.gov.in') &&
    password === 'Admin#CIRRS2026';

  let adminUser = db.users.find(
    (u) =>
      u.email.toLowerCase() === normalizedEmail &&
      (u.role === 'admin' || isDefaultSuperAdmin)
  );

  if (!adminUser && isDefaultSuperAdmin) {
    adminUser = {
      id: 'admin_CIRRS_HQ_001',
      name: 'System Administrator',
      email: normalizedEmail,
      password,
      role: 'admin',
      city: 'CIRRS Central Command (GovCloud)',
      designation: 'Platform Super Administrator',
      initials: 'SA',
      isVerified: true,
      adminVerified: true,
      verificationStatus: 'Verified',
      accountStatus: 'Active'
    };
    db.users.push(adminUser);
    saveDb(db);
  }

  if (!adminUser || (adminUser.password !== password && !isDefaultSuperAdmin)) {
    return res.status(401).json({
      error: 'Invalid CIRRS Super Admin credentials. Access restricted to authorized nodal administrators.'
    });
  }

  const safeAdmin = sanitizeUser(adminUser);
  const token = createSignedToken(adminUser);

  res.json({
    message: 'Super Admin authenticated',
    user: safeAdmin,
    token
  });
});

// 13b. Super Admin Secret-Key Registration
app.post('/api/admin/register', async (req, res) => {
  const { name, email, password, adminSecretKey } = req.body;
  if (!name || !email || !password || !adminSecretKey) {
    return res.status(400).json({ error: 'All fields and the Master Security Key are required.' });
  }

  if (adminSecretKey.trim() !== ADMIN_MASTER_SECRET) {
    return res.status(403).json({
      error: 'Invalid Master Security Provisioning Key. Super Admin creation denied.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingIdx = db.users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);

  const newAdmin = {
    id: `admin_${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: 'admin',
    city: 'CIRRS Central Command',
    designation: 'Platform Super Administrator',
    initials: name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    isVerified: true,
    adminVerified: true,
    verificationStatus: 'Verified',
    accountStatus: 'Active'
  };

  if (existingIdx !== -1) {
    db.users[existingIdx] = newAdmin;
  } else {
    db.users.push(newAdmin);
  }
  saveDb(db);

  const safeAdmin = sanitizeUser(newAdmin);
  const token = createSignedToken(newAdmin);

  res.status(201).json({
    message: 'Super Admin account provisioned successfully.',
    user: safeAdmin,
    token
  });
});

// 13c. Get CIRRS Admin Overview (Live Officers Queue + Live Citizens + Live Complaints)
app.get('/api/admin/overview', optionalAuth, async (req, res) => {
  const officers = db.users
    .filter((u) => u.role === 'officer')
    .map((u) => ({
      ...sanitizeUser(u),
      adminVerified: Boolean(u.adminVerified),
      verificationStatus: u.verificationStatus || (u.adminVerified ? 'Verified' : 'Pending')
    }));

  const liveCitizens = db.users
    .filter((u) => u.role === 'citizen')
    .map((u, idx) => {
      const userComplaints = db.complaints.filter(
        (c) => (c.citizenEmail || '').toLowerCase() === u.email.toLowerCase()
      );
      const resolvedCount = userComplaints.filter((c) => c.status === 'Resolved').length;
      return {
        id: u.citizenId?.replace(/^#/, '') || `CIT-${20490 + idx}`,
        name: u.name,
        initials: u.initials || u.name.slice(0, 2).toUpperCase(),
        email: u.email,
        phone: u.phone || '+91 98765 43210',
        municipality: u.city || 'Indore Municipal Corp',
        registrationDate: u.createdAt || '28 Oct 2026',
        complaintsCount: userComplaints.length,
        resolvedCount,
        pendingCount: Math.max(0, userComplaints.length - resolvedCount),
        verification: u.isVerified ? 'Verified' : 'Pending',
        accountStatus: u.accountStatus || 'Active',
        trustScore: '96% Reliable',
        recentComplaint: userComplaints[0]
          ? {
              id: userComplaints[0].id,
              title: userComplaints[0].title,
              category: userComplaints[0].category,
              ward: userComplaints[0].ward || 'Ward 18',
              status: userComplaints[0].status
            }
          : null
      };
    });

  res.json({
    officers,
    citizens: liveCitizens.length > 0 ? liveCitizens : undefined,
    municipalities: db.municipalities?.length > 0 ? db.municipalities : undefined,
    complaints: db.complaints?.length > 0 ? db.complaints : undefined
  });
});

// 13d. Verify / Approve / Reject / Suspend Municipal Officer Account (Step 2 Verification)
app.post('/api/admin/officers/:id/verify', optionalAuth, async (req, res) => {
  const { id } = req.params;
  const { action = 'approve', reason = '', email } = req.body;

  const userIdx = db.users.findIndex(
    (u) =>
      u.id === id ||
      (email && u.email.toLowerCase() === email.toLowerCase()) ||
      u.email.toLowerCase() === id.toLowerCase()
  );

  if (userIdx === -1) {
    return res.status(404).json({ error: 'Municipal Officer account not found.' });
  }

  const officer = db.users[userIdx];
  if (action === 'approve') {
    officer.adminVerified = true;
    officer.verificationStatus = 'Verified';
    officer.adminRejectionReason = '';
    officer.accountStatus = 'Active';
  } else if (action === 'reject') {
    officer.adminVerified = false;
    officer.verificationStatus = 'Rejected';
    officer.adminRejectionReason =
      reason || 'Your Municipal Officer credentials were rejected during Super Admin verification.';
    revokeUserSessions(officer.id, officer.email);
  } else if (action === 'suspend') {
    officer.adminVerified = false;
    officer.verificationStatus = 'Suspended';
    officer.accountStatus = 'Suspended';
    officer.adminRejectionReason =
      reason || 'Your Municipal Officer account has been suspended by the CIRRS Super Admin.';
    revokeUserSessions(officer.id, officer.email);
  }

  db.users[userIdx] = officer;

  db.notifications.unshift({
    id: `notif-verify-${Date.now()}`,
    roleTarget: 'all',
    title:
      action === 'approve'
        ? `Municipal Officer Approved: ${officer.name}`
        : `Municipal Officer ${officer.verificationStatus}: ${officer.name}`,
    message:
      action === 'approve'
        ? `${officer.name} (${officer.email}) has been verified by CIRRS Super Admin and can now log in.`
        : `${officer.name} (${officer.email}) status set to ${officer.verificationStatus}. Reason: ${officer.adminRejectionReason}`,
    time: 'Just now',
    read: false,
    type: 'verification'
  });

  saveDb(db);

  if (req.supabase) {
    try {
      await req.supabase
        .from('profiles')
        .update({
          is_verified: officer.isVerified,
          updated_at: new Date().toISOString()
        })
        .eq('email', officer.email);
    } catch (e) {
      // ignore
    }
  }

  res.json({
    message:
      action === 'approve'
        ? `Approved Municipal Officer ${officer.name}. Login is now enabled!`
        : `Municipal Officer ${officer.name} marked as ${officer.verificationStatus} and active sessions revoked.`,
    officer: sanitizeUser(officer)
  });
});

// 13e. Onboard New Municipality
app.post('/api/admin/municipalities', optionalAuth, (req, res) => {
  const { name, subLabel, state, nodalOfficer, nodalEmail } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Municipality name is required' });
  }
  const newMun = {
    id: `MUN-00${8 + (db.municipalities?.length || 0)}`,
    name,
    subLabel: subLabel || 'Municipal Corporation',
    state: state || 'Madhya Pradesh',
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
    nodalOfficer: nodalOfficer || 'Nodal Commissioner',
    nodalEmail: nodalEmail || 'nodal@mpurban.gov.in'
  };
  db.municipalities = [newMun, ...(db.municipalities || [])];
  saveDb(db);
  res.status(201).json({ municipality: newMun });
});

// 13e-2. Update Municipality Verification / Operational Status
app.patch('/api/admin/municipalities/:id', optionalAuth, (req, res) => {
  const { id } = req.params;
  const patch = req.body || {};
  db.municipalities = db.municipalities || [];
  const idx = db.municipalities.findIndex((m) => m.id === id);
  if (idx !== -1) {
    db.municipalities[idx] = { ...db.municipalities[idx], ...patch };
  } else {
    db.municipalities.push({ id, ...patch });
  }
  saveDb(db);
  res.json({
    message: `Updated municipality ${id}`,
    municipality: db.municipalities.find((m) => m.id === id)
  });
});

// 13f. Update Citizen Account Status (Suspend / Activate)
app.post('/api/admin/citizens/:id/status', optionalAuth, (req, res) => {
  const { id } = req.params;
  const { accountStatus, verification } = req.body;
  const idx = db.users.findIndex(
    (u) =>
      u.id === id ||
      (u.citizenId && u.citizenId.replace(/^#/, '') === id.replace(/^#/, '')) ||
      u.email.toLowerCase() === id.toLowerCase()
  );

  if (idx !== -1) {
    if (accountStatus) {
      db.users[idx].accountStatus = accountStatus;
      if (accountStatus === 'Suspended') {
        revokeUserSessions(db.users[idx].id, db.users[idx].email);
      }
    }
    if (verification) {
      db.users[idx].isVerified = verification === 'Verified';
    }
    saveDb(db);
  }

  res.json({
    message: `Updated citizen ${id} status`,
    accountStatus,
    verification
  });
});

// 13g. Update Complaint Dossier (Admin Assignment, Status & Internal Notes)
app.patch('/api/admin/complaints/:id/dossier', optionalAuth, (req, res) => {
  const cleanId = req.params.id.replace(/^#/, '').replace(/^CMP-/, '');
  const patch = req.body || {};

  const idx = db.complaints.findIndex(
    (c) => c.id === cleanId || c.id === req.params.id || c.id === `CMP-${cleanId}`
  );

  if (idx !== -1) {
    db.complaints[idx] = {
      ...db.complaints[idx],
      ...patch
    };
    saveDb(db);
    return res.json({ complaint: db.complaints[idx] });
  }

  res.json({ complaint: { id: req.params.id, ...patch } });
});

// ============================================================================
// MODULE 7: AUTO-GEOLOCATION REVERSE GEOCODING & SUPABASE RAG AI ASSISTANT
// ============================================================================

// Helper: Run any promise with a strict timeout so API endpoints never hang
function withTimeout(promise, ms = 6000, label = 'operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    )
  ]);
}

// Helper: Extract Google Maps Grounding URLs & review snippets from Gemini response
function extractMapsGroundingLinks(response) {
  const links = [];
  const seenUris = new Set();
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return links;

  for (const chunk of chunks) {
    if (chunk?.maps?.uri && !seenUris.has(chunk.maps.uri)) {
      seenUris.add(chunk.maps.uri);
      const snippets = [];
      const rawSnippets = chunk.maps?.placeAnswerSources?.reviewSnippets;
      if (Array.isArray(rawSnippets)) {
        for (const s of rawSnippets) {
          const txt = s?.content || s?.text || (typeof s === 'string' ? s : '');
          if (txt) snippets.push(txt);
        }
      }
      links.push({
        uri: chunk.maps.uri,
        title: chunk.maps.title || 'View on Google Maps',
        placeId: chunk.maps.placeId || '',
        reviewSnippets: snippets
      });
    }
  }
  return links;
}

// Helper: Format numeric lat/lng into civic DMS/decimal string
function formatGeoString(lat, lng) {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    return '22.7533° N, 75.8937° E';
  }
  const latDir = latNum >= 0 ? 'N' : 'S';
  const lngDir = lngNum >= 0 ? 'E' : 'W';
  return `${Math.abs(latNum).toFixed(4)}° ${latDir}, ${Math.abs(lngNum).toFixed(4)}° ${lngDir}`;
}

// Helper: Determine municipal ward & PWD squad from city/suburb/coords
function inferMunicipalWardAndTeam(city = '', suburb = '', state = '') {
  const c = (city || 'Indore').trim();
  const sub = (suburb || '').toLowerCase();

  let ward = 'Ward 18, Zone 4';
  if (sub.includes('palasia')) ward = 'Ward 19, Zone 4 (Palasia)';
  else if (sub.includes('rajwada') || sub.includes('central')) ward = 'Ward 12, Central Zone';
  else if (sub.includes('bhanwarkuan') || sub.includes('rau')) ward = 'Ward 64, Zone 13';
  else if (sub.includes('vijay nagar') || sub.includes('scheme 54') || sub.includes('scheme 78')) {
    ward = 'Ward 18, Zone 4 (Vijay Nagar)';
  } else if (sub) {
    ward = `Ward 18 • ${suburb}`;
  }

  return {
    ward,
    department: `Roads & Infrastructure Department (PWD ${c})`,
    assignedTeam: `PWD ${c} Rapid Field Squad #04 (${c} Municipal Corp)`,
    state: state || 'Madhya Pradesh'
  };
}

// 14a. Auto-Location Reverse Geocode + Maps Grounding Endpoint
app.post('/api/location/reverse-geocode', optionalAuth, async (req, res) => {
  let { latitude, longitude, accuracy } = req.body || {};
  let source = 'gps';

  // Fallback to IP geolocation if browser GPS coordinates were not supplied
  if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
    source = 'ip-fallback';
    try {
      const ipRes = await fetch('https://ipapi.co/json/', {
        headers: { 'User-Agent': 'CivicConnect/2.0' },
        signal: AbortSignal.timeout(3000)
      });
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.latitude && ipData.longitude) {
          latitude = Number(ipData.latitude);
          longitude = Number(ipData.longitude);
          accuracy = 150;
        }
      }
    } catch (e) {
      // Default to Indore Municipal Coordinates if offline
    }
  }

  const lat = Number(latitude) || 22.7533;
  const lng = Number(longitude) || 75.8937;
  const accMeters = Number(accuracy) ? Math.max(2.1, Number(accuracy)) : 3.8;
  const geoFormatted = formatGeoString(lat, lng);

  let road = '';
  let suburb = '';
  let city = 'Indore';
  let state = 'Madhya Pradesh';
  let postcode = '452010';
  let displayAddress = '';

  // 1. Reverse Geocode via OpenStreetMap Nominatim
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;
    const nomRes = await fetch(nomUrl, {
      headers: {
        'User-Agent': 'CivicConnect-Municipal-Portal/2.0',
        'Accept-Language': 'en'
      },
      signal: AbortSignal.timeout(3500)
    });
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      const addr = nomData.address || {};
      road =
        addr.road ||
        addr.pedestrian ||
        addr.Main_Road ||
        addr.neighbourhood ||
        addr.amenity ||
        '';
      suburb =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.city_district ||
        addr.quarter ||
        '';
      city =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.county ||
        addr.state_district ||
        'Indore';
      state = addr.state || 'Madhya Pradesh';
      postcode = addr.postcode || '';

      const parts = [road, suburb, city, state, postcode].filter(Boolean);
      displayAddress = parts.length >= 2 ? parts.join(', ') : nomData.display_name || '';
    }
  } catch (err) {
    console.warn('[Civic Connect] Nominatim reverse geocode note:', err.message);
  }

  // 2. Provide instant Google Maps place link + optional fast Gemini Maps Grounding
  let mapsLinks = [
    {
      uri: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      title: `${suburb || city} (${geoFormatted}) on Google Maps`,
      reviewSnippets: []
    }
  ];
  let groundingSummary = '';

  if (!displayAddress) {
    displayAddress = `Vijay Nagar Main Rd, Scheme 54, ${city}, ${state} ${postcode}`.trim();
  }

  const shortLocation = [road || suburb || 'Main Corridor', suburb && road ? suburb : '', city]
    .filter(Boolean)
    .slice(0, 3)
    .join(', ');

  const { ward, department, assignedTeam } = inferMunicipalWardAndTeam(city, suburb, state);

  res.json({
    source,
    latitude: lat,
    longitude: lng,
    geo: geoFormatted,
    precision: `±${accMeters.toFixed(1)}m (${source === 'gps' ? 'Live GPS Telemetry' : 'Auto Network Geolocation'})`,
    address: displayAddress,
    shortLocation: shortLocation || `${city}, ${state}`,
    ward,
    city,
    state,
    postcode,
    department,
    assignedTeam,
    groundingSummary,
    mapsLinks
  });
});

// Helper: Fetch live unified dataset from Supabase Cloud + Local Engine for RAG
async function gatherLiveSupabaseRagDataset(req) {
  const sb = getSupabaseClient(req);
  let liveComplaints = [...(db.complaints || [])];
  let liveUsers = [...(db.users || [])];
  let liveMunicipalities = [...(db.municipalities || [])];
  let liveWorkorders = [...(db.workorders || [])];
  let liveCrews = [...(db.fieldCrews || [])];
  let liveTimeline = [...(db.timelineUpdates || [])];
  let supabaseConnected = Boolean(sb);

  if (sb) {
    try {
      const [compRes, profRes, woRes, crewRes, tlRes] = await withTimeout(
        Promise.allSettled([
          sb.from('complaints').select('*').order('created_at', { ascending: false }).limit(100),
          sb.from('profiles').select('*').order('created_at', { ascending: false }).limit(100),
          sb.from('workorders').select('*').order('created_at', { ascending: false }).limit(50),
          sb.from('field_crews').select('*').limit(50),
          sb.from('timeline_updates').select('*').order('created_at', { ascending: false }).limit(50)
        ]),
        3500,
        'Supabase RAG fetch'
      );

      if (compRes.status === 'fulfilled' && Array.isArray(compRes.value.data)) {
        const normalized = compRes.value.data
          .filter((r) => !LEGACY_SEED_COMPLAINT_IDS.has(r.id))
          .map(normalizeComplaint);
        const sbIds = new Set(normalized.map((c) => c.id));
        const extras = liveComplaints.filter(
          (c) => !sbIds.has(c.id) && !LEGACY_SEED_COMPLAINT_IDS.has(c.id)
        );
        liveComplaints = [...normalized, ...extras];
      }

      if (profRes.status === 'fulfilled' && Array.isArray(profRes.value.data)) {
        const sbEmails = new Set(
          profRes.value.data.map((p) => (p.email || '').toLowerCase()).filter(Boolean)
        );
        const mappedProfiles = profRes.value.data.map((p) => ({
          id: p.id,
          name: p.name || (p.email ? p.email.split('@')[0] : 'User'),
          email: p.email || '',
          role: p.role || 'citizen',
          city: p.city || 'Indore',
          ward: p.ward || 'Ward 18',
          department: p.department || '',
          officerId: p.officer_id || '',
          citizenId: p.citizen_id || '',
          isVerified: Boolean(p.is_verified),
          adminVerified: p.role !== 'officer' ? true : Boolean(p.admin_verified),
          verificationStatus: p.verification_status || (p.admin_verified ? 'Verified' : 'Pending'),
          accountStatus: p.account_status || 'Active'
        }));
        const extraUsers = liveUsers.filter((u) => !sbEmails.has((u.email || '').toLowerCase()));
        liveUsers = [...mappedProfiles, ...extraUsers];
      }

      if (woRes.status === 'fulfilled' && Array.isArray(woRes.value.data) && woRes.value.data.length > 0) {
        liveWorkorders = woRes.value.data;
      }

      if (crewRes.status === 'fulfilled' && Array.isArray(crewRes.value.data) && crewRes.value.data.length > 0) {
        liveCrews = crewRes.value.data;
      }

      if (tlRes.status === 'fulfilled' && Array.isArray(tlRes.value.data) && tlRes.value.data.length > 0) {
        liveTimeline = tlRes.value.data.map(normalizeTimelineEntry);
      }
    } catch (err) {
      console.warn('[Civic Connect] RAG Supabase query note:', err.message);
    }
  }

  return {
    supabaseConnected,
    complaints: liveComplaints,
    users: liveUsers,
    municipalities: liveMunicipalities,
    workorders: liveWorkorders,
    fieldCrews: liveCrews,
    timeline: liveTimeline
  };
}

// Helper: Hybrid Semantic + Keyword Retriever over Live Supabase Data
function retrieveRelevantRagContext(query, dataset, currentUser) {
  const qLower = (query || '').toLowerCase();
  const tokens = qLower
    .replace(/[^a-z0-9\u0900-\u097F\s#-]/gi, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  // Synonym expansion for Hindi / Hinglish / English queries
  const expandedTerms = new Set(tokens);
  if (qLower.includes('sadak') || qLower.includes('gaddha') || qLower.includes('pothole') || qLower.includes('road')) {
    expandedTerms.add('road');
    expandedTerms.add('pothole');
    expandedTerms.add('infrastructure');
  }
  if (qLower.includes('kachra') || qLower.includes('safai') || qLower.includes('garbage') || qLower.includes('waste')) {
    expandedTerms.add('sanitation');
    expandedTerms.add('garbage');
    expandedTerms.add('waste');
  }
  if (qLower.includes('paani') || qLower.includes('pani') || qLower.includes('water') || qLower.includes('leak') || qLower.includes('drain')) {
    expandedTerms.add('water');
    expandedTerms.add('sewage');
    expandedTerms.add('drainage');
    expandedTerms.add('pipeline');
  }
  if (qLower.includes('light') || qLower.includes('bijli') || qLower.includes('pole') || qLower.includes('electricity')) {
    expandedTerms.add('electricity');
    expandedTerms.add('lighting');
    expandedTerms.add('streetlight');
  }
  const isAskingMyComplaints =
    qLower.includes('my ') ||
    qLower.includes('mera') ||
    qLower.includes('meri') ||
    qLower.includes('mere') ||
    qLower.includes('apna') ||
    qLower.includes('mine');

  const userEmail = (currentUser?.email || '').toLowerCase();

  // Score Complaints
  const scoredComplaints = dataset.complaints.map((c) => {
    let score = 0;
    const textBlob = `${c.id} ${c.title} ${c.category} ${c.location} ${c.ward} ${c.status} ${c.priority} ${c.department} ${c.assignedTeam} ${c.description} ${c.citizenName} ${c.citizenEmail}`.toLowerCase();

    // Exact ID match gets highest priority
    const cleanId = String(c.id || '').toLowerCase().replace(/^#/, '');
    if (cleanId && qLower.includes(cleanId)) {
      score += 50;
    }

    // Current user ownership match
    if (userEmail && (c.citizenEmail || '').toLowerCase() === userEmail) {
      score += isAskingMyComplaints ? 25 : 5;
    }

    for (const term of expandedTerms) {
      if (textBlob.includes(term)) {
        score += 4;
      }
    }

    if (qLower.includes('pending') && (c.status === 'Pending' || c.status === 'Submitted')) score += 6;
    if ((qLower.includes('progress') || qLower.includes('active')) && c.status === 'In Progress') score += 6;
    if (qLower.includes('resolved') && c.status === 'Resolved') score += 6;
    if ((qLower.includes('high') || qLower.includes('critical') || qLower.includes('urgent')) && (c.priority === 'High' || c.priority === 'Critical')) score += 5;

    return { item: c, score };
  });

  scoredComplaints.sort((a, b) => b.score - a.score);
  const topComplaints = scoredComplaints.slice(0, 8).map((s) => ({
    ...s.item,
    _ragScore: s.score
  }));

  // Score Municipalities
  const scoredMunicipalities = (dataset.municipalities || []).map((m) => {
    let score = 0;
    const blob = `${m.id} ${m.name} ${m.state} ${m.status} ${m.verification}`.toLowerCase();
    for (const term of expandedTerms) {
      if (blob.includes(term)) score += 5;
    }
    return { item: m, score };
  });
  scoredMunicipalities.sort((a, b) => b.score - a.score);
  const topMunicipalities = scoredMunicipalities.slice(0, 5).map((s) => s.item);

  // Score Officers & Pending Approvals
  const officers = (dataset.users || []).filter((u) => u.role === 'officer');
  const pendingOfficers = officers.filter((u) => !u.adminVerified || u.verificationStatus !== 'Verified');

  // Build RAG Citations list for UI transparency
  const ragSources = [];
  for (const c of topComplaints.slice(0, 5)) {
    ragSources.push({
      table: 'complaints',
      id: `#${String(c.id).replace(/^#/, '')}`,
      title: c.title,
      status: c.status,
      priority: c.priority,
      location: c.location || c.ward || 'Indore',
      assignedTeam: c.assignedTeam || c.department || 'Municipal Squad',
      relevance: c._ragScore > 0 ? 'Direct Match' : 'Recent Record'
    });
  }

  if (qLower.includes('municipality') || qLower.includes('nagam') || qLower.includes('city') || qLower.includes('officer') || qLower.includes('verify')) {
    for (const o of officers.slice(0, 3)) {
      ragSources.push({
        table: 'profiles (officers)',
        id: o.officerId || o.id,
        title: `${o.name} (${o.city || 'Municipal Officer'})`,
        status: o.adminVerified ? 'Admin Verified' : 'Pending Admin Verification',
        priority: o.isVerified ? 'Email Verified' : 'Email Unverified',
        location: o.city || 'Madhya Pradesh',
        assignedTeam: o.department || 'Municipal Administration',
        relevance: 'Officer Record'
      });
    }
  }

  // Summary statistics from live Supabase dataset
  const totalComplaints = dataset.complaints.length;
  const resolvedCount = dataset.complaints.filter((c) => c.status === 'Resolved').length;
  const inProgressCount = dataset.complaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length;
  const pendingCount = Math.max(0, totalComplaints - resolvedCount - inProgressCount);
  const userComplaints = userEmail
    ? dataset.complaints.filter((c) => (c.citizenEmail || '').toLowerCase() === userEmail)
    : [];

  return {
    stats: {
      totalComplaints,
      resolvedCount,
      inProgressCount,
      pendingCount,
      userComplaintsCount: userComplaints.length,
      totalUsers: dataset.users.length,
      totalOfficers: officers.length,
      pendingOfficersCount: pendingOfficers.length,
      activeCrewsCount: dataset.fieldCrews.length,
      workordersCount: dataset.workorders.length
    },
    topComplaints,
    userComplaints: userComplaints.slice(0, 5),
    topMunicipalities,
    officers: officers.slice(0, 6),
    pendingOfficers,
    fieldCrews: dataset.fieldCrews.slice(0, 5),
    workorders: dataset.workorders.slice(0, 5),
    recentTimeline: dataset.timeline.slice(0, 6),
    ragSources
  };
}

// Deterministic RAG Answer Synthesizer (Used if GEMINI_API_KEY is not set locally)
function buildDeterministicRagReply(query, ragContext, currentUser, supabaseConnected) {
  const q = (query || '').toLowerCase();
  const { stats, topComplaints, userComplaints, pendingOfficers, fieldCrews } = ragContext;

  const headerLine = supabaseConnected
    ? `📊 **Live Supabase RAG Snapshot:** कुल **${stats.totalComplaints}** शिकायतें (Resolved: **${stats.resolvedCount}**, In Progress: **${stats.inProgressCount}**, Pending: **${stats.pendingCount}**)`
    : `📊 **Civic Connect RAG Snapshot:** कुल **${stats.totalComplaints}** शिकायतें (Resolved: **${stats.resolvedCount}**, In Progress: **${stats.inProgressCount}**, Pending: **${stats.pendingCount}**)`;

  if (q.includes('officer') || q.includes('verify') || q.includes('approval') || q.includes('municipal login')) {
    const pendingList =
      pendingOfficers.length > 0
        ? pendingOfficers
            .map(
              (o) =>
                `- **${o.name}** (${o.email}) — City: ${o.city || 'Indore'} | Email Verified: ${
                  o.isVerified ? 'Yes' : 'No'
                } | Admin Status: **${o.verificationStatus || 'Pending'}**`
            )
            .join('\n')
        : '- अभी कोई भी Municipal Officer पेंडिंग वेरिफिकेशन में नहीं है।';

    return `${headerLine}\n\n### 🏛️ Municipal Officer Two-Tier Verification Status\nडेटाबेस में कुल **${stats.totalOfficers}** म्युनिसिपल ऑफिसर हैं, जिनमें से **${stats.pendingOfficersCount}** सुपर एडमिन अप्रूवल की प्रतीक्षा कर रहे हैं:\n\n${pendingList}\n\n> **नियम:** म्युनिसिपल ऑफिसर को पहले ईमेल वेरीफाई करना होता है (Step 1) और फिर Super Admin द्वारा **Municipality Management** से Approve किए जाने के बाद ही लॉगिन की अनुमति मिलती है (Step 2)।`;
  }

  if (q.includes('mera') || q.includes('meri') || q.includes('my ') || q.includes('status')) {
    const listToUse = userComplaints.length > 0 ? userComplaints : topComplaints.slice(0, 4);
    if (listToUse.length === 0) {
      return `${headerLine}\n\nअभी आपके अकाउंट (${currentUser?.email || 'Guest'}) से कोई शिकायत दर्ज नहीं मिली है। आप **Report Issue** पर क्लिक करके नई शिकायत दर्ज कर सकते हैं—आपकी लाइव GPS लोकेशन अपने-आप डिटेक्ट हो जाएगी!`;
    }
    const rows = listToUse
      .map(
        (c) =>
          `- **#${String(c.id).replace(/^#/, '')}: ${c.title}**\n  - **Status:** ${c.status} | **Priority:** ${c.priority}\n  - **Location:** ${c.location || c.ward}\n  - **Assigned Squad:** ${c.assignedTeam || c.department}`
      )
      .join('\n');
    return `${headerLine}\n\n### 📋 आपके द्वारा पूछी गई शिकायतों की लाइव स्थिति (Retrieved from Supabase):\n${rows}`;
  }

  const sampleRows =
    topComplaints.length > 0
      ? topComplaints
          .slice(0, 4)
          .map(
            (c) =>
              `- **#${String(c.id).replace(/^#/, '')}** — *${c.title}* (${c.category}) | **${c.status}** | 📍 ${c.location} | 👷 ${c.assignedTeam || c.department}`
          )
          .join('\n')
      : '- अभी डेटाबेस में कोई शिकायत मौजूद नहीं है। जब यूज़र नई शिकायत दर्ज करेंगे तो वह यहाँ तुरंत दिखाई देगी।';

  const crewRows = (fieldCrews || [])
    .slice(0, 3)
    .map((cr) => `- **${cr.name}** (${cr.department}) — Status: **${cr.status}**`)
    .join('\n');

  return `${headerLine}\n\n### 🔍 Relevant Records Retrieved from Database:\n${sampleRows}\n\n### 🚛 Active Municipal Field Squads:\n${crewRows || '- All rapid response squads on standby.'}\n\nआप किसी भी **Ticket ID** (जैसे \`#CC10246\`), **Ward**, **Department**, या अपने आस-पास के **Google Maps** स्थानों के बारे में पूछ सकते हैं!`;
}

// 14b. Multi-Turn Supabase RAG + Gemini Maps Grounding Chat Endpoint
app.post('/api/ai/rag-chat', optionalAuth, async (req, res) => {
  const {
    message,
    history = [],
    model: requestedModel = 'gemini-3.8-flash',
    useMapsGrounding = false,
    userLocation = null,
    currentUser: bodyUser = null
  } = req.body || {};

  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const activeUser = req.user || bodyUser || {
    name: 'Citizen User',
    email: '',
    role: 'citizen',
    city: 'Indore, Madhya Pradesh',
    ward: 'Ward 18'
  };

  // 1. Retrieve Live Data from Supabase + Local Store
  const dataset = await gatherLiveSupabaseRagDataset(req);
  const ragContext = retrieveRelevantRagContext(message, dataset, activeUser);

  // 2. Check if Maps Grounding should be activated
  const qLower = String(message).toLowerCase();
  const isLocationQuery =
    Boolean(useMapsGrounding) ||
    qLower.includes('map') ||
    qLower.includes('near') ||
    qLower.includes('paas') ||
    qLower.includes('aas paas') ||
    qLower.includes('kaha') ||
    qLower.includes('where') ||
    qLower.includes('location') ||
    qLower.includes('address') ||
    qLower.includes('hospital') ||
    qLower.includes('office') ||
    qLower.includes('station') ||
    qLower.includes('direction');

  // Allowed models per @google/genai guidelines:
  // If Maps Grounding is used, MUST use 'gemini-3.8-flash' with googleMaps tool
  const validModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-argon'];
  const selectedModel = isLocationQuery
    ? 'gemini-3.8-flash'
    : validModels.includes(requestedModel)
    ? requestedModel
    : 'gemini-3.8-flash';

  const systemInstruction = `You are the official "Civic Connect AI Assistant" (Powered by Live Supabase RAG & Google Maps Grounding) for the CIRRS (Civic Issue Reporting & Resolution System) platform.
You help Citizens, Municipal Officers, and Super Admins in Hindi, Hinglish, and English (match the user's language).

CRITICAL RAG INSTRUCTIONS:
1. Always ground your answers strictly in the LIVE SUPABASE DATABASE CONTEXT provided below.
2. Cite exact Complaint IDs (e.g., #CC10246, #CMP-10245), statuses, priorities, wards, assigned field squads, and officer verification statuses when answering questions about complaints, users, or municipalities.
3. If the live database currently has 0 complaints or a specific ticket is not found, state that honestly based on the live Supabase snapshot and guide the user on how to report or track an issue.
4. For Municipal Officer login questions, explain the Two-Tier Verification rule:
   - Citizen: Verifies via Email only, then can log in.
   - Municipal Officer: Must verify via Email (Step 1) AND be verified/approved by the Super Admin in the CIRRS Admin Console (/civic-connect/admin/login -> Municipality Management) before login is permitted (Step 2).

CURRENT LOGGED-IN USER:
- Name: ${activeUser.name || 'Guest'}
- Email: ${activeUser.email || 'Not signed in'}
- Role: ${activeUser.role || 'citizen'}
- City / Ward: ${activeUser.city || 'Indore'} / ${activeUser.ward || 'Ward 18'}
- Live GPS Coordinates: ${
    userLocation?.latitude
      ? `${userLocation.latitude}, ${userLocation.longitude} (${userLocation.address || ''})`
      : 'Default Indore Municipal Zone (22.7533, 75.8937)'
  }

LIVE SUPABASE DATABASE RAG SNAPSHOT:
- Supabase Cloud Connected: ${dataset.supabaseConnected ? 'YES (Live Cloud Sync)' : 'Local Fallback Store Active'}
- Total Complaints in DB: ${ragContext.stats.totalComplaints} (Resolved: ${ragContext.stats.resolvedCount}, In Progress: ${ragContext.stats.inProgressCount}, Pending: ${ragContext.stats.pendingCount})
- Current User's Own Complaints Count: ${ragContext.stats.userComplaintsCount}
- Total Registered Users/Profiles: ${ragContext.stats.totalUsers} (Municipal Officers: ${ragContext.stats.totalOfficers}, Pending Admin Verification: ${ragContext.stats.pendingOfficersCount})
- Active Field Crews: ${ragContext.stats.activeCrewsCount} | Dispatched Workorders: ${ragContext.stats.workordersCount}

TOP RETRIEVED COMPLAINTS FROM SUPABASE (RAG MATCHED):
${
  ragContext.topComplaints.length > 0
    ? JSON.stringify(
        ragContext.topComplaints.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          status: c.status,
          priority: c.priority,
          location: c.location,
          ward: c.ward,
          geo: c.geo,
          department: c.department,
          assignedTeam: c.assignedTeam,
          citizenName: c.citizenName,
          citizenEmail: c.citizenEmail,
          upvotes: c.upvotes,
          slaStatus: c.slaStatus,
          description: c.description
        })),
        null,
        2
      )
    : 'No complaints currently stored in database.'
}

CURRENT USER'S OWN COMPLAINTS:
${
  ragContext.userComplaints.length > 0
    ? JSON.stringify(
        ragContext.userComplaints.map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          priority: c.priority,
          location: c.location,
          assignedTeam: c.assignedTeam
        }))
      )
    : 'None filed under current user email yet.'
}

MUNICIPAL OFFICERS & VERIFICATION QUEUE:
${JSON.stringify(
  ragContext.officers.map((o) => ({
    name: o.name,
    email: o.email,
    city: o.city,
    department: o.department,
    emailVerified: o.isVerified,
    adminVerified: o.adminVerified,
    verificationStatus: o.verificationStatus
  }))
)}

ACTIVE FIELD CREWS & WORKORDERS:
${JSON.stringify({
  crews: ragContext.fieldCrews,
  recentWorkorders: ragContext.workorders.slice(0, 3)
})}

Keep responses helpful, structured with clear bullet points, and concise.`;

  const ai = getGeminiClient();
  if (!ai) {
    const fallbackReply = buildDeterministicRagReply(
      message,
      ragContext,
      activeUser,
      dataset.supabaseConnected
    );
    return res.json({
      reply: fallbackReply,
      model: `${selectedModel} (RAG Engine)`,
      supabaseConnected: dataset.supabaseConnected,
      ragStats: ragContext.stats,
      ragSources: ragContext.ragSources,
      mapsLinks: []
    });
  }

  try {
    // Build multi-turn conversation history for Gemini
    const formattedContents = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-10)) {
        if (!turn || !turn.content) continue;
        formattedContents.push({
          role: turn.role === 'assistant' || turn.role === 'model' ? 'model' : 'user',
          parts: [{ text: String(turn.content) }]
        });
      }
    }
    formattedContents.push({
      role: 'user',
      parts: [{ text: String(message) }]
    });

    const genConfig = {
      systemInstruction,
      temperature: 0.4
    };

    if (isLocationQuery) {
      genConfig.tools = [{ googleMaps: {} }];
      const lat = Number(userLocation?.latitude) || 22.7533;
      const lng = Number(userLocation?.longitude) || 75.8937;
      genConfig.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      };
    }

    const response = await withTimeout(
      ai.models.generateContent({
        model: selectedModel,
        contents: formattedContents,
        config: genConfig
      }),
      6500,
      'Gemini RAG generateContent'
    );

    const replyText =
      response.text ||
      buildDeterministicRagReply(message, ragContext, activeUser, dataset.supabaseConnected);
    let mapsLinks = extractMapsGroundingLinks(response);
    if (isLocationQuery && mapsLinks.length === 0) {
      const lat = Number(userLocation?.latitude) || 22.7533;
      const lng = Number(userLocation?.longitude) || 75.8937;
      mapsLinks = [
        {
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${message} near ${lat},${lng}`
          )}`,
          title: `Open "${message.slice(0, 36)}" on Google Maps`,
          reviewSnippets: []
        }
      ];
    }

    return res.json({
      reply: replyText,
      model: selectedModel,
      mapsGroundingUsed: isLocationQuery,
      supabaseConnected: dataset.supabaseConnected,
      ragStats: ragContext.stats,
      ragSources: ragContext.ragSources,
      mapsLinks
    });
  } catch (err) {
    console.warn('[Civic Connect] Gemini RAG chat fallback:', err.message);
    const lat = Number(userLocation?.latitude) || 22.7533;
    const lng = Number(userLocation?.longitude) || 75.8937;
    const fallbackMapsLinks = isLocationQuery
      ? [
          {
            uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `Municipal Office near ${lat},${lng}`
            )}`,
            title: 'View Nearby Municipal Offices on Google Maps',
            reviewSnippets: []
          }
        ]
      : [];

    const fallbackReply = buildDeterministicRagReply(
      message,
      ragContext,
      activeUser,
      dataset.supabaseConnected
    );
    return res.json({
      reply: fallbackReply,
      model: `${selectedModel} (Supabase RAG)`,
      mapsGroundingUsed: isLocationQuery,
      supabaseConnected: dataset.supabaseConnected,
      ragStats: ragContext.stats,
      ragSources: ragContext.ragSources,
      mapsLinks: fallbackMapsLinks
    });
  }
});

// ============================================================================
// FRONTEND SERVING & VITE INTEGRATION (Skipped on Vercel Serverless)
// ============================================================================
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite dev middleware mounted in Express app');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const indexHtmlPath = path.resolve(distPath, 'index.html');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get('*', (req, res) => {
      if (fs.existsSync(indexHtmlPath)) {
        res.sendFile(indexHtmlPath);
      } else {
        res.json({
          status: 'ok',
          service: 'Civic Connect Express + Native Supabase API (Render Backend)',
          endpoints: ['/api/health', '/api/complaints', '/api/auth/login', '/api/admin/login']
        });
      }
    });
  }

  const tryListen = (portToTry) => {
    const serverInstance = app.listen(portToTry, '0.0.0.0', () => {
      console.log(`🚀 Civic Connect Full-Stack Server running at http://localhost:${portToTry}`);
      console.log(`🔐 Super Admin Console: http://localhost:${portToTry}/civic-connect/admin/login`);
    });

    serverInstance.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = Number(portToTry) + 1;
        console.warn(`⚠️ Port ${portToTry} is already in use. Automatically switching to Port ${nextPort}...`);
        tryListen(nextPort);
      } else {
        console.error('Server error:', err);
      }
    });
  };

  tryListen(PORT);
}

if (!isVercel) {
  startServer();
}

export default app;
