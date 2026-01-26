const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { protect } = require('../middleware/auth');
const Workspace = require('../models/Workspace');

/**
 * @route   GET /api/widget/download
 * @desc    Generate and download customized widget JavaScript file
 * @access  Private
 */
router.get('/download', protect, async (req, res) => {
    try {
        // Get workspace
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        // Read widget template
        const templatePath = path.join(__dirname, '../../../frontend/public/widget-template.js');
        let widgetCode = fs.readFileSync(templatePath, 'utf8');

        // Determine API URL based on environment
        const apiUrl = process.env.NODE_ENV === 'production'
            ? 'https://api.clubfivem.com/api'
            : 'http://localhost:5000/api';

        // Prepare configuration values
        const config = {
            apiKey: workspace.apiKey,
            apiUrl: apiUrl,
            botName: workspace.settings.botName || 'Support Agent',
            welcomeMessage: workspace.settings.welcomeMessage || 'Hi there! How can I help you?',
            widgetColor: workspace.settings.widgetColor || '#667eea',
            position: workspace.settings.position || 'right',
            logo: workspace.settings.logo || '',
            workspaceId: workspace._id.toString()
        };

        // Replace placeholders with actual values
        widgetCode = widgetCode.replace(/__API_KEY__/g, config.apiKey);
        widgetCode = widgetCode.replace(/__API_URL__/g, config.apiUrl);
        widgetCode = widgetCode.replace(/__BOT_NAME__/g, config.botName.replace(/'/g, "\\'"));
        widgetCode = widgetCode.replace(/__WELCOME_MESSAGE__/g, config.welcomeMessage.replace(/'/g, "\\'"));
        widgetCode = widgetCode.replace(/__WIDGET_COLOR__/g, config.widgetColor);
        widgetCode = widgetCode.replace(/__POSITION__/g, config.position);
        widgetCode = widgetCode.replace(/__LOGO_URL__/g, config.logo);
        widgetCode = widgetCode.replace(/__WORKSPACE_ID__/g, config.workspaceId);

        // Set response headers for file download
        const filename = `minichat-widget-${workspace._id}.js`;
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', Buffer.byteLength(widgetCode));

        // Send the generated widget code
        res.send(widgetCode);

    } catch (error) {
        console.error('Error generating widget:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate widget',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/widget/info
 * @desc    Get widget information (file size, last updated)
 * @access  Private
 */
router.get('/info', protect, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        // Read template to calculate approximate file size
        const templatePath = path.join(__dirname, '../../../frontend/public/widget-template.js');
        const templateStats = fs.statSync(templatePath);

        res.json({
            success: true,
            info: {
                filename: `minichat-widget-${workspace._id}.js`,
                approximateSize: Math.round(templateStats.size / 1024), // KB
                lastUpdated: workspace.updatedAt,
                workspaceId: workspace._id
            }
        });

    } catch (error) {
        console.error('Error getting widget info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get widget info'
        });
    }
});

module.exports = router;