import { apiFetch } from "./api-client";
import type { ActivityType, CreateActivityTypeInput, FieldDefinition } from "../types/activity";

export function listActivityTypes(signal?: AbortSignal): Promise<ActivityType[]> {
  return apiFetch<ActivityType[]>("/activity-types", { signal });
}

export function createActivityType(input: CreateActivityTypeInput): Promise<ActivityType> {
  return apiFetch<ActivityType>("/activity-types", { method: "POST", body: input });
}

export function updateActivityType(id: string, input: { name?: string; description?: string }): Promise<ActivityType> {
  return apiFetch<ActivityType>(`/activity-types/${id}`, { method: "PATCH", body: input });
}

export function listFieldDefinitions(
  activityTypeId: string,
  signal?: AbortSignal
): Promise<FieldDefinition[]> {
  return apiFetch<FieldDefinition[]>(`/activity-types/${activityTypeId}/fields`, { signal });
}
