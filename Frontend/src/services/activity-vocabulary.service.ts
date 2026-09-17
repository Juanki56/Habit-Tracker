import { apiFetch } from "./api-client";
import type { VocabularyWord } from "../types/vocabulary";

export function listForActivity(
  habitId: string,
  activityId: string,
  signal?: AbortSignal
): Promise<VocabularyWord[]> {
  return apiFetch<VocabularyWord[]>(`/habits/${habitId}/activities/${activityId}/vocabulary`, { signal });
}

export function attachWord(
  habitId: string,
  activityId: string,
  word: string
): Promise<VocabularyWord> {
  return apiFetch<VocabularyWord>(`/habits/${habitId}/activities/${activityId}/vocabulary`, {
    method: "POST",
    body: { word },
  });
}

export function detachWord(habitId: string, activityId: string, wordId: string): Promise<void> {
  return apiFetch<void>(`/habits/${habitId}/activities/${activityId}/vocabulary/${wordId}`, {
    method: "DELETE",
  });
}
