-- RLS policies for frontend-only auth model
-- TEMPORARY INTERNAL-APP POLICY — REPLACE WITH AUTH-BASED RLS BEFORE PUBLIC RELEASE
-- These policies allow anon key read/write for internal mandal use only.

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yuvaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sabhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- groups: read active, admin CRUD via anon
CREATE POLICY "TEMP groups select active"
  ON public.groups FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "TEMP groups select all for admin UI"
  ON public.groups FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "TEMP groups insert"
  ON public.groups FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "TEMP groups update"
  ON public.groups FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

-- yuvaks
CREATE POLICY "TEMP yuvaks select active"
  ON public.yuvaks FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "TEMP yuvaks select all for admin UI"
  ON public.yuvaks FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "TEMP yuvaks insert"
  ON public.yuvaks FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "TEMP yuvaks update"
  ON public.yuvaks FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

-- sabhas
CREATE POLICY "TEMP sabhas select"
  ON public.sabhas FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "TEMP sabhas insert"
  ON public.sabhas FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "TEMP sabhas update"
  ON public.sabhas FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

-- attendance
CREATE POLICY "TEMP attendance select"
  ON public.attendance FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "TEMP attendance insert"
  ON public.attendance FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "TEMP attendance update"
  ON public.attendance FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

-- followup_logs
CREATE POLICY "TEMP followup_logs select"
  ON public.followup_logs FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "TEMP followup_logs insert"
  ON public.followup_logs FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- app_settings
CREATE POLICY "TEMP app_settings select"
  ON public.app_settings FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "TEMP app_settings update"
  ON public.app_settings FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "TEMP app_settings insert"
  ON public.app_settings FOR INSERT TO anon, authenticated
  WITH CHECK (id = 1);
