const Order = require('../models/Order');
const Product = require('../models/Product');
const Workspace = require('../models/Workspace');
const Notification = require('../models/Notification');

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Protected or Public (with workspaceId)
 */
exports.createOrder = async (req, res) => {
    try {
        const { workspaceId, customer, items, pricing, shipping, payment } = req.body;

        // Validate workspace
        const workspace = workspaceId
            ? await Workspace.findById(workspaceId)
            : await Workspace.findOne({ owner: req.user?.id });

        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        // Check plan limit for orders
        const { checkPlanLimit } = require('../utils/planLimits');
        const limitCheck = checkPlanLimit(workspace, 'order');

        if (!limitCheck.allowed) {
            return res.status(403).json({
                success: false,
                message: limitCheck.message,
                current: limitCheck.current,
                limit: limitCheck.limit,
                upgradeRequired: true
            });
        }

        // Validate and process items
        const processedItems = [];
        let calculatedSubtotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.product} not found`
                });
            }

            // Check stock
            if (!product.isInStock(item.quantity, item.variant)) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            const itemPrice = item.variant
                ? product.variants.find(v => v.name === item.variant)?.price || product.price
                : product.price;

            const subtotal = itemPrice * item.quantity;
            calculatedSubtotal += subtotal;

            processedItems.push({
                product: product._id,
                productName: product.name,
                productImage: product.images[0] || '',
                variant: item.variant,
                quantity: item.quantity,
                price: itemPrice,
                subtotal
            });

            // Decrease stock
            await product.decreaseStock(item.quantity, item.variant);

            // Update product stats
            product.stats.sales += item.quantity;
            product.stats.revenue += subtotal;
            await product.save();
        }

        // Create order
        const order = await Order.create({
            workspace: workspace._id,
            customer,
            items: processedItems,
            pricing: {
                subtotal: calculatedSubtotal,
                discount: pricing?.discount || 0,
                discountCode: pricing?.discountCode,
                shipping: pricing?.shipping || 0,
                tax: pricing?.tax || 0,
                total: calculatedSubtotal + (pricing?.shipping || 0) + (pricing?.tax || 0) - (pricing?.discount || 0),
                currency: pricing?.currency || 'THB'
            },
            shipping: shipping || {},
            payment: payment || {},
            conversation: {
                sessionId: customer.sessionId
            },
            metadata: {
                source: req.user ? 'dashboard' : 'widget',
                userAgent: req.headers['user-agent'],
                ip: req.ip
            }
        });

        // Increment order count
        workspace.usage.ordersThisMonth += 1;
        await workspace.save();

        // Create notification
        await Notification.create({
            workspace: workspace._id,
            type: 'new_order',
            title: 'มีออเดอร์ใหม่',
            message: `ออเดอร์ #${order.orderNumber} จากคุณ ${customer.name}`,
            priority: 'high',
            relatedTo: {
                model: 'Order',
                id: order._id
            }
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: order.toResponse()
        });
    } catch (error) {
        console.error('[ERROR] Create order:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create order'
        });
    }
};

/**
 * @route   GET /api/orders
 * @desc    Get all orders for workspace
 * @access  Protected
 */
exports.getOrders = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const {
            page = 1,
            limit = 20,
            status,
            paymentStatus,
            startDate,
            endDate
        } = req.query;

        const skip = (page - 1) * limit;
        const filter = { workspace: workspace._id };

        if (status) filter.status = status;
        if (paymentStatus) filter['payment.status'] = paymentStatus;

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .populate('items.product', 'name images')
                .lean(),
            Order.countDocuments(filter)
        ]);

        res.json({
            success: true,
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[ERROR] Get orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get orders'
        });
    }
};

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order
 * @access  Protected
 */
exports.getOrder = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            workspace: workspace._id
        }).populate('items.product', 'name images');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order: order.toResponse()
        });
    } catch (error) {
        console.error('[ERROR] Get order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get order'
        });
    }
};

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Protected
 */
exports.updateStatus = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const { status, note } = req.body;

        const order = await Order.findOne({
            _id: req.params.id,
            workspace: workspace._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await order.updateStatus(status, note);

        res.json({
            success: true,
            message: 'Order status updated',
            order: order.toResponse()
        });
    } catch (error) {
        console.error('[ERROR] Update order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
};

/**
 * @route   POST /api/orders/:id/payment
 * @desc    Update payment information
 * @access  Protected
 */
exports.updatePayment = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const { transactionId, slipImage } = req.body;

        const order = await Order.findOne({
            _id: req.params.id,
            workspace: workspace._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await order.markAsPaid(transactionId, slipImage);

        res.json({
            success: true,
            message: 'Payment confirmed',
            order: order.toResponse()
        });
    } catch (error) {
        console.error('[ERROR] Update payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment'
        });
    }
};

/**
 * @route   POST /api/orders/:id/shipping
 * @desc    Update shipping information
 * @access  Protected
 */
exports.updateShipping = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const { trackingNumber, carrier } = req.body;

        const order = await Order.findOne({
            _id: req.params.id,
            workspace: workspace._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await order.addTracking(trackingNumber, carrier);

        res.json({
            success: true,
            message: 'Shipping information updated',
            order: order.toResponse()
        });
    } catch (error) {
        console.error('[ERROR] Update shipping:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update shipping'
        });
    }
};

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Protected
 */
exports.cancelOrder = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const { reason } = req.body;

        const order = await Order.findOne({
            _id: req.params.id,
            workspace: workspace._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel this order'
            });
        }

        // Restore stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                if (item.variant) {
                    const variant = product.variants.find(v => v.name === item.variant);
                    if (variant) variant.stock += item.quantity;
                } else {
                    product.stock.available += item.quantity;
                }
                await product.save();
            }
        }

        await order.updateStatus('cancelled', reason || 'Order cancelled');

        res.json({
            success: true,
            message: 'Order cancelled',
            order: order.toResponse()
        });
    } catch (error) {
        console.error('[ERROR] Cancel order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order'
        });
    }
};

/**
 * @route   GET /api/orders/stats
 * @desc    Get order statistics
 * @access  Protected
 */
exports.getStats = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const { startDate, endDate } = req.query;

        const stats = await Order.getStats(workspace._id, { startDate, endDate });

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('[ERROR] Get order stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics'
        });
    }
};
