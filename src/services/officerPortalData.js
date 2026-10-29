// ============================================================================
// CIVIC CONNECT — MUNICIPAL OFFICER PORTAL DATA STRUCTURES
// All complaint, notification, division, and analytics series default to 0 / []
// and are dynamically computed from live Supabase records.
// ============================================================================

export const OFFICER_COMPLAINTS_DATA = [];

export const MUNICIPAL_DIVISIONS = [
  {
    id: 'DIV-RDS',
    code: '#IMC-ENG-RDS',
    name: 'Roads & Infrastructure',
    zoneCoverage: 'All Municipal Wards',
    isUserDept: true,
    statusBadge: 'YOUR DEPARTMENT',
    statusTone: 'blue',
    utilization: 0,
    utilizationLabel: '0% Bandwidth Load',
    barColor: 'bg-blue-600',
    squadsCount: 0,
    openCount: 0,
    inProgCount: 0,
    resolvedCount: 0,
    overdueCount: 0,
    leadName: 'Unassigned',
    leadRole: 'Departmental Lead',
    leadPhone: '—',
    squads: []
  },
  {
    id: 'DIV-WTR',
    code: '#IMC-ENG-WTR',
    name: 'Water Supply & Sewerage',
    zoneCoverage: 'All Municipal Wards',
    isUserDept: false,
    statusBadge: 'Standby',
    statusTone: 'emerald',
    utilization: 0,
    utilizationLabel: '0% Bandwidth Load',
    barColor: 'bg-emerald-500',
    squadsCount: 0,
    openCount: 0,
    inProgCount: 0,
    resolvedCount: 0,
    overdueCount: 0,
    leadName: 'Unassigned',
    leadRole: 'Departmental Lead',
    leadPhone: '—',
    squads: []
  },
  {
    id: 'DIV-SAN',
    code: '#IMC-SAN-WST',
    name: 'Sanitation & Solid Waste',
    zoneCoverage: 'All Municipal Wards',
    isUserDept: false,
    statusBadge: 'Standby',
    statusTone: 'emerald',
    utilization: 0,
    utilizationLabel: '0% Bandwidth Load',
    barColor: 'bg-emerald-500',
    squadsCount: 0,
    openCount: 0,
    inProgCount: 0,
    resolvedCount: 0,
    overdueCount: 0,
    leadName: 'Unassigned',
    leadRole: 'Departmental Lead',
    leadPhone: '—',
    squads: []
  },
  {
    id: 'DIV-ELC',
    code: '#IMC-ELC-STR',
    name: 'Electrical & Street Lighting',
    zoneCoverage: 'All Municipal Wards',
    isUserDept: false,
    statusBadge: 'Standby',
    statusTone: 'emerald',
    utilization: 0,
    utilizationLabel: '0% Bandwidth Load',
    barColor: 'bg-emerald-500',
    squadsCount: 0,
    openCount: 0,
    inProgCount: 0,
    resolvedCount: 0,
    overdueCount: 0,
    leadName: 'Unassigned',
    leadRole: 'Departmental Lead',
    leadPhone: '—',
    squads: []
  }
];

export const ANALYTICS_TREND_SERIES = {
  Daily: [
    { label: 'Day 1', received: 0, resolved: 0, velocity: '0%' },
    { label: 'Day 2', received: 0, resolved: 0, velocity: '0%' },
    { label: 'Day 3', received: 0, resolved: 0, velocity: '0%' },
    { label: 'Day 4', received: 0, resolved: 0, velocity: '0%' },
    { label: 'Day 5', received: 0, resolved: 0, velocity: '0%' },
    { label: 'Day 6', received: 0, resolved: 0, velocity: '0%' },
    { label: 'Today', received: 0, resolved: 0, velocity: '0%' }
  ],
  Weekly: [
    { label: 'Week 1', received: 0, resolved: 0, velocity: '0%' },
    { label: 'Week 2', received: 0, resolved: 0, velocity: '0%' },
    { label: 'Week 3', received: 0, resolved: 0, velocity: '0%' },
    { label: 'Current Week', received: 0, resolved: 0, velocity: '0%' }
  ],
  Monthly: [
    { label: 'Month 1', received: 0, resolved: 0, velocity: '0%' },
    { label: 'Month 2', received: 0, resolved: 0, velocity: '0%' },
    { label: 'Current Month', received: 0, resolved: 0, velocity: '0%' }
  ]
};

export const OFFICER_NOTIFICATIONS_DATA = [];

export const OFFICER_DEFAULT_PROFILE = {
  id: 'OFFICER-SESSION',
  name: 'Municipal Officer',
  initials: 'MO',
  role: 'officer',
  designation: 'Municipal Engineer',
  department: 'Roads & Infrastructure',
  departmentCode: 'IMC-ENG-RDS',
  zone: 'Municipal Zone',
  city: 'Municipal Corporation',
  email: '',
  phone: '',
  employeeId: 'OFF-0000',
  slaComplianceRate: '0%',
  totalResolved: 0,
  activeQueue: 0
};

