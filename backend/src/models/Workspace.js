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
        productsCount: {
            type: Number,
            default: 0
        },
        productsLimit: {
            type: Number,
            default: 10 // Free plan limit
        },
        ordersThisMonth: {
            type: Number,
            default: 0
        },
        ordersLimit: {
            type: Number,
            default: 20 // Free plan limit
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
            maxlength: 2500
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
    // Product Catalog Configuration
    productCatalog: {
        source: {
            type: String,
            enum: ['manual', 'scrape', 'api'],
            default: 'manual'
        },
        sourceUrl: String,
        apiEndpoint: String,
        products: [{
            id: String,
            name: { type: String, required: true },
            description: String,
            price: { type: Number, required: true },
            compareAtPrice: Number,
            images: [String],
            category: String,
            stock: {
                available: { type: Number, default: 0 },
                trackInventory: { type: Boolean, default: false }
            },
            isActive: { type: Boolean, default: true },
            metadata: Object,
            createdAt: { type: Date, default: Date.now }
        }]
    },
    // Knowledge Base Configuration
    knowledgeBase: {
        faqs: [{
            question: { type: String, required: true },
            answer: { type: String, required: true },
            category: String,
            order: { type: Number, default: 0 },
            isActive: { type: Boolean, default: true }
        }],
        documents: [{
            name: String,
            url: String,
            uploadedAt: { type: Date, default: Date.now },
            fileType: String
        }],
        customInstructions: {
            type: String,
            maxlength: 5000
        }
    },
    // Payment Configuration
    paymentSettings: {
        enabled: { type: Boolean, default: false },
        methods: {
            qrCode: {
                enabled: { type: Boolean, default: false },
                imageUrl: String,
                promptPayId: String
            },
            bankTransfer: {
                enabled: { type: Boolean, default: false },
                bank: String,
                accountNumber: String,
                accountName: String
            }
        }
    },
    // Notification Configuration
    notificationSettings: {
        email: {
            enabled: { type: Boolean, default: true },
            address: String
        },
        lineNotify: {
            enabled: { type: Boolean, default: false },
            token: String
        },
        webhook: {
            enabled: { type: Boolean, default: false },
            url: String,
            secret: String
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
