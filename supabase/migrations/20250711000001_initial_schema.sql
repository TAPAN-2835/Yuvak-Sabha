-- BAPS Yuvak Sabha schema
-- Run in Supabase SQL Editor in order

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. groups
CREATE TABLE IF NOT EXISTS public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_name text NOT NULL,
  leader_mobile text,
  login_key text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_groups_leader_name_lower ON public.groups (lower(leader_name));
CREATE INDEX IF NOT EXISTS idx_groups_login_key ON public.groups (login_key);

CREATE TRIGGER groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. yuvaks
CREATE TABLE IF NOT EXISTS public.yuvaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile text,
  birth_date date,
  study_job text,
  address text,
  notes text,
  group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_yuvaks_group_id ON public.yuvaks (group_id);
CREATE INDEX IF NOT EXISTS idx_yuvaks_name_lower ON public.yuvaks (lower(name));
CREATE INDEX IF NOT EXISTS idx_yuvaks_mobile ON public.yuvaks (mobile);
CREATE INDEX IF NOT EXISTS idx_yuvaks_birth_date ON public.yuvaks (birth_date);

CREATE TRIGGER yuvaks_updated_at
  BEFORE UPDATE ON public.yuvaks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. sabhas
CREATE TABLE IF NOT EXISTS public.sabhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sabha_date date NOT NULL UNIQUE,
  sabha_time time NOT NULL DEFAULT '20:30',
  title text NOT NULL DEFAULT 'Yuvak Sabha',
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sabhas_status_check CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_sabhas_sabha_date ON public.sabhas (sabha_date);

CREATE TRIGGER sabhas_updated_at
  BEFORE UPDATE ON public.sabhas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sabha_id uuid NOT NULL REFERENCES public.sabhas(id) ON DELETE CASCADE,
  yuvak_id uuid NOT NULL REFERENCES public.yuvaks(id) ON DELETE CASCADE,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sabha_id, yuvak_id),
  CONSTRAINT attendance_status_check CHECK (status IN ('present', 'absent'))
);

CREATE INDEX IF NOT EXISTS idx_attendance_sabha_id ON public.attendance (sabha_id);
CREATE INDEX IF NOT EXISTS idx_attendance_yuvak_id ON public.attendance (yuvak_id);

CREATE TRIGGER attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. followup_logs
CREATE TABLE IF NOT EXISTS public.followup_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  yuvak_id uuid NOT NULL REFERENCES public.yuvaks(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL,
  leader_name text NOT NULL,
  action_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT followup_action_type_check CHECK (action_type IN ('call', 'whatsapp', 'birthday_whatsapp'))
);

CREATE INDEX IF NOT EXISTS idx_followup_logs_group_id ON public.followup_logs (group_id);
CREATE INDEX IF NOT EXISTS idx_followup_logs_created_at ON public.followup_logs (created_at);

-- 6. app_settings (single row)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id integer PRIMARY KEY DEFAULT 1,
  mandal_name text NOT NULL DEFAULT 'BAPS Yuvak Mandal',
  sabha_day integer NOT NULL DEFAULT 6,
  sabha_time time NOT NULL DEFAULT '20:30',
  reminder_message text NOT NULL,
  birthday_message text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_settings_single_row CHECK (id = 1)
);

CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
