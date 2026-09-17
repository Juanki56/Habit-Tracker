import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useApiQuery } from "../hooks/useApiQuery";
import {
  getNote, updateNote, deleteNote, linkHabit, unlinkHabit, linkResource, unlinkResource,
} from "../services/notes.service";
import { listHabits } from "../services/habits.service";
import { listResources } from "../services/resources.service";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { TextArea, TextInput } from "../components/ui/FormControls";
import { ErrorState, LoadingState } from "../components/ui/StateViews";
import { GlitchText } from "../components/ui/GlitchText";
import { TagList } from "../features/tags/TagList";

export function NoteDetailPage() {
  const { id: routeId } = useParams<{ id: string }>();
  const id = routeId ?? "";
  const navigate = useNavigate();

  const { data: note, loading, error, refetch } = useApiQuery((signal) => getNote(id, signal), [id]);
  const { data: allHabits } = useApiQuery((signal) => listHabits(true, signal), []);
  const { data: allResources } = useApiQuery((signal) => listResources({}, signal), []);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  if (!routeId) return null;
  if (loading) return <LoadingState />;
  if (error || !note) return <ErrorState message={error ?? "Nota no encontrada"} onRetry={refetch} />;

  function startEditing() {
    if (!note) return;
    setTitle(note.title ?? "");
    setContent(note.content);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateNote(id, { title: title.trim() || undefined, content: content.trim() });
      setEditing(false);
      refetch();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta nota?")) return;
    await deleteNote(id);
    navigate("/notes");
  }

  async function toggleHabitLink(habitId: string) {
    if (!note) return;
    if (note.habit_ids.includes(habitId)) {
      await unlinkHabit(id, habitId);
    } else {
      await linkHabit(id, habitId);
    }
    refetch();
  }

  async function toggleResourceLink(resourceId: string) {
    if (!note) return;
    if (note.resource_ids.includes(resourceId)) {
      await unlinkResource(id, resourceId);
    } else {
      await linkResource(id, resourceId);
    }
    refetch();
  }

  const linkedHabits = (allHabits ?? []).filter((h) => note.habit_ids.includes(h.id));
  const unlinkedHabits = (allHabits ?? []).filter((h) => !note.habit_ids.includes(h.id));
  const linkedResources = (allResources ?? []).filter((r) => note.resource_ids.includes(r.id));
  const unlinkedResources = (allResources ?? []).filter((r) => !note.resource_ids.includes(r.id));

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        {editing ? (
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título (opcional)"
            className="flex-1 text-lg font-semibold"
          />
        ) : (
          <GlitchText as="h1" className="text-2xl font-semibold text-text">
            {note.title || "Sin título"}
          </GlitchText>
        )}
        <div className="flex shrink-0 gap-2">
          {!editing && (
            <Button variant="ghost" onClick={startEditing}>
              Editar
            </Button>
          )}
          <Button variant="ghost" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </div>

      <Card className="mt-4">
        {editing ? (
          <div className="flex flex-col gap-3">
            <TextArea rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving || !content.trim()}>
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm text-text-muted">{note.content}</p>
        )}
      </Card>

      <div className="mt-4">
        <TagList kind="notes" entityId={note.id} editable />
      </div>

      <div className="mt-6">
        <p className="flicker font-mono text-xs tracking-widest text-primary">RELATED RESOURCES</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {linkedResources.map((resource) => (
            <span key={resource.id} className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-sm text-primary">
              <Link to={`/resources/${resource.id}`} className="hover:underline">
                {resource.title}
              </Link>
              <button onClick={() => toggleResourceLink(resource.id)} className="hover:text-danger">
                ✕
              </button>
            </span>
          ))}
          {unlinkedResources.map((resource) => (
            <button
              key={resource.id}
              onClick={() => toggleResourceLink(resource.id)}
              className="rounded-md bg-surface-elevated px-2.5 py-1 text-sm text-text-dim hover:text-text-muted"
            >
              + {resource.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="flicker font-mono text-xs tracking-widest text-primary">RELATED HABITS</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {linkedHabits.map((habit) => (
            <button
              key={habit.id}
              onClick={() => toggleHabitLink(habit.id)}
              className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-sm text-primary"
            >
              {habit.name} ✕
            </button>
          ))}
          {unlinkedHabits.map((habit) => (
            <button
              key={habit.id}
              onClick={() => toggleHabitLink(habit.id)}
              className="rounded-md bg-surface-elevated px-2.5 py-1 text-sm text-text-dim hover:text-text-muted"
            >
              + {habit.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
