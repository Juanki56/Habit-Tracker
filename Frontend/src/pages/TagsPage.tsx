import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { GlitchText } from "../components/ui/GlitchText";
import { useApiQuery } from "../hooks/useApiQuery";
import * as tagsService from "../services/tags.service";
import { Button } from "../components/ui/Button";
import { TextInput } from "../components/ui/FormControls";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/StateViews";

export function TagsPage() {
  const { data: tags, loading, error, refetch } = useApiQuery((signal) => tagsService.listTags(signal), []);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await tagsService.createTag(name.trim());
      setName("");
      refetch();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este tag? Se quitará de todo lo que lo use.")) return;
    await tagsService.deleteTag(id);
    refetch();
  }

  return (
    <div>
      <p className="flicker font-mono text-xs tracking-widest text-primary">TAGS</p>
      <GlitchText as="h1" className="mt-1 text-2xl font-semibold text-text">Cómo organizas tu sistema</GlitchText>
      <p className="mt-1 text-sm text-text-muted">
        Son completamente opcionales — úsalos solo si te ayudan a encontrar cosas después.
      </p>

      <form onSubmit={handleCreate} className="mt-4 flex max-w-sm gap-2">
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del tag…"
          className="flex-1"
        />
        <Button type="submit" disabled={submitting || !name.trim()}>
          + Nuevo tag
        </Button>
      </form>

      <div className="mt-6">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && tags && tags.length === 0 && (
          <EmptyState
            title="No tienes tags todavía"
            description="Créalos cuando necesites otra forma de organizar tus cosas."
          />
        )}
        {!loading && !error && tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-2 rounded-full bg-surface-elevated px-3 py-1 text-sm text-text-muted"
              >
                <Link to={`/tags/${tag.id}`} className="hover:text-primary">
                  #{tag.name}
                </Link>
                <button
                  onClick={() => handleDelete(tag.id)}
                  aria-label={`Eliminar tag ${tag.name}`}
                  className="text-text-dim hover:text-danger"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
