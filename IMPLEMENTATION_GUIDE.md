# 🛠️ Implementation Guide - Top 20 Critical Improvements

> คู่มือการทำงานละเอียดสำหรับ 20 improvements ที่สำคัญที่สุด

---

## 1. จำกัด CORS Origins (High Priority)

**Current Issue:** อนุญาต all origins (`origin: true`) - เสี่ยงต่อ CSRF attacks

**File:** [backend/src/server.js:14-17](backend/src/server.js#L14-L17)

**Implementation:**
```javascript
// backend/src/server.js
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy violation'), false);
        }
        return callback(null, true);
    },
    credentials: true,
}));
```

**Environment Variable:**
```bash
# .env
ALLOWED_ORIGINS=https://chat.clubfivem.com,https://www.clubfivem.com,http://localhost:3000
```

**Testing:**
```bash
# Test allowed origin
curl -H "Origin: https://chat.clubfivem.com" http://localhost:5001/health

# Test blocked origin
curl -H "Origin: https://malicious-site.com" http://localhost:5001/health
# Should return CORS error
```

---

## 2. Rate Limiting (Critical Security)

**Why:** ป้องกัน brute force, DDoS, API abuse

**Installation:**
```bash
cd backend
npm install express-rate-limit
```

**Implementation:**

### Global Rate Limiter
```javascript
// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// General API rate limiter - 100 requests per 15 minutes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60 // seconds
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,
});

// Strict limiter for authentication - 5 requests per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Too many login attempts, please try again after 15 minutes.',
        retryAfter: 15 * 60
    },
    skipSuccessfulRequests: true, // Don't count successful logins
});

// Registration limiter - 3 per hour per IP
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        error: 'Too many accounts created from this IP, please try again after an hour.',
    },
});

module.exports = {
    generalLimiter,
    authLimiter,
    registerLimiter,
};
```

### Apply to Routes
```javascript
// backend/src/server.js
const { generalLimiter } = require('./middleware/rateLimiter');

// Apply to all API routes
app.use('/api/', generalLimiter);
```

```javascript
// backend/src/routes/auth.js
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, login);
router.post('/register', registerLimiter, register);
router.post('/forgot-password', authLimiter, forgotPassword);
```

---

## 3. Helmet.js Security Headers

**Installation:**
```bash
npm install helmet
```

**Implementation:**
```javascript
// backend/src/server.js
const helmet = require('helmet');

// Add after express initialization
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.groq.com", "https://api.anthropic.com"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    frameguard: {
        action: 'deny', // Prevent clickjacking
    },
    noSniff: true, // Prevent MIME type sniffing
    xssFilter: true, // Enable XSS filter
}));
```

---

## 4. Input Sanitization

**Installation:**
```bash
npm install express-validator xss validator
```

**Implementation:**

### Validation Middleware
```javascript
// backend/src/middleware/validators.js
const { body, validationResult } = require('express-validator');
const xss = require('xss');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

const registerValidator = [
    body('email')
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail()
        .customSanitizer(value => xss(value)),

    body('username')
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscore and dash')
        .customSanitizer(value => xss(value)),

    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number and special character'),

    validate
];

const messageValidator = [
    body('message')
        .trim()
        .notEmpty().withMessage('Message cannot be empty')
        .isLength({ max: 500 }).withMessage('Message too long')
        .customSanitizer(value => xss(value, {
            whiteList: {}, // No HTML allowed
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script', 'style']
        })),

    body('provider')
        .isIn(['ollama', 'groq', 'openrouter', 'anthropic'])
        .withMessage('Invalid provider'),

    validate
];

module.exports = {
    registerValidator,
    messageValidator,
};
```

### Apply to Routes
```javascript
// backend/src/routes/auth.js
const { registerValidator } = require('../middleware/validators');

router.post('/register', registerValidator, register);
```

```javascript
// backend/src/routes/chat.js
const { messageValidator } = require('../middleware/validators');

router.post('/message', optionalApiKey, incrementMessageCount, messageValidator, sendMessage);
```

---

## 5. Database Indexes

**Why:** เพิ่มประสิทธิภาพ query ได้ 10-100 เท่า

**Implementation:**

```javascript
// backend/src/models/User.js
const userSchema = new mongoose.Schema({
    // ... existing fields
});

// Indexes
userSchema.index({ email: 1 }); // Unique already indexed
userSchema.index({ username: 1 }); // Unique already indexed
userSchema.index({ createdAt: -1 }); // For admin user listing
userSchema.index({ role: 1 }); // For role-based queries
userSchema.index({ 'resetPasswordExpire': 1 }, {
    sparse: true,
    expireAfterSeconds: 0 // Auto-delete expired tokens
});
```

```javascript
// backend/src/models/Workspace.js
const workspaceSchema = new mongoose.Schema({
    // ... existing fields
});

// Indexes
workspaceSchema.index({ owner: 1 }); // Query by owner
workspaceSchema.index({ apiKey: 1 }); // Unique already indexed
workspaceSchema.index({ plan: 1 }); // Query by plan
workspaceSchema.index({ 'usage.resetDate': 1 }); // For monthly reset cron
workspaceSchema.index({ createdAt: -1 }); // For admin listing
```

```javascript
// backend/src/models/Message.js
const messageSchema = new mongoose.Schema({
    // ... existing fields
});

// Compound index for efficient chat history queries
messageSchema.index({ sessionId: 1, createdAt: -1 });

// For analytics
messageSchema.index({ provider: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 }); // Time-based queries

// TTL index for auto-delete old messages (optional)
messageSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 90 * 24 * 60 * 60, // 90 days
    sparse: true
});
```

**Verify Indexes:**
```javascript
// backend/scripts/verify-indexes.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');
const Workspace = require('../src/models/Workspace');
const Message = require('../src/models/Message');

async function verifyIndexes() {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('User indexes:', await User.collection.getIndexes());
    console.log('Workspace indexes:', await Workspace.collection.getIndexes());
    console.log('Message indexes:', await Message.collection.getIndexes());

    await mongoose.disconnect();
}

verifyIndexes();
```

**Run:**
```bash
node backend/scripts/verify-indexes.js
```

---

## 6. Redis Caching

**Installation:**
```bash
npm install redis
```

**Setup:**
```javascript
// backend/src/config/redis.js
const redis = require('redis');

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('✓ Redis connected'));

async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}

module.exports = { redisClient, connectRedis };
```

**Cache Middleware:**
```javascript
// backend/src/middleware/cache.js
const { redisClient } = require('../config/redis');

const cache = (duration = 300) => {
    return async (req, res, next) => {
        if (!redisClient.isOpen) {
            return next();
        }

        const key = `cache:${req.originalUrl}`;

        try {
            const cachedResponse = await redisClient.get(key);

            if (cachedResponse) {
                console.log(`[CACHE HIT] ${key}`);
                return res.json(JSON.parse(cachedResponse));
            }

            console.log(`[CACHE MISS] ${key}`);

            // Store original res.json
            const originalJson = res.json.bind(res);

            // Override res.json
            res.json = (body) => {
                // Cache the response
                redisClient.setEx(key, duration, JSON.stringify(body));
                return originalJson(body);
            };

            next();
        } catch (err) {
            console.error('Cache error:', err);
            next();
        }
    };
};

module.exports = cache;
```

**Usage:**
```javascript
// backend/src/routes/chat.js
const cache = require('../middleware/cache');

// Cache providers for 5 minutes
router.get('/providers', optionalApiKey, cache(300), getProviders);

// Cache workspace settings for 10 minutes
router.get('/workspaces/:id', protect, cache(600), getWorkspace);
```

**Initialize in Server:**
```javascript
// backend/src/server.js
const { connectRedis } = require('./config/redis');

// After database connection
connectDB();
connectRedis(); // Add this
```

---

## 7. Structured Logging with Winston

**Installation:**
```bash
npm install winston winston-daily-rotate-file
```

**Setup:**
```javascript
// backend/src/config/logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'minichat-backend' },
    transports: [
        // Error logs
        new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '30d',
            maxSize: '20m',
        }),
        // Combined logs
        new DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            maxSize: '20m',
        }),
    ],
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

module.exports = logger;
```

**Usage:**
```javascript
// backend/src/controllers/chatController.js
const logger = require('../config/logger');

exports.sendMessage = async (req, res) => {
    const { message, provider, model } = req.body;
    const sessionId = req.headers['x-session-id'];

    logger.info('Message received', {
        sessionId,
        provider,
        model,
        messageLength: message.length,
        ip: req.ip,
    });

    try {
        // ... process message

        logger.info('AI response generated', {
            sessionId,
            provider,
            responseTime: aiResponse.responseTime,
        });

    } catch (error) {
        logger.error('Failed to process message', {
            sessionId,
            provider,
            error: error.message,
            stack: error.stack,
        });
    }
};
```

**Replace console.log:**
```javascript
// Before
console.log('[INFO] User message saved:', message);
console.error('[ERROR] Ollama API call failed:', error.message);

// After
logger.info('User message saved', { message: message.substring(0, 50) });
logger.error('Ollama API call failed', { error: error.message, stack: error.stack });
```

---

## 8. Environment Variables Validation

**Installation:**
```bash
npm install joi
```

**Implementation:**
```javascript
// backend/src/config/validateEnv.js
const Joi = require('joi');

const envSchema = Joi.object({
    // Server
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(5001),

    // Database
    MONGODB_URI: Joi.string().required()
        .messages({
            'any.required': 'MONGODB_URI is required in .env file'
        }),

    // Auth
    JWT_SECRET: Joi.string().min(32).required()
        .messages({
            'any.required': 'JWT_SECRET is required',
            'string.min': 'JWT_SECRET must be at least 32 characters'
        }),

    // CORS
    ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),

    // AI Providers (at least one required)
    OLLAMA_BASE_URL: Joi.string().uri().default('http://localhost:11434'),
    GROQ_API_KEY: Joi.string().optional(),
    OPENROUTER_API_KEY: Joi.string().optional(),
    ANTHROPIC_API_KEY: Joi.string().optional(),

    // OAuth
    GOOGLE_CLIENT_ID: Joi.string().optional(),
    GOOGLE_CLIENT_SECRET: Joi.string().optional(),
    GOOGLE_REDIRECT_URI: Joi.string().uri().optional(),

    GITHUB_CLIENT_ID: Joi.string().optional(),
    GITHUB_CLIENT_SECRET: Joi.string().optional(),
    GITHUB_REDIRECT_URI: Joi.string().uri().optional(),

    // Email
    SENDGRID_API_KEY: Joi.string().optional(),
    SENDGRID_FROM_EMAIL: Joi.string().email().optional(),

    // Redis
    REDIS_URL: Joi.string().uri().optional(),

    // Logging
    LOG_LEVEL: Joi.string()
        .valid('error', 'warn', 'info', 'debug')
        .default('info'),

}).unknown(true); // Allow other env vars

function validateEnv() {
    const { error, value } = envSchema.validate(process.env, {
        abortEarly: false, // Show all errors
    });

    if (error) {
        console.error('❌ Environment validation failed:');
        error.details.forEach((detail) => {
            console.error(`   - ${detail.message}`);
        });
        process.exit(1);
    }

    // Check if at least one AI provider is configured
    const hasProvider = value.GROQ_API_KEY ||
                       value.OPENROUTER_API_KEY ||
                       value.ANTHROPIC_API_KEY;

    if (!hasProvider) {
        console.warn('⚠️  WARNING: No AI provider API keys configured. Only Ollama will be available.');
    }

    console.log('✓ Environment variables validated successfully');
    return value;
}

module.exports = validateEnv;
```

**Use in Server:**
```javascript
// backend/src/server.js
require('dotenv').config();
const validateEnv = require('./config/validateEnv');

// Validate environment before starting server
validateEnv();

const express = require('express');
// ... rest of server code
```

---

## 9. Error Response Standardization

**Create Error Classes:**
```javascript
// backend/src/utils/errors.js
class AppError extends Error {
    constructor(message, statusCode, code = 'SERVER_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true; // Distinguish from programming errors
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, details = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

class RateLimitError extends AppError {
    constructor(retryAfter = 900) {
        super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
        this.retryAfter = retryAfter;
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    RateLimitError,
};
```

**Global Error Handler:**
```javascript
// backend/src/middleware/errorHandler.js
const logger = require('../config/logger');
const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error('Error occurred', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id,
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error = new AppError('Resource not found', 404, 'INVALID_ID');
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = new AppError(
            `${field} already exists`,
            400,
            'DUPLICATE_FIELD'
        );
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const details = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message,
        }));
        error = new ValidationError('Validation failed', details);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new AuthenticationError('Invalid token');
    }
    if (err.name === 'TokenExpiredError') {
        error = new AuthenticationError('Token expired');
    }

    // Send response
    const response = {
        success: false,
        error: {
            code: error.code || 'SERVER_ERROR',
            message: error.message || 'Internal Server Error',
        },
    };

    // Add details if validation error
    if (error.details) {
        response.error.details = error.details;
    }

    // Add retry info if rate limit
    if (error.retryAfter) {
        response.error.retryAfter = error.retryAfter;
    }

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.error.stack = err.stack;
    }

    res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;
```

**Async Handler Wrapper:**
```javascript
// backend/src/utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
```

**Usage:**
```javascript
// backend/src/controllers/authController.js
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError, AuthenticationError } = require('../utils/errors');

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        throw new ValidationError('Email and password required');
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new AuthenticationError('Invalid credentials');
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        throw new AuthenticationError('Invalid credentials');
    }

    // Success response (standardized)
    res.json({
        success: true,
        data: {
            token,
            user: { ... },
        },
    });
});
```

**Apply Error Handler:**
```javascript
// backend/src/server.js
const errorHandler = require('./middleware/errorHandler');

// ... all routes

// 404 handler (put before error handler)
app.use((req, res, next) => {
    const error = new NotFoundError('Endpoint');
    next(error);
});

// Global error handler (must be last)
app.use(errorHandler);
```

---

## 10. Password Strength Validation

**Implementation:**
```javascript
// backend/src/utils/passwordValidator.js
const validator = require('validator');

class PasswordValidator {
    static validate(password) {
        const errors = [];

        // Length check
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        // Uppercase check
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        // Lowercase check
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        // Number check
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        // Special character check
        if (!/[@$!%*?&]/.test(password)) {
            errors.push('Password must contain at least one special character (@$!%*?&)');
        }

        // Common passwords check
        const commonPasswords = [
            'password', '12345678', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein'
        ];

        if (commonPasswords.includes(password.toLowerCase())) {
            errors.push('Password is too common');
        }

        return {
            isValid: errors.length === 0,
            errors,
            strength: this.calculateStrength(password),
        };
    }

    static calculateStrength(password) {
        let strength = 0;

        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/\d/.test(password)) strength += 1;
        if (/[@$!%*?&]/.test(password)) strength += 1;
        if (password.length >= 16) strength += 1;

        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    }
}

module.exports = PasswordValidator;
```

**Usage:**
```javascript
// backend/src/controllers/authController.js
const PasswordValidator = require('../utils/passwordValidator');

exports.register = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // Validate password strength
    const passwordCheck = PasswordValidator.validate(password);

    if (!passwordCheck.isValid) {
        throw new ValidationError('Password does not meet requirements',
            passwordCheck.errors.map(err => ({ field: 'password', message: err }))
        );
    }

    // Create user...
});
```

---

## 11-20. Quick Implementation Snippets

### 11. Compression Middleware
```bash
npm install compression
```

```javascript
// backend/src/server.js
const compression = require('compression');
app.use(compression()); // Add after body parser
```

### 12. HTTPS Redirect
```javascript
// backend/src/middleware/httpsRedirect.js
const httpsRedirect = (req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
        return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
};

module.exports = httpsRedirect;
```

### 13. Request ID Tracking
```bash
npm install uuid
```

```javascript
// backend/src/middleware/requestId.js
const { v4: uuidv4 } = require('uuid');

const requestId = (req, res, next) => {
    req.id = req.header('X-Request-ID') || uuidv4();
    res.setHeader('X-Request-ID', req.id);
    next();
};

module.exports = requestId;
```

### 14. API Response Wrapper
```javascript
// backend/src/utils/response.js
class ApiResponse {
    static success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            metadata: {
                timestamp: new Date().toISOString(),
                requestId: res.req.id,
            },
        });
    }

    static error(res, message, code = 'ERROR', statusCode = 500, details = null) {
        return res.status(statusCode).json({
            success: false,
            error: {
                code,
                message,
                ...(details && { details }),
            },
            metadata: {
                timestamp: new Date().toISOString(),
                requestId: res.req.id,
            },
        });
    }
}

module.exports = ApiResponse;
```

### 15. Database Connection Pooling
```javascript
// backend/src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10, // Max connections
            minPoolSize: 5,  // Min connections
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✓ MongoDB connected with pooling');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = { connectDB };
```

### 16. Graceful Shutdown Enhancement
```javascript
// backend/src/server.js
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server running on port ${PORT}`);
});

