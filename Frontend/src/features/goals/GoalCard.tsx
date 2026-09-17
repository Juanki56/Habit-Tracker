import { Link } from "react-router-dom";
import type { GoalWithRelations } from "../../types/goal";
import { GOAL_DIRECTION_LABELS } from "../../types/goal";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { computeGoalProgress } from "../../utils/goalProgress";

export function GoalCard({ goal }: { goal: GoalWithRelations }) {
  const { percentage, hasData } = computeGoalProgress(goal, goal.current_value);
  const target = goal.direction === "maintain" ? goal.maximum_value : goal.target_value;

  return (
    <Link to={`/goals/${goal.id}`}>
      <Card className="h-full transition-colors hover:border-border-hover">
        <p className="flicker font-mono text-xs tracking-widest text-primary uppercase">
          {GOAL_DIRECTION_LABELS[goal.direction]}
        </p>
        <h3 className="mt-1 font-medium text-text">{goal.name}</h3>

        {hasData && target != null ? (
          <>
            <p className="mt-3 text-sm text-text-muted">
              {goal.current_value} / {target} {goal.unit ?? ""}
            </p>
            <div className="mt-1">
              <ProgressBar value={percentage ?? 0} max={100} tone="success" />
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-text-dim">Sin métricas asignadas todavía.</p>
        )}
      </Card>
    </Link>
  );
}
