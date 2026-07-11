export interface DbGroup {
  id: string;
  leader_name: string;
  leader_mobile: string | null;
  login_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbYuvak {
  id: string;
  name: string;
  mobile: string | null;
  birth_date: string | null;
  study_job: string | null;
  address: string | null;
  notes: string | null;
  group_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbSabha {
  id: string;
  sabha_date: string;
  sabha_time: string;
  title: string;
  status: "scheduled" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface DbAttendance {
  id: string;
  sabha_id: string;
  yuvak_id: string;
  status: "present" | "absent";
  created_at: string;
  updated_at: string;
}

export interface DbFollowupLog {
  id: string;
  yuvak_id: string;
  group_id: string | null;
  leader_name: string;
  action_type: "call" | "whatsapp" | "birthday_whatsapp";
  created_at: string;
}

export interface DbAppSettings {
  id: number;
  mandal_name: string;
  sabha_day: number;
  sabha_time: string;
  reminder_message: string;
  birthday_message: string;
  updated_at: string;
}
