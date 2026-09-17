import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";
import { HabitActivityTypeAssignment } from "./habit-activity-types.types.js";

export async function listForHabit(supabase: SupabaseClient, habitId: string) {
  const { data, error } = await supabase
    .from("habit_activity_types")
    .select("activity_type_id, activity_types(id, name, icon, description)")
    .eq("habit_id", habitId);

  if (error) throw new HttpError(error.message);
  return data as unknown as HabitActivityTypeAssignment[];
}

export async function attach(supabase: SupabaseClient, habitId: string, activityTypeId: string) {
  if (!activityTypeId) throw new HttpError("activity_type_id es obligatorio");

  const { data, error } = await supabase
    .from("habit_activity_types")
    .insert({ habit_id: habitId, activity_type_id: activityTypeId })
    .select("activity_type_id, activity_types(id, name, icon, description)")
    .single();

  // El propio trigger validate_habit_activity_type_owner ya rechaza tipos de otro usuario.
  if (error) throw new HttpError(error.message);
  return data as unknown as HabitActivityTypeAssignment;
}

export async function detach(supabase: SupabaseClient, habitId: string, activityTypeId: string) {
  const { error } = await supabase
    .from("habit_activity_types")
    .delete()
    .eq("habit_id", habitId)
    .eq("activity_type_id", activityTypeId);

  if (error) throw new HttpError(error.message);
}