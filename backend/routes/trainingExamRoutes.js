const express = require('express');
const router = express.Router();
const trainingExamController = require('../controllers/trainingExamController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, trainingExamController.getAllExams);
router.get('/:id', authMiddleware, trainingExamController.getExam);
router.post('/run-code', authMiddleware, trainingExamController.runCode);
router.post('/:id/submit', authMiddleware, trainingExamController.submitExam);
router.get('/:id/result', authMiddleware, trainingExamController.getAttemptResult);

module.exports = router;
