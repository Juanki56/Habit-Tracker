import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../utils/request.js";
import {
  Book, BookProgress, CreateResourceInput, Resource, ResourceType, ResourceWithBook, UpdateBookInput, UpdateResourceInput,
} from "./resources.types.js";

// book_progress es una vista derivada (pages_read/progress_percentage se calculan
// a partir de las actividades reales) — nunca se guarda un porcentaje en la tabla.
async function attachBooks(
  supabase: SupabaseClient,
  resources: Resource[]
): Promise<ResourceWithBook[]> {
  const bookIds = resources.filter((r) => r.resource_type === "book").map((r) => r.id);
  if (bookIds.length === 0) {
    return resources.map((r) => ({ ...r, book: null }));
  }

  const [booksResult, progressResult] = await Promise.all([
    supabase.from("books").select("*").in("resource_id", bookIds),
    supabase.from("book_progress").select("*").in("book_id", bookIds),
  ]);

  if (booksResult.error) throw new HttpError(booksResult.error.message);
  if (progressResult.error) throw new HttpError(progressResult.error.message);

  const booksByResourceId = new Map((booksResult.data as Book[]).map((b) => [b.resource_id, b]));
  const progressByBookId = new Map((progressResult.data as BookProgress[]).map((p) => [p.book_id, p]));

  return resources.map((resource) => {
    const book = booksByResourceId.get(resource.id);
    if (!book) return { ...resource, book: null };
    const progress = progressByBookId.get(resource.id);
    return { ...resource, book: { ...book, ...progress } };
  });
}

export async function listResources(
  supabase: SupabaseClient,
  filters: { resource_type?: ResourceType; search?: string }
): Promise<ResourceWithBook[]> {
  let query = supabase.from("resources").select("*").order("created_at", { ascending: false });
  if (filters.resource_type) query = query.eq("resource_type", filters.resource_type);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new HttpError(error.message);
  return attachBooks(supabase, data as Resource[]);
}

export async function getResourceById(supabase: SupabaseClient, id: string): Promise<ResourceWithBook> {
  const { data, error } = await supabase.from("resources").select("*").eq("id", id).single();
  if (error) throw new HttpError("Recurso no encontrado", 404);

  const withBooks = await attachBooks(supabase, [data as Resource]);
  return withBooks[0]!;
}

export async function createResource(
  supabase: SupabaseClient,
  userId: string,
  input: CreateResourceInput
): Promise<ResourceWithBook> {
  if (!input.title?.trim()) throw new HttpError("El título es obligatorio");
  if (!input.resource_type) throw new HttpError("El tipo de recurso es obligatorio");

  const { data: resource, error } = await supabase
    .from("resources")
    .insert({
      user_id: userId,
      resource_type: input.resource_type,
      title: input.title.trim(),
      description: input.description ?? null,
      url: input.url ?? null,
    })
    .select()
    .single();

  if (error) throw new HttpError(error.message);
  const created = resource as Resource;

  if (input.resource_type === "book") {
    const { error: bookError } = await supabase.from("books").insert({
      resource_id: created.id,
      author: input.book?.author ?? null,
      isbn: input.book?.isbn ?? null,
      publisher: input.book?.publisher ?? null,
      total_pages: input.book?.total_pages ?? null,
      status: input.book?.status ?? "planned",
      started_at: input.book?.started_at ?? null,
      finished_at: input.book?.finished_at ?? null,
      rating: input.book?.rating ?? null,
    });
    if (bookError) throw new HttpError(`El recurso se creó, pero el libro falló: ${bookError.message}`);
  }

  return getResourceById(supabase, created.id);
}

export async function updateResource(
  supabase: SupabaseClient,
  id: string,
  input: UpdateResourceInput
): Promise<ResourceWithBook> {
  const { error } = await supabase.from("resources").update(input).eq("id", id);
  if (error) throw new HttpError(error.message);
  return getResourceById(supabase, id);
}

export async function updateBook(
  supabase: SupabaseClient,
  resourceId: string,
  input: UpdateBookInput
): Promise<ResourceWithBook> {
  const { error } = await supabase.from("books").update(input).eq("resource_id", resourceId);
  if (error) throw new HttpError(error.message);
  return getResourceById(supabase, resourceId);
}

// Antes no había forma de ver, desde un recurso, qué actividades o notas lo
// usan — activities/notes solo se consultaban por habit_id, nunca por
// resource_id. Este es el camino inverso que faltaba.
export async function listActivitiesForResource(supabase: SupabaseClient, resourceId: string) {
  const { data, error } = await supabase
    .from("activities")
    .select("id, habit_id, title, duration_seconds, quantity, unit, habits(name, color), habit_check_ins(local_date)")
    .eq("resource_id", resourceId)
    .order("created_at", { ascending: false });

  if (error) throw new HttpError(error.message);
  return (data ?? []).map((row: any) => {
    const { habit_check_ins, ...rest } = row;
    return { ...rest, local_date: habit_check_ins?.local_date ?? null };
  });
}

export async function listNotesForResource(supabase: SupabaseClient, resourceId: string) {
  const { data, error } = await supabase
    .from("note_resources")
    .select("notes(id, title, content, created_at)")
    .eq("resource_id", resourceId);

  if (error) throw new HttpError(error.message);
  return (data ?? []).map((row: any) => row.notes);
}

export async function deleteResource(supabase: SupabaseClient, id: string): Promise<void> {
  // Por si la FK de 'books' no tiene ON DELETE CASCADE — borrar primero es seguro
  // incluso si ya se propagó (0 filas afectadas no es error).
  const { error: bookError } = await supabase.from("books").delete().eq("resource_id", id);
  if (bookError) throw new HttpError(bookError.message);

  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) throw new HttpError(error.message);
}
