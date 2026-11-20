import { Request, Response } from 'express';
import { pool } from '../../server/db';
import { getUserId } from './utils/AuthHelper';
import { Question } from '../Model/Question';

export const attemptController = {
    startAttempt: async (req: Request, res: Response) => {
        const userId = getUserId(req);
        const quizId = parseInt(req.params.quizId);

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const query = `SELECT * FROM start_quiz_attempt($1, $2)`;
        const result = await pool.query(query, [userId, quizId]);
        return res.status(201).json({ attempt: result.rows[0] });
    },

    submitAttempt: async (req: Request, res: Response) => {
        const userId = getUserId(req);
        const attemptId = parseInt(req.params.attemptId);
        const { answers } = req.body; // Expects: [{ questionId: 1, answerData: { index: 2 } }, ...]

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        let totalScore = 0;
        let maxScore = 0;

        for (const ans of answers) {
            const question = await Question.findById(ans.questionId);
            let isCorrect = false;
            let score = 0;
            
            if (question) {
                maxScore += 1; 
                
                // --- SCORING LOGIC FOR MULTIPLE CHOICE ---
                if (question.type === 'multiple') {
                    // Compare User Index vs Correct Index
                    if (ans.answerData.index === question.data.correctIndex) {
                        isCorrect = true;
                        score = 1;
                    }
                } 
                // Add logic for other types here if needed
            }

            totalScore += score;
            
            // Save Detail
            await pool.query(
                `SELECT save_quiz_answer($1, $2, $3, $4, $5)`,
                [attemptId, ans.questionId, ans.answerData, isCorrect, score]
            );
        }

        // Save Final Result
        await pool.query(
            `SELECT finish_quiz_attempt($1, $2, $3)`,
            [attemptId, totalScore, maxScore]
        );

        return res.status(200).json({ message: "Quiz Submitted", score: totalScore, total: maxScore });
    },
    getHistory: async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const result = await pool.query(`SELECT * FROM get_user_quiz_history($1)`, [userId]);
        return res.status(200).json({ history: result.rows });
    },
    
    getStatistics: async (req: Request, res: Response) => {
        const userId = getUserId(req);
        const quizId = parseInt(req.params.quizId);
        
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        try {
            // 1. Overview (Existing)
            const overviewRes = await pool.query(`SELECT * FROM get_quiz_stats_overview($1)`, [quizId]);
            
            // 2. Leaderboard (Existing)
            const leaderboardRes = await pool.query(`SELECT * FROM get_quiz_leaderboard($1)`, [quizId]);

            // 3. [NEW] Question Analysis
            const questionRes = await pool.query(`SELECT * FROM get_quiz_question_stats($1)`, [quizId]);

            // 4. [NEW] All Attempts List
            const attemptsRes = await pool.query(`SELECT * FROM get_quiz_attempts_list($1)`, [quizId]);

            return res.status(200).json({
                overview: overviewRes.rows[0],
                leaderboard: leaderboardRes.rows,
                questionStats: questionRes.rows, // Send to frontend
                attempts: attemptsRes.rows       // Send to frontend
            });
        } catch (error) {
            console.error("Stats Error", error);
            return res.status(500).json({ message: "Error loading statistics" });
        }
    },
    
    getPopular: async (_req: Request, res: Response) => {
        try {
            const result = await pool.query(`SELECT * FROM get_popular_quizzes(10)`);
            return res.status(200).json({ quizzes: result.rows });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Error fetching popular quizzes" });
        }
    },

    gradeEssay: async (_req: Request, res: Response) => {

        return res.status(501).json({ message: "Manual grading feature coming soon" });
    }
};