export type MetricSourceType = "duration" | "activity_count" | "quantity" | "field_number" | "check_in_count";
export type MetricAggregation = "sum" | "average" | "count" | "min" | "max";

export interface HabitMetric {
  id: string;
  habit_id: string;
  activity_type_id: string | null;
  key: string;
  name: string;
  source_type: MetricSourceType;
  field_definition_id: string | null;
  aggregation: MetricAggregation;
  unit: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateHabitMetricInput {
  key: string;
  name: string;
  source_type: MetricSourceType;
  aggregation: MetricAggregation;
  activity_type_id?: string;
  field_definition_id?: string;
  unit?: string;
}

export const METRIC_SOURCE_LABELS: Record<MetricSourceType, string> = {
  duration: "Duración (minutos)",
  quantity: "Cantidad que registras (ej. páginas, km)",
  activity_count: "Veces que registraste una actividad",
  check_in_count: "Veces que marcaste el hábito como hecho",
  field_number: "Campo numérico personalizado",
};

export const METRIC_AGGREGATION_LABELS: Record<MetricAggregation, string> = {
  sum: "Suma",
  average: "Promedio",
  count: "Conteo",
  min: "Mínimo",
  max: "Máximo",
};
