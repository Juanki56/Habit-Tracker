export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface CreateTagInput {
  name: string;
}

export type TaggableKind = "habits" | "activities" | "resources" | "notes";
