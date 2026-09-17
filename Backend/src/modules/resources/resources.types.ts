export type ResourceType =
  | "book"
  | "article"
  | "video"
  | "course"
  | "podcast"
  | "website"
  | "documentation"
  | "other";

export type BookStatus = "planned" | "reading" | "paused" | "finished" | "abandoned";

export interface Resource {
  id: string;
  user_id: string;
  resource_type: ResourceType;
  title: string;
  description: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  resource_id: string;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  total_pages: number | null;
  status: BookStatus;
  started_at: string | null;
  finished_at: string | null;
  rating: number | null;
}

export interface BookProgress {
  book_id: string;
  total_pages: number | null;
  pages_read: number | null;
  progress_percentage: number | null;
}

export interface ResourceWithBook extends Resource {
  book: (Book & Partial<BookProgress>) | null;
}

export interface CreateBookInput {
  author?: string;
  isbn?: string;
  publisher?: string;
  total_pages?: number;
  status?: BookStatus;
  started_at?: string;
  finished_at?: string;
  rating?: number;
}

export interface CreateResourceInput {
  resource_type: ResourceType;
  title: string;
  description?: string;
  url?: string;
  book?: CreateBookInput;
}

export interface UpdateResourceInput {
  title?: string;
  description?: string;
  url?: string;
}

export interface UpdateBookInput {
  author?: string | null;
  isbn?: string | null;
  publisher?: string | null;
  total_pages?: number | null;
  status?: BookStatus;
  started_at?: string | null;
  finished_at?: string | null;
  rating?: number | null;
}
