# CIRRS Admin — Civic Connect Console & Two-Tier Municipal Verification Plan

## 1. Product & Architectural Overview

We will build the complete **CIRRS Admin — Civic Connect Console** based on your 7 uploaded UI reference screens, structured in two sequential phases as requested: **Phase 1: Complete Admin Frontend UI**, followed by **Phase 2: Backend API, Supabase Integration & Two-Tier Verification Workflow**.

### Core Capabilities
1. **Isolated Admin URL Entry (`/civic-connect/admin/login` & `/admin/login`)**:
   - The standard Citizen / Municipal Officer login page (`/`) will have **no visible link or toggle** to the Admin portal so regular users cannot discover or access it.
   - Navigating directly to `/civic-connect/admin/login` (or `/admin/login`) opens the dedicated **CIRRS Super Admin Portal** with:
     - **Pre-configured Super Admin Sign-In** (`cirrs-hq@gov.in` / `admin@cirrs.gov.in`).
     - **Secret Admin Key Registration Tab** allowing authorized personnel with the platform master key to create a Super Admin account.
2. **Two-Tier Verification Rule (Citizen vs. Municipal Officer)**:
   - **Citizen Accounts (`role: 'citizen'`)**: Verify their own email (`isVerified: true`) and can log in immediately after email verification.
   - **Municipal Officer Accounts (`role: 'officer'`)**:
     - Step 1: Officer registers and verifies their email (`isVerified: true`).
     - Step 2: Account enters the Admin's **Municipality Management → Pending Verification Queue** (`adminVerified: false`, `verificationStatus: 'Pending'`).
     - If an Officer attempts to log in before Admin approval, or after Admin rejection/suspension, login is blocked with a clear status banner displaying their exact verification state (`Pending Admin Approval` or `Rejected / Suspended` with the Admin's reason), and any active sessions are immediately revoked.
     - Once the Admin clicks **Verify / Approve** in the Admin Console (`adminVerified: true`, `verificationStatus: 'Verified'`), the Municipal Officer can log in normally.

---

## 2. Phase 1 — Admin Frontend UI Architecture (Matching All 7 Reference Screens)

### A. Admin Shell & Navigation (`src/components/admin/AdminDashboard.jsx`)
- **Dark Navy Sidebar (`#0F172A`)**:
  - Brand Header: `CIRRS Admin — Civic Connect Console`
  - Navigation Items:
    1. `Overview`
    2. `Complaint Management` (plus drill-down `Complaint Dossier View`)
    3. `Municipality Management` (with Pending Officer Verification Queue badge)
    4. `Citizen Management`
    5. `AI Analytics`
    6. `Reports & Analytics`
    7. `Notifications` (with live unread counter badge)
    8. `Settings`
  - Bottom Profile Card: `System Administrator • Platform Admin` (`cirrs-hq@gov.in`) with sign-out control.
- **Top Header Bar**:
  - Contextual breadcrumb trail (`Admin / Overview`, `Admin / Complaint Management / CMP-10245`, etc.)
  - Global command search input (`Search complaints, municipalities, citizens... ⌘K`)
  - Status pill (`Live Network Sync • 14 Municipalities Online`)
  - Notification bell drawer trigger & Admin profile menu.

### B. Screen-by-Screen UI Modules
1. **Admin Overview (`AdminOverviewView.jsx` — Ref Image 11)**:
   - Date range selector (`Last 30 Days`) and `Generate Report` CTA.
   - 4 KPI Cards: `Total Complaints`, `Pending Complaints`, `Resolved Complaints`, `Resolution Rate`.
   - Middle Row: `Complaint Trends` dual-series area chart (`Reported` vs `Resolved`) + `Issues by Category` donut chart (`Road Damage`, `Garbage & Waste`, `Water Supply`, `Streetlights`, `Drainage`, `Other`).
   - `Recent Complaints` filterable table with search, category/status/priority filters, and direct row click to open the Complaint Dossier.
   - Bottom Row: `Municipality Performance` horizontal progress bars (Indore, Bhopal, Jabalpur, Nagpur, Seoni) + `Quick Insights & Telemetry` summary cards.
2. **Complaint Management (`AdminComplaintsView.jsx` — Ref Image 12)**:
   - 4 KPI summary cards (`All Complaints`, `Pending`, `In Progress`, `Resolved`).
   - Multi-filter toolbar (`CMP-` search, Status, Category, Priority, Municipality, Date range).
   - Multi-row checkbox selection bar (`selected count`, `Export Selected`, `Bulk Assign`, `Clear Selection`, `AI-assisted classification` badge).
   - Paginated data table with `COMPLAINT ID`, `ISSUE DETAILS`, `CATEGORY`, `MUNICIPALITY`, `REPORTED DATE`, `PRIORITY`, `STATUS`, `AI CONFIDENCE` progress bar, and row action menu (`View`, `Change Status`, `Export`).
3. **Complaint Dossier / Detail View (`AdminComplaintDossierView.jsx` — Ref Image 14)**:
   - Breadcrumb & header actions (`Back to Complaints`, `Export Dossier`, `Update Status`).
   - **Left Column**:
     - `Complaint Information` metadata grid, citizen statement quote box, and tags.
     - `Photo Evidence` cards (`Primary Evidence` & `Detail Scale Macro`) with EXIF/GPS metadata and download action.
     - `Complaint Location` card with GPS coordinates, `Copy Coordinates`, `Open in GIS Portal`, and interactive Ward GIS map preview with hazard radius.
     - `AI-Assisted Analysis` card (Confidence score bar, Predicted Category, Severity Detection, Suggested Priority/Department, Safety Concern callout).
   - **Right Column**:
     - `Reported By` citizen profile summary card (Verified badge, Phone, Ward, eKYC, Total Filed / Resolved / Trust Rating).
     - `Municipal Responsibility` assignment card (Municipality, Responsible Department dropdown, Assign Officer dropdown, `Save Assignment`).
     - `Status Management` card (`Pending`, `In Progress`, `Resolved`, `Rejected` buttons, Administrative Note textarea, `Notify Citizen via SMS & Push` toggle, `Confirm Status Update`).
     - `Activity Timeline` vertical log & `Internal Notes (Admins & Nodal Officers Only)` with `+ Add Note`.
4. **Municipality Management & Officer Approval Queue (`AdminMunicipalityView.jsx` — Ref Image 13)**:
   - 4 KPI Cards: `Registered Municipalities`, `Active Municipalities`, `Pending Verification (Review Queue - Awaiting nodal officer approval)`, `Inactive Municipalities`.
   - Dedicated **Pending Municipal Officer Approvals** filter & review table alongside the Municipality Directory (`Seoni Municipal Council`, `Jabalpur Municipal Corporation`, `Bhopal Municipal Corporation`, `Indore Municipal Corporation`, `Nagpur Municipal Corporation`, plus live registered Municipal Officers).
   - One-click **Verify / Approve**, **Reject (with reason modal)**, **Suspend / Reactivate**, and **+ Add Municipality** modal.
5. **Citizen Management (`AdminCitizenView.jsx` — Ref Image 15)**:
   - 4 KPI Cards: `Total Citizens`, `Verified Accounts`, `New This Month`, `Suspended Accounts`.
   - Search, Municipality, Verification Status, and Account Status filters + bulk selection bar (`Export Selected`).
   - Citizens table (`CITIZEN`, `EMAIL`, `MUNICIPALITY`, `REG. DATE`, `COMPLAINTS`, `VERIFICATION`, `ACCOUNT STATUS`, `ACTIONS`).
   - Interactive bottom **Citizen Detail Overview** panel for the selected citizen (Civic Trust Score, Issue Engagement History bar, Recent Active Complaint card, `View Full Profile`, `Complaint History`, `Suspend / Activate Account`).
6. **AI Analytics (`AdminAiAnalyticsView.jsx` — Ref Image 17)**:
   - ISO/IEC 42001 governance banner.
   - 4 KPI Cards: `Complaints Analyzed`, `High-Priority Issues`, `Average Confidence`, `Pending AI Review (Confidence < 70%)`.
   - `Complaint Category Distribution` donut chart + `AI-Assisted Priority Distribution` stacked breakdown.
   - `Civic Issue Trends` multi-category line chart (`Road Damage`, `Garbage`, `Water`, `Drainage`) with Daily/Weekly toggle.
   - `Potential Civic Hotspots` ranked list + `Classification Performance & Model Telemetry` 2x2 grid.
   - `AI-Generated Insights` 3-column anomaly cards + `Complaints Requiring AI Review` table with `Review Classification` modal.
7. **Reports & Analytics (`AdminReportsView.jsx` — Ref Image 16)**:
   - Filter bar (`Reporting Period`, `Municipality`, `Complaint Category`, `Resolution Status`, `Apply Filters`, `Reset`).
   - 4 KPI Cards (`Total Complaints`, `Resolution Rate`, `Average Resolution Time`, `SLA Compliance`).
   - `Complaint Resolution Trends` chart + `Complaints by Category` donut chart.
   - `Municipality Performance` SLA table.
   - Bottom Row: `Generate & Export Report` interactive builder (Report Type radio cards + `CSV` / `PDF` selector + real download generator) and `Recent Reports` archive list.

---

## 3. Phase 2 — Backend API, Supabase Sync & Two-Tier Verification

### A. User Schema & Dual Verification State (`server.js` & Supabase `users` table)
- Extend user records with:
  - `isVerified` (Boolean — Email verification status)
  - `adminVerified` (Boolean — `true` by default for `citizen` and `admin`; `false` on registration for `officer`)
  - `verificationStatus` (`'Verified' | 'Pending' | 'Rejected' | 'Suspended'`)
  - `adminRejectionReason` (String — optional reason set by Admin when rejecting/suspending an account)
  - `municipality` / `state` / `municipalityId` metadata.
- **Officer Login Guard (`POST /api/auth/login`)**:
  - Step 1: Check `user.isVerified` (Email verification). If `false`, return `403` requiring email verification (`requiresEmailVerification: true`).
  - Step 2: If `user.role === 'officer'` and `!user.adminVerified`:
    - Return `403` with `requiresAdminVerification: true`, `verificationStatus: user.verificationStatus`, and `reason: user.adminRejectionReason || 'Your municipal officer account is awaiting Super Admin verification.'`.
  - Step 3: If `user.verificationStatus === 'Suspended'`, revoke any active token and block login with the suspension reason.

### B. Dedicated Admin Backend Endpoints (`server.js`)
- `POST /api/admin/login` & `POST /api/admin/register` (validates Super Admin credentials or secret key `CIRRS-ADMIN-2026`).
- `GET /api/admin/overview` — Returns live Supabase complaints/users combined seamlessly with the multi-municipality reference analytics dataset.
- `GET /api/admin/municipalities` & `POST /api/admin/municipalities` — Lists all municipalities and registered Municipal Officer accounts (including pending officer signups).
- `POST /api/admin/officers/:id/verify` — Approves, rejects (with reason), or suspends a Municipal Officer account (`adminVerified: true/false`, `verificationStatus: 'Verified' | 'Rejected' | 'Suspended'`), immediately revoking active sessions if rejected/suspended, and logs an audit notification.
- `GET /api/admin/citizens` & `POST /api/admin/citizens/:id/status` — Lists citizens and allows Admin to verify, suspend, or reactivate citizen accounts.
- `PATCH /api/admin/complaints/:id/dossier` — Allows Admin to reassign municipality/department/officer, update status with administrative notes, and append internal nodal notes.

---

## 4. Verification & End-to-End Testing Plan
1. **Isolated Route Test**: Verify `/` shows only Citizen & Municipal Officer login, while `/civic-connect/admin/login` and `/admin/login` render the CIRRS Super Admin login page.
2. **Two-Tier Officer Verification Flow**:
   - Register a new Municipal Officer → Verify email → Attempt officer login → Confirm login is blocked with `"Pending Admin Approval"` status notice.
   - Log in as Super Admin at `/civic-connect/admin/login` → Open `Municipality Management` → Approve the pending Municipal Officer → Log in as the Municipal Officer → Confirm full access to Officer Dashboard.
   - Test Admin rejection/suspension with a reason → Confirm active officer session is revoked and login displays the Admin's rejection reason.
3. **Build & Lint Verification**: Run `compile_applet` to ensure zero syntax or bundle errors.
