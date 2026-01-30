const Workspace = require('../models/Workspace');

/**
 * Widget Configuration Controller
 * Manages all widget settings in one place
 */

// Get complete widget configuration
exports.getWidgetConfig = async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        // Check if user owns this workspace
        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        res.json({
            success: true,
            config: {
                aiSettings: workspace.settings,
                productCatalog: workspace.productCatalog,
                knowledgeBase: workspace.knowledgeBase,
                paymentSettings: workspace.paymentSettings,
                notificationSettings: workspace.notificationSettings
            }
        });
    } catch (error) {
        console.error('Get widget config error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update product catalog
exports.updateProducts = async (req, res) => {
    try {
        const { products, source, sourceUrl, apiEndpoint } = req.body;
        const workspace = await Workspace.findById(req.params.workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        // Update product catalog
        workspace.productCatalog = {
            source: source || 'manual',
            sourceUrl: sourceUrl || workspace.productCatalog?.sourceUrl,
            apiEndpoint: apiEndpoint || workspace.productCatalog?.apiEndpoint,
            products: products || workspace.productCatalog?.products || []
        };

        // Update products count for plan limits
        workspace.usage.productsCount = workspace.productCatalog.products.filter(p => p.isActive).length;

        await workspace.save();

        res.json({
            success: true,
            message: 'Product catalog updated successfully',
            productCatalog: workspace.productCatalog
        });
    } catch (error) {
        console.error('Update products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Add single product
exports.addProduct = async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        // Check plan limits
        const activeProducts = workspace.productCatalog?.products?.filter(p => p.isActive).length || 0;
        if (activeProducts >= workspace.usage.productsLimit) {
            return res.status(403).json({
                success: false,
                message: `Product limit reached. Your ${workspace.plan} plan allows ${workspace.usage.productsLimit} products.`,
                upgradeRequired: true,
                current: activeProducts,
                limit: workspace.usage.productsLimit
            });
        }

        const newProduct = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date()
        };

        if (!workspace.productCatalog) {
            workspace.productCatalog = { products: [] };
        }

        workspace.productCatalog.products.push(newProduct);
        workspace.usage.productsCount = workspace.productCatalog.products.filter(p => p.isActive).length;

        await workspace.save();

        res.status(201).json({
            success: true,
            message: 'Product added successfully',
            product: newProduct
        });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update single product
exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const workspace = await Workspace.findById(req.params.workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        const productIndex = workspace.productCatalog?.products?.findIndex(p =>
            (p._id && p._id.toString() === productId) || p.id === productId
        );

        if (productIndex === -1 || productIndex === undefined) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        workspace.productCatalog.products[productIndex] = {
            ...workspace.productCatalog.products[productIndex],
            ...req.body,
            id: productId // Preserve ID
        };

        workspace.usage.productsCount = workspace.productCatalog.products.filter(p => p.isActive).length;

        await workspace.save();

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: workspace.productCatalog.products[productIndex]
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const workspace = await Workspace.findById(req.params.workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        workspace.productCatalog.products = workspace.productCatalog.products.filter(p =>
            (p._id && p._id.toString() !== productId) && p.id !== productId
        );
        workspace.usage.productsCount = workspace.productCatalog.products.filter(p => p.isActive).length;

        await workspace.save();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update knowledge base
exports.updateKnowledgeBase = async (req, res) => {
    try {
        const { faqs, documents, customInstructions } = req.body;
        const workspace = await Workspace.findById(req.params.workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        workspace.knowledgeBase = {
            faqs: faqs || workspace.knowledgeBase?.faqs || [],
            documents: documents || workspace.knowledgeBase?.documents || [],
            customInstructions: customInstructions !== undefined ? customInstructions : workspace.knowledgeBase?.customInstructions
        };

        await workspace.save();

        res.json({
            success: true,
            message: 'Knowledge base updated successfully',
            knowledgeBase: workspace.knowledgeBase
        });
    } catch (error) {
        console.error('Update knowledge base error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update payment settings
exports.updatePaymentSettings = async (req, res) => {
    try {
        const { enabled, methods } = req.body;
        const workspace = await Workspace.findById(req.params.workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        workspace.paymentSettings = {
            enabled: enabled !== undefined ? enabled : workspace.paymentSettings?.enabled || false,
            methods: methods || workspace.paymentSettings?.methods || {}
        };

        await workspace.save();

        res.json({
            success: true,
            message: 'Payment settings updated successfully',
            paymentSettings: workspace.paymentSettings
        });
    } catch (error) {
        console.error('Update payment settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update notification settings
exports.updateNotificationSettings = async (req, res) => {
    try {
        const { email, lineNotify, webhook } = req.body;
        const workspace = await Workspace.findById(req.params.workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        workspace.notificationSettings = {
            email: email || workspace.notificationSettings?.email || {},
            lineNotify: lineNotify || workspace.notificationSettings?.lineNotify || {},
            webhook: webhook || workspace.notificationSettings?.webhook || {}
        };

        await workspace.save();

        res.json({
            success: true,
            message: 'Notification settings updated successfully',
            notificationSettings: workspace.notificationSettings
        });
    } catch (error) {
        console.error('Update notification settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get products for widget (public endpoint)
exports.getPublicProducts = async (req, res) => {
    try {
        const { workspaceId } = req.query;

        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: 'Workspace ID is required'
            });
        }

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        // Return only active products
        const activeProducts = workspace.productCatalog?.products?.filter(p => p.isActive) || [];

        res.json({
            success: true,
            products: activeProducts
        });
    } catch (error) {
        console.error('Get public products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get knowledge base for widget (public endpoint)
// Download configured widget
// Download configured widget
exports.downloadWidget = async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');

        // Find workspace
        let workspace;
        if (req.query.workspaceId) {
            workspace = await Workspace.findById(req.query.workspaceId);
        } else {
            // Fallback: Find first workspace owned by user
            workspace = await Workspace.findOne({ owner: req.user._id });
        }

        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        // Read template
        const widgetPath = path.join(__dirname, '../../public/widget.js');
        let widgetContent = fs.readFileSync(widgetPath, 'utf8');

        // Send raw file (no injection)
        res.setHeader('Content-Disposition', `attachment; filename="minichat-widget.js"`);
        res.setHeader('Content-Type', 'application/javascript');
        res.send(widgetContent);

    } catch (error) {
        console.error('Download widget error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};



exports.getPublicKnowledgeBase = async (req, res) => {
    try {
        const { workspaceId } = req.query;

        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: 'Workspace ID is required'
            });
        }

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        // Return only active FAQs
        const activeFaqs = workspace.knowledgeBase?.faqs?.filter(f => f.isActive) || [];

        res.json({
            success: true,
            faqs: activeFaqs,
            customInstructions: workspace.knowledgeBase?.customInstructions || ''
        });
    } catch (error) {
        console.error('Get public knowledge base error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = exports;
