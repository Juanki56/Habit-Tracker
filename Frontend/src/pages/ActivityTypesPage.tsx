import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { useApiQuery } from "../hooks/useApiQuery";
import * as activityTypesService from "../services/activity-types.service";
import { Button } from "../components/ui/Button";
import { TextInput } from "../components/ui/FormControls";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/StateViews";
import { GlitchText } from "../components/ui/GlitchText";

// No hay borrar aquí a propósito: un tipo de actividad puede tener actividades
// históricas reales registradas con él, y borrarlo las dejaría huérfanas o
// las arrastraría consigo — eso no se pidió, así que solo se puede renombrar
// o quitar de un hábito puntual (desde el detalle del hábito).
export function ActivityTypesPage() {
  const { user } = useAuth();
  const { data: types, loading, error, refetch } = useApiQuery(
    (signal) => activityTypesService.listActivityTypes(signal),
    []
  );
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await activityTypesService.createActivityType({ name: name.trim() });
      setName("");
      refetch();
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmRename() {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    await activityTypesService.updateActivityType(renamingId, { name: renameValue.trim() });
    setRenamingId(null);
    refetch();
  }

  return (
    <div>
      <p className="flicker font-mono text-xs tracking-widest text-primary">ACTIVITY TYPES</p>
      <GlitchText as="h1" className="mt-1 text-2xl font-semibold text-text">
        Qué tipos de actividad usas
      </GlitchText>
      <p className="mt-1 text-sm text-text-muted">
        Se habilitan por hábito desde "Registrar actividad" — aquí los ves todos juntos y puedes renombrar
        los tuyos.
      </p>

      <form onSubmit={handleCreate} className="mt-4 flex max-w-sm gap-2">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre…" className="flex-1" />
        <Button type="submit" disabled={submitting || !name.trim()}>
          + Nuevo tipo
        </Button>
      </form>

      <div className="mt-6">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && types && types.length === 0 && (
          <EmptyState title="No tienes tipos de actividad todavía" />
        )}
        {!loading && !error && types && types.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {types.map((type) => {
              const isOwn = type.user_id === user?.id;
              const isRenaming = renamingId === type.id;
              return (
                <span
                  key={type.id}
                  className="inline-flex items-center gap-2 rounded-full bg-surface-elevated px-3 py-1 text-sm text-text-muted"
                >
                  {isRenaming ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={confirmRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmRename();
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      className="w-28 rounded border border-border bg-surface px-1.5 py-0.5 text-text outline-none focus:border-primary"
                    />
                  ) : (
                    <span
                      className={isOwn ? "cursor-pointer hover:text-primary" : ""}
                      onClick={() => {
                        if (isOwn) {
                          setRenamingId(type.id);
                          setRenameValue(type.name);
                        }
                      }}
                      title={isOwn ? "Click para renombrar" : "Tipo global — no editable"}
                    >
                      {type.name}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
