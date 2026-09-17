import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { useApiQuery } from "../hooks/useApiQuery";
import * as habitCategoriesService from "../services/habit-categories.service";
import { Button } from "../components/ui/Button";
import { TextInput } from "../components/ui/FormControls";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/StateViews";
import { GlitchText } from "../components/ui/GlitchText";

export function CategoriesPage() {
  const { user } = useAuth();
  const { data: categories, loading, error, refetch } = useApiQuery(
    (signal) => habitCategoriesService.listCategories(signal),
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
      await habitCategoriesService.createCategory({ name: name.trim() });
      setName("");
      refetch();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    await habitCategoriesService.deleteCategory(id);
    refetch();
  }

  async function confirmRename() {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    await habitCategoriesService.updateCategory(renamingId, { name: renameValue.trim() });
    setRenamingId(null);
    refetch();
  }

  return (
    <div>
      <p className="flicker font-mono text-xs tracking-widest text-primary">CATEGORIES</p>
      <GlitchText as="h1" className="mt-1 text-2xl font-semibold text-text">
        Cómo agrupas tus hábitos
      </GlitchText>

      <form onSubmit={handleCreate} className="mt-4 flex max-w-sm gap-2">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre…" className="flex-1" />
        <Button type="submit" disabled={submitting || !name.trim()}>
          + Nueva categoría
        </Button>
      </form>

      <div className="mt-6">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && categories && categories.length === 0 && (
          <EmptyState title="No tienes categorías todavía" description="Créalas cuando quieras agrupar tus hábitos." />
        )}
        {!loading && !error && categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isOwn = category.user_id === user?.id;
              const isRenaming = renamingId === category.id;
              return (
                <span
                  key={category.id}
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
                          setRenamingId(category.id);
                          setRenameValue(category.name);
                        }
                      }}
                      title={isOwn ? "Click para renombrar" : "Categoría global — no editable"}
                    >
                      {category.name}
                    </span>
                  )}
                  {isOwn && (
                    <button
                      onClick={() => handleDelete(category.id)}
                      aria-label={`Eliminar categoría ${category.name}`}
                      className="text-text-dim hover:text-danger"
                    >
                      ✕
                    </button>
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
