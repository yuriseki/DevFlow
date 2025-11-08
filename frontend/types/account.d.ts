import { type User } from '@frontend/types/user';

export interface AccountBase {
  username: string;
  image?: string | null;
  provider: string;
  provider_account_id: string;
  user_id: number;
}

export interface Account extends AccountBase {
  id?: number;
  created_at: string;
  updated_at?: string | null;
  password?: string | null;
  user?: User;
}

export interface AccountCreate extends AccountBase {
  password?: string;
}

export interface AccountUpdate {
  password?: string;
}

export interface AccountLoad extends AccountBase {
  id: number;
  created_at: string;
  updated_at: string;
}
