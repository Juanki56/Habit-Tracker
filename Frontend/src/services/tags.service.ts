import { apiFetch } from "./api-client";
import type { Tag, TaggableKind } from "../types/tag";

export function listTags(signal?: AbortSignal): Promise<Tag[]> {
  return apiFetch<Tag[]>("/tags", { signal });
}

export function createTag(name: string): Promise<Tag> {
  return apiFetch<Tag>("/tags", { method: "POST", body: { name } });
}

export function deleteTag(id: string): Promise<void> {
  return apiFetch<void>(`/tags/${id}`, { method: "DELETE" });
}

export function listTagsFor(kind: TaggableKind, entityId: string, signal?: AbortSignal): Promise<Tag[]> {
  return apiFetch<Tag[]>(`/tags/for/${kind}/${entityId}`, { signal });
}

export function attachTag(kind: TaggableKind, entityId: string, tagId: string): Promise<void> {
  return apiFetch<void>(`/tags/${tagId}/${kind}/${entityId}`, { method: "POST" });
}

export function detachTag(kind: TaggableKind, entityId: string, tagId: string): Promise<void> {
  return apiFetch<void>(`/tags/${tagId}/${kind}/${entityId}`, { method: "DELETE" });
}

export interface TagHabitRef {
  id: string;
  name: string;
  color: string | null;
  is_active: boolean;
}

export interface TagActivityRef {
  id: string;
  title: string | null;
  habit_id: string;
}

export interface TagResourceRef {
  id: string;
  title: string;
  resource_type: string;
}

export interface TagNoteRef {
  id: string;
  title: string | null;
  content: string;
}

export function listHabitsForTag(tagId: string, signal?: AbortSignal): Promise<TagHabitRef[]> {
  return apiFetch<TagHabitRef[]>(`/tags/${tagId}/habits`, { signal });
}

export function listActivitiesForTag(tagId: string, signal?: AbortSignal): Promise<TagActivityRef[]> {
  return apiFetch<TagActivityRef[]>(`/tags/${tagId}/activities`, { signal });
}

export function listResourcesForTag(tagId: string, signal?: AbortSignal): Promise<TagResourceRef[]> {
  return apiFetch<TagResourceRef[]>(`/tags/${tagId}/resources`, { signal });
}

export function listNotesForTag(tagId: string, signal?: AbortSignal): Promise<TagNoteRef[]> {
  return apiFetch<TagNoteRef[]>(`/tags/${tagId}/notes`, { signal });
}
