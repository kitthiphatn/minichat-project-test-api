const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Workspace = require('../models/Workspace');

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations for workspace
 * @access  Private
 */
exports.getConversations = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const { status, mode, limit = 50, page = 1 } = req.query;

        // Build query
        const query = { workspace: workspace._id };
        if (status) query.status = status;
        if (mode) query.mode = mode;

        const conversations = await Conversation.find(query)
            .populate('assignedTo', 'username email avatar')
            .sort({ 'metadata.lastActivityAt': -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Conversation.countDocuments(query);

        res.json({
            success: true,
            conversations,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('[ERROR] Get conversations failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get conversations',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/conversations/:sessionId
 * @desc    Get conversation details
 * @access  Private
 */
exports.getConversation = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const conversation = await Conversation.findOne({
            sessionId: req.params.sessionId,
            workspace: workspace._id
        })
            .populate('assignedTo', 'username email avatar');

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Get messages
        const messages = await Message.find({ sessionId: req.params.sessionId })
            .populate('sentBy', 'username email avatar')
            .sort({ createdAt: 1 })
            .lean();

        res.json({
            success: true,
            conversation,
            messages
        });

    } catch (error) {
        console.error('[ERROR] Get conversation failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get conversation',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/conversations/:sessionId/takeover
 * @desc    Take over conversation as human agent
 * @access  Private
 */
exports.takeoverConversation = async (req, res) => {
    try {
        // Find conversation first (unique by sessionId)
        const conversation = await Conversation.findOne({
            sessionId: req.params.sessionId
        }).populate('workspace');

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify ownership (or team member access - simplified to owner for now)
        if (conversation.workspace.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this conversation'
            });
        }

        // Check if already taken over by another agent
        if (conversation.mode === 'human' &&
            conversation.assignedTo &&
            conversation.assignedTo.toString() !== req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Conversation is already handled by another agent'
            });
        }

        await conversation.takeoverByHuman(req.user.id);

        // Emit socket event (will implement later)
        if (req.io) {
            req.io.to(`workspace_${conversation.workspace._id}`).emit('conversation_takeover', {
                sessionId: req.params.sessionId,
                agentId: req.user.id,
                agentName: req.user.username
            });
        }

        res.json({
            success: true,
            message: 'Successfully took over the conversation',
            conversation
        });

    } catch (error) {
        console.error('[ERROR] Takeover conversation failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to takeover conversation',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/conversations/:sessionId/end
 * @desc    End human session and return to bot
 * @access  Private
 */
exports.endHumanSession = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            sessionId: req.params.sessionId
        }).populate('workspace');

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        if (conversation.workspace.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Verify ownership
        if (conversation.assignedTo &&
            conversation.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this conversation'
            });
        }

        await conversation.endHumanSession(req.user.id);

        // Emit socket event
        if (req.io) {
            req.io.to(`workspace_${conversation.workspace._id}`).emit('conversation_ended', {
                sessionId: req.params.sessionId,
                agentId: req.user.id
            });
        }

        res.json({
            success: true,
            message: 'Human session ended, bot is now in passive mode',
            conversation
        });

    } catch (error) {
        console.error('[ERROR] End human session failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to end human session',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/conversations/:sessionId/message
 * @desc    Send message as human agent
 * @access  Private
 */
exports.sendHumanMessage = async (req, res) => {
    try {
        const { message, type = 'text', structuredData = null } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const conversation = await Conversation.findOne({
            sessionId: req.params.sessionId
        }).populate('workspace');

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        if (conversation.workspace.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Verify conversation is in human mode
        if (conversation.mode !== 'human') {
            return res.status(400).json({
                success: false,
                message: 'Conversation is not in human mode'
            });
        }

        // Create human message
        const humanMessage = await Message.create({
            role: 'human',
            sentBy: req.user.id,
            content: message,
            type: type,
            structuredData: structuredData,
            sessionId: req.params.sessionId,
            provider: 'human',
            model: 'human-agent'
        });

        // Update conversation activity
        await conversation.updateActivity();

        // Emit socket event to customer
        if (req.io) {
            req.io.to(`session_${req.params.sessionId}`).emit('new_message', {
                message: humanMessage.toResponse()
            });
        }

        res.json({
            success: true,
            message: humanMessage.toResponse()
        });

    } catch (error) {
        console.error('[ERROR] Send human message failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/conversations/:sessionId/resolve
 * @desc    Mark conversation as resolved
 * @access  Private
 */
exports.resolveConversation = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const conversation = await Conversation.findOne({
            sessionId: req.params.sessionId,
            workspace: workspace._id
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        await conversation.resolve(req.user.id);

        res.json({
            success: true,
            message: 'Conversation marked as resolved'
        });

    } catch (error) {
        console.error('[ERROR] Resolve conversation failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resolve conversation',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/conversations/:sessionId/notes
 * @desc    Add note to conversation
 * @access  Private
 */
exports.addNote = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Note text is required'
            });
        }

        const conversation = await Conversation.findOne({
            sessionId: req.params.sessionId,
            workspace: workspace._id
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        conversation.notes.push({
            text: text,
            addedBy: req.user.id,
            createdAt: new Date()
        });

        await conversation.save();

        res.json({
            success: true,
            message: 'Note added successfully',
            conversation
        });

    } catch (error) {
        console.error('[ERROR] Add note failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add note',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/conversations/stats
 * @desc    Get conversation statistics
 * @access  Private
 */
exports.getStats = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const stats = await Conversation.aggregate([
            { $match: { workspace: workspace._id } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    botHandled: {
                        $sum: { $cond: [{ $eq: ['$mode', 'bot'] }, 1, 0] }
                    },
                    humanHandled: {
                        $sum: { $cond: [{ $eq: ['$mode', 'human'] }, 1, 0] }
                    },
                    resolved: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            stats: stats[0] || {
                total: 0,
                active: 0,
                botHandled: 0,
                humanHandled: 0,
                resolved: 0
            }
        });

    } catch (error) {
        console.error('[ERROR] Get stats failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics',
            error: error.message
        });
    }
};
