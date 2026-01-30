const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');

/**
 * Product Management Routes
 */

// Protected routes (require authentication)
router.post('/', protect, productController.createProduct);
router.get('/', protect, productController.getProducts);
router.get('/categories', protect, productController.getCategories);
router.post('/bulk-upload', protect, productController.bulkUpload);
router.get('/:id', protect, productController.getProduct);
router.put('/:id', protect, productController.updateProduct);
router.delete('/:id', protect, productController.deleteProduct);

// Public routes (for widget)
router.get('/search', productController.searchProducts);

module.exports = router;
