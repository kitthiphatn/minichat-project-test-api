require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/database');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware
 */
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
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

/**
 * Root Endpoint
 */
app.get('/', (req, res) => {
    res.json({
        message: 'Mini Chat Ollama API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            providers: '/api/chat/providers',
            history: '/api/chat/history',
            message: '/api/chat/message',
            clear: '/api/chat/clear',
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
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🤖  MINI CHAT OLLAMA - BACKEND SERVER');
    console.log('='.repeat(60));
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    console.log('\n📡 API Endpoints:');
    console.log(`   GET  /health                - Health check`);
    console.log(`   GET  /api/chat/providers    - Get available providers`);
    console.log(`   GET  /api/chat/history      - Get chat history`);
    console.log(`   POST /api/chat/message      - Send message`);
    console.log(`   POST /api/chat/clear        - Clear chat`);
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
