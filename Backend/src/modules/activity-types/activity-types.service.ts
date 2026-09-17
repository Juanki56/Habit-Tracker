import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";
import { getFieldDefinitions } from "../activities/field-values.util.js";
import { ActivityType, CreateActivityTypeInput, UpdateActivityTypeInput } from "./activity-types.types.js";

// El RLS ya filtra: devuelve los globales (user_id IS NULL) + los propios del usuario.
export async function listActivityTypes(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("activity_types").select("*").order("name");
  if (error) throw new HttpError(error.message);
  return data as ActivityType[];
}

// Para que el frontend pueda armar el formulario de "deep log" según el tipo de actividad.
export function listFieldDefinitions(supabase: SupabaseClient, activityTypeId: string) {
  return getFieldDefinitions(supabase, activityTypeId);
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

// El RLS solo deja actualizar tipos propios (user_id = auth.uid()) — un tipo
// global (user_id IS NULL) no hace match con ninguna fila y esto falla con un
// mensaje claro en vez de fallar en silencio.
export async function updateActivityType(
  supabase: SupabaseClient,
  id: string,
  input: UpdateActivityTypeInput
) {
  const { data, error } = await supabase
    .from("activity_types")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new HttpError("No se pudo actualizar — puede que sea un tipo global, no editable");
  return data as ActivityType;
}