const ActivityLog = require('../models/ActivityLog');

/**
 * Log user activity
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Short description of the action (e.g., 'LOGIN', 'UPDATE_SETTINGS')
 * @param {string} details - Additional details
 * @param {object} req - Express request object (optional, for IP/Agent)
 */
const logActivity = async (userId, action, details = '', req = null) => {
    try {
        const logData = {
            user: userId,
            action,
            details
        };

        if (req) {
            logData.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            logData.userAgent = req.headers['user-agent'];
        }

        await ActivityLog.create(logData);
    } catch (error) {
        console.error('Error logging activity:', error);
        // Don't throw error to prevent disrupting the main flow
    }
};

module.exports = logActivity;
