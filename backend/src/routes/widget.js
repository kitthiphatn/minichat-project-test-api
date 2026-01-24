const express = require('express');
const router = express.Router();
const { validateApiKey } = require('../middleware/apiKey');

// @desc    Get widget configuration
// @route   GET /api/widget/config
// @access  Public (requires API key)
router.get('/config', validateApiKey, async (req, res) => {
    try {
        const workspace = req.workspace;

        res.json({
            success: true,
            config: {
                workspaceName: workspace.name,
                welcomeMessage: workspace.settings.welcomeMessage,
                widgetColor: workspace.settings.widgetColor,
                aiProvider: workspace.settings.aiProvider,
                aiModel: workspace.settings.aiModel,
                plan: workspace.plan,
                usage: {
                    messagesThisMonth: workspace.usage.messagesThisMonth,
                    messagesLimit: workspace.usage.messagesLimit,
                    remaining: workspace.usage.messagesLimit - workspace.usage.messagesThisMonth
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;