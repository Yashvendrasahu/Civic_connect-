-- ============================================================
-- CIVIC CONNECT - NATIVE SUPABASE DATABASE SCHEMA, TRIGGERS & RLS
-- ============================================================
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- Uses Native Supabase Auth (auth.users), Postgres Triggers, Storage, Realtime & RLS
-- so NO service_role key is ever required!

-- 1. Create Profiles Table (automatically synced with auth.users via trigger)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '+91 98765 43210',
  role TEXT NOT NULL DEFAULT 'citizen', -- 'citizen' or 'officer'
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
    is_verified
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
    (NEW.email_confirmed_at IS NOT NULL)
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
  status TEXT NOT NULL DEFAULT 'In Progress', -- 'Needs Verification', 'Assigned', 'In Progress', 'Resolved', 'Submitted'
  priority TEXT NOT NULL DEFAULT 'Medium', -- 'Critical', 'High', 'Medium', 'Low'
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
  citizen_name TEXT DEFAULT 'Priya Sharma',
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
  officer_name TEXT DEFAULT 'Er. Rajesh Verma',
  assigned_crew TEXT NOT NULL,
  department TEXT NOT NULL,
  lead_engineer TEXT DEFAULT 'Er. R. K. Verma (AE - Zone 4)',
  instructions TEXT,
  priority TEXT DEFAULT 'High',
  sla_hours INTEGER DEFAULT 24,
  sla_deadline TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  status TEXT DEFAULT 'Dispatched', -- 'Dispatched', 'On-Site', 'Completed'
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
  status TEXT DEFAULT 'Available', -- 'Available', 'On-Site', 'En Route'
  active_tickets INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  role_target TEXT DEFAULT 'all', -- 'all', 'citizen', 'officer'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  time TEXT DEFAULT 'Just now',
  read BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'dispatch', -- 'dispatch', 'ai', 'resolved', 'alert', 'assignment'
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
-- ROW LEVEL SECURITY (RLS) - NATIVE ANON + JWT POLICIES
-- ------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_updates ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert profiles" ON public.profiles;
CREATE POLICY "Public can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
CREATE POLICY "Users can update profiles" ON public.profiles FOR UPDATE USING (true);

-- Complaints Policies
DROP POLICY IF EXISTS "Public can view complaints" ON public.complaints;
CREATE POLICY "Public can view complaints" ON public.complaints FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert complaints" ON public.complaints;
CREATE POLICY "Anyone can insert complaints" ON public.complaints FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update complaints" ON public.complaints;
CREATE POLICY "Anyone can update complaints" ON public.complaints FOR UPDATE USING (true);

-- Workorders Policies
DROP POLICY IF EXISTS "Public can view workorders" ON public.workorders;
CREATE POLICY "Public can view workorders" ON public.workorders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Officers can insert workorders" ON public.workorders;
CREATE POLICY "Officers can insert workorders" ON public.workorders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Officers can update workorders" ON public.workorders;
CREATE POLICY "Officers can update workorders" ON public.workorders FOR UPDATE USING (true);

-- Field Crews Policies
DROP POLICY IF EXISTS "Public can view field_crews" ON public.field_crews;
CREATE POLICY "Public can view field_crews" ON public.field_crews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Officers can update field_crews" ON public.field_crews;
CREATE POLICY "Officers can update field_crews" ON public.field_crews FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Officers can insert field_crews" ON public.field_crews;
CREATE POLICY "Officers can insert field_crews" ON public.field_crews FOR INSERT WITH CHECK (true);

-- Notifications Policies
DROP POLICY IF EXISTS "Public can view notifications" ON public.notifications;
CREATE POLICY "Public can view notifications" ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert notifications" ON public.notifications;
CREATE POLICY "Public can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update notifications" ON public.notifications;
CREATE POLICY "Public can update notifications" ON public.notifications FOR UPDATE USING (true);

-- Timeline Updates Policies
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

