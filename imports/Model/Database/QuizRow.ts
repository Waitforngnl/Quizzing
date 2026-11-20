export interface QuizRow {
  id: number;
  user_id: number;
  name: string;
  status: 'draft' | 'published' | 'hidden';
  access_code: string | null;
  started_at: Date | null;
  ended_at: Date | null;
  created_at: Date;
  updated_at: Date;
}