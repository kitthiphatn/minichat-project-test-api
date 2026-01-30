const Product = require('../models/Product');
const Workspace = require('../models/Workspace');

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Protected
 */
exports.createProduct = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        // Check plan limit
        const { checkPlanLimit } = require('../utils/planLimits');
        const limitCheck = checkPlanLimit(workspace, 'product');

        if (!limitCheck.allowed) {
            return res.status(403).json({
                success: false,
                message: limitCheck.message,
                current: limitCheck.current,
                limit: limitCheck.limit,
                upgradeRequired: true
            });
        }

        const productData = {
            ...req.body,
            workspace: workspace._id
        };

        const product = await Product.create(productData);

        // Increment product count
        workspace.usage.productsCount += 1;
        await workspace.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: product.toResponse()
        });
    } catch (error) {
        console.error('[ERROR] Create product:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create product'
        });
    }
};

/**
 * @route   GET /api/products
 * @desc    Get all products for workspace
 * @access  Protected
 */
exports.getProducts = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const {
            page = 1,
            limit = 20,
            category,
            tags,
            search,
            minPrice,
            maxPrice,
            inStock,
            isActive
        } = req.query;

        const skip = (page - 1) * limit;
        const filter = { workspace: workspace._id };

        // Apply filters
        if (category) filter.category = category;
        if (tags) filter.tags = { $in: tags.split(',') };
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (inStock === 'true') filter['stock.available'] = { $gt: 0 };

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        if (search) {
            filter.$text = { $search: search };
        }

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .lean(),
            Product.countDocuments(filter)
        ]);

        res.json({
            success: true,
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[ERROR] Get products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get products'
        });
    }
};

/**
 * @route   GET /api/products/:id
 * @desc    Get single product
 * @access  Protected
 */
exports.getProduct = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const product = await Product.findOne({
            _id: req.params.id,
            workspace: workspace._id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Increment view count
        product.stats.views += 1;
        await product.save();

        res.json({
            success: true,
            product: product.toResponse()
        });
    } catch (error) {
        console.error('[ERROR] Get product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get product'
        });
    }
};

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Protected
 */
exports.updateProduct = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, workspace: workspace._id },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: product.toResponse()
        });
    } catch (error) {
        console.error('[ERROR] Update product:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update product'
        });
    }
};

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Protected
 */
exports.deleteProduct = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            workspace: workspace._id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Decrement product count
        workspace.usage.productsCount = Math.max(0, workspace.usage.productsCount - 1);
        await workspace.save();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('[ERROR] Delete product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        });
    }
};

/**
 * @route   GET /api/products/search
 * @desc    Search products (for widget/public use)
 * @access  Public (with workspaceId)
 */
exports.searchProducts = async (req, res) => {
    try {
        const { workspaceId, query, category, tags, limit = 10 } = req.query;

        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: 'Workspace ID is required'
            });
        }

        const products = await Product.searchProducts(workspaceId, query, {
            category,
            tags: tags ? tags.split(',') : undefined,
            limit: parseInt(limit),
            inStock: true
        });

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('[ERROR] Search products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search products'
        });
    }
};

/**
 * @route   GET /api/products/categories
 * @desc    Get all product categories
 * @access  Protected
 */
exports.getCategories = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const categories = await Product.distinct('category', {
            workspace: workspace._id,
            isActive: true
        });

        res.json({
            success: true,
            categories: categories.filter(Boolean)
        });
    } catch (error) {
        console.error('[ERROR] Get categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get categories'
        });
    }
};

/**
 * @route   POST /api/products/bulk-upload
 * @desc    Bulk upload products from CSV
 * @access  Protected
 */
exports.bulkUpload = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const { products } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Products array is required'
            });
        }

        // Add workspace to all products
        const productsWithWorkspace = products.map(p => ({
            ...p,
            workspace: workspace._id
        }));

        const result = await Product.insertMany(productsWithWorkspace, {
            ordered: false // Continue on error
        });

        res.json({
            success: true,
            message: `Successfully uploaded ${result.length} products`,
            count: result.length
        });
    } catch (error) {
        console.error('[ERROR] Bulk upload:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload products'
        });
    }
};
