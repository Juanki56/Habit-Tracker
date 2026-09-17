import { apiFetch } from "./api-client";
import type { Activity, CreateActivityInput, UpdateActivityInput } from "../types/activity";

export function listActivities(
  habitId: string,
  filters: { from?: string; to?: string; activity_type_id?: string } = {},
  signal?: AbortSignal
): Promise<Activity[]> {
  return apiFetch<Activity[]>(`/habits/${habitId}/activities`, { query: filters, signal });
}

export function getActivity(habitId: string, activityId: string, signal?: AbortSignal): Promise<Activity> {
  return apiFetch<Activity>(`/habits/${habitId}/activities/${activityId}`, { signal });
}

export function createActivity(habitId: string, input: CreateActivityInput): Promise<Activity> {
  return apiFetch<Activity>(`/habits/${habitId}/activities`, { method: "POST", body: input });
}

export function updateActivity(
  habitId: string,
  activityId: string,
  input: UpdateActivityInput
): Promise<Activity> {
  return apiFetch<Activity>(`/habits/${habitId}/activities/${activityId}`, { method: "PATCH", body: input });
}

export function deleteActivity(habitId: string, activityId: string): Promise<void> {
  return apiFetch<void>(`/habits/${habitId}/activities/${activityId}`, { method: "DELETE" });
}
