import { apiFetch } from "./api-client";
import type { HabitCheckIn, UpsertCheckInInput } from "../types/check-in";

export function listCheckIns(
  habitId: string,
  range: { from?: string; to?: string } = {},
  signal?: AbortSignal
): Promise<HabitCheckIn[]> {
  return apiFetch<HabitCheckIn[]>(`/habits/${habitId}/check-ins`, { query: range, signal });
}

export function upsertCheckIn(habitId: string, input: UpsertCheckInInput): Promise<HabitCheckIn> {
  return apiFetch<HabitCheckIn>(`/habits/${habitId}/check-ins`, { method: "POST", body: input });
}

export function deleteCheckIn(habitId: string, localDate: string): Promise<void> {
  return apiFetch<void>(`/habits/${habitId}/check-ins/${localDate}`, { method: "DELETE" });
}
