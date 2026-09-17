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

// No incluye activity_type_id ni local_date a propósito: cambiar el tipo
// invalidaría los field_values ya guardados, y mover la fecha implicaría
// reasignar check_in_id (compartido con otras actividades del mismo día) —
// ninguno de los dos es un simple UPDATE de columna.
export interface UpdateActivityInput {
  title?: string;
  description?: string;
  resource_id?: string | null;
  duration_seconds?: number | null;
  quantity?: number | null;
  unit?: string | null;
  field_values?: Record<string, unknown>;
}