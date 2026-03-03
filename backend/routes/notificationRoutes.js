const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Get notifications for authenticated user
router.get('/', authMiddleware, notificationController.getNotifications);

// Mark notification as read
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

// Mark all as read
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

// Admin: Broadcast new notification
router.post('/admin/push', authMiddleware, notificationController.createPushNotification);

module.exports = router;
