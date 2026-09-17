import { Link } from "react-router-dom";
import { useApiQuery } from "../../hooks/useApiQuery";
import { listNotes } from "../../services/notes.service";
import { Card } from "../../components/ui/Card";

const MAX_VISIBLE = 3;

export function RecentNotesSummary() {
  const { data: notes, loading } = useApiQuery((signal) => listNotes(undefined, signal), []);

  if (loading || !notes || notes.length === 0) return null;

  const visible = notes.slice(0, MAX_VISIBLE);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <p className="flicker font-mono text-xs tracking-widest text-primary">RECENT NOTES</p>
        {notes.length > MAX_VISIBLE && (
          <Link to="/notes" className="text-xs text-text-muted hover:text-primary">
            Ver todas ({notes.length})
          </Link>
        )}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {visible.map((note) => (
          <Link key={note.id} to={`/notes/${note.id}`}>
            <Card className="h-full hover:border-border-hover">
              <p className="text-sm font-medium text-text">{note.title || "Sin título"}</p>
              <p className="mt-1 line-clamp-2 text-xs text-text-muted">{note.content}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
