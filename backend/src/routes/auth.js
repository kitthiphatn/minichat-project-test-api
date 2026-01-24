const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { googleLogin, githubLogin, getGoogleAuthUrl, getGithubAuthUrl } = require('../controllers/oauthController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);

router.get('/google/url', getGoogleAuthUrl);
router.post('/google', googleLogin);

router.get('/github/url', getGithubAuthUrl);
router.post('/github', githubLogin);

router.get('/me', protect, getMe);

module.exports = router;
