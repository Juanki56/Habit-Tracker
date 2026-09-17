export interface Habit {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  category_id?: string | null;
  end_date?: string | null;
}