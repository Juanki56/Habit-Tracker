import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, TextArea, TextInput } from "../../components/ui/FormControls";
import { updateResource } from "../../services/resources.service";
import type { ResourceWithBook } from "../../types/resource";

export function ResourceEditForm({
  resource,
  onDone,
  onCancel,
}: {
  resource: ResourceWithBook;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(resource.description ?? "");
  const [url, setUrl] = useState(resource.url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateResource(resource.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        url: url.trim() || undefined,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos actualizar el recurso");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="max-w-md">
      <div className="flex flex-col gap-3">
        <Field label="Título">
          <TextInput autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="URL">
          <TextInput type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
        </Field>
        <Field label="Descripción">
          <TextArea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !title.trim()}>
            {submitting ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
