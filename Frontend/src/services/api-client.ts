import { supabase } from "./supabase";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | undefined>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Record<string, string | undefined>): string {
  const url = new URL(BASE_URL + path);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, value);
  }
  return url.toString();
}

// Cada request necesita el JWT vigente de la sesión de Supabase Auth —
// el backend lo valida en requireAuth y arma un cliente de Supabase ligado a ese usuario.
async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const authHeader = await getAuthHeader();

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (payload as { error?: string } | null)?.error ?? "No pudimos completar la solicitud";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
