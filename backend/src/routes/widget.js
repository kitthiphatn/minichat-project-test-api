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
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const workspaceId = workspace._id.toString();
        const frontendHost = 'https://chat.clubfivem.com';
        const position = workspace.settings.position || 'right';

        // Loader Script
        // This script creates an iframe pointing to our Embed Page
        const widgetCode = `
(function() {
    // Configuration
    const workspaceId = "${workspaceId}";
    const host = "${frontendHost}";
    const position = "${position}";
    
    // Prevent duplicate injection
    if (document.getElementById('minichat-iframe-host')) return;

    // Create Iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'minichat-iframe-host';
    iframe.src = host + '/embed/' + workspaceId;
    
    // Initial Styles (Button Mode)
    iframe.style.position = 'fixed';
    iframe.style.bottom = '20px'; /* Spacing */
    iframe.style.border = 'none';
    iframe.style.width = '100px'; 
    iframe.style.height = '100px';
    iframe.style.zIndex = '2147483647';
    iframe.style.background = 'transparent';
    iframe.style.colorScheme = 'none';
    iframe.style.transition = 'width 0.1s ease, height 0.1s ease'; // Fast transition

    // Position
    if (position === 'left') {
        iframe.style.left = '20px';
        iframe.style.right = 'auto';
    } else {
        iframe.style.right = '20px';
        iframe.style.left = 'auto';
    }
    
    document.body.appendChild(iframe);

    // Context Scraper
    function sendContext() {
        try {
            const context = {
                type: 'MINICHAT_CONTEXT',
                url: window.location.href,
                title: document.title,
                content: document.body.innerText.substring(0, 5000).replace(/\s+/g, ' ').trim() // Limit to 5000 chars
            };
            iframe.contentWindow.postMessage(context, '*');
        } catch (e) {
            console.error('[MiniChat] Failed to send context:', e);
        }
    }

    // Send context after a short delay to ensure iframe is ready
    setTimeout(sendContext, 1000);
    setTimeout(sendContext, 3000); // Retry just in case

    // Message Listener for Resizing
    window.addEventListener('message', function(event) {
        // Security check - allow messages only from our host
        // Note: event.origin might lack slash, so strict check
        if (event.origin !== host) return;
        
        const data = event.data;
        if (data.type === 'MINICHAT_RESIZE') {
            const isMobile = window.innerWidth < 480;

            if (data.isOpen) {
                // OPEN STATE
                if (isMobile) {
                    // Mobile Fullscreen
                    iframe.style.width = '100%';
                    iframe.style.height = '100dvh'; // Use dvh
                    iframe.style.bottom = '0';
                    iframe.style.right = '0';
                    iframe.style.left = '0';
                    iframe.style.borderRadius = '0';
                } else {
                    // Desktop Window
                    iframe.style.width = '380px';
                    iframe.style.height = '700px'; /* Height enough for window + spacing */
                    iframe.style.maxHeight = 'calc(100vh - 40px)';
                    iframe.style.bottom = '20px';
                    // Restore position
                    if (position === 'left') {
                        iframe.style.left = '20px';
                        iframe.style.right = 'auto';
                    } else {
                        iframe.style.right = '20px';
                        iframe.style.left = 'auto';
                    }
                }
            } else {
                // CLOSED STATE (Button only)
                iframe.style.width = '100px'; 
                iframe.style.height = '100px';
                iframe.style.bottom = '20px';
                if (position === 'left') {
                    iframe.style.left = '20px';
                    iframe.style.right = 'auto';
                } else {
                    iframe.style.right = '20px';
                    iframe.style.left = 'auto';
                }
            }
        }
    });

    console.log('[MiniChat] Widget loaded via Hosted Iframe 🚀');
})();
        `;

        const filename = `minichat-widget-${workspace._id}.js`;
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', Buffer.byteLength(widgetCode));
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

/**
 * @route   GET /api/widget/config/:workspaceId
 * @desc    Get public widget configuration (for hosted iframe/embed)
 * @access  Public
 */
router.get('/config/:workspaceId', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        // Helper function to convert image to base64 (Duplicated from download - logic should ideally be shared)
        const getImageBase64 = (imagePath) => {
            try {
                let localPath = imagePath;
                const baseUrl = 'https://api.clubfivem.com';
                if (localPath && localPath.includes(baseUrl)) {
                    localPath = localPath.replace(baseUrl, '');
                }

                if (localPath && localPath.startsWith('/uploads/')) {
                    const fullPath = path.join(__dirname, '../..', localPath);
                    if (fs.existsSync(fullPath)) {
                        const fileBuffer = fs.readFileSync(fullPath);
                        const ext = path.extname(fullPath).substring(1);
                        const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
                        return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
                    }
                }
                return imagePath;
            } catch (err) {
                console.error('[WidgetConfig] Error converting image:', err);
                if (imagePath && imagePath.startsWith('/')) {
                    return 'https://api.clubfivem.com' + imagePath;
                }
                return imagePath;
            }
        };

        const config = {
            botName: workspace.settings.botName || 'Support Agent',
            welcomeMessage: workspace.settings.welcomeMessage || 'Hi there! How can I help you?',
            widgetColor: workspace.settings.widgetColor || '#667eea',
            position: workspace.settings.position || 'right',
            logo: (() => {
                const processedLogo = getImageBase64(workspace.settings.logo);
                if (processedLogo && processedLogo.startsWith('/uploads/')) {
                    return 'https://api.clubfivem.com' + processedLogo;
                }
                return processedLogo || '';
            })(),
            workspaceId: workspace._id,
        };

        res.json({ success: true, config });

    } catch (error) {
        console.error('Error getting widget config:', error);
        res.status(500).json({ success: false, message: 'Failed to get config' });
    }
});

/**
 * @route   GET /api/widget/init
 * @desc    Initialize widget by API Key (Public)
 * @access  Public
 */
router.get('/init', async (req, res) => {
    try {
        const { apiKey } = req.query;

        if (!apiKey) {
            return res.status(400).json({ success: false, message: 'API Key is required' });
        }

        const workspace = await Workspace.findOne({ apiKey });

        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Invalid API Key' });
        }

        // Helper to get Base64 (Reuse logic or keep simple)
        // For simplicity, we just return the URL or simple string for now, or re-implement Base64 logic if needed.
        // Let's assume we return standard URLs for now to keep it lightweight, or reuse logic.
        const getImageBase64 = (imagePath) => {
            // ... Simple path fix ...
            if (imagePath && imagePath.startsWith('/uploads/')) {
                return 'https://api.clubfivem.com' + imagePath;
            }
            return imagePath || '';
        };

        const config = {
            botName: workspace.settings.botName || 'Support Agent',
            welcomeMessage: workspace.settings.welcomeMessage || 'Hi there! How can I help you?',
            widgetColor: workspace.settings.widgetColor || '#667eea',
            position: workspace.settings.position || 'right',
            logo: getImageBase64(workspace.settings.logo),
            workspaceId: workspace._id
        };

        res.json({ success: true, config });

    } catch (error) {
        console.error('Widget Init Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;