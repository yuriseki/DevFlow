import { type User } from '@frontend/types/user';
import { type Question } from '@frontend/types/question';

export interface AnswerBase {
  content: string;
  user_id: number;
  question_id: number;
  upvotes?: number | null;
  downvotes?: number | null;
}

export interface Answer extends AnswerBase {
  id?: number;
  created_at: string;
  updated_at?: string | null;
  user: User;
  question: Question;
}

export interface AnswerCreate extends AnswerBase {}

export type AnswerUpdate = Partial<AnswerBase>;

export interface AnswerLoad extends AnswerBase {
  id: number;
  created_at: string;
  updated_at: string;
}
