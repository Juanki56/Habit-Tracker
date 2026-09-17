import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiQuery } from "../hooks/useApiQuery";
import { getResource, deleteResource } from "../services/resources.service";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { GlitchText } from "../components/ui/GlitchText";
import { ErrorState, LoadingState } from "../components/ui/StateViews";
import { BookDetail } from "../features/resources/BookDetail";
import { ResourceEditForm } from "../features/resources/ResourceEditForm";
import { ResourceConnections } from "../features/resources/ResourceConnections";
import { TagList } from "../features/tags/TagList";
import { RESOURCE_TYPE_LABELS } from "../types/resource";

export function ResourceDetailPage() {
  const { id: routeId } = useParams<{ id: string }>();
  const id = routeId ?? "";
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const { data: resource, loading, error, refetch } = useApiQuery(
    (signal) => getResource(id, signal),
    [id]
  );

  if (!routeId) return null;
  if (loading) return <LoadingState />;
  if (error || !resource) {
    return <ErrorState message={error ?? "Recurso no encontrado"} onRetry={refetch} />;
  }

  async function handleDelete() {
    if (!resource) return;
    if (!confirm(`¿Eliminar "${resource.title}"?`)) return;
    await deleteResource(resource.id);
    navigate("/resources");
  }

  if (editing) {
    return (
      <ResourceEditForm
        resource={resource}
        onDone={() => {
          setEditing(false);
          refetch();
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flicker font-mono text-xs tracking-widest text-primary">
            {RESOURCE_TYPE_LABELS[resource.resource_type]}
          </p>
          <GlitchText as="h1" className="mt-1 text-2xl font-semibold text-text">
            {resource.title}
          </GlitchText>
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-sm text-primary hover:underline"
            >
              {resource.url}
            </a>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" onClick={() => setEditing(true)}>
            Editar
          </Button>
          <Button variant="ghost" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </div>

      {resource.description && <p className="mt-4 text-sm text-text-muted">{resource.description}</p>}

      <div className="mt-3">
        <TagList kind="resources" entityId={resource.id} editable />
      </div>

      {resource.book && (
        <div className="mt-6 max-w-md">
          <BookDetail resourceId={resource.id} book={resource.book} onChange={refetch} />
        </div>
      )}

      {!resource.book && (
        <Card className="mt-6 max-w-md">
          <p className="text-sm text-text-muted">
            Este recurso se puede vincular desde una actividad (deep log) para relacionarlo con lo que
            practicas.
          </p>
        </Card>
      )}

      <ResourceConnections resourceId={resource.id} />
    </div>
  );
}
