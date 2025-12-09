const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

/**
 * Chat Routes
 */

// Get available providers
router.get('/providers', chatController.getProviders);

// Get chat history
router.get('/history', chatController.getChatHistory);

// Send message to AI
router.post('/message', chatController.sendMessage);

// Clear chat history
router.post('/clear', chatController.clearChat);

module.exports = router;
