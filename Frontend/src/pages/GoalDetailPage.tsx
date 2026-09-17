import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiQuery } from "../hooks/useApiQuery";
import { getGoal, deleteGoal } from "../services/goals.service";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { ErrorState, LoadingState } from "../components/ui/StateViews";
import { GlitchText } from "../components/ui/GlitchText";
import { computeGoalProgress } from "../utils/goalProgress";
import { GoalEditForm } from "../features/goals/GoalEditForm";
import { GoalConnectionsCard } from "../features/goals/GoalConnectionsCard";
import { GOAL_DIRECTION_LABELS, GOAL_PERIOD_LABELS } from "../types/goal";

export function GoalDetailPage() {
  const { id: routeId } = useParams<{ id: string }>();
  const id = routeId ?? "";
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const { data: goal, loading, error, refetch } = useApiQuery((signal) => getGoal(id, signal), [id]);

  if (!routeId) return null;
  if (loading) return <LoadingState />;
  if (error || !goal) return <ErrorState message={error ?? "Goal no encontrado"} onRetry={refetch} />;

  const { percentage, hasData } = computeGoalProgress(goal, goal.current_value);
  const target = goal.direction === "maintain" ? goal.maximum_value : goal.target_value;

  async function handleDelete() {
    if (!goal) return;
    if (!confirm(`¿Eliminar el goal "${goal.name}"?`)) return;
    await deleteGoal(goal.id);
    navigate("/goals");
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flicker font-mono text-xs tracking-widest text-primary">
            {GOAL_DIRECTION_LABELS[goal.direction]} · {GOAL_PERIOD_LABELS[goal.period_type]}
          </p>
          <GlitchText as="h1" className="mt-1 text-2xl font-semibold text-text">
            {goal.name}
          </GlitchText>
          {goal.description && <p className="mt-1 text-sm text-text-muted">{goal.description}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          {!editing && (
            <Button variant="ghost" onClick={() => setEditing(true)}>
              Editar
            </Button>
          )}
          <Button variant="ghost" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </div>

      {editing && (
        <Card className="mt-6 max-w-md">
          <GoalEditForm
            goal={goal}
            onDone={() => {
              setEditing(false);
              refetch();
            }}
            onCancel={() => setEditing(false)}
          />
        </Card>
      )}

      <Card className="mt-6 max-w-md">
        {hasData && target != null ? (
          <>
            <p className="text-2xl font-semibold text-text">
              {goal.current_value} / {target} {goal.unit ?? ""}
            </p>
            <div className="mt-2">
              <ProgressBar value={percentage ?? 0} max={100} tone="success" />
            </div>
            {percentage != null && <p className="mt-1 text-xs text-text-dim">{Math.round(percentage)}%</p>}
          </>
        ) : (
          <p className="text-sm text-text-muted">
            Todavía no hay progreso calculado — asigna al menos una métrica a este goal.
          </p>
        )}
      </Card>

      <GoalConnectionsCard goal={goal} onChange={refetch} />
    </div>
  );
}
