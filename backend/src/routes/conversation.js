const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getConversations,
    getConversation,
    takeoverConversation,
    endHumanSession,
    sendHumanMessage,
    resolveConversation,
    addNote,
    getStats
} = require('../controllers/conversationController');

// All routes are protected (require authentication)
router.use(protect);

// Conversation management
router.get('/', getConversations);
router.get('/stats', getStats);
router.get('/:sessionId', getConversation);

// Human takeover
router.post('/:sessionId/takeover', takeoverConversation);
router.post('/:sessionId/end', endHumanSession);
router.post('/:sessionId/message', sendHumanMessage);

// Conversation actions
router.post('/:sessionId/resolve', resolveConversation);
router.post('/:sessionId/notes', addNote);

module.exports = router;
