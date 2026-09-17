import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Field, Select, TextArea, TextInput } from "../../components/ui/FormControls";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/StateViews";
import { DurationInput, durationToSeconds } from "../../components/ui/DurationInput";
import { ActivityFieldInput } from "./ActivityFieldInput";
import { useApiQuery } from "../../hooks/useApiQuery";
import * as habitActivityTypesService from "../../services/habit-activity-types.service";
import * as activityTypesService from "../../services/activity-types.service";
import { createResource, listResources } from "../../services/resources.service";
import { createActivity } from "../../services/activities.service";
import { todayLocalDate } from "../../utils/dates";
import { RESOURCE_TYPE_LABELS } from "../../types/resource";
import type { ResourceType } from "../../types/resource";
import type { Activity, FieldDefinition } from "../../types/activity";

interface DeepLogModalProps {
  habitId: string;
  onClose: () => void;
  onCreated: (activity: Activity) => void;
}

export function DeepLogModal({ habitId, onClose, onCreated }: DeepLogModalProps) {
  const {
    data: assigned,
    loading: loadingAssigned,
    refetch: refetchAssigned,
  } = useApiQuery((signal) => habitActivityTypesService.listForHabit(habitId, signal), [habitId]);
  const { data: allTypes, refetch: refetchAllTypes } = useApiQuery(
    (signal) => activityTypesService.listActivityTypes(signal),
    []
  );
  const { data: resources, refetch: refetchResources } = useApiQuery((signal) => listResources({}, signal), []);

  const [activityTypeId, setActivityTypeId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string | boolean>>({});
  const [attaching, setAttaching] = useState(false);
  const [creatingType, setCreatingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [creatingResource, setCreatingResource] = useState(false);
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceType, setNewResourceType] = useState<ResourceType>("article");
  const [creatingResourceBusy, setCreatingResourceBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [localDate, setLocalDate] = useState(todayLocalDate());

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!activityTypeId) {
      setFieldDefinitions([]);
      return;
    }
    activityTypesService.listFieldDefinitions(activityTypeId).then(setFieldDefinitions).catch(() => setFieldDefinitions([]));
    setFieldValues({});
  }, [activityTypeId]);

  async function handleAttach(typeId: string) {
    setAttaching(true);
    setError(null);
    try {
      await habitActivityTypesService.attach(habitId, typeId);
      setActivityTypeId(typeId);
      refetchAssigned();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos habilitar ese tipo de actividad");
    } finally {
      setAttaching(false);
    }
  }

  async function handleCreateType() {
    const name = newTypeName.trim();
    if (!name) {
      setCreatingType(false);
      return;
    }
    setAttaching(true);
    setError(null);
    try {
      const type = await activityTypesService.createActivityType({ name });
      await habitActivityTypesService.attach(habitId, type.id);
      setActivityTypeId(type.id);
      setNewTypeName("");
      setCreatingType(false);
      refetchAllTypes();
      refetchAssigned();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear el tipo de actividad");
    } finally {
      setAttaching(false);
    }
  }

  async function handleCreateResource() {
    const title = newResourceTitle.trim();
    if (!title) {
      setCreatingResource(false);
      return;
    }
    setCreatingResourceBusy(true);
    setError(null);
    try {
      const resource = await createResource({ resource_type: newResourceType, title });
      setResourceId(resource.id);
      setNewResourceTitle("");
      setCreatingResource(false);
      refetchResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear el recurso");
    } finally {
      setCreatingResourceBusy(false);
    }
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
        payload[def.key] = String(raw)
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      } else {
        payload[def.key] = raw;
      }
    }
    return payload;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!activityTypeId) {
      setError("Elige un tipo de actividad");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const activity = await createActivity(habitId, {
        activity_type_id: activityTypeId,
        resource_id: resourceId || undefined,
        local_date: localDate,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        duration_seconds: durationToSeconds(durationHours, durationMinutes),
        quantity: quantity ? Number(quantity) : undefined,
        unit: unit.trim() || undefined,
        field_values: buildFieldValuesPayload(),
      });
      onCreated(activity);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar la actividad");
    } finally {
      setSubmitting(false);
    }
  }

  const unassignedTypes = (allTypes ?? []).filter(
    (type) => !assigned?.some((a) => a.activity_type_id === type.id)
  );

  return (
    <Modal title="Registrar actividad" onClose={onClose}>
      {loadingAssigned ? (
        <LoadingState />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Tipo de actividad">
            <Select value={activityTypeId} onChange={(e) => setActivityTypeId(e.target.value)}>
              <option value="">Elige un tipo…</option>
              {assigned?.map((a) => (
                <option key={a.activity_type_id} value={a.activity_type_id}>
                  {a.activity_types.name}
                </option>
              ))}
            </Select>
          </Field>

          {(assigned?.length ?? 0) === 0 && (
            <p className="text-sm text-text-muted">
              Este hábito todavía no tiene tipos de actividad habilitados. Crea el primero abajo.
            </p>
          )}

          {unassignedTypes.length > 0 && (
            <Field label="Habilitar un tipo existente para este hábito">
              <Select
                value=""
                disabled={attaching}
                onChange={(e) => e.target.value && handleAttach(e.target.value)}
              >
                <option value="">{attaching ? "Habilitando…" : "Elegir tipo…"}</option>
                {unassignedTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          {creatingType ? (
            <Field label="Nombre del tipo de actividad">
              <div className="flex gap-2">
                <TextInput
                  autoFocus
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="Ej. Lectura, Programación, Listening…"
                  disabled={attaching}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateType();
                    }
                  }}
                />
                <Button type="button" onClick={handleCreateType} disabled={attaching || !newTypeName.trim()}>
                  {attaching ? "…" : "Crear"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setCreatingType(false)} disabled={attaching}>
                  ✕
                </Button>
              </div>
            </Field>
          ) : (
            <button
              type="button"
              onClick={() => setCreatingType(true)}
              className="self-start font-mono text-xs text-text-muted hover:text-primary"
            >
              + Crear tipo de actividad nuevo
            </button>
          )}

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

          <div className="grid grid-cols-2 gap-3">
            <DurationInput
              hours={durationHours}
              minutes={durationMinutes}
              onHoursChange={setDurationHours}
              onMinutesChange={setDurationMinutes}
            />
            <Field label="Fecha">
              <TextInput type="date" value={localDate} onChange={(e) => setLocalDate(e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Cantidad (opcional)">
              <TextInput type="number" min={0} placeholder="30" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </Field>
            <Field label="Unidad (opcional)">
              <TextInput placeholder="páginas, km, flexiones…" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </Field>
          </div>
          <p className="-mt-2 text-xs text-text-dim">
            Úsalo cuando algo se mida mejor en unidades que en tiempo — ej. "30" + "páginas", "5" + "km".
          </p>

          <Field label="Recurso (opcional)">
            <Select value={resourceId} onChange={(e) => setResourceId(e.target.value)}>
              <option value="">Sin recurso</option>
              {resources?.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.title}
                </option>
              ))}
            </Select>
          </Field>

          {creatingResource ? (
            <Field label="Nuevo recurso">
              <div className="flex gap-2">
                <Select
                  value={newResourceType}
                  onChange={(e) => setNewResourceType(e.target.value as ResourceType)}
                  disabled={creatingResourceBusy}
                  className="w-32"
                >
                  {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <TextInput
                  autoFocus
                  value={newResourceTitle}
                  onChange={(e) => setNewResourceTitle(e.target.value)}
                  placeholder="Título del recurso…"
                  disabled={creatingResourceBusy}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateResource();
                    }
                  }}
                />
                <Button type="button" onClick={handleCreateResource} disabled={creatingResourceBusy || !newResourceTitle.trim()}>
                  {creatingResourceBusy ? "…" : "Crear"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setCreatingResource(false)} disabled={creatingResourceBusy}>
                  ✕
                </Button>
              </div>
            </Field>
          ) : (
            <button
              type="button"
              onClick={() => setCreatingResource(true)}
              className="self-start font-mono text-xs text-text-muted hover:text-primary"
            >
              + Crear recurso nuevo
            </button>
          )}

          <Field label="Título (opcional)">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>

          <Field label="Notas (opcional)">
            <TextArea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || !activityTypeId}>
              {submitting ? "Guardando…" : "Guardar actividad"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
