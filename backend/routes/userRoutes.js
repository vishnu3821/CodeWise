const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:userId/completed-questions', userController.getCompletedQuestions);
router.post('/update-profile', authMiddleware, upload.single('profilePicture'), userController.updateProfile);
router.post('/change-password', authMiddleware, userController.changePassword);

// Admin Routes
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware('admin'), userController.getAllUsers);
router.get('/:id', authMiddleware, roleMiddleware('admin'), userController.getUserById);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), userController.deleteUser);
router.patch('/:id/status', authMiddleware, roleMiddleware('admin'), userController.toggleUserStatus);

module.exports = router;
