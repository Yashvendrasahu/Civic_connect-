// ============================================================================
// CIVIC CONNECT — DATA DEFINITIONS & CONSTANTS
// All complaint, notification, and timeline arrays start empty ([]) and are
// populated exclusively from the live Supabase database & Express API.
// ============================================================================

export const DEFAULT_CITIZEN_USER = {
  name: 'Citizen User',
  role: 'citizen',
  email: '',
  phone: '',
  city: '',
  ward: '',
  citizenId: '#CIT-0000',
  initials: 'CU',
  impactScore: 0,
  reportedCount: 0,
  resolvedCount: 0
};

export const DEFAULT_OFFICER_USER = {
  name: 'Municipal Officer',
  role: 'officer',
  email: '',
  phone: '',
  city: '',
  ward: '',
  zone: '',
  department: 'Municipal Administration',
  designation: 'Municipal Nodal Officer',
  deskExtension: '',
  officerId: 'OFF-0000',
  initials: 'MO',
  activeCount: 0,
  inProgressCount: 0,
  needsAttentionCount: 0,
  resolvedCount: 0
};

export const INITIAL_COMPLAINTS = [];

export const TIMELINE_UPDATES = [];

export const INITIAL_NOTIFICATIONS = [];

export const ISSUE_CATEGORIES = [
  { id: 'road', name: 'Road Damage', subtitle: 'Potholes, cracks, broken pavement', icon: 'road', aiMatch: false },
  { id: 'garbage', name: 'Garbage Overflow', subtitle: 'Uncollected waste, overflowing bins', icon: 'trash', aiMatch: false },
  { id: 'water', name: 'Water Leakage', subtitle: 'Burst pipes, waterlogging, supply leaks', icon: 'droplet', aiMatch: false },
  { id: 'light', name: 'Streetlight Failure', subtitle: 'Dark poles, flickering bulbs, exposed wires', icon: 'lightbulb', aiMatch: false },
  { id: 'drainage', name: 'Drainage Blockage', subtitle: 'Clogged drains, sewage overflow, open manholes', icon: 'waves', aiMatch: false },
  { id: 'other', name: 'Other Issue', subtitle: 'Encroachment, fallen trees, public hazards', icon: 'grid', aiMatch: false }
];

export const DEPARTMENT_PERFORMANCE = [
  { name: 'Roads & Infrastructure', score: 0, color: 'bg-blue-600' },
  { name: 'Sanitation & Waste', score: 0, color: 'bg-emerald-500' },
  { name: 'Electricity & Lighting', score: 0, color: 'bg-sky-500' },
  { name: 'Water Supply & Sewage', score: 0, color: 'bg-amber-500' }
];
