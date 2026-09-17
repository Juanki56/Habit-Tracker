import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";
import {
  ActivityTypeBreakdown, DailyTotal, HabitBasicStats, HabitDashboard, HabitOverviewItem,
} from "./dashboard.types.js";

async function getStreak(supabase: SupabaseClient, habitId: string): Promise<number> {
  const { data, error } = await supabase.rpc("habit_current_streak", { target_habit: habitId });
  if (error) throw new HttpError(error.message);
  return (data as number) ?? 0;
}

// Nota: calcula la racha con una llamada por hábito (N+1). Está bien para pocos
// hábitos por usuario; si esto crece mucho, conviene una función SQL que
// calcule todas las rachas de un usuario en una sola pasada.
export async function getOverview(supabase: SupabaseClient): Promise<HabitOverviewItem[]> {
  const { data, error } = await supabase.from("habit_basic_stats").select("*");
  if (error) throw new HttpError(error.message);

  const stats = (data ?? []) as HabitBasicStats[];
  return Promise.all(
    stats.map(async (s) => ({ ...s, current_streak: await getStreak(supabase, s.habit_id) }))
  );
}

export async function getHabitDashboard(
  supabase: SupabaseClient,
  habitId: string,
  days: number
): Promise<HabitDashboard> {
  const [statsResult, dailyResult, breakdownResult, streak] = await Promise.all([
    supabase.from("habit_basic_stats").select("*").eq("habit_id", habitId).maybeSingle(),
    supabase
      .from("habit_daily_totals")
      .select("*")
      .eq("habit_id", habitId)
      .order("local_date", { ascending: false })
      .limit(days),
    supabase.from("habit_activity_type_breakdown").select("*").eq("habit_id", habitId),
    getStreak(supabase, habitId),
  ]);

  if (statsResult.error) throw new HttpError(statsResult.error.message);
  if (dailyResult.error) throw new HttpError(dailyResult.error.message);
  if (breakdownResult.error) throw new HttpError(breakdownResult.error.message);

  // la vista viene ordenada del más reciente al más viejo; el gráfico quiere orden cronológico
  const dailyTotals = ((dailyResult.data ?? []) as DailyTotal[]).slice().reverse();

  return {
    stats: (statsResult.data as HabitBasicStats) ?? null,
    streak,
    daily_totals: dailyTotals,
    breakdown_by_type: (breakdownResult.data ?? []) as ActivityTypeBreakdown[],
  };
}