// imports/Model/Quizz.ts
import { pool } from '../../server/db';
import { QuizRow } from './Database/QuizRow';
import { Question } from './Question';

export type DBStatus = 'draft' | 'published' | 'hidden';
export type UIStatus = 'draft' | 'hidden' | 'upcoming' | 'running' | 'ending';

export class Quiz {
  public id: number;
  public userId: number;
  public name: string;
  private _dbStatus: DBStatus; 
  public accessCode: string | null;
  public startedAt: Date | null;
  public endedAt: Date | null;

  constructor(row: QuizRow) {
    this.id = row.id;
    this.userId = row.user_id;
    this.name = row.name;
    this._dbStatus = row.status as DBStatus;
    this.accessCode = row.access_code;
    this.startedAt = row.started_at;
    this.endedAt = row.ended_at;
  }

  public get status(): UIStatus {
    const now = new Date();
    if (this._dbStatus === 'draft') return 'draft';
    if (this._dbStatus === 'hidden') return 'hidden';

    if (this._dbStatus === 'published') {
        if (this.endedAt && now > this.endedAt) return 'ending';
        if (this.startedAt && now >= this.startedAt) return 'running';
        if (this.startedAt && now < this.startedAt) return 'upcoming';
        return 'running';
    }
    return 'draft';
  }

  static async create(userId: number, name: string, status: DBStatus = 'draft', start?: Date, end?: Date): Promise<Quiz> {
    const query = `SELECT * FROM create_quiz($1, $2, $3, $4, $5)`;
    const result = await pool.query(query, [userId, name, status, start, end]);
    return new Quiz(result.rows[0] as QuizRow);
  }

  static async update(id: number, name: string, status: DBStatus, access_code?: string| null, start?: Date | null, end?: Date | null): Promise<Quiz[]> {
    const query = `SELECT * FROM update_quiz($1, $2, $3, $4, $5, $6);`; 
    const result = await pool.query(query, [id, name, status, access_code || null, start || null, end || null]);
    return result.rows.map((row: QuizRow) => new Quiz(row));
  }

  // This is the HARD DELETE function (SQL function delete_quiz)
  static async delete(id: number) {
    const query = `SELECT * FROM delete_quiz($1);`; 
    await pool.query(query, [id]);
    return true; 
  }

  static async findById(id: number): Promise<Quiz[]>{
    const query = `SELECT * FROM get_quiz_by_id($1);`;
    const result = await pool.query(query, [id]);
    return result.rows.map((row: QuizRow) => new Quiz(row));
  }

  static async findByUser(userId: number): Promise<Quiz[]>{
    const query = `SELECT * FROM get_quizzes_by_user($1);`;
    const result = await pool.query(query, [userId]);
    return result.rows.map((row: QuizRow) => new Quiz(row));
  }

  static async findByName(name: string): Promise<Quiz[]>{
    const query = `SELECT * FROM get_quizzes_by_name($1);`;
    const result = await pool.query(query, [name]);
    return result.rows.map((row: QuizRow) => new Quiz(row));
  }

  static async findByAccessCode(access_code: string): Promise<Quiz | null> {
    const query = `SELECT * FROM get_quiz_by_access_code($1);`;
    const result = await pool.query(query, [access_code]);
    if (result.rows.length === 0) return null;
    return new Quiz(result.rows[0] as QuizRow);
  }

  public toJson() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      accessCode: this.accessCode
    };
  }

  public async addQuestion(content: string, type: string, data: object) {
    return await Question.create(this.id, content, type, data);
  }
  public async getQuestions() {
    return await Question.findByQuizId(this.id);
  }

  public async updateQuestion(questionId: number, content: string, type: string, data: object) {
    return await Question.update(questionId, content, type, data);
  }
  
  public async removeQuestion(questionId: number) {
    return await Question.delete(questionId);
  }
}