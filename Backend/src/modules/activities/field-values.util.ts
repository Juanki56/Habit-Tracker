import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";

type ColumnName = "text_value" | "number_value" | "boolean_value" | "date_value" | "datetime_value" | "json_value";

const COLUMN_BY_TYPE: Record<string, ColumnName> = {
  text: "text_value",
  long_text: "text_value",
  url: "text_value",
  select: "text_value",
  multi_select: "json_value",
  number: "number_value",
  duration: "number_value",
  rating: "number_value",
  boolean: "boolean_value",
  date: "date_value",
  datetime: "datetime_value",
};

export interface FieldDefinition {
  id: string;
  key: string;
  field_type: string;
  is_required: boolean;
}

export async function getFieldDefinitions(supabase: SupabaseClient, activityTypeId: string) {
  const { data, error } = await supabase
    .from("activity_field_definitions")
    .select("id, key, field_type, is_required")
    .eq("activity_type_id", activityTypeId);

  if (error) throw new HttpError(error.message);
  return data as FieldDefinition[];
}

// { pages: 30, learnings: "..." } → filas listas para insertar en activity_field_values
export function buildFieldValueRows(
  activityId: string,
  fieldValues: Record<string, unknown>,
  definitions: FieldDefinition[]
) {
  const byKey = new Map(definitions.map((d) => [d.key, d]));
  const rows: Record<string, unknown>[] = [];

  for (const [key, rawValue] of Object.entries(fieldValues)) {
    if (rawValue === undefined || rawValue === null || rawValue === "") continue;

    const def = byKey.get(key);
    if (!def) throw new HttpError(`'${key}' no es un campo válido para este tipo de actividad`);

    const column = COLUMN_BY_TYPE[def.field_type];
    if (!column) throw new HttpError(`Tipo de campo no soportado: ${def.field_type}`);

    rows.push({ activity_id: activityId, field_definition_id: def.id, [column]: rawValue });
  }

  const missing = definitions.filter((d) => d.is_required && !(d.key in fieldValues));
  if (missing.length > 0) {
    throw new HttpError(`Faltan campos obligatorios: ${missing.map((d) => d.key).join(", ")}`);
  }

  return rows;
}

// Vuelve de las filas de activity_field_values a { key: value } legible
export function flattenFieldValues(
  values: Array<{
    text_value: string | null;
    number_value: number | null;
    boolean_value: boolean | null;
    date_value: string | null;
    datetime_value: string | null;
    json_value: unknown;
    activity_field_definitions: { key: string } | null;
  }>
) {
  const result: Record<string, unknown> = {};
  for (const v of values) {
    const key = v.activity_field_definitions?.key;
    if (!key) continue;
    result[key] = v.text_value ?? v.number_value ?? v.boolean_value ?? v.date_value ?? v.datetime_value ?? v.json_value ?? null;
  }
  return result;
}