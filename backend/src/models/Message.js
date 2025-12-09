const mongoose = require('mongoose');

/**
 * Message Schema
 * Stores chat messages from users and AI responses
 */
const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ['user', 'ai'],
            required: [true, 'Role is required'],
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
            maxlength: [10000, 'Content cannot exceed 10000 characters'],
        },
        provider: {
            type: String,
            enum: ['ollama', 'openrouter', 'groq', 'anthropic'],
            default: 'ollama',
        },
        model: {
            type: String,
            default: 'llama3',
        },
        sessionId: {
            type: String,
            default: 'default',
            index: true,
        },
        metadata: {
            responseTime: {
                type: Number,
                min: 0,
            },
            tokenCount: {
                type: Number,
                min: 0,
            },
            error: {
                type: String,
            },
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Compound index for efficient session queries
messageSchema.index({ sessionId: 1, createdAt: -1 });

// Index for sorting by creation time
messageSchema.index({ createdAt: -1 });

/**
 * Static method to get chat history for a session
 * @param {String} sessionId - Session identifier
 * @param {Number} limit - Maximum number of messages to return
 * @returns {Promise<Array>} Array of messages
 */
messageSchema.statics.getChatHistory = async function (sessionId = 'default', limit = 50) {
    try {
        const messages = await this.find({ sessionId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Return in chronological order (oldest first)
        return messages.reverse();
    } catch (error) {
        console.error('[ERROR] Failed to get chat history:', error);
        throw error;
    }
};

/**
 * Static method to clear chat history for a session
 * @param {String} sessionId - Session identifier
 * @returns {Promise<Object>} Deletion result
 */
messageSchema.statics.clearHistory = async function (sessionId = 'default') {
    try {
        const result = await this.deleteMany({ sessionId });
        console.log(`[INFO] Cleared ${result.deletedCount} messages for session: ${sessionId}`);
        return result;
    } catch (error) {
        console.error('[ERROR] Failed to clear chat history:', error);
        throw error;
    }
};

/**
 * Instance method to format message for API response
 * @returns {Object} Formatted message
 */
messageSchema.methods.toResponse = function () {
    return {
        _id: this._id,
        role: this.role,
        content: this.content,
        provider: this.provider,
        model: this.model,
        sessionId: this.sessionId,
        metadata: this.metadata,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
