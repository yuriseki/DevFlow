import { type Question } from '@frontend/types/question';

export interface TagBase {
  name: string;
}

export interface Tag extends TagBase {
  id?: number;
  created_at: string;
  updated_at?: string | null;
  num_questions?: number | null;
  questions: Question[];
}

export interface TagCreate extends TagBase {}

export type TagUpdate = Partial<TagBase>;

export interface TagLoad extends TagBase {
  id: number;
  created_at: string;
  updated_at: string;
  num_questions: number;
}
