import { Link } from "react-router-dom";
import { useApiQuery } from "../../hooks/useApiQuery";
import { listGoals } from "../../services/goals.service";
import { computeGoalProgress } from "../../utils/goalProgress";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Card } from "../../components/ui/Card";

const MAX_VISIBLE = 3;

export function ActiveGoalsSummary() {
  const { data: goals, loading } = useApiQuery((signal) => listGoals(signal), []);

  if (loading || !goals || goals.length === 0) return null;

  const visible = goals.slice(0, MAX_VISIBLE);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <p className="flicker font-mono text-xs tracking-widest text-primary">ACTIVE GOALS</p>
        {goals.length > MAX_VISIBLE && (
          <Link to="/goals" className="text-xs text-text-muted hover:text-primary">
            Ver todos ({goals.length})
          </Link>
        )}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {visible.map((goal) => {
          const { percentage, hasData } = computeGoalProgress(goal, goal.current_value);
          const target = goal.direction === "maintain" ? goal.maximum_value : goal.target_value;
          return (
            <Link key={goal.id} to={`/goals/${goal.id}`}>
              <Card className="h-full hover:border-border-hover">
                <p className="text-sm font-medium text-text">{goal.name}</p>
                {hasData && target != null ? (
                  <>
                    <p className="mt-1 text-xs text-text-muted">
                      {goal.current_value} / {target} {goal.unit ?? ""}
                    </p>
                    <div className="mt-2">
                      <ProgressBar value={percentage ?? 0} max={100} tone="success" />
                    </div>
                  </>
                ) : (
                  <p className="mt-1 text-xs text-text-dim">Sin métricas todavía</p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
