import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Select, TextInput } from "../../components/ui/FormControls";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { updateBook } from "../../services/resources.service";
import { BOOK_STATUS_LABELS } from "../../types/resource";
import type { Book, BookStatus } from "../../types/resource";

export function BookDetail({
  resourceId,
  book,
  onChange,
}: {
  resourceId: string;
  book: Book;
  onChange: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <Card>
        <BookEditForm
          resourceId={resourceId}
          book={book}
          onDone={() => {
            setEditing(false);
            onChange();
          }}
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  return (
    <Card>
      <p className="flicker font-mono text-xs tracking-widest text-primary">BOOK</p>
      {book.author && <p className="mt-1 text-text">{book.author}</p>}
      <p className="mt-1 text-sm text-text-muted">{BOOK_STATUS_LABELS[book.status]}</p>

      {book.total_pages ? (
        <div className="mt-3">
          <p className="text-sm text-text-muted">
            {book.pages_read ?? 0} / {book.total_pages} páginas
          </p>
          <div className="mt-1">
            <ProgressBar value={book.pages_read ?? 0} max={book.total_pages} tone="success" />
          </div>
          {book.progress_percentage != null && (
            <p className="mt-1 text-xs text-text-dim">{Math.round(book.progress_percentage)}%</p>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs text-text-dim">Sin páginas totales registradas.</p>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {book.publisher && (
          <div>
            <dt className="text-xs text-text-dim">Editorial</dt>
            <dd className="text-text-muted">{book.publisher}</dd>
          </div>
        )}
        {book.isbn && (
          <div>
            <dt className="text-xs text-text-dim">ISBN</dt>
            <dd className="text-text-muted">{book.isbn}</dd>
          </div>
        )}
        {book.started_at && (
          <div>
            <dt className="text-xs text-text-dim">Empezado</dt>
            <dd className="text-text-muted">{book.started_at}</dd>
          </div>
        )}
        {book.finished_at && (
          <div>
            <dt className="text-xs text-text-dim">Terminado</dt>
            <dd className="text-text-muted">{book.finished_at}</dd>
          </div>
        )}
        {book.rating != null && (
          <div>
            <dt className="text-xs text-text-dim">Calificación</dt>
            <dd className="text-text-muted">{book.rating} / 5</dd>
          </div>
        )}
      </dl>

      <button onClick={() => setEditing(true)} className="mt-3 text-xs text-text-muted hover:text-primary">
        Editar libro
      </button>
    </Card>
  );
}

function BookEditForm({
  resourceId,
  book,
  onDone,
  onCancel,
}: {
  resourceId: string;
  book: Book;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState<BookStatus>(book.status);
  const [author, setAuthor] = useState(book.author ?? "");
  const [publisher, setPublisher] = useState(book.publisher ?? "");
  const [isbn, setIsbn] = useState(book.isbn ?? "");
  const [totalPages, setTotalPages] = useState(book.total_pages?.toString() ?? "");
  const [startedAt, setStartedAt] = useState(book.started_at ?? "");
  const [finishedAt, setFinishedAt] = useState(book.finished_at ?? "");
  const [rating, setRating] = useState(book.rating?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await updateBook(resourceId, {
        status,
        author: author.trim() || null,
        publisher: publisher.trim() || null,
        isbn: isbn.trim() || null,
        total_pages: totalPages ? Number(totalPages) : null,
        started_at: startedAt || null,
        finished_at: finishedAt || null,
        rating: rating ? Number(rating) : null,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos actualizar el libro");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="flicker font-mono text-xs tracking-widest text-primary">BOOK</p>

      <Field label="Estado">
        <Select value={status} onChange={(e) => setStatus(e.target.value as BookStatus)}>
          {Object.entries(BOOK_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Autor">
          <TextInput value={author} onChange={(e) => setAuthor(e.target.value)} />
        </Field>
        <Field label="Editorial">
          <TextInput value={publisher} onChange={(e) => setPublisher(e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="ISBN">
          <TextInput value={isbn} onChange={(e) => setIsbn(e.target.value)} />
        </Field>
        <Field label="Páginas totales">
          <TextInput type="number" min={1} value={totalPages} onChange={(e) => setTotalPages(e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Empezado">
          <TextInput type="date" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
        </Field>
        <Field label="Terminado">
          <TextInput type="date" value={finishedAt} onChange={(e) => setFinishedAt(e.target.value)} />
        </Field>
      </div>

      <Field label="Calificación (1-5)">
        <TextInput type="number" min={1} max={5} value={rating} onChange={(e) => setRating(e.target.value)} />
      </Field>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
