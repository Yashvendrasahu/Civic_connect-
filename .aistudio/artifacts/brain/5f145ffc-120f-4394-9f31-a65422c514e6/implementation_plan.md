# CivicConnect — 100% Dynamic Supabase Data & Zero-State Architecture Plan

CivicConnect will transition from hybrid static/seed fallbacks to a strictly live, database-driven architecture powered by Supabase across all three portals (Citizen, Municipal Officer, and Super Admin). Every KPI card, chart series, data table, map pin, notification feed, and form input will reflect real-time records stored in Supabase, displaying clean `0` counters and structured empty states whenever a new user registers or when a database collection has no records.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Product & Data Scoping Decisions:**
> 1. **100% Live Admin & Officer Telemetry:** All artificial floor multipliers (such as `Math.max(total, 248)`) and static reference arrays in the Super Admin Console and Municipal Officer Dashboard will be removed. When no records exist in Supabase, all KPIs, SLA percentages, department workloads, and chart series will accurately display `0` (`0%`).
> 2. **Strict Role-Based Data Scoping:**
>    - **Citizens:** Strictly scoped to their own authenticated identity (`citizenEmail` / `userId`). A newly registered citizen will see `0` total complaints, `0` resolved, `0%` resolution rate, `0` notifications, and an empty complaint ledger until they submit an issue.
>    - **Municipal Officers & Super Admin:** Scoped to live platform-wide and municipal records fetched from Supabase (`complaints`, `profiles`, `workorders`, `field_crews`, `notifications`, and `timeline_updates`).
> 3. **Zero Pre-Filled Form Text & Mock Seeds:** All static demo tickets, mock citizens, mock municipalities, and pre-filled sample text in the Report Issue workflow ("Large Pothole on Main Road", sample Unsplash URLs, etc.) will be cleared. New reports will start at Step 1 with blank inputs and live GPS auto-detection.

---

## 1. Overview & Core Concept

Currently, several views across the platform rely on fallback seed arrays or mathematical floors to simulate a busy city environment when the database is empty. While useful for initial visual prototyping, this prevents the application from behaving like a true production civic-tech SaaS platform where new users start with a clean slate and administrators see exact, auditable counts from Supabase.

This upgrade establishes a **Single Source of Truth (SSOT)** data pipeline:
- **Zero Static Inflation:** Backend aggregation endpoints (`/api/stats`, `/api/admin/overview`, `/api/analytics/departments`, `/api/analytics/wards`) and frontend Supabase service methods will compute totals, averages, and trends exclusively from live database rows.
- **Per-Citizen Isolation:** Authenticated citizens will only query and subscribe to records matching their account email/ID, ensuring privacy and an authentic `0`-state onboarding experience.
- **Dynamic Admin & Officer Aggregation:** The Super Admin Console (Overview, Complaints Ledger, Municipality Directory, Citizen Directory, AI Analytics, and Reports) and Municipal Officer Workspace will dynamically aggregate metrics from live `complaints`, `profiles`, `workorders`, and `field_crews` tables in Supabase.

---

## 2. User Experience & Visual Design

To ensure that `0`-state dashboards and live data tables look intentional, authoritative, and refined, the UI will follow strict **Atmospheric Minimalism & High-Craft SaaS Dashboard** principles:

- **Tabular Numerals & Zero-State Precision:**
  - All KPI values, SLA timers, coordinates, and percentages will enforce `font-variant-numeric: tabular-nums` so counters (`0`, `0%`, `0.0 hrs`) align along a strict vertical rhythm without layout jitter when live Supabase rows arrive.
- **Purposeful Empty States (No Broken Charts or Blank Holes):**
  - When a table or chart has `0` records in Supabase, the container will retain its structural grid geometry (`1px solid` hairline border, single-elevation card surface) and render a clean, non-intrusive empty state with a contextual action (e.g., *"No civic complaints filed under your account yet — Click 'Report Issue' to submit your first report with live GPS"* for Citizens, or *"0 Active Escalations in Queue"* for Officers/Admins).
  - Charts (Weekly Intake vs. Resolution, Department Workload, Ward Distribution, AI Severity Breakdown) will render clean zero-baseline axes with `0` values across intervals rather than disappearing or falling back to fake trend lines.
- **Uncluttered Report Issue Workflow:**
  - Opening the Report Issue page or modal will initialize at Step 1 with blank text inputs, an empty photo uploader ready for camera/file input, and automatic live browser GPS acquisition that populates the real street address, ward, and latitude/longitude coordinates.
- **Visual Restraint & Scannable Hierarchy:**
  - Cards will strictly cap at 3–4 data points (Metric Label, Primary Tabular Numeral, Live Delta/Status Subtext) with at least 25% open whitespace across the viewport and zero decorative bloat.

---

## 3. Key Product Decisions & Trade-Offs

