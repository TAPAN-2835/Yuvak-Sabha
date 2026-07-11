export interface Group {
  id: string;
  leaderName: string;
  leaderMobile: string | null;
  loginKey?: string;
  active: boolean;
}

export interface Yuvak {
  id: string;
  name: string;
  mobile: string | null;
  studyJob: string | null;
  birthDate: string | null;
  address?: string | null;
  notes?: string | null;
  groupId: string;
  active: boolean;
}

export interface Sabha {
  id: string;
  date: string;
  time?: string;
  title?: string;
  status?: "scheduled" | "completed" | "cancelled";
}

export interface AttendanceRecord {
  id?: string;
  sabhaId: string;
  yuvakId: string;
  status?: "present" | "absent";
  present: boolean;
}

export type FollowupType = "call" | "whatsapp" | "birthday_whatsapp";

export interface FollowupLog {
  id: string;
  yuvakId: string;
  groupId: string | null;
  leaderName: string;
  type: FollowupType;
  at: string;
}

export interface AppSettings {
  mandalName: string;
  sabhaDay: string;
  sabhaDayNumber: number;
  sabhaTime: string;
  sabhaTimeRaw: string;
  reminderMessage: string;
  birthdayMessage: string;
}

export interface AuthSession {
  role: "admin" | "leader";
  groupId?: string;
  leaderName?: string;
}
