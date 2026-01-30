require('dotenv').config();
const validateEnv = require('./config/validateEnv');
validateEnv(); // Validate Env immediately

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet'); // Security Headers
const { connectDB } = require('./config/database');
const { generalLimiter } = require('./middleware/rateLimiter'); // Rate Limiting
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5001;

/**
 * Middleware
 */
// Security Headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for now to avoid breaking existing frontend/images
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow resources to be loaded
}));

// Rate Limiting (Global)
app.use('/api/', generalLimiter);

// Strict CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'https://chat.clubfivem.com', 'https://api.clubfivem.com'];

app.use(cors({
    origin: true, // Allow all origins (reflect request origin) for maximum compatibility during testing
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

/**
 * Connect to Database
 */
connectDB();

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

/**
 * API Routes
 */
app.use('/api/chat', chatRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workspaces', require('./routes/workspaces'));
app.use('/api/widget', require('./routes/widget'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/conversations', require('./routes/conversation'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/widget-config', require('./routes/widgetConfig'));

// Serve uploaded files statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/**
 * Root Endpoint
 */
app.get('/', (req, res) => {
    res.json({
        message: 'MiniChat SaaS API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: {
                register: '/api/auth/register',
                login: '/api/auth/login',
                me: '/api/auth/me'
            },
            chat: {
                providers: '/api/chat/providers',
                history: '/api/chat/history',
                message: '/api/chat/message',
                clear: '/api/chat/clear',
            },
            conversations: {
                list: '/api/conversations',
                stats: '/api/conversations/stats',
                detail: '/api/conversations/:sessionId',
                takeover: '/api/conversations/:sessionId/takeover',
                end: '/api/conversations/:sessionId/end',
                message: '/api/conversations/:sessionId/message',
                resolve: '/api/conversations/:sessionId/resolve',
                notes: '/api/conversations/:sessionId/notes',
            }
        },
    });
});

/**
 * 404 Handler
 */
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
    });
});

/**
 * Error Handler
 */
app.use((err, req, res, next) => {
    console.error('[ERROR] Unhandled error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

/**
 * Start Server
 */
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🤖  MINI CHAT SAAS - BACKEND SERVER');
    console.log('='.repeat(60));
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ CORS enabled for: ALL`);
    console.log('\n📡 API Endpoints:');
    console.log(`   AUTH:`);
    console.log(`   POST /api/auth/register     - Register new user`);
    console.log(`   POST /api/auth/login        - Login`);
    console.log(`   GET  /api/auth/me           - Get current user`);
    console.log(`   CHAT:`);
    console.log(`   GET  /api/chat/providers    - Get available providers`);
    console.log(`   GET  /api/chat/history      - Get chat history`);
    console.log(`   POST /api/chat/message      - Send message`);
    console.log(`   CONVERSATIONS:`);
    console.log(`   GET  /api/conversations     - List conversations`);
    console.log(`   GET  /api/conversations/stats - Get stats`);
    console.log(`   POST /api/conversations/:id/takeover - Human takeover`);
    console.log(`   POST /api/conversations/:id/message  - Send as human`);
    console.log('\n' + '='.repeat(60) + '\n');
});

/**
 * Graceful Shutdown
 */
process.on('SIGTERM', () => {
    console.log('\n[INFO] SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('[INFO] HTTP server closed');
        require('mongoose').connection.close(false, () => {
            console.log('[INFO] MongoDB connection closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('\n[INFO] SIGINT signal received: closing HTTP server');
    require('mongoose').connection.close(false, () => {
        console.log('[INFO] MongoDB connection closed');
        process.exit(0);
    });
});

module.exports = app;
