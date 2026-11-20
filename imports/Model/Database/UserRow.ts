export interface UserRow {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: boolean;
  created_at: Date;
  updated_at: Date;
}

