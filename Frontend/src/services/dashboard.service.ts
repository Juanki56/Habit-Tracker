import { apiFetch } from "./api-client";
import type { HabitDashboard, HabitOverviewItem } from "../types/dashboard";

export function getOverview(signal?: AbortSignal): Promise<HabitOverviewItem[]> {
  return apiFetch<HabitOverviewItem[]>("/dashboard", { signal });
}

export function getHabitDashboard(
  habitId: string,
  days = 14,
  signal?: AbortSignal
): Promise<HabitDashboard> {
  return apiFetch<HabitDashboard>(`/habits/${habitId}/dashboard`, {
    query: { days: String(days) },
    signal,
  });
}
