import { Link } from "react-router-dom";
import type { NoteWithLinks } from "../../types/note";
import { Card } from "../../components/ui/Card";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });
}

export function NoteCard({ note }: { note: NoteWithLinks }) {
  return (
    <Link to={`/notes/${note.id}`}>
      <Card className="h-full transition-colors hover:border-border-hover">
        <p className="text-xs text-text-dim">{formatDate(note.created_at)}</p>
        <h3 className="mt-1 font-medium text-text">{note.title || "Sin título"}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-text-muted">{note.content}</p>
        {(note.habit_ids.length > 0 || note.resource_ids.length > 0) && (
          <p className="mt-2 text-xs text-text-dim">
            {note.habit_ids.length > 0 && `${note.habit_ids.length} hábito(s)`}
            {note.habit_ids.length > 0 && note.resource_ids.length > 0 && " · "}
            {note.resource_ids.length > 0 && `${note.resource_ids.length} recurso(s)`}
          </p>
        )}
      </Card>
    </Link>
  );
}
