import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { useApiQuery } from "../../hooks/useApiQuery";
import { listGoals } from "../../services/goals.service";

// GET /goals ya trae los hábitos de cada goal embebidos — no hace falta un
// endpoint nuevo, solo filtrar del lado del cliente cuáles goals mencionan
// a este hábito. Es la conexión inversa que faltaba (antes solo se veía
// "hábito -> goal" desde el detalle del goal, nunca al revés).
export function HabitGoalsCard({ habitId }: { habitId: string }) {
  const { data: goals, loading } = useApiQuery((signal) => listGoals(signal), []);

  const relatedGoals = (goals ?? []).filter((g) => g.habits.some((h) => h.id === habitId));

  if (loading || relatedGoals.length === 0) return null;

  return (
    <Card>
      <p className="flicker font-mono text-xs tracking-widest text-primary">GOALS</p>
      <ul className="mt-2 flex flex-col gap-1">
        {relatedGoals.map((goal) => (
          <li key={goal.id}>
            <Link to={`/goals/${goal.id}`} className="text-sm text-text-muted hover:text-primary">
              {goal.name}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
