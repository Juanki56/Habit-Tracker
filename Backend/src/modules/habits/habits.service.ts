import { SupabaseClient } from "@supabase/supabase-js";
import { CreateHabitInput, Habit, UpdateHabitInput } from "./habits.types.js";

function fail(message: string, status = 400): never {
  throw Object.assign(new Error(message), { status });
}

export async function listHabits(supabase: SupabaseClient, onlyActive = true) {
  let query = supabase.from("habits").select("*").order("created_at", { ascending: false });
  if (onlyActive) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) fail(error.message);
  return data as Habit[];
}

export async function getHabitById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from("habits").select("*").eq("id", id).single();
  if (error) fail("Hábito no encontrado", 404);
  return data as Habit;
}

export async function createHabit(supabase: SupabaseClient, userId: string, input: CreateHabitInput) {
  if (!input.name?.trim()) fail("El nombre del hábito es obligatorio");

  const { data, error } = await supabase
    .from("habits")
    .insert({ ...input, user_id: userId })
    .select()
    .single();

  if (error) fail(error.message);
  return data as Habit;
}

export async function updateHabit(supabase: SupabaseClient, id: string, input: UpdateHabitInput) {
  const { data, error } = await supabase.from("habits").update(input).eq("id", id).select().single();
  if (error) fail(error.message);
  return data as Habit;
}

// No hay DELETE — se desactiva, igual que en FinanzIA con las cuentas.
export async function deactivateHabit(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("habits")
    .update({ is_active: false, end_date: new Date().toISOString().slice(0, 10) })
    .eq("id", id)
    .select()
    .single();

  if (error) fail(error.message);
  return data as Habit;
}