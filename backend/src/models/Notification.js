const mongoose = require('mongoose');

/**
 * Notification Schema
 * Manages system notifications and alerts
 */
const notificationSchema = new mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: [true, 'Workspace is required'],
            index: true
        },
        type: {
            type: String,
            enum: [
                'new_order',
                'order_paid',
                'order_shipped',
                'low_stock',
                'new_lead',
                'new_message',
                'system'
            ],
            required: true,
            index: true
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            maxlength: 100
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            maxlength: 500
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
            index: true
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        },
        readAt: {
            type: Date
        },
        relatedTo: {
            model: {
                type: String,
                enum: ['Order', 'Product', 'Lead', 'Message']
            },
            id: {
                type: mongoose.Schema.Types.ObjectId
            }
        },
        recipients: [{
            type: {
                type: String,
                enum: ['admin', 'email', 'webhook'],
                default: 'admin'
            },
            value: String
        }],
        metadata: {
            type: Object,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

// Indexes
notificationSchema.index({ workspace: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ workspace: 1, type: 1 });
notificationSchema.index({ workspace: 1, priority: 1 });

/**
 * Mark as read
 */
notificationSchema.methods.markAsRead = async function () {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
};

/**
 * Format for API response
 */
notificationSchema.methods.toResponse = function () {
    return {
        _id: this._id,
        type: this.type,
        title: this.title,
        message: this.message,
        priority: this.priority,
        isRead: this.isRead,
        readAt: this.readAt,
        relatedTo: this.relatedTo,
        createdAt: this.createdAt
    };
};

/**
 * Static method to get unread count
 */
notificationSchema.statics.getUnreadCount = async function (workspaceId) {
    return await this.countDocuments({
        workspace: workspaceId,
        isRead: false
    });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
