import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// Solo para verificar tokens — nunca lo uses para leer/escribir datos de un usuario.
export const supabaseAnon = createClient(env.supabaseUrl, env.supabaseAnonKey);

// Cliente ligado al JWT del usuario: todas las consultas respetan auth.uid() y el RLS.
export function getSupabaseForUser(accessToken: string): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}