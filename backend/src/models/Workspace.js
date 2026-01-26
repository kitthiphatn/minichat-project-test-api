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
            default: 'You are a helpful AI assistant.',
            maxlength: 500
        },
        widgetColor: {
            type: String,
            default: '#667eea'
        },
        welcomeMessage: {
            type: String,
            default: 'Hi there! How can I help you today?'
        },
        botName: {
            type: String,
            default: 'Support Agent'
        },
        position: {
            type: String,
            enum: ['left', 'right'],
            default: 'right'
        },
        logo: {
            type: String,
            default: ''
        },
        chatBackground: {
            type: String,
            default: ''
        },
        // General Settings
        businessHours: {
            enabled: { type: Boolean, default: false },
            start: { type: String, default: '09:00' },
            end: { type: String, default: '17:00' },
            days: { type: [Number], default: [1, 2, 3, 4, 5] } // Mon-Fri
        },
        timezone: {
            type: String,
            default: 'Asia/Bangkok'
        },
        currency: {
            type: String,
            default: 'THB'
        },
        // Notification Settings
        emailAlerts: {
            newLead: { type: Boolean, default: true },
            dailySummary: { type: Boolean, default: false }
        },
        soundEnabled: {
            type: Boolean,
            default: true
        },
        // Security Settings
        security: {
            pin: { type: String, default: null }, // Hashed PIN
            pinLength: { type: Number, enum: [4, 6], default: 4 },
            allowedDomains: [{ type: String }],
            dataRetentionDays: { type: Number, default: 90 }, // 30, 60, 90, 365
            requirePinForExport: { type: Boolean, default: true },
            requirePinForDelete: { type: Boolean, default: true }
        },
        // Automation Settings
        inactivityTimeout: {
            type: Number,
            default: 5 // Minutes
        },
        offlineMessage: {
            type: String,
            default: 'We are currently offline. We will get back to you during business hours!'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ plan: 1 });
workspaceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Workspace', workspaceSchema);
