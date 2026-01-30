const mongoose = require('mongoose');

/**
 * Order Schema
 * Manages customer orders from chat widget
 */
const orderSchema = new mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: [true, 'Workspace is required'],
            index: true
        },
        orderNumber: {
            type: String,
            required: true
        },
        customer: {
            name: {
                type: String,
                required: [true, 'Customer name is required'],
                trim: true
            },
            email: {
                type: String,
                trim: true,
                lowercase: true
            },
            phone: {
                type: String,
                required: [true, 'Customer phone is required'],
                trim: true
            },
            sessionId: {
                type: String,
                index: true
            },
            metadata: {
                type: Object,
                default: {}
            }
        },
        items: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            productName: {
                type: String,
                required: true
            },
            productImage: String,
            variant: String,
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity must be at least 1']
            },
            price: {
                type: Number,
                required: true,
                min: [0, 'Price cannot be negative']
            },
            subtotal: {
                type: Number,
                required: true,
                min: [0, 'Subtotal cannot be negative']
            }
        }],
        pricing: {
            subtotal: {
                type: Number,
                required: true,
                min: 0
            },
            discount: {
                type: Number,
                default: 0,
                min: 0
            },
            discountCode: {
                type: String,
                trim: true
            },
            shipping: {
                type: Number,
                default: 0,
                min: 0
            },
            tax: {
                type: Number,
                default: 0,
                min: 0
            },
            total: {
                type: Number,
                required: true,
                min: 0
            },
            currency: {
                type: String,
                default: 'THB',
                enum: ['THB', 'USD', 'EUR', 'GBP']
            }
        },
        status: {
            type: String,
            enum: [
                'pending',      // รอดำเนินการ
                'confirmed',    // ยืนยันแล้ว
                'processing',   // กำลังดำเนินการ
                'shipped',      // จัดส่งแล้ว
                'delivered',    // ส่งถึงแล้ว
                'cancelled',    // ยกเลิก
                'refunded'      // คืนเงิน
            ],
            default: 'pending',
            index: true
        },
        payment: {
            method: {
                type: String,
                enum: ['bank_transfer', 'credit_card', 'qr_code', 'cash_on_delivery'],
                default: 'bank_transfer'
            },
            status: {
                type: String,
                enum: ['pending', 'paid', 'failed', 'refunded'],
                default: 'pending',
                index: true
            },
            paidAt: Date,
            transactionId: String,
            slipImage: String,
            bankAccount: {
                bank: String,
                accountNumber: String,
                accountName: String
            }
        },
        shipping: {
            address: {
                street: String,
                subdistrict: String,
                district: String,
                province: String,
                zipCode: String,
                country: {
                    type: String,
                    default: 'Thailand'
                }
            },
            method: {
                type: String,
                enum: ['standard', 'express', 'pickup'],
                default: 'standard'
            },
            trackingNumber: String,
            carrier: {
                type: String,
                enum: ['Kerry', 'ThaiPost', 'Flash', 'J&T', 'DHL', 'Other']
            },
            shippedAt: Date,
            estimatedDelivery: Date,
            deliveredAt: Date
        },
        conversation: {
            messages: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Message'
            }],
            sessionId: String
        },
        notes: [{
            text: {
                type: String,
                required: true
            },
            createdBy: {
                type: String,
                enum: ['customer', 'admin', 'system'],
                default: 'admin'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        timeline: [{
            status: {
                type: String,
                required: true
            },
            note: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        metadata: {
            source: {
                type: String,
                enum: ['widget', 'dashboard', 'api'],
                default: 'widget'
            },
            userAgent: String,
            ip: String,
            referrer: String
        }
    },
    {
        timestamps: true
    }
);

// Indexes for performance
orderSchema.index({ workspace: 1, status: 1 });
orderSchema.index({ workspace: 1, 'payment.status': 1 });
orderSchema.index({ workspace: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ 'customer.phone': 1 });

/**
 * Generate unique order number
 */
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        // Find last order today
        const lastOrder = await this.constructor.findOne({
            workspace: this.workspace,
            orderNumber: new RegExp(`^ORD${year}${month}${day}`)
        }).sort({ orderNumber: -1 });

        let sequence = 1;
        if (lastOrder) {
            const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
            sequence = lastSequence + 1;
        }

        this.orderNumber = `ORD${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
    }

    // Add to timeline
    if (this.isNew) {
        this.timeline.push({
            status: this.status,
            note: 'Order created'
        });
    } else if (this.isModified('status')) {
        this.timeline.push({
            status: this.status,
            note: `Status changed to ${this.status}`
        });
    }

    next();
});

/**
 * Update order status
 */
orderSchema.methods.updateStatus = async function (newStatus, note = '') {
    this.status = newStatus;
    this.timeline.push({
        status: newStatus,
        note: note || `Status changed to ${newStatus}`
    });
    await this.save();
};

/**
 * Mark as paid
 */
orderSchema.methods.markAsPaid = async function (transactionId = null, slipImage = null) {
    this.payment.status = 'paid';
    this.payment.paidAt = new Date();
    if (transactionId) this.payment.transactionId = transactionId;
    if (slipImage) this.payment.slipImage = slipImage;

    this.timeline.push({
        status: this.status,
        note: 'Payment confirmed'
    });

    await this.save();
};

/**
 * Add tracking number
 */
orderSchema.methods.addTracking = async function (trackingNumber, carrier) {
    this.shipping.trackingNumber = trackingNumber;
    this.shipping.carrier = carrier;
    this.shipping.shippedAt = new Date();
    this.status = 'shipped';

    this.timeline.push({
        status: 'shipped',
        note: `Shipped via ${carrier}, tracking: ${trackingNumber}`
    });

    await this.save();
};

/**
 * Format for API response
 */
orderSchema.methods.toResponse = function () {
    return {
        _id: this._id,
        orderNumber: this.orderNumber,
        customer: this.customer,
        items: this.items,
        pricing: this.pricing,
        status: this.status,
        payment: this.payment,
        shipping: this.shipping,
        notes: this.notes,
        timeline: this.timeline,
        metadata: this.metadata,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

/**
 * Static method to get order statistics
 */
orderSchema.statics.getStats = async function (workspaceId, dateRange = {}) {
    const { startDate, endDate } = dateRange;
    const filter = { workspace: workspaceId };

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const stats = await this.aggregate([
        { $match: filter },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$pricing.total' },
                avgOrderValue: { $avg: '$pricing.total' },
                pendingOrders: {
                    $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                },
                paidOrders: {
                    $sum: { $cond: [{ $eq: ['$payment.status', 'paid'] }, 1, 0] }
                }
            }
        }
    ]);

    return stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        pendingOrders: 0,
        paidOrders: 0
    };
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
