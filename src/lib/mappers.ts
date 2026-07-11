import type { AppSettings, AttendanceRecord, FollowupLog, Group, Sabha, Yuvak } from "@/types";
import type {
  DbAppSettings,
  DbAttendance,
  DbFollowupLog,
  DbGroup,
  DbSabha,
  DbYuvak,
} from "@/types/database";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function mapGroup(row: DbGroup): Group {
  return {
    id: row.id,
    leaderName: row.leader_name,
    leaderMobile: row.leader_mobile,
    loginKey: row.login_key,
    active: row.is_active,
  };
}

export function mapYuvak(row: DbYuvak): Yuvak {
  return {
    id: row.id,
    name: row.name,
    mobile: row.mobile,
    birthDate: row.birth_date,
    studyJob: row.study_job,
    address: row.address,
    notes: row.notes,
    groupId: row.group_id ?? "",
    active: row.is_active,
  };
}

export function mapSabha(row: DbSabha): Sabha {
  return {
    id: row.id,
    date: row.sabha_date,
    time: row.sabha_time,
    title: row.title,
    status: row.status,
  };
}

export function mapAttendance(row: DbAttendance): AttendanceRecord {
  return {
    id: row.id,
    sabhaId: row.sabha_id,
    yuvakId: row.yuvak_id,
    status: row.status,
    present: row.status === "present",
  };
}

export function mapFollowup(row: DbFollowupLog): FollowupLog {
  return {
    id: row.id,
    yuvakId: row.yuvak_id,
    groupId: row.group_id,
    leaderName: row.leader_name,
    type: row.action_type,
    at: row.created_at,
  };
}

export function mapSettings(row: DbAppSettings): AppSettings {
  const time = row.sabha_time?.slice(0, 5) ?? "20:30";
  const [h, m] = time.split(":").map(Number);
  const hour12 = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";
  return {
    mandalName: row.mandal_name,
    sabhaDay: DAY_NAMES[row.sabha_day] ?? "Saturday",
    sabhaDayNumber: row.sabha_day,
    sabhaTime: `${hour12}:${String(m).padStart(2, "0")} ${ampm}`,
    sabhaTimeRaw: time,
    reminderMessage: row.reminder_message,
    birthdayMessage: row.birthday_message,
  };
}

export function groupToInsert(leaderName: string, leaderMobile: string | null, loginKey: string) {
  return {
    leader_name: leaderName,
    leader_mobile: leaderMobile,
    login_key: loginKey,
    is_active: true,
  };
}

export function yuvakToInsert(data: {
  name: string;
  mobile: string | null;
  birthDate: string | null;
  studyJob: string | null;
  address?: string | null;
  notes?: string | null;
  groupId: string;
  active?: boolean;
}) {
  return {
    name: data.name,
    mobile: data.mobile,
    birth_date: data.birthDate,
    study_job: data.studyJob,
    address: data.address ?? null,
    notes: data.notes ?? null,
    group_id: data.groupId,
    is_active: data.active ?? true,
  };
}
