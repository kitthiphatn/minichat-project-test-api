const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Workspace = require('../models/Workspace');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// @desc    Get all workspaces for current user
// @route   GET /api/workspaces
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const workspaces = await Workspace.find({ owner: req.user.id });
        res.json({ success: true, workspaces });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Get single workspace
// @route   GET /api/workspaces/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        res.json({ success: true, workspace });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Create new workspace
// @route   POST /api/workspaces
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, error: 'Workspace name is required' });
        }

        const workspace = await Workspace.create({
            name: name.trim(),
            owner: req.user.id,
            plan: 'free'
        });

        res.status(201).json({ success: true, workspace });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        // Update allowed fields
        const { name, settings } = req.body;

        if (name) workspace.name = name;

        if (settings) {
            // Safe merge for settings
            Object.keys(settings).forEach(key => {
                if (key === 'security' && typeof settings[key] === 'object') {
                    // Deep merge for security object
                    if (!workspace.settings.security) workspace.settings.security = {};

                    Object.keys(settings.security).forEach(secKey => {
                        // Don't authenticate/update PIN here, use dedicated endpoint
                        if (secKey !== 'pin') {
                            workspace.settings.security[secKey] = settings.security[secKey];
                        }
                    });
                } else {
                    workspace.settings[key] = settings[key];
                }
            });
            workspace.markModified('settings');
        }

        await workspace.save();

        res.json({ success: true, workspace });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Set or Update Security PIN
// @route   POST /api/workspaces/:id/pin
// @access  Private
router.post('/:id/pin', protect, async (req, res) => {
    try {
        const { pin, oldPin } = req.body;
        const workspace = await Workspace.findOne({ _id: req.params.id, owner: req.user.id });

        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

        // If setting PIN for the first time or changing it
        if (workspace.settings.security?.pin && !oldPin) {
            return res.status(400).json({ error: 'Current PIN required to set a new one' });
        }

        // Verify old PIN if exists
        if (workspace.settings.security?.pin) {
            const isMatch = await bcrypt.compare(oldPin, workspace.settings.security.pin);
            if (!isMatch) return res.status(401).json({ error: 'Invalid current PIN' });
        }

        // Hash new PIN
        const salt = await bcrypt.genSalt(10);
        const hashedPin = await bcrypt.hash(pin, salt);

        // Update PIN
        if (!workspace.settings.security) workspace.settings.security = {};
        workspace.settings.security.pin = hashedPin;
        // Default settings if missing
        if (!workspace.settings.security.pinLength) workspace.settings.security.pinLength = pin.length;

        workspace.markModified('settings');
        await workspace.save();

        res.json({ success: true, message: 'Security PIN updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @desc    Verify Security PIN
// @route   POST /api/workspaces/:id/pin/verify
// @access  Private
router.post('/:id/pin/verify', protect, async (req, res) => {
    try {
        const { pin } = req.body;
        const workspace = await Workspace.findOne({ _id: req.params.id, owner: req.user.id });

        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

        // Check if PIN is set
        if (!workspace.settings.security?.pin) {
            return res.json({ success: true, valid: true, message: 'No PIN set' });
        }

        const isMatch = await bcrypt.compare(pin, workspace.settings.security.pin);
        if (!isMatch) return res.status(401).json({ success: false, valid: false, error: 'Invalid PIN' });

        res.json({ success: true, valid: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @desc    Regenerate API key
// @route   POST /api/workspaces/:id/regenerate-key
// @access  Private
router.post('/:id/regenerate-key', protect, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        // Generate new API key
        workspace.apiKey = 'mc_' + crypto.randomBytes(16).toString('hex');
        await workspace.save();

        res.json({ success: true, apiKey: workspace.apiKey });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Export chat history
// @route   GET /api/workspaces/:id/export
// @access  Private
router.get('/:id/export', protect, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        const Message = require('../models/Message'); // Ensure correct path
        // For demo: Export all messages. In production: Filter by workspace association.
        const messages = await Message.find().sort({ createdAt: -1 }).limit(1000).lean();

        if (!messages || messages.length === 0) {
            // Return empty CSV with headers if no messages
            return res.status(200).send('createdAt,role,content,provider,model,sessionId\n');
        }

        // Convert to CSV
        const fields = ['createdAt', 'role', 'content', 'provider', 'model', 'sessionId'];
        const csvContent = [
            fields.join(','),
            ...messages.map(msg => {
                return fields.map(field => {
                    let val = msg[field] || '';
                    if (field === 'createdAt') val = new Date(val).toISOString();
                    // Escape quotes and wrap in quotes
                    val = String(val).replace(/"/g, '""');
                    return `"${val}"`;
                }).join(',');
            })
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="chat-history-${workspace.name}-${Date.now()}.csv"`);
        res.status(200).send(csvContent);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Export workspace configuration (JSON Snapshot)
// @route   GET /api/workspaces/:id/export-config
// @access  Private
router.get('/:id/export-config', protect, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        // Create clean snapshot
        const snapshot = {
            version: '1.0',
            exportedAt: new Date(),
            name: workspace.name,
            settings: JSON.parse(JSON.stringify(workspace.settings))
        };

        // SANITIZATION: Remove secrets
        if (snapshot.settings.security) {
            delete snapshot.settings.security.pin; // NEVER export PIN hash
        }
        // Remove potentially sensitive or unrelated internal fields if any

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="config-${workspace.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json"`);
        res.send(JSON.stringify(snapshot, null, 2));

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Import workspace configuration
// @route   POST /api/workspaces/:id/import-config
// @access  Private
router.post('/:id/import-config', protect, async (req, res) => {
    try {
        const { config } = req.body; // Expect JSON object

        if (!config || !config.settings) {
            return res.status(400).json({ success: false, error: 'Invalid configuration file' });
        }

        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        // Import Name (Optional)
        // if (config.name) workspace.name = config.name; 

        // Import Settings with Deep Merge Strategy
        // We iterate over the IMPORTED settings and apply them to the workspace
        // This allows Partial Imports if needed, but usually it's a full restore

        const settingsToImport = config.settings;

        Object.keys(settingsToImport).forEach(key => {
            // SECURITY: Skip imported security PINs to prevent overwriting with unknown/malicious PINs
            if (key === 'security') {
                if (!workspace.settings.security) workspace.settings.security = {};

                // Merge security settings but EXCLUDE PIN
                if (settingsToImport.security) {
                    Object.keys(settingsToImport.security).forEach(secKey => {
                        if (secKey !== 'pin') {
                            workspace.settings.security[secKey] = settingsToImport.security[secKey];
                        }
                    });
                }
            } else {
                // Standard fields (businessHours, notifications, customization)
                workspace.settings[key] = settingsToImport[key];
            }
        });

        workspace.markModified('settings');
        await workspace.save();

        res.json({ success: true, message: 'Configuration imported successfully', workspace });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        // Check if user has other workspaces
        const workspaceCount = await Workspace.countDocuments({ owner: req.user.id });
        if (workspaceCount <= 1) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete your only workspace'
            });
        }

        await workspace.deleteOne();

        res.json({ success: true, message: 'Workspace deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;