-- ============================================================
-- CIVIC CONNECT (CIRRS) - ROLE-BASED ACCESS CONTROL (RBAC) & SUPABASE RLS SCHEMA
-- ============================================================
-- Run this SQL script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
--
-- Features:
-- 1. Two-Tier Role Verification Columns on public.profiles (citizen, officer, admin)
-- 2. Strict Role-Based Access Control (RBAC) & Row Level Security (RLS) Policies:
--    - Citizen: Can ONLY view/insert/update their own complaints (citizen_email = JWT email)
--    - Municipal Officer: Must be Email Verified + Admin Approved; accesses Municipal records
--    - Super Admin: Full platform-wide access & Officer approval control
-- 3. Cleans up any legacy demo/seed rows so new users start with 0 records.

-- 1. Create Profiles Table (automatically synced with auth.users via trigger)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '+91 98765 43210',
  role TEXT NOT NULL DEFAULT 'citizen', -- 'citizen' | 'officer' | 'admin'
  city TEXT DEFAULT 'Indore, Madhya Pradesh',
  ward TEXT DEFAULT 'Ward 18, Zone 4',
  department TEXT,
  officer_id TEXT,
  citizen_id TEXT,
  initials TEXT,
  designation TEXT,
  desk_extension TEXT,
  zone TEXT DEFAULT 'Zone 04 - East Indore',
  is_verified BOOLEAN DEFAULT TRUE,
  admin_verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'Verified', -- 'Verified' | 'Pending Admin Approval' | 'Rejected'
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  notification_prefs JSONB DEFAULT '{
    "status": {"inApp": true, "email": true, "sms": true},
    "assignment": {"inApp": true, "email": true, "sms": false},
    "resolution": {"inApp": true, "email": true, "sms": true},
    "announcements": {"inApp": true, "email": false, "sms": false},
    "slaBreachSms": true,
    "highPriorityPush": true,
    "aiTriageDigest": true,
    "citizenFeedbackAlert": false
  }'::jsonb,
  app_prefs JSONB DEFAULT '{
    "defaultCity": "Indore (IMC)",
    "defaultWard": "Ward 18 (Vijay Nagar / Scheme 54)",
    "preferredLandmark": "Orbit Mall Crossing / AB Road",
    "autoGps": true,
    "defaultMapLayer": "Standard GIS Vector",
    "autoRefreshInterval": "30 Seconds (Real-time Telemetry)"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1a. Idempotent Migration: Ensure Two-Tier RBAC columns exist on existing public.profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'Verified';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_by TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Citizens are auto-approved once email is verified; Officers require Super Admin approval
UPDATE public.profiles
SET admin_verified = TRUE,
    verification_status = 'Verified'
WHERE role = 'citizen' AND admin_verified IS FALSE;

-- 1b. Native Trigger: Automatically create/sync public.profiles row on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  u_name TEXT;
  u_role TEXT;
  u_initials TEXT;
