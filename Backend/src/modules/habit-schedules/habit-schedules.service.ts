import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";
import { CreateScheduleInput, HabitSchedule, HabitScheduleWithDays } from "./habit-schedules.types.js";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Refleja exactamente el CHECK habit_schedules_frequency_rules de la BD,
// pero con mensajes legibles en vez de un error crudo de Postgres.
function validate(input: CreateScheduleInput) {
  const { frequency_type, target_occurrences, interval_days, days } = input;

  if (frequency_type === "daily") {
    if (target_occurrences != null || interval_days != null) {
      throw new HttpError("'daily' no admite target_occurrences ni interval_days");
    }
  } else if (frequency_type === "weekly" || frequency_type === "monthly") {
    if (target_occurrences == null) throw new HttpError(`'${frequency_type}' requiere target_occurrences`);
    if (interval_days != null) throw new HttpError(`'${frequency_type}' no admite interval_days`);
    if (frequency_type === "weekly" && target_occurrences > 7) {
      throw new HttpError("target_occurrences no puede superar 7 en una frecuencia semanal");
    }
  } else if (frequency_type === "interval") {
    if (interval_days == null) throw new HttpError("'interval' requiere interval_days");
    if (target_occurrences != null) throw new HttpError("'interval' no admite target_occurrences");
  } else {
    throw new HttpError("frequency_type inválido");
  }

  if (days?.length) {
    if (frequency_type !== "weekly") throw new HttpError("'days' solo aplica a frequency_type 'weekly'");
    if (days.some((d) => d < 1 || d > 7)) throw new HttpError("Cada día debe estar entre 1 (lunes) y 7 (domingo)");
  }
}

async function getDays(supabase: SupabaseClient, scheduleId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("habit_schedule_days")
    .select("day_of_week")
    .eq("schedule_id", scheduleId)
    .order("day_of_week");
  if (error) throw new HttpError(error.message);
  return (data ?? []).map((r) => r.day_of_week as number);
}

export async function listSchedules(supabase: SupabaseClient, habitId: string) {
  const { data, error } = await supabase
    .from("habit_schedules")
    .select("*")
    .eq("habit_id", habitId)
    .order("start_date", { ascending: false });
  if (error) throw new HttpError(error.message);

  const schedules = data as HabitSchedule[];
  return Promise.all(schedules.map(async (s) => ({ ...s, days: await getDays(supabase, s.id) })));
}

export async function getCurrentSchedule(
  supabase: SupabaseClient,
  habitId: string
): Promise<HabitScheduleWithDays | null> {
  const today = todayISO();
  const { data, error } = await supabase
    .from("habit_schedules")
    .select("*")
    .eq("habit_id", habitId)
    .lte("start_date", today)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new HttpError(error.message);
  if (!data) return null;

  const days = await getDays(supabase, (data as HabitSchedule).id);
  return { ...(data as HabitSchedule), days };
}

export async function createSchedule(supabase: SupabaseClient, habitId: string, input: CreateScheduleInput) {
  validate(input);
  const startDate = input.start_date ?? todayISO();

  const current = await getCurrentSchedule(supabase, habitId);
  if (current) {
    const dayBefore = new Date(startDate + "T00:00:00");
    dayBefore.setDate(dayBefore.getDate() - 1);
    const { error: closeError } = await supabase
      .from("habit_schedules")
      .update({ end_date: dayBefore.toISOString().slice(0, 10) })
      .eq("id", current.id);
    if (closeError) throw new HttpError(closeError.message);
  }

  const { data: schedule, error } = await supabase
    .from("habit_schedules")
    .insert({
      habit_id: habitId,
      frequency_type: input.frequency_type,
      target_occurrences: input.target_occurrences ?? null,
      interval_days: input.interval_days ?? null,
      start_date: startDate,
    })
    .select()
    .single();

  if (error) throw new HttpError(error.message);
  const scheduleId = (schedule as HabitSchedule).id;

  if (input.days?.length) {
    const { error: daysError } = await supabase
      .from("habit_schedule_days")
      .insert(input.days.map((day_of_week) => ({ schedule_id: scheduleId, day_of_week })));
    if (daysError) throw new HttpError(daysError.message);
  }

  return { ...(schedule as HabitSchedule), days: input.days ?? [] };
}

export async function deleteSchedule(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("habit_schedules").delete().eq("id", id);
  if (error) throw new HttpError(error.message);
}