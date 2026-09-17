import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApiQuery } from "../hooks/useApiQuery";
import { getHabit } from "../services/habits.service";
import { getActivity, updateActivity, deleteActivity } from "../services/activities.service";
import * as habitActivityTypesService from "../services/habit-activity-types.service";
import * as activityTypesService from "../services/activity-types.service";
import { listResources } from "../services/resources.service";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Field, Select, TextArea, TextInput } from "../components/ui/FormControls";
import { DurationInput, durationToSeconds, secondsToDuration } from "../components/ui/DurationInput";
import { GlitchText } from "../components/ui/GlitchText";
import { ErrorState, LoadingState } from "../components/ui/StateViews";
import { ActivityFieldInput } from "../features/activities/ActivityFieldInput";
import { TagList } from "../features/tags/TagList";
import { ActivityVocabulary } from "../features/vocabulary/ActivityVocabulary";
import { formatDuration } from "../utils/dates";
import type { FieldDefinition } from "../types/activity";

export function ActivityDetailPage() {
  const { habitId: routeHabitId, activityId: routeActivityId } = useParams<{ habitId: string; activityId: string }>();
  const habitId = routeHabitId ?? "";
  const activityId = routeActivityId ?? "";
  const navigate = useNavigate();

  const { data: activity, loading, error, refetch } = useApiQuery(
    (signal) => getActivity(habitId, activityId, signal),
    [habitId, activityId]
  );
  const { data: habit } = useApiQuery((signal) => getHabit(habitId, signal), [habitId]);
  const { data: assignedTypes } = useApiQuery(
    (signal) => habitActivityTypesService.listForHabit(habitId, signal),
    [habitId]
  );
  const { data: resources } = useApiQuery((signal) => listResources({}, signal), []);

  const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>([]);
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string | boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!activity) return;
    activityTypesService.listFieldDefinitions(activity.activity_type_id).then(setFieldDefinitions).catch(() => setFieldDefinitions([]));
  }, [activity?.activity_type_id]);

  if (!routeHabitId || !routeActivityId) return null;
  if (loading) return <LoadingState />;
  if (error || !activity) return <ErrorState message={error ?? "Actividad no encontrada"} onRetry={refetch} />;

  const typeName = assignedTypes?.find((t) => t.activity_type_id === activity.activity_type_id)?.activity_types.name;

  function startEditing() {
    if (!activity) return;
    setTitle(activity.title ?? "");
    setDescription(activity.description ?? "");
    const duration = secondsToDuration(activity.duration_seconds);
    setDurationHours(duration.hours);
    setDurationMinutes(duration.minutes);
    setQuantity(activity.quantity != null ? String(activity.quantity) : "");
    setUnit(activity.unit ?? "");
    setResourceId(activity.resource_id ?? "");
    const initialFieldValues: Record<string, string | boolean> = {};
    for (const [key, value] of Object.entries(activity.field_values)) {
      if (typeof value === "boolean") initialFieldValues[key] = value;
      else if (value != null) initialFieldValues[key] = String(value);
    }
    setFieldValues(initialFieldValues);
    setSaveError(null);
    setEditing(true);
  }

  function buildFieldValuesPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const def of fieldDefinitions) {
      const raw = fieldValues[def.key];
      if (raw === undefined || raw === "") continue;

      if (def.field_type === "boolean") {
        payload[def.key] = raw === true;
      } else if (def.field_type === "number" || def.field_type === "duration" || def.field_type === "rating") {
        payload[def.key] = Number(raw);
      } else if (def.field_type === "multi_select") {
        payload[def.key] = String(raw).split(",").map((v) => v.trim()).filter(Boolean);
      } else {
        payload[def.key] = raw;
      }
    }
    return payload;
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      await updateActivity(habitId, activityId, {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        duration_seconds: durationToSeconds(durationHours, durationMinutes) ?? null,
        quantity: quantity ? Number(quantity) : null,
        unit: unit.trim() || null,
        resource_id: resourceId || null,
        field_values: buildFieldValuesPayload(),
      });
      setEditing(false);
      refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "No pudimos guardar los cambios");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta actividad?")) return;
    await deleteActivity(habitId, activityId);
    navigate(`/habits/${habitId}`);
  }

  return (
    <div className="max-w-2xl">
      <Link to={`/habits/${habitId}`} className="font-mono text-xs text-text-dim hover:text-primary">
        ← {habit?.name ?? "Volver al hábito"}
      </Link>

      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <p className="flicker font-mono text-xs tracking-widest text-primary">{typeName ?? "ACTIVITY"}</p>
          <GlitchText as="h1" className="mt-1 text-2xl font-semibold text-text">
            {activity.title || "Actividad"}
          </GlitchText>
          <p className="mt-1 text-sm text-text-muted">{activity.local_date}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {!editing && (
            <Button variant="ghost" onClick={startEditing}>
              Editar
            </Button>
          )}
          <Button variant="ghost" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </div>

      <Card className="mt-6">
        {editing ? (
          <div className="flex flex-col gap-4">
            <Field label="Título">
              <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <DurationInput
                hours={durationHours}
                minutes={durationMinutes}
                onHoursChange={setDurationHours}
                onMinutesChange={setDurationMinutes}
              />
              <Field label="Recurso">
                <Select value={resourceId} onChange={(e) => setResourceId(e.target.value)}>
                  <option value="">Sin recurso</option>
                  {resources?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Cantidad">
                <TextInput type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </Field>
              <Field label="Unidad">
                <TextInput value={unit} onChange={(e) => setUnit(e.target.value)} />
              </Field>
            </div>

            {fieldDefinitions.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-border pt-3">
                {fieldDefinitions.map((def) => (
                  <ActivityFieldInput
                    key={def.id}
                    definition={def}
                    value={fieldValues[def.key]}
                    onChange={(value) => setFieldValues((prev) => ({ ...prev, [def.key]: value }))}
                  />
                ))}
              </div>
            )}

            <Field label="Notas">
              <TextArea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>

            {saveError && <p className="text-sm text-danger">{saveError}</p>}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-semibold text-text">
                  {activity.duration_seconds ? formatDuration(activity.duration_seconds) : "—"}
                </p>
                <p className="text-xs text-text-dim">duración</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-text">
                  {activity.quantity != null ? `${activity.quantity} ${activity.unit ?? ""}` : "—"}
                </p>
                <p className="text-xs text-text-dim">cantidad</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-text">
                  {activity.resource ? (
                    <Link to={`/resources/${activity.resource_id}`} className="hover:text-primary">
                      {activity.resource.title}
                    </Link>
                  ) : (
                    "—"
                  )}
                </p>
                <p className="text-xs text-text-dim">recurso</p>
              </div>
            </div>

            {Object.keys(activity.field_values).length > 0 && (
              <dl className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                {Object.entries(activity.field_values).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs text-text-dim">{key.replace(/_/g, " ")}</dt>
                    <dd className="text-sm text-text-muted">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            )}

            {activity.description && (
              <div className="border-t border-border pt-4">
                <p className="text-xs text-text-dim">NOTAS</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-text-muted">{activity.description}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="mt-4 flex flex-col gap-3">
        <TagList kind="activities" entityId={activity.id} editable />
        <ActivityVocabulary habitId={habitId} activityId={activity.id} />
      </div>
    </div>
  );
}
