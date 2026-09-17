import { useState } from "react";
import { Link } from "react-router-dom";
import { useApiQuery } from "../../hooks/useApiQuery";
import * as tagsService from "../../services/tags.service";
import type { TaggableKind } from "../../types/tag";

interface TagListProps {
  kind: TaggableKind;
  entityId: string;
  editable?: boolean;
}

// Los tags son opcionales en todo el producto: este componente nunca bloquea
// nada, solo aparece cuando hay algo que mostrar o cuando se pide poder editar.
export function TagList({ kind, entityId, editable = false }: TagListProps) {
  const { data: tags, loading, refetch } = useApiQuery(
    (signal) => tagsService.listTagsFor(kind, entityId, signal),
    [kind, entityId]
  );
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleDetach(tagId: string) {
    await tagsService.detachTag(kind, entityId, tagId);
    refetch();
  }

  async function handleAdd() {
    const name = value.trim();
    if (!name) {
      setAdding(false);
      return;
    }
    setSubmitting(true);
    try {
      const tag = await tagsService.createTag(name);
      await tagsService.attachTag(kind, entityId, tag.id);
      setValue("");
      setAdding(false);
      refetch();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags?.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1 rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-text-muted"
        >
          <Link to={`/tags/${tag.id}`} className="hover:text-primary">
            #{tag.name}
          </Link>
          {editable && (
            <button
              onClick={() => handleDetach(tag.id)}
              aria-label={`Quitar tag ${tag.name}`}
              className="text-text-dim hover:text-danger"
            >
              ✕
            </button>
          )}
        </span>
      ))}

      {editable && !adding && (
        <button
          onClick={() => setAdding(true)}
          className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-text-dim hover:border-border-hover hover:text-text-muted"
        >
          + tag
        </button>
      )}

      {editable && adding && (
        <input
          autoFocus
          value={value}
          disabled={submitting}
          placeholder="nombre…"
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleAdd}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") {
              setValue("");
              setAdding(false);
            }
          }}
          className="w-24 rounded-full border border-border bg-surface-elevated px-2 py-0.5 text-xs text-text outline-none focus:border-primary"
        />
      )}
    </div>
  );
}
