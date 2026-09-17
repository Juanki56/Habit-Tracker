import { Link } from "react-router-dom";
import { useApiQuery } from "../../hooks/useApiQuery";
import { listResources } from "../../services/resources.service";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";

// El dashboard solo mostraba Habits + Goals — Resources vivía totalmente
// aislado, aunque la idea original era que se sintiera como un solo sistema.
export function CurrentlyReadingSummary() {
  const { data: resources, loading } = useApiQuery(
    (signal) => listResources({ type: "book" }, signal),
    []
  );

  const reading = (resources ?? []).filter((r) => r.book?.status === "reading");

  if (loading || reading.length === 0) return null;

  return (
    <div className="mt-8">
      <p className="flicker font-mono text-xs tracking-widest text-primary">CURRENTLY READING</p>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {reading.map((resource) => (
          <Link key={resource.id} to={`/resources/${resource.id}`}>
            <Card className="h-full hover:border-border-hover">
              <p className="text-sm font-medium text-text">{resource.title}</p>
              {resource.book?.author && <p className="text-xs text-text-muted">{resource.book.author}</p>}
              {resource.book?.total_pages ? (
                <>
                  <p className="mt-2 text-xs text-text-muted">
                    {resource.book.pages_read ?? 0} / {resource.book.total_pages} páginas
                  </p>
                  <div className="mt-1">
                    <ProgressBar value={resource.book.pages_read ?? 0} max={resource.book.total_pages} tone="success" />
                  </div>
                </>
              ) : (
                <p className="mt-2 text-xs text-text-dim">Sin páginas totales registradas</p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
