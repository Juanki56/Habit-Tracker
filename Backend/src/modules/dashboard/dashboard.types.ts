export interface HabitBasicStats {
  habit_id: string;
  user_id: string;
  name: string;
  completed_days: number;
  skipped_days: number;
  total_check_ins: number;
  total_duration_seconds: number;
  total_activities: number;
  total_quantity: number;
}

export interface DailyTotal {
  local_date: string;
  total_duration_seconds: number;
  total_quantity: number;
  total_activities: number;
}

export interface ActivityTypeBreakdown {
  activity_type_id: string;
  activity_type_name: string;
  total_duration_seconds: number;
  total_quantity: number;
  total_activities: number;
}

export interface HabitOverviewItem extends HabitBasicStats {
  current_streak: number;
}

export interface HabitDashboard {
  stats: HabitBasicStats | null;
  streak: number;
  daily_totals: DailyTotal[];
  breakdown_by_type: ActivityTypeBreakdown[];
}