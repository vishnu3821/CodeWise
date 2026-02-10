const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Standard upload middleware

// Post new issue (with screenshot)
// Assuming 'screenshot' is the field name for file
router.post('/', auth, upload.single('screenshot'), async (req, res, next) => {
    // Basic handle of file upload to get URL
    if (req.file) {
        // middleware saves to uploads/profiles, so url should reflect that
        req.body.screenshot_url = `/uploads/profiles/${req.file.filename}`;
    }
    next();
}, issueController.createIssue);

// Get issues
router.get('/', auth, issueController.getIssues);

// Get single issue
router.get('/:id', auth, issueController.getIssueById);

// Update status (Admin only)
router.patch('/:id/status', auth, issueController.updateIssueStatus);

module.exports = router;
