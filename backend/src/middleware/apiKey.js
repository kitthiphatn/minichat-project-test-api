const Workspace = require('../models/Workspace');

/**
 * Middleware to validate API key and attach workspace to request
 */
exports.validateApiKey = async (req, res, next) => {
    try {
        // Get API key from header or query parameter
        const apiKey = req.headers['x-api-key'] || req.query.apiKey || req.body.apiKey;

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                error: 'API key is required'
            });
        }

        // Find workspace by API key
        const workspace = await Workspace.findOne({ apiKey });

        if (!workspace) {
            return res.status(401).json({
                success: false,
                error: 'Invalid API key'
            });
        }

        // Check if workspace is active (not deleted)
        if (workspace.status === 'deleted') {
            return res.status(403).json({
                success: false,
                error: 'Workspace is inactive'
            });
        }

        // Check message limit
        if (workspace.usage.messagesThisMonth >= workspace.usage.messagesLimit) {
            return res.status(429).json({
                success: false,
                error: 'Monthly message limit exceeded. Please upgrade your plan.',
                limit: workspace.usage.messagesLimit,
                used: workspace.usage.messagesThisMonth
            });
        }

        // Attach workspace to request
        req.workspace = workspace;
        next();
    } catch (error) {
        console.error('[API Key Validation Error]:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during authentication'
        });
    }
};

/**
 * Increment message count for workspace
 */
exports.incrementMessageCount = async (req, res, next) => {
    try {
        if (!req.workspace) {
            return next();
        }

        // Check if we need to reset monthly counter
        const now = new Date();
        if (now > req.workspace.usage.resetDate) {
            req.workspace.usage.messagesThisMonth = 0;
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            req.workspace.usage.resetDate = nextMonth;
        }

        // Increment counter
        req.workspace.usage.messagesThisMonth += 1;
        await req.workspace.save();

        next();
    } catch (error) {
        console.error('[Message Count Error]:', error);
        // Don't fail the request, just log the error
        next();
    }
};