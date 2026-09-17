import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";
import { findOrCreateWord } from "../vocabulary/vocabulary.service.js";
import { CreateVocabularyInput, VocabularyWord } from "../vocabulary/vocabulary.types.js";

export async function listForActivity(supabase: SupabaseClient, activityId: string) {
  const { data, error } = await supabase
    .from("activity_vocabulary")
    .select("vocabulary_words(*)")
    .eq("activity_id", activityId);

  if (error) throw new HttpError(error.message);
  return (data ?? []).map((row: any) => row.vocabulary_words as VocabularyWord);
}

export async function attachWord(
  supabase: SupabaseClient,
  userId: string,
  activityId: string,
  input: Partial<CreateVocabularyInput> & { word_id?: string }
) {
  let word: VocabularyWord;

  if (input.word_id) {
    const { data, error } = await supabase.from("vocabulary_words").select("*").eq("id", input.word_id).single();
    if (error) throw new HttpError("Palabra no encontrada", 404);
    word = data as VocabularyWord;
  } else {
    if (!input.word) throw new HttpError("Manda 'word_id' o 'word'");
    word = await findOrCreateWord(supabase, userId, input as CreateVocabularyInput);
  }

  const { error } = await supabase
    .from("activity_vocabulary")
    .upsert({ activity_id: activityId, vocabulary_word_id: word.id }, { onConflict: "activity_id,vocabulary_word_id" });

  if (error) throw new HttpError(error.message);
  return word;
}

export async function detachWord(supabase: SupabaseClient, activityId: string, wordId: string) {
  const { error } = await supabase
    .from("activity_vocabulary")
    .delete()
    .eq("activity_id", activityId)
    .eq("vocabulary_word_id", wordId);

  if (error) throw new HttpError(error.message);
}