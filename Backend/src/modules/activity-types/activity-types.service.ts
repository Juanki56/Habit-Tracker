import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";
import { ActivityType, CreateActivityTypeInput } from "./activity-types.types.js";

// El RLS ya filtra: devuelve los globales (user_id IS NULL) + los propios del usuario.
export async function listActivityTypes(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("activity_types").select("*").order("name");
  if (error) throw new HttpError(error.message);
  return data as ActivityType[];
}

export async function createActivityType(
  supabase: SupabaseClient,
  userId: string,
  input: CreateActivityTypeInput
) {
  if (!input.name?.trim()) throw new HttpError("El nombre del tipo de actividad es obligatorio");

  const { data, error } = await supabase
    .from("activity_types")
    .insert({ ...input, user_id: userId })
    .select()
    .single();

  if (error) throw new HttpError(error.message);
  return data as ActivityType;
}