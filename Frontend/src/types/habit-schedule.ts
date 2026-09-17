export type FrequencyType = "daily" | "weekly" | "monthly" | "interval";

export interface HabitSchedule {
  id: string;
  habit_id: string;
  frequency_type: FrequencyType;
  target_occurrences: number | null;
  interval_days: number | null;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitScheduleWithDays extends HabitSchedule {
  days: number[];
}

export interface CreateScheduleInput {
  frequency_type: FrequencyType;
  target_occurrences?: number;
  interval_days?: number;
  start_date?: string;
  days?: number[];
}
