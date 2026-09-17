import { useAuth } from "../hooks/useAuth";
import { useApiQuery } from "../hooks/useApiQuery";
import { getOverview } from "../services/dashboard.service";
import { HabitOverviewCard } from "../features/dashboard/HabitOverviewCard";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/StateViews";
import { ActiveGoalsSummary } from "../features/dashboard/ActiveGoalsSummary";
import { CurrentlyReadingSummary } from "../features/dashboard/CurrentlyReadingSummary";
import { RecentNotesSummary } from "../features/dashboard/RecentNotesSummary";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data: habits, loading, error, refetch } = useApiQuery((signal) => getOverview(signal), []);

  const displayName = user?.email?.split("@")[0] ?? "";

  return (
    <div>
      <p className="flicker font-mono text-xs tracking-widest text-primary">TODAY</p>
      <h1 className="mt-1 text-2xl font-semibold text-text">
        {greeting()}{displayName && `, ${displayName}`}
      </h1>
      <p className="mt-1 text-sm text-text-muted">Esto es lo que has hecho hasta ahora.</p>

      <div className="mt-6">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && habits && habits.length === 0 && (
          <EmptyState
            title="Todavía no tienes hábitos registrados"
            description="Ve a Hábitos para crear el primero."
          />
        )}
        {!loading && !error && habits && habits.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {habits.map((habit) => (
              <HabitOverviewCard key={habit.habit_id} habit={habit} />
            ))}
          </div>
        )}
      </div>

      <ActiveGoalsSummary />
      <CurrentlyReadingSummary />
      <RecentNotesSummary />
    </div>
  );
}
