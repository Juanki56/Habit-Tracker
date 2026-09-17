import { apiFetch } from "./api-client";
import type { CreateGoalInput, GoalWithRelations, UpdateGoalInput } from "../types/goal";

export function listGoals(signal?: AbortSignal): Promise<GoalWithRelations[]> {
  return apiFetch<GoalWithRelations[]>("/goals", { signal });
}

export function getGoal(id: string, signal?: AbortSignal): Promise<GoalWithRelations> {
  return apiFetch<GoalWithRelations>(`/goals/${id}`, { signal });
}

export function createGoal(input: CreateGoalInput): Promise<GoalWithRelations> {
  return apiFetch<GoalWithRelations>("/goals", { method: "POST", body: input });
}

export function updateGoal(id: string, input: UpdateGoalInput): Promise<GoalWithRelations> {
  return apiFetch<GoalWithRelations>(`/goals/${id}`, { method: "PATCH", body: input });
}

export function deleteGoal(id: string): Promise<void> {
  return apiFetch<void>(`/goals/${id}`, { method: "DELETE" });
}

export function attachHabit(goalId: string, habitId: string): Promise<void> {
  return apiFetch<void>(`/goals/${goalId}/habits/${habitId}`, { method: "POST" });
}

export function detachHabit(goalId: string, habitId: string): Promise<void> {
  return apiFetch<void>(`/goals/${goalId}/habits/${habitId}`, { method: "DELETE" });
}

export function attachMetric(goalId: string, metricId: string): Promise<void> {
  return apiFetch<void>(`/goals/${goalId}/metrics/${metricId}`, { method: "POST" });
}

export function detachMetric(goalId: string, metricId: string): Promise<void> {
  return apiFetch<void>(`/goals/${goalId}/metrics/${metricId}`, { method: "DELETE" });
}
