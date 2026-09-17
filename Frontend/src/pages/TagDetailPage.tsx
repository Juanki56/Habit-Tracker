import { Link, useParams } from "react-router-dom";
import { useApiQuery } from "../hooks/useApiQuery";
import * as tagsService from "../services/tags.service";
import { Card } from "../components/ui/Card";
import { EmptyState, LoadingState } from "../components/ui/StateViews";
import { GlitchText } from "../components/ui/GlitchText";

export function TagDetailPage() {
  const { id: routeId } = useParams<{ id: string }>();
  const id = routeId ?? "";

  const { data: allTags } = useApiQuery((signal) => tagsService.listTags(signal), []);
  const tag = allTags?.find((t) => t.id === id);

  const { data: habits, loading: loadingHabits } = useApiQuery(
    (signal) => tagsService.listHabitsForTag(id, signal),
    [id]
  );
  const { data: activities, loading: loadingActivities } = useApiQuery(
    (signal) => tagsService.listActivitiesForTag(id, signal),
    [id]
  );
  const { data: resources, loading: loadingResources } = useApiQuery(
    (signal) => tagsService.listResourcesForTag(id, signal),
    [id]
  );
  const { data: notes, loading: loadingNotes } = useApiQuery(
    (signal) => tagsService.listNotesForTag(id, signal),
    [id]
  );

  if (!routeId) return null;

  const loading = loadingHabits || loadingActivities || loadingResources || loadingNotes;
  const total = (habits?.length ?? 0) + (activities?.length ?? 0) + (resources?.length ?? 0) + (notes?.length ?? 0);

  return (
    <div>
      <p className="flicker font-mono text-xs tracking-widest text-primary">TAG</p>
      <GlitchText as="h1" className="mt-1 text-2xl font-semibold text-text">
        {`#${tag?.name ?? "…"}`}
      </GlitchText>

      {loading && <LoadingState />}

      {!loading && total === 0 && (
        <EmptyState title="Nada tiene este tag todavía" description="Etiqueta un hábito, actividad, recurso o nota para verlo aquí." />
      )}

      {!loading && total > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(habits?.length ?? 0) > 0 && (
            <Card>
              <p className="flicker font-mono text-xs tracking-widest text-primary">HABITS</p>
              <ul className="mt-2 flex flex-col gap-1">
                {habits!.map((h) => (
                  <li key={h.id}>
                    <Link to={`/habits/${h.id}`} className="text-sm text-text-muted hover:text-primary">
                      {h.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {(activities?.length ?? 0) > 0 && (
            <Card>
              <p className="flicker font-mono text-xs tracking-widest text-primary">ACTIVITIES</p>
              <ul className="mt-2 flex flex-col gap-1">
                {activities!.map((a) => (
                  <li key={a.id}>
                    <Link to={`/habits/${a.habit_id}`} className="text-sm text-text-muted hover:text-primary">
                      {a.title || "Actividad"}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {(resources?.length ?? 0) > 0 && (
            <Card>
              <p className="flicker font-mono text-xs tracking-widest text-primary">RESOURCES</p>
              <ul className="mt-2 flex flex-col gap-1">
                {resources!.map((r) => (
                  <li key={r.id}>
                    <Link to={`/resources/${r.id}`} className="text-sm text-text-muted hover:text-primary">
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {(notes?.length ?? 0) > 0 && (
            <Card>
              <p className="flicker font-mono text-xs tracking-widest text-primary">NOTES</p>
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
      )}
    </div>
  );
}