-- ------------------------------------------------------------
-- INITIAL SEED DATA (INDORE MUNICIPAL CORPORATION)
-- ------------------------------------------------------------
INSERT INTO public.profiles (id, name, email, phone, role, city, ward, department, officer_id, citizen_id, initials, designation, is_verified)
VALUES 
  ('usr_IND_8841', 'Priya Sharma', 'priya.sharma@example.com', '+91 98765 43210', 'citizen', 'Indore, Madhya Pradesh', 'Ward 18, Zone 4', NULL, NULL, '#IND-8841', 'PS', 'Verified Citizen', true),
  ('officer_IND_PWD_8429', 'Er. Rajesh Verma', 'rajesh.sharma@indore.gov.in', '+91 98260 41290', 'officer', 'Indore Municipal Corporation', 'Zone 04 (Wards 18-24)', 'Roads & Infrastructure', 'IMC-ENG-0842', NULL, 'RV', 'Superintending Engineer (Roads & Infrastructure)', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.field_crews (id, name, department, ward_zone, lead_name, contact_phone, vehicle_no, crew_size, status, active_tickets)
VALUES
  ('CREW-PWD-04', 'Indore PWD Road Maintenance Squad #04', 'Roads & Infrastructure', 'Zone 04 (Wards 18-24)', 'Mohan Lal Patidar', '+91 98260 44104', 'MP09-CZ-8821', 8, 'On-Site', 2),
  ('CREW-SWM-08', 'Swachh Indore Rapid Compactor Squad #08', 'Sanitation & Waste', 'Zone 04 (Wards 18-24)', 'Rameshwar Solanki', '+91 98260 44108', 'MP09-SW-1108', 5, 'En Route', 1),
  ('CREW-ELC-02', 'Municipal Electrical Rapid Unit #02', 'Electrical & Street Lighting', 'Zone 04 (Wards 12-20)', 'Er. Vivek Tiwari', '+91 98260 44102', 'MP09-EL-4410', 4, 'Available', 0),
  ('CREW-WTR-01', 'Narmada Water Works Rapid Response #01', 'Water Supply & Sewerage', 'Zone 04 (Wards 18-25)', 'SureshChandra Dubey', '+91 98260 44101', 'MP09-WT-2091', 6, 'Available', 1),
  ('CREW-HRT-03', 'Horticulture & Urban Forestry Squad #03', 'Parks & Greenery', 'Zone 04 (Wards 18-24)', 'Kailash Parmar', '+91 98260 44103', 'MP09-HR-3312', 5, 'Available', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (
  id, title, category, location, ward, geo, reported, timestamp, status, priority,
  assigned_team, confidence, ai_detected, dimensions, severity_level, department,
  image, description, steps, dispatch_note, citizen_name, citizen_email, upvotes, sla_hours, sla_status
)
VALUES 
(
  'CC10245',
  'Severe Road Pothole Near Vijay Nagar Square',
  'Roads & Infrastructure',
  'Vijay Nagar Square, Near Orbit Mall, Indore',
  'Ward 18',
  '22.7533° N, 75.8937° E',
  '2 hours ago',
  'Today, 08:30 AM',
  'In Progress',
  'High',
  'Indore PWD Road Maintenance Squad #04',
  '98.4%',
  'Asphalt Crater Defect',
  '1.2m x 0.8m, Depth ~14cm',
  'High (Vehicle Hazard)',
  'Roads & Infrastructure',
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  'Dangerous road fissure and pothole on the fast lane causing traffic slowdown and two-wheeler hazard. Immediate asphalt repaving needed.',
  '[
    {"step": 1, "title": "1. Submitted", "subtitle": "Today, 08:30 AM • Confirmed", "status": "completed"},
    {"step": 2, "title": "2. AI Verified", "subtitle": "98.4% Confidence • High Hazard", "status": "completed"},
    {"step": 3, "title": "3. Assigned", "subtitle": "Road Maintenance Wing", "status": "completed"},
    {"step": 4, "title": "4. In Progress", "subtitle": "Truck #04 On-Site (ETA 45m)", "status": "current"},
    {"step": 5, "title": "5. Resolved", "subtitle": "Quality Check Pending", "status": "upcoming"}
  ]'::jsonb,
  'Dispatched Heavy Patchwork Truck #04 with 8 crew members. Bitumen mix deployed on site.',
  'Priya Sharma',
  'priya.sharma@example.com',
  14,
  24,
  'Due in 5h 30m'
),
(
  'CC10244',
  'Overflowing Municipal Garbage Bin at Palasia',
  'Sanitation & Waste',
  'Old Palasia Main Market, Indore',
  'Ward 19',
  '22.7244° N, 75.8839° E',
  'Yesterday',
  'Yesterday, 04:15 PM',
  'In Progress',
  'Medium',
  'Swachh Indore Rapid Compactor Squad #08',
  '96.1%',
  'Commercial Waste Spill',
  'Community Dumpster 100% Full',
  'Medium (Sanitation Alert)',
  'Sanitation & Waste',
  'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
  'Solid waste container overflowed onto pedestrian walkway. Odor nuisance reported by local shopkeepers.',
  '[
    {"step": 1, "title": "1. Submitted", "subtitle": "Yesterday, 04:15 PM", "status": "completed"},
    {"step": 2, "title": "2. AI Verified", "subtitle": "96.1% Confidence • High Spill", "status": "completed"},
    {"step": 3, "title": "3. Assigned", "subtitle": "Swachh Indore Squad #08", "status": "completed"},
    {"step": 4, "title": "4. In Progress", "subtitle": "Compactor en route", "status": "current"},
    {"step": 5, "title": "5. Resolved", "subtitle": "Awaiting clean sweep photo", "status": "upcoming"}
  ]'::jsonb,
  'Hydraulic garbage compactor dispatched. Clean sweep scheduled before 11:00 AM.',
  'Priya Sharma',
  'priya.sharma@example.com',
  8,
  48,
  'On Track'
),
(
  'CC10243',
  'Faulty Street Light Pole at Rajwada Ring Road',
  'Electricity & Lighting',
  'Rajwada Palace Outer Circle, Ward 12, Indore',
  'Ward 12',
  '22.7196° N, 75.8577° E',
  '3 days ago',
  '08 Oct 2026, 07:10 PM',
  'Resolved',
  'Low',
  'Municipal Electrical Rapid Unit #02',
  '99.2%',
  'LED Luminaire Power Defect',
  'Pole #RW-104',
  'Low (Night Visibility Issue)',
  'Electrical & Street Lighting',
  'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
  'High mast LED streetlight pole not turning on past twilight hours causing poor pedestrian safety.',
  '[
    {"step": 1, "title": "1. Submitted", "subtitle": "08 Oct 2026, 07:10 PM", "status": "completed"},
    {"step": 2, "title": "2. AI Verified", "subtitle": "99.2% Confidence • Verified", "status": "completed"},
    {"step": 3, "title": "3. Assigned", "subtitle": "Electrical Dept Unit 2", "status": "completed"},
    {"step": 4, "title": "4. In Progress", "subtitle": "Ballast Replacement", "status": "completed"},
    {"step": 5, "title": "5. Resolved", "subtitle": "Tested & Verified Working", "status": "completed"}
  ]'::jsonb,
  'LED driver and photocell timer replaced. Luminaire verified active by Ward Junior Engineer.',
  'Priya Sharma',
  'priya.sharma@example.com',
  5,
  72,
  'Resolved Within SLA'
),
(
  'CC10242',
  'Drinking Water Pipeline Leakage at Bengali Square',
  'Water & Sewage',
  'Bengali Square By-Pass, Ward 22, Indore',
  'Ward 22',
  '22.7301° N, 75.9102° E',
  '4 days ago',
  '07 Oct 2026, 11:20 AM',
  'Resolved',
  'High',
  'Narmada Water Works Rapid Response #01',
  '95.8%',
  'Pressurized Pipe Fracture',
  '150mm Sub-main Joint Fissure',
  'High (Freshwater Loss)',
  'Water Supply & Sewerage',
  'https://images.unsplash.com/photo-1541888946425-d0fbb18f1562?auto=format&fit=crop&w=800&q=80',
  'Underground Narmada supply line burst causing high volume clean water spill on asphalt road.',
  '[
    {"step": 1, "title": "1. Submitted", "subtitle": "07 Oct 2026, 11:20 AM", "status": "completed"},
    {"step": 2, "title": "2. AI Verified", "subtitle": "95.8% Confidence", "status": "completed"},
    {"step": 3, "title": "3. Assigned", "subtitle": "Narmada Water Works Unit", "status": "completed"},
    {"step": 4, "title": "4. In Progress", "subtitle": "Clamp Sealed on Conduit", "status": "completed"},
    {"step": 5, "title": "5. Resolved", "subtitle": "Pressure Normalized", "status": "completed"}
  ]'::jsonb,
  'Heavy duty stainless clamp installed. Pressure test passed at 4.2 bar.',
  'Priya Sharma',
  'priya.sharma@example.com',
  19,
  24,
  'Resolved Within SLA'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workorders (id, complaint_id, officer_id, officer_name, assigned_crew, department, lead_engineer, instructions, priority, sla_hours, status)
