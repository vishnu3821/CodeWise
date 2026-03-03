const express = require('express');
const router = express.Router();
const trainingExamController = require('../controllers/trainingExamController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/admin/list', authMiddleware, trainingExamController.getAdminExams); // Admin List - MUST be before /:id
router.get('/:id/inspection', authMiddleware, trainingExamController.getExamInspectionStats); // Admin Inspection
router.get('/', authMiddleware, trainingExamController.getAllExams);
router.get('/:id', authMiddleware, trainingExamController.getExam);
router.get('/:id/result', authMiddleware, trainingExamController.getAttemptResult);

router.post('/run-code', authMiddleware, trainingExamController.runCode);
router.post('/:id/execute-code', authMiddleware, trainingExamController.executeExamCode);
router.post('/:id/submit', authMiddleware, trainingExamController.submitExam);
router.post('/:id/set-password', authMiddleware, trainingExamController.setExamPassword);
router.post('/:id/pre-exam-message', authMiddleware, trainingExamController.setPreExamMessage);
router.post('/:id/accept-message', authMiddleware, trainingExamController.acceptPreExamMessage);
router.post('/:id/verify-password', authMiddleware, trainingExamController.verifyPassword);
router.post('/:id/pass-percentage', authMiddleware, trainingExamController.editPassPercentage);

router.delete('/admin/:id', authMiddleware, trainingExamController.deleteExam);
router.delete('/admin/:id/reset-attempt/:userId', authMiddleware, trainingExamController.resetExamAttempt);

module.exports = router;
