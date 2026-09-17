import { useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Field, Select, TextArea, TextInput } from "../../components/ui/FormControls";
import { Button } from "../../components/ui/Button";
import { useApiQuery } from "../../hooks/useApiQuery";
import { createCategory, listCategories } from "../../services/habit-categories.service";
import { createHabit, updateHabit } from "../../services/habits.service";
import type { Habit } from "../../types/habit";

interface HabitFormModalProps {
  habit?: Habit;
  onClose: () => void;
  onSaved: (habit: Habit) => void;
}

export function HabitFormModal({ habit, onClose, onSaved }: HabitFormModalProps) {
  const { data: categories, refetch: refetchCategories } = useApiQuery((signal) => listCategories(signal), []);
  const isEditing = Boolean(habit);

  const [name, setName] = useState(habit?.name ?? "");
  const [description, setDescription] = useState(habit?.description ?? "");
  const [color, setColor] = useState(habit?.color ?? "#22d3ee");
  const [categoryId, setCategoryId] = useState(habit?.category_id ?? "");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategoryBusy, setCreatingCategoryBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateCategory() {
    const name = newCategoryName.trim();
    if (!name) {
      setCreatingCategory(false);
      return;
    }
    setCreatingCategoryBusy(true);
    setError(null);
    try {
      const category = await createCategory({ name });
      setCategoryId(category.id);
      setNewCategoryName("");
      setCreatingCategory(false);
      refetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear la categoría");
    } finally {
      setCreatingCategoryBusy(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const saved = habit
        ? await updateHabit(habit.id, {
            name: name.trim(),
            description: description.trim() || undefined,
            color,
            category_id: categoryId || null,
          })
        : await createHabit({
            name: name.trim(),
            description: description.trim() || undefined,
            color,
            category_id: categoryId || undefined,
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar el hábito");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={isEditing ? "Editar hábito" : "Nuevo hábito"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nombre">
          <TextInput
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. English, Leer, Programar…"
          />
        </Field>

        <Field label="Descripción (opcional)">
          <TextArea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿Qué quieres cultivar con este hábito?"
          />
        </Field>

        <Field label="Categoría (opcional)">
          <Select value={categoryId ?? ""} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Sin categoría</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>

        {creatingCategory ? (
          <Field label="Nombre de la categoría nueva">
            <div className="flex gap-2">
              <TextInput
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ej. Salud, Trabajo, Idiomas…"
                disabled={creatingCategoryBusy}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateCategory();
                  }
                }}
              />
              <Button type="button" onClick={handleCreateCategory} disabled={creatingCategoryBusy || !newCategoryName.trim()}>
                {creatingCategoryBusy ? "…" : "Crear"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setCreatingCategory(false)} disabled={creatingCategoryBusy}>
                ✕
              </Button>
            </div>
          </Field>
        ) : (
          <button
            type="button"
            onClick={() => setCreatingCategory(true)}
            className="self-start font-mono text-xs text-text-muted hover:text-primary"
          >
            + Crear categoría nueva
          </button>
        )}

        <Field label="Color">
          <input
            type="color"
            value={color ?? "#22d3ee"}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded-md border border-border bg-surface-elevated"
          />
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear hábito"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
