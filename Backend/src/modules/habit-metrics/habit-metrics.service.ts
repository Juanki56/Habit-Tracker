import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";
import { CreateHabitMetricInput, HabitMetric, MetricAggregation } from "./habit-metrics.types.js";

// Refleja el CHECK habit_metrics_source_rules de la BD: field_definition_id es
// obligatorio si y solo si source_type = 'field_number'.
function validate(input: CreateHabitMetricInput) {
  if (!/^[a-z][a-z0-9_]*$/.test(input.key ?? "")) {
    throw new HttpError("'key' debe empezar con una letra minúscula y usar solo minúsculas, números y guiones bajos");
  }
  if (!input.name?.trim()) throw new HttpError("El nombre de la métrica es obligatorio");

  if (input.source_type === "field_number" && !input.field_definition_id) {
    throw new HttpError("'field_number' requiere field_definition_id");
  }
  if (input.source_type !== "field_number" && input.field_definition_id) {
    throw new HttpError(`'${input.source_type}' no admite field_definition_id`);
  }
}

export async function listForHabit(supabase: SupabaseClient, habitId: string): Promise<HabitMetric[]> {
  const { data, error } = await supabase
    .from("habit_metrics")
    .select("*")
    .eq("habit_id", habitId)
    .order("name");

  if (error) throw new HttpError(error.message);
  return data as HabitMetric[];
}

export async function createHabitMetric(
  supabase: SupabaseClient,
  habitId: string,
  input: CreateHabitMetricInput
): Promise<HabitMetric> {
  validate(input);

  const { data, error } = await supabase
    .from("habit_metrics")
    .insert({
      habit_id: habitId,
      key: input.key,
      name: input.name.trim(),
      source_type: input.source_type,
      aggregation: input.aggregation,
      activity_type_id: input.activity_type_id ?? null,
      field_definition_id: input.field_definition_id ?? null,
      unit: input.unit ?? null,
    })
    .select()
    .single();

  if (error) throw new HttpError(error.message);
  return data as HabitMetric;
}

export async function deleteHabitMetric(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("habit_metrics").delete().eq("id", id);
  if (error) throw new HttpError(error.message);
}

function aggregate(values: number[], aggregation: MetricAggregation): number {
  if (values.length === 0) return 0;
  switch (aggregation) {
    case "sum": return values.reduce((a, b) => a + b, 0);
    case "average": return values.reduce((a, b) => a + b, 0) / values.length;
    case "min": return Math.min(...values);
    case "max": return Math.max(...values);
    case "count": return values.length;
  }
}

// Antes una métrica no mostraba ningún número por sí sola — solo cobraba vida
// dentro de un goal. Esto calcula lo mismo que calculate_goal_progress.sql
// pero para UNA métrica sola y una ventana arbitraria, en JS (no otra función
// SQL que pedirte correr aparte) — así una métrica es útil de inmediato.
export async function calculateMetricValue(
  supabase: SupabaseClient,
  metricId: string,
  windowStart: string,
  windowEnd: string
): Promise<number> {
  const { data: metric, error } = await supabase.from("habit_metrics").select("*").eq("id", metricId).single();
  if (error) throw new HttpError("Métrica no encontrada", 404);
  const m = metric as HabitMetric;

  if (m.source_type === "activity_count") {
    let query = supabase
      .from("activities")
      .select("id, habit_check_ins!inner(local_date)", { count: "exact", head: true })
      .eq("habit_id", m.habit_id)
      .gte("habit_check_ins.local_date", windowStart)
      .lte("habit_check_ins.local_date", windowEnd);
    if (m.activity_type_id) query = query.eq("activity_type_id", m.activity_type_id);
    const { count, error: countError } = await query;
    if (countError) throw new HttpError(countError.message);
    return count ?? 0;
  }

  if (m.source_type === "check_in_count") {
    const { count, error: countError } = await supabase
      .from("habit_check_ins")
      .select("id", { count: "exact", head: true })
      .eq("habit_id", m.habit_id)
      .eq("status", "completed")
      .gte("local_date", windowStart)
      .lte("local_date", windowEnd);
    if (countError) throw new HttpError(countError.message);
    return count ?? 0;
  }

  if (m.source_type === "duration" || m.source_type === "quantity") {
    const column = m.source_type === "duration" ? "duration_seconds" : "quantity";
    let query = supabase
      .from("activities")
      .select(`${column}, habit_check_ins!inner(local_date)`)
      .eq("habit_id", m.habit_id)
      .gte("habit_check_ins.local_date", windowStart)
      .lte("habit_check_ins.local_date", windowEnd);
    if (m.activity_type_id) query = query.eq("activity_type_id", m.activity_type_id);
    const { data: rows, error: rowsError } = await query;
    if (rowsError) throw new HttpError(rowsError.message);
    const values = (rows ?? [])
      .map((r: any) => r[column])
      .filter((v: unknown): v is number => typeof v === "number");
    const result = aggregate(values, m.aggregation);
    return m.source_type === "duration" ? result / 60 : result;
  }

  if (m.source_type === "field_number") {
    let query = supabase
      .from("activity_field_values")
      .select("number_value, activities!inner(habit_id, activity_type_id, habit_check_ins!inner(local_date))")
      .eq("field_definition_id", m.field_definition_id as string)
      .eq("activities.habit_id", m.habit_id)
      .gte("activities.habit_check_ins.local_date", windowStart)
      .lte("activities.habit_check_ins.local_date", windowEnd);
    if (m.activity_type_id) query = query.eq("activities.activity_type_id", m.activity_type_id);
    const { data: rows, error: rowsError } = await query;
    if (rowsError) throw new HttpError(rowsError.message);
    const values = (rows ?? [])
      .map((r: any) => r.number_value)
      .filter((v: unknown): v is number => typeof v === "number");
    return aggregate(values, m.aggregation);
  }

  return 0;
}
