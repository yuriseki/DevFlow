import { type User } from '@frontend/types/user';
import { type Question } from '@frontend/types/question';

export interface UserCollectionBase {}

export interface UserCollection {
  created_at: string;
  updated_at?: string | null;
  user_id: number;
  question_id: number;
  user: User;
  question: Question;
}

export interface UserCollectionCreate extends UserCollectionBase {
    user_id: number;
    question_id: number;
}

export type UserCollectionUpdate = Partial<UserCollectionBase>;

export interface UserCollectionLoad extends UserCollectionBase {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  question_id: number;
}
