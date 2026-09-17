import { SupabaseClient } from "@supabase/supabase-js";
import { HabitCheckIn, UpsertCheckInInput } from "./check-ins.types.js";

function fail(message: string, status = 400): never {
  throw Object.assign(new Error(message), { status });
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function listCheckIns(
  supabase: SupabaseClient,
  habitId: string,
  range?: { from?: string; to?: string }
) {
  let query = supabase
    .from("habit_check_ins")
    .select("*")
    .eq("habit_id", habitId)
    .order("local_date", { ascending: false });

  if (range?.from) query = query.gte("local_date", range.from);
  if (range?.to) query = query.lte("local_date", range.to);

  const { data, error } = await query;
  if (error) fail(error.message);
  return data as HabitCheckIn[];
}

// Un check-in es único por (habit_id, local_date): si ya existe, lo actualiza en vez de duplicarlo.
export async function upsertCheckIn(
  supabase: SupabaseClient,
  habitId: string,
  input: UpsertCheckInInput
) {
  if (!input.status) fail("El status es obligatorio ('completed' o 'skipped')");

  const { data, error } = await supabase
    .from("habit_check_ins")
    .upsert(
      {
        habit_id: habitId,
        local_date: input.local_date ?? todayUTC(),
        status: input.status,
        note: input.note ?? null,
      },
      { onConflict: "habit_id,local_date" }
    )
    .select()
    .single();

  if (error) fail(error.message);
  return data as HabitCheckIn;
}

export async function deleteCheckIn(supabase: SupabaseClient, habitId: string, localDate: string) {
  const { error } = await supabase
    .from("habit_check_ins")
    .delete()
    .eq("habit_id", habitId)
    .eq("local_date", localDate);

  if (error) fail(error.message);
}