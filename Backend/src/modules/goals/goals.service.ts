import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";
import {
  CreateGoalInput, Goal, GoalHabitLink, GoalMetricLink, GoalPeriodType, GoalWithRelations, UpdateGoalInput,
} from "./goals.types.js";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function endOfMonthISO(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  const endOfMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
  return endOfMonth.toISOString().slice(0, 10);
}

function endOfYearISO(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return `${date.getUTCFullYear()}-12-31`;
}

// goals.end_date es NOT NULL en la BD — no lo descubrí con la consulta de CHECK
// constraints porque "not null" es otro tipo de constraint, así que en vez de
// obligar al usuario a siempre elegir una fecha de fin, la calculamos según el
// periodo (fin de mes, fin de año, etc.). 'custom' sigue siendo explícito.
function computeEndDate(periodType: GoalPeriodType, startDate: string, explicitEndDate?: string): string {
  if (explicitEndDate) return explicitEndDate;
  switch (periodType) {
    case "custom":
      throw new HttpError("El periodo 'custom' requiere que elijas una fecha de fin");
    case "daily":
      return startDate;
    case "weekly":
      return addDaysISO(startDate, 6);
    case "monthly":
      return endOfMonthISO(startDate);
    case "yearly":
      return endOfYearISO(startDate);
  }
}

// Refleja goals_nonmaintain_target y goals_maintain_range de la BD, con mensajes
// legibles en vez de un error crudo de Postgres.
function validate(input: CreateGoalInput) {
  if (!input.name?.trim()) throw new HttpError("El nombre del goal es obligatorio");

  if (input.direction === "maintain") {
    if (input.minimum_value == null || input.maximum_value == null) {
      throw new HttpError("'maintain' requiere minimum_value y maximum_value");
    }
    if (input.maximum_value < input.minimum_value) {
      throw new HttpError("maximum_value debe ser mayor o igual a minimum_value");
    }
  } else if (input.target_value == null) {
    throw new HttpError(`'${input.direction}' requiere target_value`);
  }
}

// calculate_goal_progress es la función SQL pendiente de aplicar (ver Backend/sql/).
// Si todavía no existe en la BD, devolvemos null en vez de romper el resto del goal.
async function getCurrentValue(supabase: SupabaseClient, goalId: string): Promise<number | null> {
  const { data, error } = await supabase.rpc("calculate_goal_progress", { target_goal: goalId });
  if (error) {
    if (error.code === "PGRST202") return null;
    throw new HttpError(error.message);
  }
  return (data as number) ?? 0;
}

async function attachRelations(supabase: SupabaseClient, goal: Goal): Promise<GoalWithRelations> {
  const [habitsResult, metricsResult, currentValue] = await Promise.all([
    supabase.from("goal_habits").select("habit_id, habits(id, name, color)").eq("goal_id", goal.id),
    supabase.from("goal_metrics").select("metric_id, habit_metrics(id, name, unit, habit_id)").eq("goal_id", goal.id),
    getCurrentValue(supabase, goal.id),
  ]);

  if (habitsResult.error) throw new HttpError(habitsResult.error.message);
  if (metricsResult.error) throw new HttpError(metricsResult.error.message);

  return {
    ...goal,
    habits: (habitsResult.data as unknown as GoalHabitLink[]).map((h) => h.habits),
    metrics: (metricsResult.data as unknown as GoalMetricLink[]).map((m) => m.habit_metrics),
    current_value: currentValue ?? 0,
  };
}

export async function listGoals(supabase: SupabaseClient): Promise<GoalWithRelations[]> {
  const { data, error } = await supabase.from("goals").select("*").order("start_date", { ascending: false });
  if (error) throw new HttpError(error.message);
  return Promise.all((data as Goal[]).map((g) => attachRelations(supabase, g)));
}

export async function getGoalById(supabase: SupabaseClient, id: string): Promise<GoalWithRelations> {
  const { data, error } = await supabase.from("goals").select("*").eq("id", id).single();
  if (error) throw new HttpError("Goal no encontrado", 404);
  return attachRelations(supabase, data as Goal);
}

export async function createGoal(
  supabase: SupabaseClient,
  userId: string,
  input: CreateGoalInput
): Promise<GoalWithRelations> {
  validate(input);
  const startDate = input.start_date ?? todayISO();
  const endDate = computeEndDate(input.period_type, startDate, input.end_date);
  if (endDate < startDate) throw new HttpError("end_date no puede ser anterior a start_date");

  const { data: goal, error } = await supabase
    .from("goals")
    .insert({
      user_id: userId,
      name: input.name.trim(),
      description: input.description ?? null,
      direction: input.direction,
      period_type: input.period_type,
      target_value: input.direction === "maintain" ? null : input.target_value,
      minimum_value: input.minimum_value ?? null,
      maximum_value: input.maximum_value ?? null,
      unit: input.unit ?? null,
      start_date: startDate,
      end_date: endDate,
    })
    .select()
    .single();

  if (error) throw new HttpError(error.message);
  const created = goal as Goal;

  if (input.habit_ids?.length) {
    const { error: linkError } = await supabase
      .from("goal_habits")
      .insert(input.habit_ids.map((habit_id) => ({ goal_id: created.id, habit_id })));
    if (linkError) throw new HttpError(`El goal se creó, pero un hábito falló: ${linkError.message}`);
  }

  if (input.metric_ids?.length) {
    const { error: linkError } = await supabase
      .from("goal_metrics")
      .insert(input.metric_ids.map((metric_id) => ({ goal_id: created.id, metric_id })));
    if (linkError) throw new HttpError(`El goal se creó, pero una métrica falló: ${linkError.message}`);
  }

  return getGoalById(supabase, created.id);
}

export async function updateGoal(
  supabase: SupabaseClient,
  id: string,
  input: UpdateGoalInput
): Promise<GoalWithRelations> {
  const { error } = await supabase.from("goals").update(input).eq("id", id);
  if (error) throw new HttpError(error.message);
  return getGoalById(supabase, id);
}

export async function deleteGoal(supabase: SupabaseClient, id: string): Promise<void> {
  await Promise.all([
    supabase.from("goal_habits").delete().eq("goal_id", id),
    supabase.from("goal_metrics").delete().eq("goal_id", id),
  ]);

  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw new HttpError(error.message);
}

export async function attachHabit(supabase: SupabaseClient, goalId: string, habitId: string): Promise<void> {
  const { error } = await supabase.from("goal_habits").upsert({ goal_id: goalId, habit_id: habitId });
  if (error) throw new HttpError(error.message);
}

export async function detachHabit(supabase: SupabaseClient, goalId: string, habitId: string): Promise<void> {
  const { error } = await supabase.from("goal_habits").delete().eq("goal_id", goalId).eq("habit_id", habitId);
  if (error) throw new HttpError(error.message);
}

export async function attachMetric(supabase: SupabaseClient, goalId: string, metricId: string): Promise<void> {
  const { error } = await supabase.from("goal_metrics").upsert({ goal_id: goalId, metric_id: metricId });
  if (error) throw new HttpError(error.message);
}

export async function detachMetric(supabase: SupabaseClient, goalId: string, metricId: string): Promise<void> {
  const { error } = await supabase.from("goal_metrics").delete().eq("goal_id", goalId).eq("metric_id", metricId);
  if (error) throw new HttpError(error.message);
}
