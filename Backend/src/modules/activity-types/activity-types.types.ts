export interface ActivityType {
  id: string;
  user_id: string | null; // null = tipo global, disponible para todos
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
