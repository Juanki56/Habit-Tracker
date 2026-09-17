import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiQuery } from "../hooks/useApiQuery";
import { getHabit, deactivateHabit } from "../services/habits.service";
import { getHabitDashboard } from "../services/dashboard.service";
import { listCheckIns } from "../services/check-ins.service";
import { listActivities } from "../services/activities.service";
import { todayLocalDate, formatDuration } from "../utils/dates";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ErrorState, LoadingState } from "../components/ui/StateViews";
import { GlitchText } from "../components/ui/GlitchText";
import { QuickCheckActions } from "../features/habits/QuickCheckActions";
import { HabitFormModal } from "../features/habits/HabitFormModal";
import { HabitScheduleCard } from "../features/habits/HabitScheduleCard";
import { DeepLogModal } from "../features/activities/DeepLogModal";
import { ActivityList } from "../features/activities/ActivityList";
import { DailyTotalsChart } from "../features/dashboard/DailyTotalsChart";
import { TagList } from "../features/tags/TagList";
import { HabitMetricsCard } from "../features/habits/HabitMetricsCard";
import { HabitActivityTypesCard } from "../features/habits/HabitActivityTypesCard";
import { HabitGoalsCard } from "../features/habits/HabitGoalsCard";

export function HabitDetailPage() {
  const { id: routeId } = useParams<{ id: string }>();
  const id = routeId ?? "";
  const navigate = useNavigate();

  const habitQuery = useApiQuery((signal) => getHabit(id, signal), [id]);
  const dashboardQuery = useApiQuery((signal) => getHabitDashboard(id, 14, signal), [id]);
  const today = todayLocalDate();
  const checkInQuery = useApiQuery((signal) => listCheckIns(id, { from: today, to: today }, signal), [id]);
  const activitiesQuery = useApiQuery((signal) => listActivities(id, {}, signal), [id]);

  const [showEdit, setShowEdit] = useState(false);
  const [showDeepLog, setShowDeepLog] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  function refreshAll() {
    habitQuery.refetch();
    dashboardQuery.refetch();
    checkInQuery.refetch();
    activitiesQuery.refetch();
  }

  if (!routeId) return null;
  if (habitQuery.loading) return <LoadingState />;
  if (habitQuery.error || !habitQuery.data) {
    return <ErrorState message={habitQuery.error ?? "Hábito no encontrado"} onRetry={habitQuery.refetch} />;
  }

  const habit = habitQuery.data;
  const stats = dashboardQuery.data?.stats;
  const hasActivityToday = (activitiesQuery.data ?? []).some((a) => a.local_date === today);

  async function handleDeactivate() {
    if (!confirm(`¿Desactivar "${habit.name}"? Tu historial no se pierde.`)) return;
    setDeactivating(true);
    try {
      await deactivateHabit(habit.id);
      navigate("/habits");
    } finally {
      setDeactivating(false);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: habit.color ?? "var(--color-primary)" }}
          />
          <div>
            <GlitchText as="h1" className="text-2xl font-semibold text-text">
              {habit.name}
            </GlitchText>
            {habit.description && <p className="mt-1 text-sm text-text-muted">{habit.description}</p>}
            <div className="mt-2">
              <TagList kind="habits" entityId={habit.id} editable />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" onClick={() => setShowEdit(true)}>
            Editar
          </Button>
          {habit.is_active && (
            <Button variant="ghost" onClick={handleDeactivate} disabled={deactivating}>
              Desactivar
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <QuickCheckActions
          habitId={habit.id}
          todayCheckIn={checkInQuery.data?.[0] ?? null}
          hasActivityToday={hasActivityToday}
          onChange={refreshAll}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <p className="flicker font-mono text-xs tracking-widest text-primary">PROGRESS</p>
            {stats ? (
              <>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xl font-semibold text-text">
                      {formatDuration(stats.total_duration_seconds)}
                    </p>
                    <p className="text-xs text-text-dim">tiempo total</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-success">{stats.completed_days}</p>
                    <p className="text-xs text-text-dim">días completados</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-text-muted">
                      {dashboardQuery.data?.streak ?? 0}d
                    </p>
                    <p className="text-xs text-text-dim">racha actual</p>
                  </div>
                </div>
                {dashboardQuery.data && dashboardQuery.data.daily_totals.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs text-text-dim">Últimos 14 días</p>
                    <DailyTotalsChart dailyTotals={dashboardQuery.data.daily_totals} />
                  </div>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-text-muted">Sin datos todavía.</p>
            )}
          </Card>

          <div className="flex items-center justify-between">
            <p className="flicker font-mono text-xs tracking-widest text-primary">ACTIVITIES</p>
            <Button variant="ghost" onClick={() => setShowDeepLog(true)}>
              + Registrar actividad
            </Button>
          </div>
          {activitiesQuery.loading ? (
            <LoadingState />
          ) : (
            <ActivityList
              habitId={habit.id}
              activities={activitiesQuery.data ?? []}
              onChange={refreshAll}
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <HabitGoalsCard habitId={habit.id} />
          <HabitScheduleCard habitId={habit.id} />
          <HabitActivityTypesCard habitId={habit.id} />
          <HabitMetricsCard habitId={habit.id} />
        </div>
      </div>

      {showEdit && (
        <HabitFormModal
          habit={habit}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            habitQuery.refetch();
          }}
        />
      )}

      {showDeepLog && (
        <DeepLogModal
          habitId={habit.id}
          onClose={() => setShowDeepLog(false)}
          onCreated={() => {
            setShowDeepLog(false);
            refreshAll();
          }}
        />
      )}
    </div>
  );
}
