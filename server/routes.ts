import express from 'express';
import { authController } from '../imports/Controller/Authentical';
import { quizzController } from '../imports/Controller/QuizController';
import { authMiddleware } from '../imports/Controller/Middleware/AuthMiddleware';
import { attemptController } from '../imports/Controller/AttemptController'; 

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.post('/quizzes', authMiddleware, quizzController.createQuiz);

router.get('/quizzes', authMiddleware, quizzController.findQuiz);

router.get('/quizzes/search', authMiddleware, quizzController.searchQuizzes);
router.get('/quizzes/popular', attemptController.getPopular);                 
router.get('/quizzes/:id', authMiddleware, quizzController.findQuiz);
router.put('/quizzes/:id', authMiddleware, quizzController.updateQuiz);
router.delete('/quizzes/:id', authMiddleware, quizzController.hiddenQuiz);

router.get('/quizzes/:quizId/stats', authMiddleware, attemptController.getStatistics);
router.get('/history', authMiddleware, attemptController.getHistory);

router.get('/quizzes/:id/questions', authMiddleware, quizzController.getQuestions);
router.post('/quizzes/:id/questions', authMiddleware, quizzController.addQuestion);
router.put('/quizzes/:id/questions/:questionId', authMiddleware, quizzController.updateQuestion);
router.delete('/quizzes/:id/questions/:questionId', authMiddleware, quizzController.deleteQuestion);

router.post('/quizzes/:quizId/start', authMiddleware, attemptController.startAttempt);
router.post('/attempts/:attemptId/submit', authMiddleware, attemptController.submitAttempt);

export default router;