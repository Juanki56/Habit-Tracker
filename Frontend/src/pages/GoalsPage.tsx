import { useState } from "react";
import { GlitchText } from "../components/ui/GlitchText";
import { useApiQuery } from "../hooks/useApiQuery";
import { listGoals } from "../services/goals.service";
import { GoalCard } from "../features/goals/GoalCard";
import { GoalFormModal } from "../features/goals/GoalFormModal";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/StateViews";

export function GoalsPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: goals, loading, error, refetch } = useApiQuery((signal) => listGoals(signal), []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="flicker font-mono text-xs tracking-widest text-primary">GOALS</p>
          <GlitchText as="h1" className="mt-1 text-2xl font-semibold text-text">Hacia dónde vas</GlitchText>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Nuevo goal</Button>
      </div>

      <div className="mt-6">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && goals && goals.length === 0 && (
          <EmptyState
            title="No tienes goals activos"
            description="Elige algo hacia lo que quieras trabajar."
            action={<Button onClick={() => setShowForm(true)}>Crear goal</Button>}
          />
        )}
        {!loading && !error && goals && goals.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <GoalFormModal
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
