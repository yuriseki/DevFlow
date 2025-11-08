import { type Account } from '@frontend/types/account';
import { type Question } from '@frontend/types/question';
import { type Answer } from '@frontend/types/answer';
import { type UserCollection } from '@frontend/types/user_collection';

export interface UserBase {
  name: string;
  username: string;
  email: string;
  bio?: string | null;
  image: string;
  location?: string | null;
  portfolio?: string | null;
  reputation: number;
}

export interface User extends UserBase {
  id?: number;
  created_at: string;
  updated_at?: string | null;
  accounts?: Account[];
  questions?: Question[];
  answers?: Answer[];
  collection?: UserCollection[];
}

export interface UserCreate extends UserBase {}

export type UserUpdate = Partial<UserBase>;

export interface UserLoad extends UserBase {
  id: number;
  created_at: string;
  updated_at: string;
}
