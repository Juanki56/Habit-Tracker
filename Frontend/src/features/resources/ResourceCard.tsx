import { Link } from "react-router-dom";
import type { ResourceWithBook } from "../../types/resource";
import { RESOURCE_TYPE_LABELS, BOOK_STATUS_LABELS } from "../../types/resource";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";

export function ResourceCard({ resource }: { resource: ResourceWithBook }) {
  return (
    <Link to={`/resources/${resource.id}`}>
      <Card className="h-full transition-colors hover:border-border-hover">
        <p className="flicker font-mono text-xs tracking-widest text-primary uppercase">
          {RESOURCE_TYPE_LABELS[resource.resource_type]}
        </p>
        <h3 className="mt-1 font-medium text-text">{resource.title}</h3>

        {resource.book && (
          <div className="mt-3">
            {resource.book.author && <p className="text-sm text-text-muted">{resource.book.author}</p>}
            <p className="mt-1 text-xs text-text-dim">{BOOK_STATUS_LABELS[resource.book.status]}</p>
            {resource.book.total_pages ? (
              <>
                <p className="mt-2 text-xs text-text-muted">
                  {resource.book.pages_read ?? 0} / {resource.book.total_pages} páginas
                </p>
                <div className="mt-1">
                  <ProgressBar value={resource.book.pages_read ?? 0} max={resource.book.total_pages} />
                </div>
              </>
            ) : null}
          </div>
        )}

        {!resource.book && resource.description && (
          <p className="mt-2 line-clamp-2 text-sm text-text-muted">{resource.description}</p>
        )}
      </Card>
    </Link>
  );
}