- **Dynamic Municipality & Citizen Directory Derivation vs. Static Reference Lists:**
  - *Decision:* Instead of reading municipalities and citizens from static JavaScript arrays, the Super Admin **Municipality Directory** and **Citizen Directory** will dynamically build their rows from live Supabase `profiles` (filtering by `role = 'officer'` / `department` / `municipality` and `role = 'citizen'`) cross-referenced with live `complaints` counts per user and ward.
  - *Trade-Off:* If zero officers or citizens have registered yet, these directories will show `0` rows. However, as soon as any citizen signs up or an officer is provisioned, they immediately appear in the Super Admin tables with real-time complaint counts and trust/activity metrics.
- **Landing Page Live Platform Telemetry:**
  - *Decision:* Public landing page counters will reflect real platform-wide counts from `/api/stats` (defaulting to `0` when the database is empty) rather than hardcoded promotional numbers, maintaining 100% consistency between public telemetry and the Super Admin console.
- **Live AI Analytics & Reports Computation:**
  - *Decision:* The Admin AI Analytics view and Officer/Admin Reports views will calculate AI categorization confidence, duplicate detection rates, priority distributions (`High`, `Medium`, `Low`), and SLA compliance directly from the metadata stored on live Supabase `complaints` rows. When `0` complaints exist, all gauges and distributions will cleanly report `0`.

---

## 4. Technical Architecture & Data Strategy

### End-to-End Live Supabase Data Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE POSTGRES DATABASE                          │
│  ┌────────────┐  ┌──────────┐  ┌────────────┐  ┌───────────┐  ┌──────────┐ │
│  │ complaints │  │ profiles │  │ workorders │  │field_crews│  │timeline &│ │
│  │ (Live Rows)│  │(Users/   │  │ (Dispatch) │  │ (Units)   │  │notifs    │ │
│  └─────┬──────┘  │ Officers)│  └─────┬──────┘  └─────┬─────┘  └────┬─────┘ │
└────────┼─────────┴────┬─────┴────────┼───────────────┼─────────────┼───────┘
         │              │              │               │             │
         ▼              ▼              ▼               ▼             ▼
┌────────────────────────────────────────────────────────────────────────────┐
│             DATA SERVICE & EXPRESS / SUPABASE API LAYER                    │
│  • Removes Math.max(..., 248) floors & clears static seed arrays           │
│  • Computes real-time KPIs, Ward/Dept aggregations & AI telemetry          │
│  • Applies Role Scoping:                                                   │
│      ├─ Citizen Role  ──► Filter by citizen_email === currentUser.email    │
│      ├─ Officer Role  ──► Live Municipal Queue + Workorders + Field Crews  │
│      └─ Super Admin   ──► Live Platform-Wide Ledger + Profiles + Analytics │
└───────────────┬──────────────────────────────┬─────────────────────────────┘
                │                              │
                ▼                              ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────────┐
│      CITIZEN PORTAL STATE        │  │   OFFICER & SUPER ADMIN CONSOLES     │
│  • New User: 0 Complaints,       │  │  • Live Overview KPIs (0 if empty)   │
│    0% Resolution, 0 Notifs       │  │  • Dynamic Municipality & Citizen    │
│  • Blank Report Form (Step 1) +  │  │    tables built from live profiles   │
│    Auto GPS Reverse Geocoding    │  │  • Live AI Analytics & Dossier View  │
└──────────────────────────────────┘  └──────────────────────────────────────┘
```

### Interactive State & Role Behavior Matrix

| Portal / Module | Data Source in Supabase | Behavior When Database / User Account Has 0 Records | Behavior When Live Records Exist |
| :--- | :--- | :--- | :--- |
| **Citizen Dashboard & My Complaints** | `complaints`, `notifications`, `timeline_updates` filtered by `citizen_email` | All KPI cards show `0` (`0%` resolution, `0` impact score). Table renders clean zero-state prompt to report an issue. | Displays exact count of the citizen's own complaints, live status timeline, and personal notifications. |
| **Report Issue (Page & Modal)** | Browser Geolocation API + `/api/location/reverse-geocode` + `complaints` insert | Starts at Step 1 with blank title, blank description, no pre-filled demo photos, and live auto-detected GPS address/ward. | Submits real complaint row to Supabase, triggers AI triage, and immediately updates Citizen, Officer, and Admin counters. |
| **Municipal Officer Workspace** | `complaints`, `workorders`, `field_crews`, `notifications` | Queue table, SLA breach counters, active workorders, and department bars display `0` with no hardcoded `CC10246` fallback rows. | Displays live incoming citizen complaints, allows status updates, crew dispatch, and workorder creation synced to Supabase. |
| **Super Admin Console (All 6 Tabs + Dossier)** | `complaints`, `profiles`, `workorders`, `field_crews`, `timeline_updates` | Overview KPIs, Municipality Directory, Citizen Directory, AI Analytics, and Reports show `0` across all metrics and charts. | Dynamically aggregates registered citizens, provisioned officers/municipalities, SLA compliance, and AI triage metrics from live rows. |
| **RAG AI Civic Assistant** | Live `complaints` + `stats` context + Google Maps Grounding | Informs the user that `0` complaints are currently recorded in the database while still answering general civic & location queries. | Answers natural-language questions using exact live complaint IDs, ward statistics, and status breakdowns from Supabase. |
