const express = require('express');
const router = express.Router();
const placementPrepController = require('../controllers/placementPrepController');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/companies');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4() + path.extname(file.originalname).toLowerCase();
        cb(null, uniqueSuffix);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter
});

// Base Route: /api/placement-prep

// --- Companies ---
router.get('/companies', verifyToken, checkRole(['content_manager', 'admin']), placementPrepController.getCompanies);
router.post('/companies', verifyToken, checkRole(['content_manager', 'admin']), upload.single('logo'), placementPrepController.addCompany);
router.get('/companies/:id', verifyToken, checkRole(['content_manager', 'admin']), placementPrepController.getCompanyDetails);
router.put('/companies/:id', verifyToken, checkRole(['content_manager', 'admin']), upload.single('logo'), placementPrepController.updateCompany);
router.delete('/companies/:id', verifyToken, checkRole(['content_manager', 'admin']), placementPrepController.deleteCompany);

// --- Modules ---
router.get('/companies/:companyId/modules', verifyToken, checkRole(['content_manager', 'admin']), placementPrepController.getModules);
router.post('/companies/:companyId/modules', verifyToken, checkRole(['content_manager', 'admin']), placementPrepController.addModule);
router.put('/modules/:id', verifyToken, checkRole(['content_manager', 'admin']), placementPrepController.updateModule);
router.delete('/modules/:id', verifyToken, checkRole(['content_manager', 'admin']), placementPrepController.deleteModule);

// --- Questions ---
router.get('/companies/:companyId/questions', verifyToken, checkRole(['content_manager', 'admin']), placementPrepController.getQuestions);
router.post('/companies/:companyId/questions', verifyToken, checkRole(['content_manager', 'admin']), placementPrepController.addQuestion);
router.put('/questions/:id', verifyToken, checkRole(['content_manager', 'admin']), placementPrepController.updateQuestion);
router.delete('/questions/:id', verifyToken, checkRole(['content_manager', 'admin']), placementPrepController.deleteQuestion);

// --- Public (Student) Routes ---
router.get('/public/companies', verifyToken, placementPrepController.getPublicCompanies);
router.get('/public/companies/:companyId', verifyToken, placementPrepController.getPublicCompanyDetails);
router.get('/public/companies/:companyId/modules', verifyToken, placementPrepController.getPublicModules);
router.get('/public/companies/:companyId/questions', verifyToken, placementPrepController.getPublicQuestions);

// --- Activity Logs & Admin Monitor ---
router.get('/activity', verifyToken, checkRole(['content_manager', 'admin']), placementPrepController.getCMActivityLogs);

// Admin exclusive routes
router.get('/admin/overview', verifyToken, checkRole(['admin']), placementPrepController.getAdminOverviewStats);
router.get('/admin/companies', verifyToken, checkRole(['admin']), placementPrepController.getAdminCompaniesList);
router.get('/admin/companies/:companyId/questions', verifyToken, checkRole(['admin']), placementPrepController.getAdminCompanyQuestions);
router.get('/admin/activity', verifyToken, checkRole(['admin']), placementPrepController.getAllActivityLogs);
router.patch('/admin/questions/:id/status', verifyToken, checkRole(['admin']), placementPrepController.toggleQuestionStatus);

module.exports = router;
