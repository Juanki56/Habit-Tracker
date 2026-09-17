import { useState } from "react";
import { GlitchText } from "../components/ui/GlitchText";
import { useApiQuery } from "../hooks/useApiQuery";
import { listResources } from "../services/resources.service";
import { ResourceCard } from "../features/resources/ResourceCard";
import { ResourceFormModal } from "../features/resources/ResourceFormModal";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/StateViews";
import { RESOURCE_TYPE_LABELS } from "../types/resource";
import type { ResourceType } from "../types/resource";

const TABS: Array<{ value: ResourceType | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  ...Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => ({ value: value as ResourceType, label })),
];

export function ResourcesPage() {
  const [tab, setTab] = useState<ResourceType | "all">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const {
    data: resources,
    loading,
    error,
    refetch,
  } = useApiQuery(
    (signal) => listResources({ type: tab === "all" ? undefined : tab, search: search || undefined }, signal),
    [tab, search]
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="flicker font-mono text-xs tracking-widest text-primary">RESOURCES</p>
          <GlitchText as="h1" className="mt-1 text-2xl font-semibold text-text">Lo que consumes para crecer</GlitchText>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Nuevo recurso</Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Buscar recursos…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`rounded-md px-3 py-1.5 text-xs ${
                tab === t.value ? "bg-primary/20 text-primary" : "bg-surface-elevated text-text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && resources && resources.length === 0 && (
          <EmptyState
            title="Todavía no tienes recursos"
            description="Guarda las cosas de las que estás aprendiendo — libros, artículos, videos, cursos."
            action={<Button onClick={() => setShowForm(true)}>+ Nuevo recurso</Button>}
          />
        )}
        {!loading && !error && resources && resources.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ResourceFormModal
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
