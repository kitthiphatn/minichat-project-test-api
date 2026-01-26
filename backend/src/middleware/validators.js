const { body, validationResult } = require('express-validator');
const xss = require('xss');

// Validation Middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: errors.array().map(err => err.msg)
        });
    }
    next();
};

// Register Validators
const registerValidator = [
    body('email')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\s]*$/).withMessage('Username contains invalid characters'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate
];

// Login Validators
const loginValidator = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

// Chat Message Validators
const messageValidator = [
    body('message')
        .trim()
        .notEmpty().withMessage('Message cannot be empty')
        .isLength({ max: 2000 }).withMessage('Message is too long (max 2000 chars)')
        .customSanitizer(value => xss(value, {
            whiteList: {}, // Filter out all HTML tags
            stripIgnoreTag: true
        })),
    validate
];

module.exports = { registerValidator, loginValidator, messageValidator };
