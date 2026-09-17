import { useState, type FormEvent } from "react";
import { GlitchText } from "../components/ui/GlitchText";
import { useApiQuery } from "../hooks/useApiQuery";
import * as vocabularyService from "../services/vocabulary.service";
import { Button } from "../components/ui/Button";
import { Select, TextInput } from "../components/ui/FormControls";
import { Card } from "../components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/StateViews";
import { VOCABULARY_STATUS_LABELS } from "../types/vocabulary";
import type { VocabularyStatus } from "../types/vocabulary";

const TABS: Array<{ value: VocabularyStatus | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  ...Object.entries(VOCABULARY_STATUS_LABELS).map(([value, label]) => ({ value: value as VocabularyStatus, label })),
];

export function VocabularyPage() {
  const [tab, setTab] = useState<VocabularyStatus | "all">("all");
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    data: words,
    loading,
    error,
    refetch,
  } = useApiQuery((signal) => vocabularyService.listWords(tab === "all" ? undefined : tab, signal), [tab]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!word.trim()) return;
    setSubmitting(true);
    try {
      await vocabularyService.createWord({ word: word.trim(), meaning: meaning.trim() || undefined });
      setWord("");
      setMeaning("");
      refetch();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id: string, status: VocabularyStatus) {
    await vocabularyService.updateWord(id, { status });
    refetch();
  }

  async function handleDelete(id: string) {
    await vocabularyService.deleteWord(id);
    refetch();
  }

  return (
    <div>
      <p className="flicker font-mono text-xs tracking-widest text-primary">VOCABULARY</p>
      <GlitchText as="h1" className="mt-1 text-2xl font-semibold text-text">Lo que estás aprendiendo</GlitchText>

      <form onSubmit={handleCreate} className="mt-4 flex flex-wrap gap-2">
        <TextInput value={word} onChange={(e) => setWord(e.target.value)} placeholder="Palabra…" className="w-40" />
        <TextInput
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder="Significado (opcional)"
          className="flex-1 min-w-[160px]"
        />
        <Button type="submit" disabled={submitting || !word.trim()}>
          + Agregar
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-md px-3 py-1.5 text-xs ${
              tab === t.value ? "bg-primary/20 text-primary" : "bg-surface-elevated text-text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && words && words.length === 0 && (
          <EmptyState
            title="Sin palabras todavía"
            description="Agrega vocabulario nuevo aquí, o desde una actividad de idiomas."
          />
        )}
        {!loading && !error && words && words.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {words.map((w) => (
              <Card key={w.id}>
                <div className="flex items-start justify-between">
                  <p className="font-medium text-text">{w.word}</p>
                  <button onClick={() => handleDelete(w.id)} className="text-xs text-text-dim hover:text-danger">
                    ✕
                  </button>
                </div>
                {w.meaning && <p className="mt-1 text-sm text-text-muted">{w.meaning}</p>}
                <Select
                  value={w.status}
                  onChange={(e) => handleStatusChange(w.id, e.target.value as VocabularyStatus)}
                  className="mt-2 text-xs"
                >
                  {Object.entries(VOCABULARY_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
