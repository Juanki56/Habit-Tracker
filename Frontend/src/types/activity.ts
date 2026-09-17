export interface Activity {
  id: string;
  user_id: string;
  habit_id: string;
  check_in_id: string;
  activity_type_id: string;
  resource_id: string | null;
  title: string | null;
  description: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  quantity: number | null;
  unit: string | null;
  local_date: string | null;
  field_values: Record<string, unknown>;
  resource: { title: string; resource_type: string } | null;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityInput {
  activity_type_id: string;
  local_date?: string;
  resource_id?: string;
  title?: string;
  description?: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  quantity?: number;
  unit?: string;
  field_values?: Record<string, unknown>;
}

export interface UpdateActivityInput {
  title?: string;
  description?: string;
  resource_id?: string | null;
  duration_seconds?: number | null;
  quantity?: number | null;
  unit?: string | null;
  field_values?: Record<string, unknown>;
}

export interface ActivityType {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityTypeInput {
  name: string;
  description?: string;
  icon?: string;
}

export interface HabitActivityTypeAssignment {
  activity_type_id: string;
  activity_types: {
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
    user_id: string | null;
  };
}

export type FieldType =
  | "text"
  | "long_text"
  | "url"
  | "select"
  | "multi_select"
  | "number"
  | "duration"
  | "rating"
  | "boolean"
  | "date"
  | "datetime";

export interface FieldDefinition {
  id: string;
  key: string;
  field_type: FieldType;
  is_required: boolean;
}
