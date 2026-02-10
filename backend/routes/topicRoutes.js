const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const topicController = require('../controllers/topicController');
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware');

router.get('/:topicSlug/questions', questionController.getQuestionsByTopic);
router.get('/:slug/subtopics', optionalAuthMiddleware, topicController.getSubtopicsByTopic);

module.exports = router;