// Enhanced graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received, starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async () => {
        console.log('HTTP server closed');

        try {
            // Close database connection
            await mongoose.connection.close();
            console.log('MongoDB connection closed');

            // Close Redis connection
            if (redisClient.isOpen) {
                await redisClient.quit();
                console.log('Redis connection closed');
            }

            console.log('Graceful shutdown completed');
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

### 17. Sensitive Data Masking in Logs
```javascript
// backend/src/utils/maskSensitiveData.js
const maskSensitiveData = (obj) => {
    const sensitiveFields = ['password', 'apiKey', 'token', 'secret', 'pin'];
    const masked = { ...obj };

    for (const key in masked) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            const value = String(masked[key]);
            masked[key] = value.substring(0, 4) + '*'.repeat(value.length - 4);
        }
    }

    return masked;
};

module.exports = maskSensitiveData;
```

### 18. Health Check Enhancement
```javascript
// backend/src/routes/health.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { redisClient } = require('../config/redis');

router.get('/health', async (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        services: {
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            redis: redisClient.isOpen ? 'connected' : 'disconnected',
        },
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        },
    };

    // Check if all critical services are up
    const isHealthy = health.services.mongodb === 'connected';

    res.status(isHealthy ? 200 : 503).json(health);
});

router.get('/health/ready', async (req, res) => {
    // Readiness probe - can we handle requests?
    const isReady = mongoose.connection.readyState === 1;
    res.status(isReady ? 200 : 503).json({ ready: isReady });
});

router.get('/health/live', (req, res) => {
    // Liveness probe - is the server running?
    res.status(200).json({ alive: true });
});

module.exports = router;
```

### 19. Automated Data Cleanup Cron Job
```bash
npm install node-cron
```

```javascript
// backend/src/jobs/cleanup.js
const cron = require('node-cron');
const Message = require('../models/Message');
const Workspace = require('../models/Workspace');
const logger = require('../config/logger');

// Run daily at 2 AM
const cleanupJob = cron.schedule('0 2 * * *', async () => {
    logger.info('Starting data cleanup job');

    try {
        // Get all workspaces with retention policy
        const workspaces = await Workspace.find({
            'settings.security.dataRetentionDays': { $exists: true }
        });

        let totalDeleted = 0;

        for (const workspace of workspaces) {
            const retentionDays = workspace.settings.security.dataRetentionDays;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

            // Find messages belonging to this workspace
            const result = await Message.deleteMany({
                sessionId: { $regex: workspace._id.toString() },
                createdAt: { $lt: cutoffDate }
            });

            totalDeleted += result.deletedCount;

            logger.info(`Deleted ${result.deletedCount} messages for workspace ${workspace._id}`);
        }

        logger.info(`Data cleanup completed. Total deleted: ${totalDeleted} messages`);
    } catch (error) {
        logger.error('Data cleanup job failed', { error: error.message });
    }
}, {
    scheduled: false // Don't start automatically
});

module.exports = { cleanupJob };
```

```javascript
// backend/src/server.js
const { cleanupJob } = require('./jobs/cleanup');

// Start cleanup job in production
if (process.env.NODE_ENV === 'production') {
    cleanupJob.start();
    console.log('✓ Data cleanup job scheduled');
}
```

### 20. API Documentation with Swagger
```bash
npm install swagger-jsdoc swagger-ui-express
```

```javascript
// backend/src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MiniChat SaaS API',
            version: '1.0.0',
            description: 'API documentation for MiniChat SaaS platform',
        },
        servers: [
            {
                url: 'http://localhost:5001',
                description: 'Development server',
            },
            {
                url: 'https://api.clubfivem.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                },
            },
        },
    },
    apis: ['./src/routes/*.js'], // Path to API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
```

```javascript
// backend/src/server.js
const { swaggerUi, swaggerSpec } = require('./config/swagger');

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

---

## Testing Checklist

### Security Tests
- [ ] Test CORS with different origins
- [ ] Verify rate limiting works
- [ ] Test authentication with invalid tokens
- [ ] Test SQL/NoSQL injection attempts
- [ ] Test XSS payload in messages

### Performance Tests
- [ ] Verify indexes are created
- [ ] Test cache hit/miss
- [ ] Measure response times before/after
- [ ] Test with 100+ concurrent users

### Functional Tests
- [ ] Test error responses format
- [ ] Verify logging works
- [ ] Test environment validation
- [ ] Test graceful shutdown

---

## Deployment Checklist

- [ ] Set all environment variables in production
- [ ] Enable HTTPS redirect
- [ ] Configure CORS whitelist
- [ ] Set up Redis
- [ ] Configure log rotation
- [ ] Set up monitoring
- [ ] Test health check endpoints
- [ ] Enable data cleanup cron job
- [ ] Review Swagger docs

---

**Next Steps:**
1. Start with security improvements (1-4)
2. Add performance optimizations (5-6)
3. Improve logging and monitoring (7-8)
4. Standardize responses and errors (9-10)
5. Add remaining improvements (11-20)

สำเร็จ! 🎉
