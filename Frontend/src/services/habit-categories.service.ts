import { apiFetch } from "./api-client";
import type { CreateHabitCategoryInput, HabitCategory } from "../types/habit-category";

export function listCategories(signal?: AbortSignal): Promise<HabitCategory[]> {
  return apiFetch<HabitCategory[]>("/habit-categories", { signal });
}

export function createCategory(input: CreateHabitCategoryInput): Promise<HabitCategory> {
  return apiFetch<HabitCategory>("/habit-categories", { method: "POST", body: input });
}

export function updateCategory(id: string, input: { name?: string }): Promise<HabitCategory> {
  return apiFetch<HabitCategory>(`/habit-categories/${id}`, { method: "PATCH", body: input });
}

export function deleteCategory(id: string): Promise<void> {
  return apiFetch<void>(`/habit-categories/${id}`, { method: "DELETE" });
}
