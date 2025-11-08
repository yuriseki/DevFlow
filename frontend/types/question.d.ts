import { type Answer } from '@frontend/types/answer';
import { type Tag } from '@frontend/types/tag';
import { type User } from '@frontend/types/user';

export interface QuestionBase {
  title: string;
  content: string;
  views?: number | null;
  upvotes?: number | null;
  downvotes?: number | null;
  author_id: number;
}

export interface Question extends QuestionBase {
  id?: number;
  created_at: string;
  updated_at?: string | null;
  answers?: Answer[] | null;
  tags: Tag[];
  author?: User;
}

export interface QuestionCreate extends QuestionBase {}

export type QuestionUpdate = Partial<QuestionBase>;

export interface QuestionLoad extends QuestionBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionTagRelationship {
    question_id: number;
    tag_id: number;
}
