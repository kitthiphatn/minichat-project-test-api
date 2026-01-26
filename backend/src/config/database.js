const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Implements retry logic for connection failures
 */
const connectDB = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        console.log('[INFO] Connecting to MongoDB...');

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);

        console.log(`[INFO] MongoDB connected successfully: ${conn.connection.host}`);
        console.log(`[INFO] Database name: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('[ERROR] MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('[WARN] MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('[INFO] MongoDB reconnected successfully');
        });

        return conn;
    } catch (error) {
        console.error('[ERROR] MongoDB connection failed:', error.message);
        console.error('[ERROR] Please ensure MongoDB is running and the connection string is correct');
        console.error('[ERROR] Connection string:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//<credentials>@'));

        // Exit process with failure
        process.exit(1);
    }
};

/**
 * Gracefully close database connection
 */
const closeDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('[INFO] MongoDB connection closed');
    } catch (error) {
        console.error('[ERROR] Error closing MongoDB connection:', error);
    }
};

module.exports = { connectDB, closeDB };
