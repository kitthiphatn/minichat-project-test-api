const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const widgetConfigController = require('../controllers/widgetConfigController');

// Protected routes (require authentication)
router.get('/download', protect, widgetConfigController.downloadWidget); // Add this line
router.get('/:workspaceId/config', protect, widgetConfigController.getWidgetConfig);
router.put('/:workspaceId/products', protect, widgetConfigController.updateProducts);
router.post('/:workspaceId/products', protect, widgetConfigController.addProduct);
router.put('/:workspaceId/products/:productId', protect, widgetConfigController.updateProduct);
router.delete('/:workspaceId/products/:productId', protect, widgetConfigController.deleteProduct);
router.put('/:workspaceId/knowledge-base', protect, widgetConfigController.updateKnowledgeBase);
router.put('/:workspaceId/payment', protect, widgetConfigController.updatePaymentSettings);
router.put('/:workspaceId/notifications', protect, widgetConfigController.updateNotificationSettings);

// Public routes (for widget to fetch data)
router.get('/public/products', widgetConfigController.getPublicProducts);
router.get('/public/knowledge-base', widgetConfigController.getPublicKnowledgeBase);

module.exports = router;
