import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";
import { CreateTagInput, Tag, TaggableKind } from "./tags.types.js";

// Tabla de unión + columna por tipo de entidad — igual de simple que COLUMN_BY_TYPE
// en field-values.util.ts, no una capa de abstracción nueva.
const JUNCTION_BY_KIND: Record<TaggableKind, { table: string; column: string }> = {
  habits: { table: "habit_tags", column: "habit_id" },
  activities: { table: "activity_tags", column: "activity_id" },
  resources: { table: "resource_tags", column: "resource_id" },
  notes: { table: "note_tags", column: "note_id" },
};

export async function listTags(supabase: SupabaseClient): Promise<Tag[]> {
  const { data, error } = await supabase.from("tags").select("*").order("name");
  if (error) throw new HttpError(error.message);
  return data as Tag[];
}

// Reutiliza el tag si ya existe (sin distinguir mayúsculas/minúsculas), igual que
// findOrCreateWord en vocabulary.service.ts — no hay una restricción UNIQUE en DB
// que lo garantice, así que la deduplicación se resuelve aquí.
export async function findOrCreateTag(
  supabase: SupabaseClient,
  userId: string,
  input: CreateTagInput
): Promise<Tag> {
  if (!input.name?.trim()) throw new HttpError("El nombre del tag es obligatorio");
  const name = input.name.trim();

  const { data: existing, error: findError } = await supabase
    .from("tags")
    .select("*")
    .ilike("name", name)
    .maybeSingle();

  if (findError) throw new HttpError(findError.message);
  if (existing) return existing as Tag;

  const { data, error } = await supabase
    .from("tags")
    .insert({ user_id: userId, name })
    .select()
    .single();

  if (error) throw new HttpError(error.message);
  return data as Tag;
}

export async function deleteTag(supabase: SupabaseClient, id: string): Promise<void> {
  // Por si las FK de las tablas de unión no tienen ON DELETE CASCADE.
  await Promise.all(
    Object.values(JUNCTION_BY_KIND).map(({ table }) => supabase.from(table).delete().eq("tag_id", id))
  );

  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw new HttpError(error.message);
}

export async function attachTag(
  supabase: SupabaseClient,
  kind: TaggableKind,
  entityId: string,
  tagId: string
): Promise<void> {
  const { table, column } = JUNCTION_BY_KIND[kind];
  const { error } = await supabase.from(table).upsert({ [column]: entityId, tag_id: tagId });
  if (error) throw new HttpError(error.message);
}

export async function detachTag(
  supabase: SupabaseClient,
  kind: TaggableKind,
  entityId: string,
  tagId: string
): Promise<void> {
  const { table, column } = JUNCTION_BY_KIND[kind];
  const { error } = await supabase.from(table).delete().eq(column, entityId).eq("tag_id", tagId);
  if (error) throw new HttpError(error.message);
}

export async function listTagsForEntity(
  supabase: SupabaseClient,
  kind: TaggableKind,
  entityId: string
): Promise<Tag[]> {
  const { table, column } = JUNCTION_BY_KIND[kind];
  const { data, error } = await supabase.from(table).select("tags(*)").eq(column, entityId);
  if (error) throw new HttpError(error.message);
  return (data ?? []).map((row: any) => row.tags as Tag);
}

// El camino inverso que faltaba: dado un tag, qué tiene ese tag. Antes solo
// existía "tags de esta entidad" — para que un tag sirva de verdad para
// "encontrar cosas después" (el propósito que se pidió desde el inicio) hace
// falta poder navegar en ambos sentidos.
const ENTITY_EMBED_BY_KIND: Record<TaggableKind, string> = {
  habits: "habits(id, name, color, is_active)",
  activities: "activities(id, title, habit_id)",
  resources: "resources(id, title, resource_type)",
  notes: "notes(id, title, content)",
};

export async function listEntitiesForTag(supabase: SupabaseClient, kind: TaggableKind, tagId: string) {
  const { table } = JUNCTION_BY_KIND[kind];
  const { data, error } = await supabase.from(table).select(ENTITY_EMBED_BY_KIND[kind]).eq("tag_id", tagId);
  if (error) throw new HttpError(error.message);
  return (data ?? []).map((row: any) => row[kind]);
}
