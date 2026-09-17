import { apiFetch } from "./api-client";
import type {
  CreateResourceInput, ResourceType, ResourceWithBook, UpdateBookInput, UpdateResourceInput,
} from "../types/resource";

export function listResources(
  filters: { type?: ResourceType; search?: string } = {},
  signal?: AbortSignal
): Promise<ResourceWithBook[]> {
  return apiFetch<ResourceWithBook[]>("/resources", { query: filters, signal });
}

export function getResource(id: string, signal?: AbortSignal): Promise<ResourceWithBook> {
  return apiFetch<ResourceWithBook>(`/resources/${id}`, { signal });
}

export function createResource(input: CreateResourceInput): Promise<ResourceWithBook> {
  return apiFetch<ResourceWithBook>("/resources", { method: "POST", body: input });
}

export function updateResource(id: string, input: UpdateResourceInput): Promise<ResourceWithBook> {
  return apiFetch<ResourceWithBook>(`/resources/${id}`, { method: "PATCH", body: input });
}

export function updateBook(resourceId: string, input: UpdateBookInput): Promise<ResourceWithBook> {
  return apiFetch<ResourceWithBook>(`/resources/${resourceId}/book`, { method: "PATCH", body: input });
}

export function deleteResource(id: string): Promise<void> {
  return apiFetch<void>(`/resources/${id}`, { method: "DELETE" });
}

export interface ResourceActivityRef {
  id: string;
  habit_id: string;
  title: string | null;
  duration_seconds: number | null;
  quantity: number | null;
  unit: string | null;
  local_date: string | null;
  habits: { name: string; color: string | null };
}

export interface ResourceNoteRef {
  id: string;
  title: string | null;
  content: string;
}

export function listActivitiesForResource(id: string, signal?: AbortSignal): Promise<ResourceActivityRef[]> {
  return apiFetch<ResourceActivityRef[]>(`/resources/${id}/activities`, { signal });
}

export function listNotesForResource(id: string, signal?: AbortSignal): Promise<ResourceNoteRef[]> {
  return apiFetch<ResourceNoteRef[]>(`/resources/${id}/notes`, { signal });
}
