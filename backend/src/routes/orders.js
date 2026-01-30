const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');

/**
 * Order Management Routes
 */

// Protected routes (require authentication)
router.get('/', protect, orderController.getOrders);
router.get('/stats', protect, orderController.getStats);
router.get('/:id', protect, orderController.getOrder);
router.put('/:id/status', protect, orderController.updateStatus);
router.post('/:id/payment', protect, orderController.updatePayment);
router.post('/:id/shipping', protect, orderController.updateShipping);
router.post('/:id/cancel', protect, orderController.cancelOrder);

// Public/Optional auth (for widget)
router.post('/', orderController.createOrder);

module.exports = router;
