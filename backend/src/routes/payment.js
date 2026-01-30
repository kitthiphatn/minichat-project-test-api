const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const PaymentTransaction = require('../models/PaymentTransaction');
const Workspace = require('../models/Workspace');
const logActivity = require('../utils/logger');

/**
 * @route   POST /api/payment/checkout
 * @desc    Create a mock checkout session
 * @access  Private
 */
router.post('/checkout', protect, async (req, res) => {
    try {
        const { plan, billingPeriod } = req.body;

        if (!['free', 'premium', 'business'].includes(plan)) {
            return res.status(400).json({ success: false, message: 'Invalid plan' });
        }

        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        // Mock Pricing Logic
        let amount = 0;
        if (plan === 'premium') {
            amount = billingPeriod === 'yearly' ? 2990 : 299;
        } else if (plan === 'business') {
            amount = billingPeriod === 'yearly' ? 9990 : 999;
        }

        // Create pending transaction
        const transaction = await PaymentTransaction.create({
            user: req.user.id,
            workspace: workspace._id,
            amount,
            plan,
            billingPeriod,
            provider: 'mock',
            status: 'pending'
        });

        await logActivity(req.user.id, 'INITIATE_CHECKOUT', `Started checkout for ${plan} (${billingPeriod})`);

        // In a real app, we would return a Stripe session URL here
        // For now, we'll return the transaction ID to simulate success purely on frontend for demo
        res.json({
            success: true,
            transactionId: transaction._id,
            checkoutUrl: `/dashboard/billing/success?session_id=${transaction._id}`
        });

    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   POST /api/payment/mock-success
 * @desc    Mock payment success handler (Simulates webhook)
 * @access  Private (For Demo Only)
 */
router.post('/mock-success', protect, async (req, res) => {
    try {
        const { transactionId } = req.body;

        const transaction = await PaymentTransaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        // Update transaction status
        transaction.status = 'completed';
        transaction.providerTransactionId = `mock_tx_${Date.now()}`;
        await transaction.save();

        // Update workspace plan
        const workspace = await Workspace.findById(transaction.workspace);
        workspace.plan = transaction.plan;
        await workspace.save();

        await logActivity(req.user.id, 'PAYMENT_SUCCESS', `Upgraded to ${transaction.plan} plan`);

        res.json({
            success: true,
            message: 'Payment successful, plan updated'
        });

    } catch (error) {
        console.error('Payment success error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
