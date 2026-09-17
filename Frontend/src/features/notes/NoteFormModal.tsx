import { useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Field, TextArea, TextInput } from "../../components/ui/FormControls";
import { Button } from "../../components/ui/Button";
import { useApiQuery } from "../../hooks/useApiQuery";
import { listHabits } from "../../services/habits.service";
import { listResources } from "../../services/resources.service";
import { createNote } from "../../services/notes.service";
import type { NoteWithLinks } from "../../types/note";

interface NoteFormModalProps {
  onClose: () => void;
  onCreated: (note: NoteWithLinks) => void;
}

export function NoteFormModal({ onClose, onCreated }: NoteFormModalProps) {
  const { data: habits } = useApiQuery((signal) => listHabits(true, signal), []);
  const { data: resources } = useApiQuery((signal) => listResources({}, signal), []);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [habitIds, setHabitIds] = useState<string[]>([]);
  const [resourceIds, setResourceIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const note = await createNote({
        title: title.trim() || undefined,
        content: content.trim(),
        habit_ids: habitIds.length > 0 ? habitIds : undefined,
        resource_ids: resourceIds.length > 0 ? resourceIds : undefined,
      });
      onCreated(note);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar la nota");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Nueva nota" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Título (opcional)">
          <TextInput autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>

        <Field label="Contenido">
          <TextArea required rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
        </Field>

        {habits && habits.length > 0 && (
          <div>
            <p className="mb-2 text-sm text-text-muted">Relacionar con hábitos (opcional)</p>
            <div className="flex flex-wrap gap-2">
              {habits.map((habit) => (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => toggle(habitIds, setHabitIds, habit.id)}
                  className={`rounded-md px-2 py-1 text-xs ${
                    habitIds.includes(habit.id) ? "bg-primary/20 text-primary" : "bg-surface-elevated text-text-muted"
                  }`}
                >
                  {habit.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {resources && resources.length > 0 && (
          <div>
            <p className="mb-2 text-sm text-text-muted">Relacionar con recursos (opcional)</p>
            <div className="flex flex-wrap gap-2">
              {resources.map((resource) => (
                <button
                  key={resource.id}
                  type="button"
                  onClick={() => toggle(resourceIds, setResourceIds, resource.id)}
                  className={`rounded-md px-2 py-1 text-xs ${
                    resourceIds.includes(resource.id)
                      ? "bg-primary/20 text-primary"
                      : "bg-surface-elevated text-text-muted"
                  }`}
                >
                  {resource.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting || !content.trim()}>
            {submitting ? "Guardando…" : "Guardar nota"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
