import { apiFetch } from "./api-client";
import type { CreateHabitInput, Habit, UpdateHabitInput } from "../types/habit";

export function listHabits(onlyActive = true, signal?: AbortSignal): Promise<Habit[]> {
  return apiFetch<Habit[]>("/habits", { query: { all: onlyActive ? undefined : "true" }, signal });
}

export function getHabit(id: string, signal?: AbortSignal): Promise<Habit> {
  return apiFetch<Habit>(`/habits/${id}`, { signal });
}

export function createHabit(input: CreateHabitInput): Promise<Habit> {
  return apiFetch<Habit>("/habits", { method: "POST", body: input });
}

export function updateHabit(id: string, input: UpdateHabitInput): Promise<Habit> {
  return apiFetch<Habit>(`/habits/${id}`, { method: "PATCH", body: input });
}

export function deactivateHabit(id: string): Promise<Habit> {
  return apiFetch<Habit>(`/habits/${id}/desactivar`, { method: "PATCH" });
}
