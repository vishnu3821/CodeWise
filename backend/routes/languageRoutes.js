const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');

const authMiddleware = require('../middleware/authMiddleware');

router.get('/', languageController.getAllLanguages);
router.get('/:slug/topics', authMiddleware, languageController.getTopicsByLanguage);

module.exports = router;
