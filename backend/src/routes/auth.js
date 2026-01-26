const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');
const { googleLogin, githubLogin, getGoogleAuthUrl, getGithubAuthUrl } = require('../controllers/oauthController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidator, loginValidator } = require('../middleware/validators');

router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.put('/reset-password', resetPassword);

router.get('/google/url', getGoogleAuthUrl);
router.post('/google', googleLogin);

router.get('/github/url', getGithubAuthUrl);
router.post('/github', githubLogin);

router.get('/me', protect, getMe);

module.exports = router;
