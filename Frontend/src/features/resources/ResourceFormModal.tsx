import { useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Field, Select, TextArea, TextInput } from "../../components/ui/FormControls";
import { Button } from "../../components/ui/Button";
import { createResource } from "../../services/resources.service";
import { RESOURCE_TYPE_LABELS } from "../../types/resource";
import type { ResourceType, ResourceWithBook } from "../../types/resource";

interface ResourceFormModalProps {
  onClose: () => void;
  onCreated: (resource: ResourceWithBook) => void;
}

export function ResourceFormModal({ onClose, onCreated }: ResourceFormModalProps) {
  const [resourceType, setResourceType] = useState<ResourceType>("article");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const resource = await createResource({
        resource_type: resourceType,
        title: title.trim(),
        description: description.trim() || undefined,
        url: url.trim() || undefined,
        book:
          resourceType === "book"
            ? {
                author: author.trim() || undefined,
                total_pages: totalPages ? Number(totalPages) : undefined,
              }
            : undefined,
      });
      onCreated(resource);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar el recurso");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Nuevo recurso" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Tipo">
          <Select value={resourceType} onChange={(e) => setResourceType(e.target.value as ResourceType)}>
            {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Título">
          <TextInput required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>

        {resourceType === "book" && (
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
            <Field label="Autor (opcional)">
              <TextInput value={author} onChange={(e) => setAuthor(e.target.value)} />
            </Field>
            <Field label="Páginas totales (opcional)">
              <TextInput type="number" min={1} value={totalPages} onChange={(e) => setTotalPages(e.target.value)} />
            </Field>
          </div>
        )}

        <Field label="URL (opcional)">
          <TextInput type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
        </Field>

        <Field label="Descripción (opcional)">
          <TextArea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting || !title.trim()}>
            {submitting ? "Guardando…" : "Guardar recurso"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