VALUES
  ('WO-2026-841', 'CC10245', 'IMC-ENG-0842', 'Er. Rajesh Verma', 'Indore PWD Road Maintenance Squad #04', 'Roads & Infrastructure', 'Er. R. K. Verma (AE - Zone 4)', 'Deploy rapid hot-mix asphalt patch unit. Ensure traffic cones are placed 30m prior to Metro Pillar 114.', 'High', 24, 'On-Site'),
  ('WO-2026-840', 'CC10244', 'IMC-ENG-0842', 'Er. Rajesh Verma', 'Swachh Indore Rapid Compactor Squad #08', 'Sanitation & Waste', 'Dr. Anand Mehta (CSO - Zone 4)', 'Clear spill, spray bio-enzyme deodorizer, and verify clean sweep photo.', 'Medium', 48, 'Dispatched')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notifications (id, role_target, title, message, time, read, type, ticket_id)
VALUES 
  ('notif-1', 'all', 'Field Team Dispatched', 'Repair Unit 4 has arrived at Vijay Nagar Square for Ticket #CC10245.', '15 mins ago', false, 'dispatch', 'CC10245'),
  ('notif-2', 'all', 'Complaint Verified by AI', 'Computer vision analysis verified high-priority road defect with 98.4% confidence.', '1 hour ago', false, 'ai', 'CC10245'),
  ('notif-3', 'all', 'Ticket #CC10243 Resolved', 'Street light repair at Rajwada Ring Road has been closed and inspected.', '1 day ago', true, 'resolved', 'CC10243')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.timeline_updates (id, ticket_id, time, actor, action, description, type)
VALUES
  ('upd-1', 'CC10245', '15 min ago', 'Municipal Dispatcher', 'Field Unit Dispatched', 'Repair vehicle #04 deployed with 8 technicians and hot-mix bitumen patch equipment.', 'dispatch'),
  ('upd-2', 'CC10245', '1 hour ago', 'AI Vision Engine', 'Automated Severity Assessment', 'Severity Level 4 (High Vehicle Hazard) confirmed with 98.4% model confidence.', 'ai'),
  ('upd-3', 'CC10245', '2 hours ago', 'Priya Sharma (Citizen)', 'Complaint Filed', 'Citizen report submitted with geo-tagged photograph near Vijay Nagar Square.', 'created')
ON CONFLICT (id) DO NOTHING;
