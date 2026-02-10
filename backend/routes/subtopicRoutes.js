const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.get('/:subtopicId/questions', questionController.getQuestionsBySubtopic);

module.exports = router;
