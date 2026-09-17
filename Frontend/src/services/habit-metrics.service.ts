import { apiFetch } from "./api-client";
import type { CreateHabitMetricInput, HabitMetric } from "../types/habit-metric";

export function listForHabit(habitId: string, signal?: AbortSignal): Promise<HabitMetric[]> {
  return apiFetch<HabitMetric[]>(`/habits/${habitId}/metrics`, { signal });
}

export function createHabitMetric(habitId: string, input: CreateHabitMetricInput): Promise<HabitMetric> {
  return apiFetch<HabitMetric>(`/habits/${habitId}/metrics`, { method: "POST", body: input });
}

export function deleteHabitMetric(habitId: string, metricId: string): Promise<void> {
  return apiFetch<void>(`/habits/${habitId}/metrics/${metricId}`, { method: "DELETE" });
}

export interface MetricValue {
  value: number;
  from: string;
  to: string;
}

export function getMetricValue(habitId: string, metricId: string, signal?: AbortSignal): Promise<MetricValue> {
  return apiFetch<MetricValue>(`/habits/${habitId}/metrics/${metricId}/value`, { signal });
}
