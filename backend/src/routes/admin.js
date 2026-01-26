const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Workspace = require('../models/Workspace');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics
 * @access  Private (Admin only)
 */
router.get('/stats', protect, isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalWorkspaces = await Workspace.countDocuments();
        const activeUsers = await User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        // Get users by plan
        const freeWorkspaces = await Workspace.countDocuments({ plan: 'free' });
        const premiumWorkspaces = await Workspace.countDocuments({ plan: 'premium' });

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalWorkspaces,
                activeUsers,
                plans: {
                    free: freeWorkspaces,
                    premium: premiumWorkspaces
                }
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Private (Admin only)
 */
router.get('/users', protect, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password -resetPasswordToken -resetPasswordExpire')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.json({
            success: true,
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   GET /api/admin/workspaces
 * @desc    Get all workspaces with pagination
 * @access  Private (Admin only)
 */
router.get('/workspaces', protect, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const workspaces = await Workspace.find()
            .populate('owner', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Workspace.countDocuments();

        res.json({
            success: true,
            workspaces,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const ActivityLog = require('../models/ActivityLog');
const SystemSetting = require('../models/SystemSetting');
const logActivity = require('../utils/logger');

// ... (stats, users, workspaces routes remain same) ...

/**
 * @route   GET /api/admin/logs
 * @desc    Get activity logs with pagination
 * @access  Private (Admin only)
 */
router.get('/logs', protect, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const logs = await ActivityLog.find()
            .populate('user', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ActivityLog.countDocuments();

        res.json({
            success: true,
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   GET /api/admin/settings
 * @desc    Get all system settings
 * @access  Private (Admin only)
 */
router.get('/settings', protect, isAdmin, async (req, res) => {
    try {
        const settings = await SystemSetting.find().sort({ key: 1 });
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   PUT /api/admin/settings
 * @desc    Update or create a system setting
 * @access  Private (Admin only)
 */
router.put('/settings', protect, isAdmin, async (req, res) => {
    try {
        const { key, value, description, isPublic } = req.body;

        const setting = await SystemSetting.findOneAndUpdate(
            { key },
            { value, description, isPublic, updatedAt: Date.now() },
            { new: true, upsert: true } // Create if not exists
        );

        await logActivity(req.user.id, 'UPDATE_SYSTEM_SETTING', `Updated setting: ${key}`, req);

        res.json({ success: true, setting });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 */
router.put('/users/:id/role', protect, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await logActivity(req.user.id, 'UPDATE_USER_ROLE', `Updated role for user ${user.email} to ${role}`, req);

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user and their workspace
 * @access  Private (Admin only)
 */
router.delete('/users/:id', protect, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const email = user.email;

        // Delete user's workspace
        await Workspace.deleteMany({ owner: req.params.id });

        // Delete user
        await user.deleteOne();

        await logActivity(req.user.id, 'DELETE_USER', `Deleted user ${email} and their workspace`, req);

        res.json({
            success: true,
            message: 'User and associated workspace deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
