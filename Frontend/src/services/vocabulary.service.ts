import { apiFetch } from "./api-client";
import type { CreateVocabularyInput, UpdateVocabularyInput, VocabularyStatus, VocabularyWord } from "../types/vocabulary";

export function listWords(status?: VocabularyStatus, signal?: AbortSignal): Promise<VocabularyWord[]> {
  return apiFetch<VocabularyWord[]>("/vocabulary", { query: { status }, signal });
}

export function createWord(input: CreateVocabularyInput): Promise<VocabularyWord> {
  return apiFetch<VocabularyWord>("/vocabulary", { method: "POST", body: input });
}

export function updateWord(id: string, input: UpdateVocabularyInput): Promise<VocabularyWord> {
  return apiFetch<VocabularyWord>(`/vocabulary/${id}`, { method: "PATCH", body: input });
}

export function deleteWord(id: string): Promise<void> {
  return apiFetch<void>(`/vocabulary/${id}`, { method: "DELETE" });
}
