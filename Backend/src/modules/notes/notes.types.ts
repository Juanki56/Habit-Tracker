export interface Note {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  title?: string;
  content: string;
  habit_ids?: string[];
  activity_ids?: string[];
  resource_ids?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
}

export interface NoteWithLinks extends Note {
  habit_ids: string[];
  activity_ids: string[];
  resource_ids: string[];
}