const mongoose = require('mongoose');

/**
 * Conversation Model
 * Manages conversation state, human takeover, and session metadata
 */
const conversationSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
        index: true
    },
    customer: {
        name: String,
        email: String,
        phone: String,
        metadata: Object  // Additional customer info
    },
    status: {
        type: String,
        enum: ['active', 'waiting', 'resolved', 'abandoned'],
        default: 'active',
        index: true
    },
    mode: {
        type: String,
        enum: ['bot', 'human', 'hybrid'],
        default: 'bot',
        index: true
        // bot: AI handles everything
        // human: Human agent handles
        // hybrid: Both can respond
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    handoverAt: {
        type: Date,
        default: null
    },
    endedAt: {
        type: Date,
        default: null
    },
    botPaused: {
        type: Boolean,
        default: false
    },
    botMode: {
        type: String,
        enum: ['active', 'passive'],
        default: 'active'
        // active: Bot responds automatically
        // passive: Bot waits for customer to ask
    },
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative'],
        default: 'neutral'
    },
    metadata: {
        source: String,          // 'widget', 'facebook', 'line'
        deviceType: String,      // 'mobile', 'desktop'
        browserInfo: String,
        pageUrl: String,
        referrer: String,
        messageCount: {
            type: Number,
            default: 0
        },
        lastActivityAt: Date
    },
    notes: [{
        text: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    timeline: [{
        event: String,           // 'created', 'bot_paused', 'human_joined', 'human_ended', 'resolved'
        description: String,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
conversationSchema.index({ workspace: 1, status: 1, mode: 1 });
conversationSchema.index({ assignedTo: 1, status: 1 });
conversationSchema.index({ createdAt: -1 });

// Methods
conversationSchema.methods.takeoverByHuman = async function(userId) {
    this.mode = 'human';
    this.botPaused = true;
    this.assignedTo = userId;
    this.handoverAt = new Date();

    this.timeline.push({
        event: 'human_takeover',
        description: 'Human agent took over the conversation',
        userId: userId,
        timestamp: new Date()
    });

    await this.save();
};

conversationSchema.methods.endHumanSession = async function(userId) {
    this.mode = 'bot';
    this.botPaused = false;
    this.botMode = 'passive';  // Bot goes to passive mode
    this.endedAt = new Date();

    this.timeline.push({
        event: 'human_ended',
        description: 'Human agent ended the session, bot in passive mode',
        userId: userId,
        timestamp: new Date()
    });

    await this.save();
};

conversationSchema.methods.activateBot = async function() {
    this.mode = 'bot';
    this.botPaused = false;
    this.botMode = 'active';
    this.assignedTo = null;

    this.timeline.push({
        event: 'bot_activated',
        description: 'Bot returned to active mode',
        timestamp: new Date()
    });

    await this.save();
};

conversationSchema.methods.resolve = async function(userId) {
    this.status = 'resolved';
    this.endedAt = new Date();

    this.timeline.push({
        event: 'resolved',
        description: 'Conversation marked as resolved',
        userId: userId,
        timestamp: new Date()
    });

    await this.save();
};

conversationSchema.methods.updateActivity = async function() {
    this.metadata.lastActivityAt = new Date();
    this.metadata.messageCount += 1;
    await this.save();
};

// Static methods
conversationSchema.statics.findOrCreate = async function(sessionId, workspaceId) {
    let conversation = await this.findOne({ sessionId });

    if (!conversation) {
        conversation = await this.create({
            sessionId,
            workspace: workspaceId,
            timeline: [{
                event: 'created',
                description: 'Conversation started',
                timestamp: new Date()
            }]
        });
    }

    return conversation;
};

conversationSchema.statics.getActiveConversations = async function(workspaceId) {
    return await this.find({
        workspace: workspaceId,
        status: { $in: ['active', 'waiting'] }
    })
    .populate('assignedTo', 'username email')
    .sort({ 'metadata.lastActivityAt': -1 });
};

conversationSchema.statics.getPendingHumanResponse = async function(workspaceId) {
    return await this.find({
        workspace: workspaceId,
        mode: 'human',
        status: 'active'
    })
    .populate('assignedTo', 'username email')
    .sort({ handoverAt: 1 });
};

module.exports = mongoose.model('Conversation', conversationSchema);
