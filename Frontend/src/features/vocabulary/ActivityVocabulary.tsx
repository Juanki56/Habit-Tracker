import { useState } from "react";
import { useApiQuery } from "../../hooks/useApiQuery";
import * as activityVocabularyService from "../../services/activity-vocabulary.service";

interface ActivityVocabularyProps {
  habitId: string;
  activityId: string;
}

// Vocabulario es opcional y solo tiene sentido para algunas actividades (idiomas) —
// por eso vive colapsado hasta que el usuario lo abre, en vez de ocupar espacio siempre.
export function ActivityVocabulary({ habitId, activityId }: ActivityVocabularyProps) {
  const [open, setOpen] = useState(false);
  const { data: words, refetch } = useApiQuery(
    (signal) => activityVocabularyService.listForActivity(habitId, activityId, signal),
    [habitId, activityId]
  );
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");

  async function handleDetach(wordId: string) {
    await activityVocabularyService.detachWord(habitId, activityId, wordId);
    refetch();
  }

  async function handleAdd() {
    const word = value.trim();
    if (!word) {
      setAdding(false);
      return;
    }
    await activityVocabularyService.attachWord(habitId, activityId, word);
    setValue("");
    setAdding(false);
    refetch();
  }

  if (!open && (words?.length ?? 0) === 0) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-text-dim hover:text-text-muted">
        + vocabulario
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {words?.map((w) => (
        <span
          key={w.id}
          className="inline-flex items-center gap-1 rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-text-muted"
        >
          {w.word}
          <button onClick={() => handleDetach(w.id)} className="text-text-dim hover:text-danger">
            ✕
          </button>
        </span>
      ))}
      {adding ? (
        <input
          autoFocus
          value={value}
          placeholder="palabra…"
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleAdd}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") setAdding(false);
          }}
          className="w-24 rounded-full border border-border bg-surface-elevated px-2 py-0.5 text-xs text-text outline-none focus:border-primary"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-text-dim hover:border-border-hover"
        >
          + palabra
        </button>
      )}
    </div>
  );
}
