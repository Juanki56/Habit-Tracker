import { Link } from "react-router-dom";
import type { HabitOverviewItem } from "../../types/dashboard";
import { Card } from "../../components/ui/Card";
import { formatDuration } from "../../utils/dates";

export function HabitOverviewCard({ habit }: { habit: HabitOverviewItem }) {
  return (
    <Link to={`/habits/${habit.habit_id}`}>
      <Card className="h-full transition-colors hover:border-border-hover">
        <div className="flex items-start justify-between">
          <h3 className="font-mono text-sm tracking-wide text-primary uppercase">{habit.name}</h3>
          {habit.current_streak > 0 && (
            <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-text-muted">
              {habit.current_streak}d
            </span>
          )}
        </div>

        <p className="mt-3 text-2xl font-semibold text-text">
          {formatDuration(habit.total_duration_seconds)}
        </p>
        <p className="text-xs text-text-muted">tiempo invertido en total</p>

        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
          <div>
            <dt className="text-xs text-text-dim">Completados</dt>
            <dd className="text-sm font-medium text-success">{habit.completed_days}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-dim">Saltados</dt>
            <dd className="text-sm font-medium text-text-muted">{habit.skipped_days}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-dim">Actividades</dt>
            <dd className="text-sm font-medium text-text">{habit.total_activities}</dd>
          </div>
        </dl>
      </Card>
    </Link>
  );
}
