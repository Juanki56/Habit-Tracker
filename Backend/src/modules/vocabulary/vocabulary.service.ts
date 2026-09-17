import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";
import { CreateVocabularyInput, UpdateVocabularyInput, VocabularyWord } from "./vocabulary.types.js";

export async function listWords(supabase: SupabaseClient, status?: string) {
  let query = supabase.from("vocabulary_words").select("*").order("word");
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new HttpError(error.message);
  return data as VocabularyWord[];
}

// Reutiliza la palabra si ya existe (sin distinguir mayúsculas/minúsculas); si no, la crea.
export async function findOrCreateWord(
  supabase: SupabaseClient,
  userId: string,
  input: CreateVocabularyInput
): Promise<VocabularyWord> {
  if (!input.word?.trim()) throw new HttpError("La palabra es obligatoria");

  const { data: existing, error: findError } = await supabase
    .from("vocabulary_words")
    .select("*")
    .ilike("word", input.word.trim())
    .maybeSingle();

  if (findError) throw new HttpError(findError.message);
  if (existing) return existing as VocabularyWord;

  const { data, error } = await supabase
    .from("vocabulary_words")
    .insert({
      user_id: userId,
      word: input.word.trim(),
      meaning: input.meaning ?? null,
      example: input.example ?? null,
      pronunciation: input.pronunciation ?? null,
      status: input.status ?? "learning",
      first_seen_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new HttpError(error.message);
  return data as VocabularyWord;
}

export async function updateWord(supabase: SupabaseClient, id: string, input: UpdateVocabularyInput) {
  const { data, error } = await supabase.from("vocabulary_words").update(input).eq("id", id).select().single();
  if (error) throw new HttpError(error.message);
  return data as VocabularyWord;
}

export async function deleteWord(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("vocabulary_words").delete().eq("id", id);
  if (error) throw new HttpError(error.message);
}