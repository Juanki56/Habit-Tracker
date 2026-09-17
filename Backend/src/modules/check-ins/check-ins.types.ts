export type CheckInStatus = "completed" | "skipped";

export interface HabitCheckIn {
  id: string;
  habit_id: string;
  local_date: string;
  status: CheckInStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertCheckInInput {
  local_date?: string; // si no se manda, se usa la fecha de hoy (UTC) como respaldo
  status: CheckInStatus;
  note?: string;
}