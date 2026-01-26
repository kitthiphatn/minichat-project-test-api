const User = require('../models/User');
const Workspace = require('../models/Workspace');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Generate ID (6 digits)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP and save to database
        const salt = await bcrypt.genSalt(10);
        user.resetPasswordToken = await bcrypt.hash(otp, salt);
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // Send Email logic
        let emailSent = false;

        // Try to send via SendGrid if API key exists
        if (process.env.SENDGRID_API_KEY) {
            try {
                const sgMail = require('@sendgrid/mail');
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);

                const msg = {
                    to: email,
                    from: {
                        name: 'MiniChat',
                        email: process.env.SENDGRID_FROM_EMAIL || 'ktthiphat.n@gmail.com'
                    },
                    subject: 'Reset Your Password - MiniChat',
                    text: `Your password reset code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
                            </div>
                            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">Hello,</p>
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">You requested to reset your password. Use the code below:</p>
                                <div style="background-color: #f5f5f5; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; text-align: center;">
                                    <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
                                    <h2 style="margin: 10px 0 0 0; color: #667eea; font-size: 36px; letter-spacing: 8px; font-weight: bold;">${otp}</h2>
                                </div>
                                <p style="font-size: 14px; color: #666; line-height: 1.6;">⏱️ This code will expire in <strong>10 minutes</strong>.</p>
                                <p style="font-size: 14px; color: #666; line-height: 1.6;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} MiniChat. All rights reserved.</p>
                            </div>
                        </div>
                    `
                };

                await sgMail.send(msg);
                emailSent = true;
                console.log(`✅ OTP email sent to ${email} via SendGrid`);
            } catch (err) {
                console.error("SendGrid failed:", err.message);
                // Fallback to mock logic below...
            }
        }

        // Fallback or Dev Mode: Log to console
        if (!emailSent) {
            console.log(`\n========================================`);
            console.log(`🔑 [MOCK EMAIL] OTP for ${email}`);
            console.log(`🔢 Code: ${otp}`);
            console.log(`========================================\n`);
        }

        res.status(200).json({ success: true, data: 'Email sent' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired token' });
        }

        // Check OTP
        const isMatch = await bcrypt.compare(otp, user.resetPasswordToken);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Invalid code' });
        }

        res.status(200).json({ success: true, data: 'OTP Verified' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid request' });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, data: 'Password updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