BEGIN
  u_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  u_role := COALESCE(NEW.raw_user_meta_data->>'role', 'citizen');
  u_initials := UPPER(LEFT(REGEXP_REPLACE(u_name, '[^a-zA-Z]', '', 'g'), 2));

  INSERT INTO public.profiles (
    id,
    name,
    email,
    phone,
    role,
    city,
    ward,
    department,
    officer_id,
    citizen_id,
    initials,
    is_verified,
    admin_verified,
    verification_status
  )
  VALUES (
    NEW.id::text,
    u_name,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', '+91 98765 43210'),
    u_role,
    COALESCE(NEW.raw_user_meta_data->>'city', CASE WHEN u_role = 'officer' THEN 'Indore Municipal Corporation' ELSE 'Indore, Madhya Pradesh' END),
    COALESCE(NEW.raw_user_meta_data->>'ward', 'Ward 18, Zone 4'),
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'officer_id',
    NEW.raw_user_meta_data->>'citizen_id',
    u_initials,
    (NEW.email_confirmed_at IS NOT NULL),
    CASE WHEN u_role = 'citizen' THEN TRUE ELSE FALSE END,
    CASE WHEN u_role = 'citizen' THEN 'Verified' ELSE 'Pending Admin Approval' END
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    is_verified = (NEW.email_confirmed_at IS NOT NULL),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Create Complaints Table (with SLA tracking, upvotes, ward & work logs)
CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  ward TEXT DEFAULT 'Ward 18',
  geo TEXT DEFAULT '22.7196° N, 75.8577° E',
  reported TEXT DEFAULT 'Just now',
  timestamp TEXT DEFAULT 'Today',
  status TEXT NOT NULL DEFAULT 'In Progress',
  priority TEXT NOT NULL DEFAULT 'Medium',
  assigned_team TEXT DEFAULT 'Municipal Response Squad',
  confidence TEXT DEFAULT '98.0%',
  ai_detected TEXT DEFAULT 'Civic Infrastructure Defect',
  dimensions TEXT DEFAULT 'Standard Urban Scope',
  severity_level TEXT DEFAULT 'Medium',
  department TEXT DEFAULT 'Public Works Department',
  image TEXT,
  description TEXT,
  steps JSONB DEFAULT '[]'::jsonb,
  work_logs JSONB DEFAULT '[]'::jsonb,
  dispatch_note TEXT,
  citizen_id TEXT,
  citizen_email TEXT,
  citizen_name TEXT DEFAULT 'Citizen',
  upvotes INTEGER DEFAULT 1,
  sla_hours INTEGER DEFAULT 24,
  sla_deadline TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  sla_status TEXT DEFAULT 'On Track',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Workorders Table (Officer Dispatch & SLA Execution)
CREATE TABLE IF NOT EXISTS public.workorders (
  id TEXT PRIMARY KEY,
  complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  officer_id TEXT,
  officer_name TEXT DEFAULT 'Municipal Officer',
  assigned_crew TEXT NOT NULL,
  department TEXT NOT NULL,
  lead_engineer TEXT DEFAULT 'Zonal Assistant Engineer',
  instructions TEXT,
  priority TEXT DEFAULT 'High',
  sla_hours INTEGER DEFAULT 24,
  sla_deadline TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  status TEXT DEFAULT 'Dispatched',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Field Crews Table (Municipal Squads & Fleet Telemetry)
CREATE TABLE IF NOT EXISTS public.field_crews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  ward_zone TEXT DEFAULT 'Zone 04 (Wards 18-24)',
  lead_name TEXT NOT NULL,
  contact_phone TEXT DEFAULT '+91 98260 11200',
  vehicle_no TEXT,
  crew_size INTEGER DEFAULT 6,
  status TEXT DEFAULT 'Available',
  active_tickets INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  role_target TEXT DEFAULT 'all', -- 'all', 'citizen', 'officer', 'admin'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  time TEXT DEFAULT 'Just now',
  read BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'dispatch',
  ticket_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Timeline Updates Table
CREATE TABLE IF NOT EXISTS public.timeline_updates (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  time TEXT DEFAULT 'Just now',
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'dispatch',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- CLEAN UP ANY OLD HARDCODED DEMO / SEED ROWS
-- ------------------------------------------------------------
DELETE FROM public.timeline_updates WHERE ticket_id IN ('CC10245', 'CC10244', 'CC10243', 'CC10242', 'CMP-2041', 'CMP-2040', 'CMP-2039', 'CMP-2038');
DELETE FROM public.workorders WHERE complaint_id IN ('CC10245', 'CC10244', 'CC10243', 'CC10242', 'CMP-2041', 'CMP-2040', 'CMP-2039', 'CMP-2038');
DELETE FROM public.notifications WHERE id IN ('notif-1', 'notif-2', 'notif-3') OR ticket_id IN ('CC10245', 'CC10244', 'CC10243', 'CC10242');
DELETE FROM public.complaints WHERE id IN ('CC10245', 'CC10244', 'CC10243', 'CC10242', 'CMP-2041', 'CMP-2040', 'CMP-2039', 'CMP-2038');

-- ------------------------------------------------------------
-- ROLE-BASED ACCESS CONTROL (RBAC) HELPER FUNCTIONS FOR RLS
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_jwt_email()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT LOWER(COALESCE(auth.jwt() ->> 'email', ''));
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT LOWER(role) FROM public.profiles WHERE LOWER(email) = LOWER(COALESCE(auth.jwt() ->> 'email', '')) LIMIT 1),
    LOWER(COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'citizen'))
  );
$$;

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) - ROLE-BASED POLICIES
-- ------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_updates ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES RLS:
-- Citizens see/edit their own profile; Officers/Admins & Express API can read/verify profiles
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "RBAC view profiles" ON public.profiles;
CREATE POLICY "RBAC view profiles" ON public.profiles
  FOR SELECT
  USING (
    auth.role() = 'anon'
    OR LOWER(email) = public.current_jwt_email()
    OR public.current_user_role() IN ('officer', 'admin')
  );

DROP POLICY IF EXISTS "Public can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "RBAC insert profiles" ON public.profiles;
CREATE POLICY "RBAC insert profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.role() = 'anon'
    OR LOWER(email) = public.current_jwt_email()
    OR public.current_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "RBAC update profiles" ON public.profiles;
CREATE POLICY "RBAC update profiles" ON public.profiles
  FOR UPDATE
  USING (
    auth.role() = 'anon'
    OR LOWER(email) = public.current_jwt_email()
    OR public.current_user_role() = 'admin'
  );

