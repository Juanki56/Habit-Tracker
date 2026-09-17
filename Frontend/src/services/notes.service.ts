import { apiFetch } from "./api-client";
import type { CreateNoteInput, NoteWithLinks, UpdateNoteInput } from "../types/note";

export function listNotes(habitId?: string, signal?: AbortSignal): Promise<NoteWithLinks[]> {
  return apiFetch<NoteWithLinks[]>("/notes", { query: { habit_id: habitId }, signal });
}

export function getNote(id: string, signal?: AbortSignal): Promise<NoteWithLinks> {
  return apiFetch<NoteWithLinks>(`/notes/${id}`, { signal });
}

export function createNote(input: CreateNoteInput): Promise<NoteWithLinks> {
  return apiFetch<NoteWithLinks>("/notes", { method: "POST", body: input });
}

export function updateNote(id: string, input: UpdateNoteInput): Promise<NoteWithLinks> {
  return apiFetch<NoteWithLinks>(`/notes/${id}`, { method: "PATCH", body: input });
}

export function deleteNote(id: string): Promise<void> {
  return apiFetch<void>(`/notes/${id}`, { method: "DELETE" });
}

export function linkHabit(noteId: string, habitId: string): Promise<void> {
  return apiFetch<void>(`/notes/${noteId}/habits/${habitId}`, { method: "POST" });
}

export function unlinkHabit(noteId: string, habitId: string): Promise<void> {
  return apiFetch<void>(`/notes/${noteId}/habits/${habitId}`, { method: "DELETE" });
}

export function linkResource(noteId: string, resourceId: string): Promise<void> {
  return apiFetch<void>(`/notes/${noteId}/resources/${resourceId}`, { method: "POST" });
}

export function unlinkResource(noteId: string, resourceId: string): Promise<void> {
  return apiFetch<void>(`/notes/${noteId}/resources/${resourceId}`, { method: "DELETE" });
}
