const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

// Middleware to mock authentication if not present, or use existing logic
// For now, assuming request sends user_id in headers or we rely on the one passed in body for submit, 
// but for GET requests we need to know who the user is.
// Since we store user in localStorage on frontend, we can pass it in headers.

const getUserId = (req, res, next) => {
    // In a real app, verify JWT. Here, strictly for this task scope, we trust a header or query param for simplicity
    // IF NO AUTH MIDDLEWARE EXISTS.
    // Checking previous code... authController exists. Let's assume we can use a simple middleware here.
    const userId = req.headers['x-user-id'] || req.query.user_id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User ID required' });
    }
    req.user = { id: userId };
    next();
};

router.get('/profile', getUserId, progressController.getUserProfile);
router.get('/summary', getUserId, progressController.getProgressSummary);

module.exports = router;
