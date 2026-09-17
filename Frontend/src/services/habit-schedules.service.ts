import { apiFetch } from "./api-client";
import type { CreateScheduleInput, HabitScheduleWithDays } from "../types/habit-schedule";

export function getCurrentSchedule(
  habitId: string,
  signal?: AbortSignal
): Promise<HabitScheduleWithDays | null> {
  return apiFetch<HabitScheduleWithDays | null>(`/habits/${habitId}/schedules/current`, { signal });
}

export function createSchedule(
  habitId: string,
  input: CreateScheduleInput
): Promise<HabitScheduleWithDays> {
  return apiFetch<HabitScheduleWithDays>(`/habits/${habitId}/schedules`, { method: "POST", body: input });
}
