const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const contentQuestionController = require('../controllers/contentQuestionController');
const contentExamController = require('../controllers/contentExamController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Base path: /api/content

const contentNotesController = require('../controllers/contentNotesController');
const adminController = require('../controllers/adminController');

// Middleware to check for Admin role

// Middleware to check for Admin role
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

// Admin Routes
router.get('/admin/stats', authMiddleware, adminOnly, adminController.getStats);
router.get('/admin/review-queue', authMiddleware, adminOnly, adminController.getReviewQueue);
router.get('/admin/item/:type/:id', authMiddleware, adminOnly, adminController.getReviewItemDetails);
router.post('/admin/review/:type/:id', authMiddleware, adminOnly, adminController.reviewItem);
router.get('/admin/audit-logs', authMiddleware, adminOnly, adminController.getAuditLogs);
router.get('/admin/users', authMiddleware, adminOnly, adminController.getContentManagers);
router.post('/admin/users', authMiddleware, adminOnly, adminController.createContentManager);
router.patch('/admin/users/:id/status', authMiddleware, adminOnly, adminController.toggleUserStatus);
router.delete('/admin/users/:id', authMiddleware, adminOnly, adminController.deleteUser);
router.patch('/admin/languages/:id/status', authMiddleware, adminOnly, adminController.toggleLanguageStatus);
router.patch('/admin/content/:type/:id/status', authMiddleware, adminOnly, adminController.toggleItemStatus);

// Languages
router.get('/languages', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentController.getAllLanguages);
router.post('/languages', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentController.createLanguage);
router.put('/languages/:id', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentController.updateLanguage);
router.patch('/languages/:id/status', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentController.toggleLanguageStatus);

// Topics
router.get('/languages/:languageId/topics', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentController.getTopicsByLanguage);
router.post('/topics', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentController.createTopic);
router.put('/topics/:id', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentController.updateTopic);
router.patch('/topics/:id/status', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentController.toggleTopicStatus);

// Subtopics
router.get('/topics/:topicId/subtopics', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentController.getSubtopicsByTopic);
router.post('/subtopics', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentController.createSubtopic);
router.put('/subtopics/:id', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentController.updateSubtopic);
router.patch('/subtopics/:id/status', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentController.toggleSubtopicStatus);

// Questions
router.get('/questions', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentQuestionController.getQuestions);
router.get('/questions/:id', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentQuestionController.getQuestionById);
router.post('/questions', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentQuestionController.createQuestion);
router.put('/questions/:id', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentQuestionController.updateQuestion);
router.patch('/questions/:id/status', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentQuestionController.toggleQuestionStatus);

// --- Exam Management Routes ---
// --- Exam Management Routes ---
router.get('/exams', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentExamController.getExams);
router.get('/exams/:id', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentExamController.getExamById);
router.post('/exams', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentExamController.createExam);
router.put('/exams/:id', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentExamController.updateExam);
router.patch('/exams/:id/status', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentExamController.updateExamStatus);

// Exam Questions
router.post('/exams/:id/questions', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentExamController.addQuestionToExam);
router.delete('/exams/:id/questions/:questionId', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentExamController.removeQuestionFromExam);
router.put('/exams/:id/reorder', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentExamController.reorderQuestions);

// --- Notes Management Routes ---
const multer = require('multer');
const path = require('path');
// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/notes/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // e.g. 123456789.pdf
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
});

router.post('/notes', authMiddleware, roleMiddleware(['content_manager', 'admin']), upload.single('file'), contentNotesController.createNote);
router.get('/notes', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentNotesController.getNotes);
router.put('/notes/:id', authMiddleware, roleMiddleware(['content_manager', 'admin']), upload.single('file'), contentNotesController.updateNote);
router.patch('/notes/:id/status', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentNotesController.toggleStatus);
// 8. Request Delete
router.patch('/notes/:id/request-delete', authMiddleware, roleMiddleware(['content_manager', 'admin']), contentNotesController.requestDelete);

// Public/Student Route (Needs auth but not admin role)
router.get('/notes/public', authMiddleware, contentNotesController.getPublicNotes);
router.get('/notes/public/:id', authMiddleware, contentNotesController.getPublicNoteById);

module.exports = router;
