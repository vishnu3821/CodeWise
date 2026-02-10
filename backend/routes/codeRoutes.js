const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');

router.post('/run', codeController.runCode);
router.post('/submit', codeController.submitCode);
router.post('/run-cases', codeController.runTestCases);

module.exports = router;
