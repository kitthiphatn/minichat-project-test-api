const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { validateApiKey, incrementMessageCount } = require('../middleware/apiKey');

/**
 * Chat Routes
 *
 * Supports two authentication modes:
 * 1. API Key (for widget) - requires x-api-key header
 * 2. Session-based (legacy) - requires x-session-id header
 */

// Middleware to make API key optional (tries to validate if present)
const optionalApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey || req.body.apiKey;
    if (apiKey) {
        // If API key is provided, validate it
        return validateApiKey(req, res, next);
    }
    // If no API key, proceed without workspace
    next();
};

// Get available providers
router.get('/providers', chatController.getProviders);

// Get chat history
router.get('/history', optionalApiKey, chatController.getChatHistory);

// Send message to AI (with API key validation and message counting)
router.post('/message', optionalApiKey, incrementMessageCount, chatController.sendMessage);

// Clear chat history
router.post('/clear', optionalApiKey, chatController.clearChat);

module.exports = router;