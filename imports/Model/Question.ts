import { pool } from '../../server/db';
import { QuestionRow, QuestionData } from '../Model/Database/QuestionRow';

export class Question {
  public id: number;
  public quizId: number;
  public content: string;
  public type: string;
  public data: QuestionData;
  public createdAt: Date;

  constructor(row: QuestionRow) {
    this.id = row.id;
    this.quizId = row.quiz_id;
    this.content = row.content;
    this.type = row.type;
    this.data = row.data; 
    this.createdAt = row.created_at;
  }

  public getMediaUrl(): string | null {
    return this.data.media?.url || null;
  }

  static async create(quizId: number, content: string, type: string, data: object) {
    const query = `SELECT * FROM create_question($1, $2, $3, $4)`;
    const result = await pool.query(query, [content, type, quizId, data]);
    return result.rows[0];
  }

  static async update(id: number, content: string, type: string, data: object) {
    const query = `SELECT * FROM update_question($1, $2, $3, $4)`; // 4 params now
    const result = await pool.query(query, [id, content, type, data]);
    return result.rows[0];
  }

  static async findByQuizId(quizId: number) {
    const query = `SELECT * FROM get_question_in_quiz($1)`;
    const result = await pool.query(query, [quizId]);
    return result.rows;
  }

  static async findById(id: number) {
    const query = `SELECT * FROM get_question_by_id($1)`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
  
  static async delete(id: number) {
    const query = `SELECT delete_question($1)`;
    await pool.query(query, [id]);
    return true;
  }
}