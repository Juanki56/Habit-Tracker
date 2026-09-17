import { useState } from "react";
import { Link } from "react-router-dom";
import { GlitchText } from "../components/ui/GlitchText";
import { useApiQuery } from "../hooks/useApiQuery";
import { listHabits } from "../services/habits.service";
import { HabitCard } from "../features/habits/HabitCard";
import { HabitFormModal } from "../features/habits/HabitFormModal";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/StateViews";

export function HabitsPage() {
  const [showInactive, setShowInactive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const {
    data: habits,
    loading,
    error,
    refetch,
  } = useApiQuery((signal) => listHabits(!showInactive, signal), [showInactive]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="flicker font-mono text-xs tracking-widest text-primary">HABITS</p>
          <GlitchText as="h1" className="mt-1 text-2xl font-semibold text-text">Tus hábitos</GlitchText>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Nuevo hábito</Button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Incluir hábitos desactivados
        </label>
        <div className="flex gap-3 font-mono text-xs text-text-dim">
          <Link to="/categories" className="hover:text-primary">
            Gestionar categorías
          </Link>
          <Link to="/activity-types" className="hover:text-primary">
            Gestionar tipos de actividad
          </Link>
        </div>
      </div>

      <div className="mt-6">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && habits && habits.length === 0 && (
          <EmptyState
            title="Todavía no tienes hábitos"
            description="Crea el primero para empezar a registrar tu progreso."
            action={<Button onClick={() => setShowForm(true)}>+ Nuevo hábito</Button>}
          />
        )}
        {!loading && !error && habits && habits.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <HabitFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
