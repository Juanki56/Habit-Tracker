import { useState } from "react";
import { GlitchText } from "../components/ui/GlitchText";
import { useApiQuery } from "../hooks/useApiQuery";
import { listNotes } from "../services/notes.service";
import { NoteCard } from "../features/notes/NoteCard";
import { NoteFormModal } from "../features/notes/NoteFormModal";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/StateViews";

export function NotesPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: notes, loading, error, refetch } = useApiQuery((signal) => listNotes(undefined, signal), []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="flicker font-mono text-xs tracking-widest text-primary">NOTES</p>
          <GlitchText as="h1" className="mt-1 text-2xl font-semibold text-text">Lo que piensas en el camino</GlitchText>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Nueva nota</Button>
      </div>

      <div className="mt-6">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && notes && notes.length === 0 && (
          <EmptyState
            title="Todavía no tienes notas"
            description="Escribe una reflexión y relaciónala con un hábito o recurso si quieres."
            action={<Button onClick={() => setShowForm(true)}>+ Nueva nota</Button>}
          />
        )}
        {!loading && !error && notes && notes.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <NoteFormModal
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
