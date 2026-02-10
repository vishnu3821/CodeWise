const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.get('/:id', questionController.getQuestionById);
router.post('/:id/draft', questionController.saveCodeDraft);
router.get('/:id/draft', questionController.getCodeDraft);

module.exports = router;
