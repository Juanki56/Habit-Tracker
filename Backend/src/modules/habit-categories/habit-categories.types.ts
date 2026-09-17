export interface HabitCategory {
  id: string;
  user_id: string | null; // null = categoría global
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateHabitCategoryInput {
  name: string;
  description?: string;
  icon?: string;
}