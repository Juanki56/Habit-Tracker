import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";
import * as checkInsService from "../check-ins/check-ins.service.js";
import { buildFieldValueRows, flattenFieldValues, getFieldDefinitions } from "./field-values.util.js";
import { Activity, CreateActivityInput, UpdateActivityInput } from "./activities.types.js";

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

// habit_check_ins!inner asegura que podamos filtrar por local_date (zona horaria del
// usuario) en vez de created_at (que sería la hora del server).
const SELECT_WITH_RELATIONS = `
  *,
  habit_check_ins!inner ( local_date ),
  activity_field_values (
    text_value, number_value, boolean_value, date_value, datetime_value, json_value,
    activity_field_definitions ( key )
  ),
  resources ( title, resource_type )
`;

function shapeRow(row: any) {
  const { habit_check_ins, activity_field_values, resources, ...rest } = row;
  return {
    ...rest,
    local_date: habit_check_ins?.local_date ?? null,
    field_values: flattenFieldValues(activity_field_values ?? []),
    resource: resources ? { title: resources.title, resource_type: resources.resource_type } : null,
  };
}

export async function listActivities(
  supabase: SupabaseClient,
  habitId: string,
  filters: { from?: string; to?: string; activity_type_id?: string }
) {
  let query = supabase
    .from("activities")
    .select(SELECT_WITH_RELATIONS)
    .eq("habit_id", habitId)
    .order("created_at", { ascending: false });

  if (filters.activity_type_id) query = query.eq("activity_type_id", filters.activity_type_id);
  if (filters.from) query = query.gte("habit_check_ins.local_date", filters.from);
  if (filters.to) query = query.lte("habit_check_ins.local_date", filters.to);

  const { data, error } = await query;
  if (error) throw new HttpError(error.message);
  return (data ?? []).map(shapeRow);
}

export async function createActivity(
  supabase: SupabaseClient,
  userId: string,
  habitId: string,
  input: CreateActivityInput
) {
  if (!input.activity_type_id) throw new HttpError("activity_type_id es obligatorio");

  const checkIn = await checkInsService.upsertCheckIn(supabase, habitId, {
    local_date: input.local_date ?? todayUTC(),
    status: "completed",
  });

  const { data: activity, error } = await supabase
    .from("activities")
    .insert({
      user_id: userId,
      habit_id: habitId,
      check_in_id: checkIn.id,
      activity_type_id: input.activity_type_id,
      resource_id: input.resource_id ?? null,
      title: input.title ?? null,
      description: input.description ?? null,
      started_at: input.started_at ?? null,
      ended_at: input.ended_at ?? null,
      duration_seconds: input.duration_seconds ?? null,
      quantity: input.quantity ?? null,
      unit: input.unit ?? null,
    })
    .select()
    .single();

  if (error) throw new HttpError(error.message);

  let fieldValues: Record<string, unknown> = {};
  if (input.field_values && Object.keys(input.field_values).length > 0) {
    const definitions = await getFieldDefinitions(supabase, input.activity_type_id);
    const rows = buildFieldValueRows((activity as Activity).id, input.field_values, definitions);

    if (rows.length > 0) {
      const { error: valuesError } = await supabase.from("activity_field_values").insert(rows);
      if (valuesError) throw new HttpError(valuesError.message);
    }
    fieldValues = input.field_values;
  }

  return { ...(activity as Activity), local_date: checkIn.local_date, field_values: fieldValues };
}

export async function getActivityById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from("activities").select(SELECT_WITH_RELATIONS).eq("id", id).single();
  if (error) throw new HttpError("Actividad no encontrada", 404);
  return shapeRow(data);
}

export async function updateActivity(
  supabase: SupabaseClient,
  id: string,
  input: UpdateActivityInput
) {
  const { field_values, ...columns } = input;

  if (Object.keys(columns).length > 0) {
    const { error } = await supabase.from("activities").update(columns).eq("id", id);
    if (error) throw new HttpError(error.message);
  }

  if (field_values) {
    const { data: activity, error: fetchError } = await supabase
      .from("activities")
      .select("activity_type_id")
      .eq("id", id)
      .single();
    if (fetchError) throw new HttpError("Actividad no encontrada", 404);

    // Reemplaza todos los field_values — más simple y predecible que intentar
    // diffear cuáles cambiaron, y de todas formas el formulario siempre manda
    // el set completo (igual que al crear).
    const { error: deleteError } = await supabase.from("activity_field_values").delete().eq("activity_id", id);
    if (deleteError) throw new HttpError(deleteError.message);

    if (Object.keys(field_values).length > 0) {
      const definitions = await getFieldDefinitions(supabase, (activity as { activity_type_id: string }).activity_type_id);
      const rows = buildFieldValueRows(id, field_values, definitions);
      if (rows.length > 0) {
        const { error: insertError } = await supabase.from("activity_field_values").insert(rows);
        if (insertError) throw new HttpError(insertError.message);
      }
    }
  }

  return getActivityById(supabase, id);
}

export async function deleteActivity(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw new HttpError(error.message);
}