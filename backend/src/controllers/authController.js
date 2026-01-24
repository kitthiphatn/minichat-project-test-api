const User = require('../models/User');
const Workspace = require('../models/Workspace');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod', {
        expiresIn: '30d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }

        // Validate Username and Password (English characters, numbers, and symbols only)
        const englishRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\s]*$/;
        if (!englishRegex.test(username) || !englishRegex.test(password)) {
            return res.status(400).json({
                success: false,
                error: 'Username and Password must contain only English characters, numbers, and symbols.'
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password
        });

        // Create default workspace for user
        const workspace = await Workspace.create({
            name: `${username}'s Workspace`,
            owner: user._id,
            plan: 'free'
        });

        res.status(201).json({
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            workspace: {
                id: workspace._id,
                name: workspace.name,
                apiKey: workspace.apiKey
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Get user's workspace
        const workspace = await Workspace.findOne({ owner: user._id });

        res.status(200).json({
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            workspace: workspace ? {
                id: workspace._id,
                name: workspace.name,
                apiKey: workspace.apiKey
            } : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const workspace = await Workspace.findOne({ owner: user._id });

        res.status(200).json({
            success: true,
            data: user,
            workspace
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
