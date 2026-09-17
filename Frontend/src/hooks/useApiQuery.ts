import { useEffect, useState, useCallback } from "react";
import { ApiError } from "../services/api-client";

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Hook mínimo de fetch+cache-por-instancia. Con pocos endpoints y sin necesidad
// de cache compartida entre pantallas, no justifica sumar una librería como
// TanStack Query todavía — si el árbol de datos crece (goals, resources...),
// vale la pena reconsiderarlo.
export function useApiQuery<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<QueryState<T>>({ data: null, loading: true, error: null });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcher(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message = err instanceof ApiError ? err.message : "No pudimos cargar la información";
        setState({ data: null, loading: false, error: message });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { ...state, refetch };
}
