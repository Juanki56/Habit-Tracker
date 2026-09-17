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
