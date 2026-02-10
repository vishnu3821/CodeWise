const express = require('express');
const router = express.Router();
const { signup, login, googleLogin, forgotPassword, resetPassword, sendVerificationEmail, verifyEmail } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-verification-email', sendVerificationEmail);
router.post('/verify-email', verifyEmail);

module.exports = router;
