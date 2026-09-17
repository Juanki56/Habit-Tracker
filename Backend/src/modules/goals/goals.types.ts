export type GoalDirection = "increase" | "decrease" | "maintain";
export type GoalPeriodType = "daily" | "weekly" | "monthly" | "yearly" | "custom";

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  direction: GoalDirection;
  period_type: GoalPeriodType;
  target_value: number | null;
  minimum_value: number | null;
  maximum_value: number | null;
  unit: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface GoalHabitLink {
  habit_id: string;
  habits: { id: string; name: string; color: string | null };
}

export interface GoalMetricLink {
  metric_id: string;
  habit_metrics: { id: string; name: string; unit: string | null; habit_id: string };
}

export interface GoalWithRelations extends Goal {
  habits: GoalHabitLink["habits"][];
  metrics: GoalMetricLink["habit_metrics"][];
  current_value: number;
}

// Refleja goals_nonmaintain_target / goals_maintain_range de la BD:
// - increase/decrease requieren target_value
// - maintain requiere minimum_value y maximum_value (con maximum >= minimum)
export interface CreateGoalInput {
  name: string;
  description?: string;
  direction: GoalDirection;
  period_type: GoalPeriodType;
  target_value?: number;
  minimum_value?: number;
  maximum_value?: number;
  unit?: string;
  start_date?: string;
  end_date?: string;
  habit_ids?: string[];
  metric_ids?: string[];
}

export interface UpdateGoalInput {
  name?: string;
  description?: string;
  target_value?: number | null;
  minimum_value?: number | null;
  maximum_value?: number | null;
  unit?: string;
  end_date?: string;
}
