import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";
import { CreateNoteInput, Note, NoteWithLinks, UpdateNoteInput } from "./notes.types.js";

async function getLinks(supabase: SupabaseClient, noteId: string) {
  const [habits, activities, resources] = await Promise.all([
    supabase.from("note_habits").select("habit_id").eq("note_id", noteId),
    supabase.from("note_activities").select("activity_id").eq("note_id", noteId),
    supabase.from("note_resources").select("resource_id").eq("note_id", noteId),
  ]);

  if (habits.error) throw new HttpError(habits.error.message);
  if (activities.error) throw new HttpError(activities.error.message);
  if (resources.error) throw new HttpError(resources.error.message);

  return {
    habit_ids: (habits.data ?? []).map((r) => r.habit_id as string),
    activity_ids: (activities.data ?? []).map((r) => r.activity_id as string),
    resource_ids: (resources.data ?? []).map((r) => r.resource_id as string),
  };
}

async function shape(supabase: SupabaseClient, note: Note): Promise<NoteWithLinks> {
  return { ...note, ...(await getLinks(supabase, note.id)) };
}

export async function listNotes(supabase: SupabaseClient, habitId?: string) {
  if (habitId) {
    // filtrar por hábito requiere pasar por la tabla de unión primero
    const { data: links, error: linksError } = await supabase
      .from("note_habits")
      .select("note_id")
      .eq("habit_id", habitId);
    if (linksError) throw new HttpError(linksError.message);

    const noteIds = (links ?? []).map((l) => l.note_id as string);
    if (noteIds.length === 0) return [];

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .in("id", noteIds)
      .order("created_at", { ascending: false });
    if (error) throw new HttpError(error.message);
    return Promise.all((data as Note[]).map((n) => shape(supabase, n)));
  }

  const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false });
  if (error) throw new HttpError(error.message);
  return Promise.all((data as Note[]).map((n) => shape(supabase, n)));
}

export async function getNoteById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from("notes").select("*").eq("id", id).single();
  if (error) throw new HttpError("Nota no encontrada", 404);
  return shape(supabase, data as Note);
}

export async function createNote(supabase: SupabaseClient, userId: string, input: CreateNoteInput) {
  if (!input.content?.trim()) throw new HttpError("El contenido de la nota es obligatorio");

  const { data: note, error } = await supabase
    .from("notes")
    .insert({ user_id: userId, title: input.title ?? null, content: input.content })
    .select()
    .single();
  if (error) throw new HttpError(error.message);

  const noteId = (note as Note).id;

  const linkInserts = await Promise.all([
    input.habit_ids?.length
      ? supabase.from("note_habits").insert(input.habit_ids.map((habit_id) => ({ note_id: noteId, habit_id })))
      : null,
    input.activity_ids?.length
      ? supabase.from("note_activities").insert(input.activity_ids.map((activity_id) => ({ note_id: noteId, activity_id })))
      : null,
    input.resource_ids?.length
      ? supabase.from("note_resources").insert(input.resource_ids.map((resource_id) => ({ note_id: noteId, resource_id })))
      : null,
  ]);

  const linkError = linkInserts.find((r) => r?.error)?.error;
  if (linkError) throw new HttpError(`La nota se creó, pero un enlace falló: ${linkError.message}`);

  return shape(supabase, note as Note);
}

export async function updateNote(supabase: SupabaseClient, id: string, input: UpdateNoteInput) {
  const { data, error } = await supabase.from("notes").update(input).eq("id", id).select().single();
  if (error) throw new HttpError(error.message);
  return shape(supabase, data as Note);
}

export async function deleteNote(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw new HttpError(error.message);
}

export async function linkToHabit(supabase: SupabaseClient, noteId: string, habitId: string) {
  const { error } = await supabase.from("note_habits").upsert({ note_id: noteId, habit_id: habitId });
  if (error) throw new HttpError(error.message);
}

export async function unlinkFromHabit(supabase: SupabaseClient, noteId: string, habitId: string) {
  const { error } = await supabase.from("note_habits").delete().eq("note_id", noteId).eq("habit_id", habitId);
  if (error) throw new HttpError(error.message);
}

// Antes solo se podían vincular recursos al CREAR la nota — si no tenías el
// recurso todavía en ese momento, quedaba imposible de conectar después.
export async function linkToResource(supabase: SupabaseClient, noteId: string, resourceId: string) {
  const { error } = await supabase.from("note_resources").upsert({ note_id: noteId, resource_id: resourceId });
  if (error) throw new HttpError(error.message);
}

export async function unlinkFromResource(supabase: SupabaseClient, noteId: string, resourceId: string) {
  const { error } = await supabase
    .from("note_resources")
    .delete()
    .eq("note_id", noteId)
    .eq("resource_id", resourceId);
  if (error) throw new HttpError(error.message);
}