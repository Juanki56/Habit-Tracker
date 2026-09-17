import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { useApiQuery } from "../../hooks/useApiQuery";
import { listActivitiesForResource, listNotesForResource } from "../../services/resources.service";
import { formatDuration } from "../../utils/dates";

// El camino inverso que faltaba: antes solo se veía "actividad -> recurso"
// (en la lista de actividades), nunca "recurso -> qué lo usó".
export function ResourceConnections({ resourceId }: { resourceId: string }) {
  const { data: activities } = useApiQuery((signal) => listActivitiesForResource(resourceId, signal), [resourceId]);
  const { data: notes } = useApiQuery((signal) => listNotesForResource(resourceId, signal), [resourceId]);

  const hasActivities = (activities?.length ?? 0) > 0;
  const hasNotes = (notes?.length ?? 0) > 0;

  if (!hasActivities && !hasNotes) return null;

  return (
    <div className="mt-6 flex flex-col gap-4">
      {hasActivities && (
        <Card className="max-w-md">
          <p className="flicker font-mono text-xs tracking-widest text-primary">USADO EN</p>
          <ul className="mt-2 flex flex-col gap-1">
            {activities!.map((a) => (
              <li key={a.id} className="text-sm">
                <Link to={`/habits/${a.habit_id}`} className="text-text-muted hover:text-primary">
                  {a.habits.name}
                </Link>
                <span className="text-text-dim">
                  {" "}
                  · {a.title || "Actividad"}
                  {a.duration_seconds ? ` · ${formatDuration(a.duration_seconds)}` : ""}
                  {a.quantity ? ` · ${a.quantity} ${a.unit ?? ""}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {hasNotes && (
        <Card className="max-w-md">
          <p className="flicker font-mono text-xs tracking-widest text-primary">NOTAS RELACIONADAS</p>
          <ul className="mt-2 flex flex-col gap-1">
            {notes!.map((n) => (
              <li key={n.id}>
                <Link to={`/notes/${n.id}`} className="text-sm text-text-muted hover:text-primary">
                  {n.title || "Sin título"}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
