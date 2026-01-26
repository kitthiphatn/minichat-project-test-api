import axios from 'axios';

/**
 * Generate or retrieve session ID
 * Each browser gets a unique session ID stored in localStorage
 */
const getSessionId = () => {
    let sessionId = localStorage.getItem('chatSessionId');
    if (!sessionId) {
        // Generate UUID v4
        sessionId = crypto.randomUUID();
        localStorage.setItem('chatSessionId', sessionId);
        console.log('[INFO] New session created:', sessionId);
    }
    return sessionId;
};

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000,
});

// Add session ID to all requests
api.interceptors.request.use(config => {
    config.headers['X-Session-ID'] = getSessionId();
    return config;
}, error => {
    return Promise.reject(error);
});

/**
 * Get available AI providers
 * @returns {Promise<Object>} Providers with availability status
 */
export const getProviders = async () => {
    try {
        const response = await api.get('/chat/providers');
        return response.data;
    } catch (error) {
        console.error('Failed to get providers:', error);
        throw error;
    }
};

/**
 * Get chat history for current session
 * @returns {Promise<Array>} Array of messages
 */
export const getChatHistory = async () => {
    try {
        const response = await api.get('/chat/history');
        return response.data.messages;
    } catch (error) {
        console.error('Failed to get chat history:', error);
        throw error;
    }
};

/**
 * Send message to AI
 * @param {String} message - User message
 * @param {String} provider - AI provider
 * @param {String} model - AI model
 * @returns {Promise<Object>} User and AI messages
 */
export const sendMessage = async (message, provider, model) => {
    try {
        const response = await api.post('/chat/message', {
            message,
            provider,
            model,
        });
        return response.data;
    } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
    }
};

/**
 * Clear chat history for current session
 * @returns {Promise<Object>} Deletion result
 */
export const clearChat = async () => {
    try {
        const response = await api.post('/chat/clear');
        return response.data;
    } catch (error) {
        console.error('Failed to clear chat:', error);
        throw error;
    }
};

export default api;
