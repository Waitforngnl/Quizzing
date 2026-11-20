// imports/Controller/QuizController.ts
import { Request, Response } from 'express';
import { Quiz } from '../Model/Quizz';
import { getUserId } from './utils/AuthHelper';

export const quizzController = {
    createQuiz: async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { name, status, startedAt, endedAt } = req.body;
        if (!name) return res.status(400).json({ message: 'Quiz name is required' });

        const newQuiz = await Quiz.create(userId, name, status, startedAt, endedAt);
        
        return res.status(201).json({
            message: 'Quiz created successfully',
            quiz: newQuiz.toJson()
        });
    },

    updateQuiz: async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const quizId = parseInt(req.params.id);
        const { name, status, accessCode, startedAt, endedAt } = req.body;

        const [existing] = await Quiz.findById(quizId);
        if (!existing) return res.status(404).json({ message: 'Quiz not found' });
        if (existing.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

        const updatedQuizzes = await Quiz.update(
            quizId,
            name || existing.name,
            status || (existing as any)._dbStatus, 
            accessCode !== undefined ? accessCode : existing.accessCode,
            startedAt,
            endedAt
        );

        return res.status(200).json({
            message: 'Quiz updated',
            quiz: updatedQuizzes[0].toJson()
        });
    },

    hiddenQuiz: async (req: Request, res: Response) => {
        // This function is kept for backward compatibility if routed, 
        // but 'deleteQuiz' below handles the logic better.
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const quizId = parseInt(req.params.id);
        const [existing] = await Quiz.findById(quizId);
        
        if (!existing) return res.status(404).json({ message: 'Quiz not found' });
        if (existing.userId !== userId) return res.status(403).json({ message: 'Forbidden' });
        
        const updatedQuizzes = await Quiz.update(
            quizId, existing.name, 'hidden', existing.accessCode, existing.startedAt, existing.endedAt
        );

        return res.status(200).json({
            message: 'Quiz hidden successfully',
            quiz: updatedQuizzes[0].toJson()
        });
    },

    findQuiz: async (req: Request, res: Response) => {
        try {
            const userId = getUserId(req);
            const quizIdParam = req.params.id;

            // CASE 1: Get Single Quiz by ID
            if (quizIdParam) {
                const quizId = parseInt(quizIdParam);
                const [quiz] = await Quiz.findById(quizId);
                if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
                return res.status(200).json({ quiz: quiz.toJson() });
            }

            // CASE 2: Get All Quizzes for User
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const quizzes = await Quiz.findByUser(userId);
            return res.status(200).json({ 
                quizzes: quizzes.map(q => q.toJson()) 
            });

        } catch (error) {
            console.error("Find Quiz Error:", error);
            return res.status(500).json({ message: "Server Error" });
        }
    },

    joinQuiz: async (req: Request, res: Response) => {
        const { accessCode } = req.body;
        if (!accessCode) return res.status(400).json({ message: "Access code required" });

        const quiz = await Quiz.findByAccessCode(accessCode);

        if (!quiz) return res.status(404).json({ message: "Quiz not found or code invalid" });
        if (quiz.status === 'draft' || quiz.status === 'hidden') return res.status(403).json({ message: "Quiz is not active" });
        if (quiz.status === 'upcoming') return res.status(403).json({ message: "Quiz has not started yet", startTime: quiz.startedAt });
        if (quiz.status === 'ending') return res.status(403).json({ message: "Quiz has ended" });

        return res.status(200).json({ 
            message: "Joined successfully", 
            quiz: quiz.toJson() 
        });
    },

    searchQuizzes: async (req: Request, res: Response) => {
        const { name } = req.query;
        if (typeof name !== 'string') return res.status(400).json({ message: "Search term required" });

        const quizzes = await Quiz.findByName(name);
        const publicQuizzes = quizzes.filter(q => q.status !== 'draft' && q.status !== 'hidden');

        return res.status(200).json({ quizzes: publicQuizzes.map(q => q.toJson()) });
    },

    deleteQuiz: async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const quizId = parseInt(req.params.id);
        const [existing] = await Quiz.findById(quizId);
        
        if (!existing) return res.status(404).json({ message: 'Quiz not found' });
        if (existing.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

        // Logic: Draft -> Hard Delete. Published -> Soft Delete (Hidden).
        if (existing.status === 'draft') {
            await Quiz.delete(quizId);
            return res.status(200).json({ message: 'Quiz deleted permanently', id: quizId, action: 'deleted' });
        } else {
            const updated = await Quiz.update(
                quizId, existing.name, 'hidden', existing.accessCode, existing.startedAt, existing.endedAt
            );
            return res.status(200).json({ message: 'Quiz archived (hidden)', quiz: updated[0].toJson(), action: 'hidden' });
        }
    },

    updateQuestion: async (req: Request, res: Response) => {
        const userId = getUserId(req);
        const quizId = parseInt(req.params.id);       
        const questionId = parseInt(req.params.questionId); 
        const { content, type, data } = req.body; // FIX: Extract 'type' here

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        if (!content) return res.status(400).json({ message: 'Content is required' });

        const [quiz] = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });
        if (quiz.userId !== userId) return res.status(403).json({ message: "Forbidden" });

        // FIX: Pass 'type' to the model
        const updatedQuestion = await quiz.updateQuestion(questionId, content, type, data || {});

        return res.status(200).json({ question: updatedQuestion });
    },

    addQuestion: async (req: Request, res: Response) => {
        const userId = getUserId(req);
        const quizId = parseInt(req.params.id);
        const { content, type, data } = req.body;

        const [quiz] = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });
        if (quiz.userId !== userId) return res.status(403).json({ message: "Forbidden" });

        const newQuestion = await quiz.addQuestion(content, type, data);
        return res.status(201).json({ question: newQuestion });
    },

    getQuestions: async (req: Request, res: Response) => {
        const quizId = parseInt(req.params.id);
        const [quiz] = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        const questions = await quiz.getQuestions();
        return res.status(200).json({ questions });
    },

    deleteQuestion: async (req: Request, res: Response) => {
        const userId = getUserId(req);
        const quizId = parseInt(req.params.id);
        const questionId = parseInt(req.params.questionId);

        const [quiz] = await Quiz.findById(quizId);
        if (!quiz || quiz.userId !== userId) return res.status(403).json({ message: "Forbidden" });

        await quiz.removeQuestion(questionId);
        return res.status(200).json({ message: "Question deleted" });
    }

    
};