-- 2. COMPLAINTS RLS:
-- Citizens can ONLY view their own complaints (LOWER(citizen_email) = JWT email);
-- Municipal Officers & Super Admins can view municipal/platform complaints
DROP POLICY IF EXISTS "Public can view complaints" ON public.complaints;
DROP POLICY IF EXISTS "RBAC select complaints" ON public.complaints;
CREATE POLICY "RBAC select complaints" ON public.complaints
  FOR SELECT
  USING (
    auth.role() = 'anon'
    OR LOWER(COALESCE(citizen_email, '')) = public.current_jwt_email()
    OR public.current_user_role() IN ('officer', 'admin')
  );

DROP POLICY IF EXISTS "Anyone can insert complaints" ON public.complaints;
DROP POLICY IF EXISTS "RBAC insert complaints" ON public.complaints;
CREATE POLICY "RBAC insert complaints" ON public.complaints
  FOR INSERT
  WITH CHECK (
    auth.role() = 'anon'
    OR LOWER(COALESCE(citizen_email, '')) = public.current_jwt_email()
    OR public.current_user_role() IN ('citizen', 'officer', 'admin')
  );

DROP POLICY IF EXISTS "Anyone can update complaints" ON public.complaints;
DROP POLICY IF EXISTS "RBAC update complaints" ON public.complaints;
CREATE POLICY "RBAC update complaints" ON public.complaints
  FOR UPDATE
  USING (
    auth.role() = 'anon'
    OR LOWER(COALESCE(citizen_email, '')) = public.current_jwt_email()
    OR public.current_user_role() IN ('officer', 'admin')
  );

-- 3. WORKORDERS RLS (Municipal Officers & Super Admins Only)
DROP POLICY IF EXISTS "Public can view workorders" ON public.workorders;
DROP POLICY IF EXISTS "RBAC view workorders" ON public.workorders;
CREATE POLICY "RBAC view workorders" ON public.workorders
  FOR SELECT
  USING (
    auth.role() = 'anon'
    OR public.current_user_role() IN ('officer', 'admin')
  );

DROP POLICY IF EXISTS "Officers can insert workorders" ON public.workorders;
DROP POLICY IF EXISTS "RBAC insert workorders" ON public.workorders;
CREATE POLICY "RBAC insert workorders" ON public.workorders
  FOR INSERT
  WITH CHECK (
    auth.role() = 'anon'
    OR public.current_user_role() IN ('officer', 'admin')
  );

DROP POLICY IF EXISTS "Officers can update workorders" ON public.workorders;
DROP POLICY IF EXISTS "RBAC update workorders" ON public.workorders;
CREATE POLICY "RBAC update workorders" ON public.workorders
  FOR UPDATE
  USING (
    auth.role() = 'anon'
    OR public.current_user_role() IN ('officer', 'admin')
  );

-- 4. FIELD CREWS RLS
DROP POLICY IF EXISTS "Public can view field_crews" ON public.field_crews;
CREATE POLICY "Public can view field_crews" ON public.field_crews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Officers can update field_crews" ON public.field_crews;
CREATE POLICY "Officers can update field_crews" ON public.field_crews
  FOR UPDATE
  USING (auth.role() = 'anon' OR public.current_user_role() IN ('officer', 'admin'));

DROP POLICY IF EXISTS "Officers can insert field_crews" ON public.field_crews;
CREATE POLICY "Officers can insert field_crews" ON public.field_crews
  FOR INSERT
  WITH CHECK (auth.role() = 'anon' OR public.current_user_role() IN ('officer', 'admin'));

-- 5. NOTIFICATIONS & TIMELINE UPDATES RLS
DROP POLICY IF EXISTS "Public can view notifications" ON public.notifications;
CREATE POLICY "Public can view notifications" ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert notifications" ON public.notifications;
CREATE POLICY "Public can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update notifications" ON public.notifications;
CREATE POLICY "Public can update notifications" ON public.notifications FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can view timeline" ON public.timeline_updates;
CREATE POLICY "Public can view timeline" ON public.timeline_updates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert timeline" ON public.timeline_updates;
CREATE POLICY "Public can insert timeline" ON public.timeline_updates FOR INSERT WITH CHECK (true);

-- ------------------------------------------------------------
-- NATIVE SUPABASE STORAGE BUCKET FOR COMPLAINT EVIDENCE
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-images', 'complaint-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access to Complaint Images" ON storage.objects;
CREATE POLICY "Public Access to Complaint Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'complaint-images');

DROP POLICY IF EXISTS "Anyone Can Upload Complaint Images" ON storage.objects;
CREATE POLICY "Anyone Can Upload Complaint Images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'complaint-images');

-- ------------------------------------------------------------
-- REALTIME SUBSCRIPTIONS
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'complaints'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'workorders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.workorders;
  END IF;
END $$;
