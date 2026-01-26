const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { validateApiKey, incrementMessageCount } = require('../middleware/apiKey');
const { messageValidator } = require('../middleware/validators');

// Middleware to make API key optional (tries to validate if present)
const optionalApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey || req.body.apiKey;
    if (apiKey) {
        // If API key is provided, validate it
        return validateApiKey(req, res, next);
    }
    // If no API key, proceed without workspace (some endpoints might handle this differently)
    next();
};

// Get available providers
router.get('/providers', chatController.getProviders);

// Get chat history
router.get('/history', optionalApiKey, chatController.getChatHistory);

// Send message to AI (with API key validation, message counting, and input validation)
router.post('/message', optionalApiKey, incrementMessageCount, messageValidator, chatController.sendMessage);

// Clear chat history
router.delete('/clear', optionalApiKey, chatController.clearChat);

module.exports = router;