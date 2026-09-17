export type VocabularyStatus = "learning" | "known" | "mastered";

export interface VocabularyWord {
  id: string;
  user_id: string;
  word: string;
  meaning: string | null;
  example: string | null;
  pronunciation: string | null;
  status: VocabularyStatus;
  first_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVocabularyInput {
  word: string;
  meaning?: string;
  example?: string;
  pronunciation?: string;
  status?: VocabularyStatus;
}

export interface UpdateVocabularyInput {
  meaning?: string;
  example?: string;
  pronunciation?: string;
  status?: VocabularyStatus;
}

export const VOCABULARY_STATUS_LABELS: Record<VocabularyStatus, string> = {
  learning: "Aprendiendo",
  known: "Conocida",
  mastered: "Dominada",
};
