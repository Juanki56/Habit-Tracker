import { useState } from "react";
import { Link } from "react-router-dom";
import type { Activity } from "../../types/activity";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/StateViews";
import { formatDuration } from "../../utils/dates";
import { deleteActivity } from "../../services/activities.service";

interface ActivityListProps {
  habitId: string;
  activities: Activity[];
  onChange: () => void;
}

export function ActivityList({ habitId, activities, onChange }: ActivityListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(activityId: string) {
    setDeletingId(activityId);
    try {
      await deleteActivity(habitId, activityId);
      onChange();
    } finally {
      setDeletingId(null);
    }
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        title="Sin actividades todavía"
        description="Cuando registres un 'deep log' aparecerá aquí."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {activities.map((activity) => (
        <Card key={activity.id} className="flex items-center justify-between py-3">
          <Link to={`/habits/${habitId}/activities/${activity.id}`} className="flex-1">
            <p className="text-sm font-medium text-text hover:text-primary">{activity.title || "Actividad"}</p>
            <p className="text-xs text-text-muted">
              {activity.local_date}
              {activity.duration_seconds ? ` · ${formatDuration(activity.duration_seconds)}` : ""}
              {activity.quantity ? ` · ${activity.quantity} ${activity.unit ?? ""}` : ""}
              {activity.resource ? ` · ${activity.resource.title}` : ""}
            </p>
          </Link>
          <button
            onClick={() => handleDelete(activity.id)}
            disabled={deletingId === activity.id}
            className="shrink-0 text-xs text-text-dim hover:text-danger"
          >
            {deletingId === activity.id ? "…" : "Eliminar"}
          </button>
        </Card>
      ))}
    </div>
  );
}
