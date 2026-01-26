const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Strict limit for auth routes (login/register)
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Optional: don't count successful logins (prevents locking out valid users easily)
    message: { error: 'Too many login attempts, please try again later.' }
});

module.exports = { generalLimiter, authLimiter };
