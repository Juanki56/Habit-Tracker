import { apiFetch } from "./api-client";
import type { HabitActivityTypeAssignment } from "../types/activity";

export function listForHabit(
  habitId: string,
  signal?: AbortSignal
): Promise<HabitActivityTypeAssignment[]> {
  return apiFetch<HabitActivityTypeAssignment[]>(`/habits/${habitId}/activity-types`, { signal });
}

export function attach(habitId: string, activityTypeId: string): Promise<HabitActivityTypeAssignment> {
  return apiFetch<HabitActivityTypeAssignment>(`/habits/${habitId}/activity-types`, {
    method: "POST",
    body: { activity_type_id: activityTypeId },
  });
}

export function detach(habitId: string, activityTypeId: string): Promise<void> {
  return apiFetch<void>(`/habits/${habitId}/activity-types/${activityTypeId}`, { method: "DELETE" });
}
