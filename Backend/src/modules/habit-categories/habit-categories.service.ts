import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";
import { CreateHabitCategoryInput, HabitCategory } from "./habit-categories.types.js";

// El RLS ya filtra: devuelve las globales (user_id IS NULL) + las propias del usuario.
export async function listCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("habit_categories").select("*").order("name");
  if (error) throw new HttpError(error.message);
  return data as HabitCategory[];
}

export async function createCategory(
  supabase: SupabaseClient,
  userId: string,
  input: CreateHabitCategoryInput
) {
  if (!input.name?.trim()) throw new HttpError("El nombre de la categoría es obligatorio");

  const { data, error } = await supabase
    .from("habit_categories")
    .insert({ ...input, user_id: userId })
    .select()
    .single();

  if (error) throw new HttpError(error.message);
  return data as HabitCategory;
}

export async function deleteCategory(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("habit_categories").delete().eq("id", id);
  if (error) throw new HttpError(error.message);
}