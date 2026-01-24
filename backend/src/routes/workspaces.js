const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Workspace = require('../models/Workspace');
const crypto = require('crypto');

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
            workspace.settings = { ...workspace.settings, ...settings };
        }

        await workspace.save();

        res.json({ success: true, workspace });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
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