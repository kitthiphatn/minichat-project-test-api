const mongoose = require('mongoose');
const crypto = require('crypto');

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    apiKey: {
        type: String,
        unique: true,
        default: function () {
            return 'mc_' + crypto.randomBytes(16).toString('hex');
        }
    },
    plan: {
        type: String,
        enum: ['free', 'starter', 'pro', 'business'],
        default: 'free'
    },
    usage: {
        messagesThisMonth: {
            type: Number,
            default: 0
        },
        messagesLimit: {
            type: Number,
            default: 250 // Free plan limit
        },
        resetDate: {
            type: Date,
            default: function () {
                const nextMonth = new Date();
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                return nextMonth;
            }
        }
    },
    settings: {
        aiProvider: {
            type: String,
            default: 'groq'
        },
        aiModel: {
            type: String,
            default: 'llama-3.3-70b-versatile'
        },
        systemPrompt: {
            type: String,
            default: 'You are a helpful AI assistant.'
        },
        widgetColor: {
            type: String,
            default: '#667eea'
        },
        welcomeMessage: {
            type: String,
            default: 'Hi there! How can I help you today?'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Workspace', workspaceSchema);
