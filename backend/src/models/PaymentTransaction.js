const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'thb'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    provider: {
        type: String,
        enum: ['stripe', 'promptpay', 'mock'],
        required: true
    },
    providerTransactionId: {
        type: String
    },
    plan: {
        type: String,
        enum: ['free', 'premium'],
        required: true
    },
    billingPeriod: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
