const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');

router.get('/', languageController.getAllLanguages);
router.get('/:slug/topics', languageController.getTopicsByLanguage);

module.exports = router;
