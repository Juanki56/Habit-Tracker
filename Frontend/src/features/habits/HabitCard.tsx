import { Link } from "react-router-dom";
import type { Habit } from "../../types/habit";
import { Card } from "../../components/ui/Card";

export function HabitCard({ habit }: { habit: Habit }) {
  return (
    <Link to={`/habits/${habit.id}`}>
      <Card className="h-full transition-colors hover:border-border-hover">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: habit.color ?? "var(--color-primary)" }}
          />
          <h3 className="font-medium text-text">{habit.name}</h3>
        </div>
        {habit.description && (
          <p className="mt-2 line-clamp-2 text-sm text-text-muted">{habit.description}</p>
        )}
      </Card>
    </Link>
  );
}
