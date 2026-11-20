import { pool } from '../../server/db';
import { UserRow } from './Database/UserRow';
import bcrypt from 'bcryptjs'
export class User {
  private id: number;
  private password_hash: string;
  
  public username: string;
  public email: string;
  public role: boolean;
  public created_at: Date;
  public updated_at: Date;

  constructor(row: UserRow) {
    this.id = row.id;
    this.username = row.username;
    this.email = row.email;
    this.password_hash = row.password_hash;
    this.role = row.role;
    this.created_at = row.created_at;
    this.updated_at = row.updated_at;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM get_user_by_email($1)`;
    const result = await pool.query(query, [email]);
    if (result.rows.length === 0) {
      return null;
    }
    return new User(result.rows[0] as UserRow);
  }

  static async createUser(email: string, username: string, password: string): Promise<User | null>{
    const query = `SELECT * FROM create_user($1, $2, $3)`;
    const result = await pool.query(query, [username, email, password]);
    if (result.rows.length === 0 || !result.rows[0].id){
      return null;
    }
    return new User(result.rows[0] as UserRow)
  }

  static async login(email: string, password: string): Promise<User | null>{
    const user = await this.findByEmail(email);
    if (!user)
      return null;
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (isMatch)
      return user;
    else 
      return null;
  }

  public toJson(){
    return {
        id: this.id,
        username: this.username,
        email: this.email,
        role: this.role,
    }
  }
}