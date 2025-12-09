import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000,
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
 * Get chat history for a session
 * @param {String} sessionId - Session identifier
 * @returns {Promise<Array>} Array of messages
 */
export const getChatHistory = async (sessionId = 'default') => {
    try {
        const response = await api.get('/chat/history', {
            params: { sessionId },
        });
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
 * @param {String} sessionId - Session identifier
 * @returns {Promise<Object>} User and AI messages
 */
export const sendMessage = async (message, provider, model, sessionId = 'default') => {
    try {
        const response = await api.post('/chat/message', {
            message,
            provider,
            model,
            sessionId,
        });
        return response.data;
    } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
    }
};

/**
 * Clear chat history
 * @param {String} sessionId - Session identifier
 * @returns {Promise<Object>} Deletion result
 */
export const clearChat = async (sessionId = 'default') => {
    try {
        const response = await api.post('/chat/clear', {
            sessionId,
        });
        return response.data;
    } catch (error) {
        console.error('Failed to clear chat:', error);
        throw error;
    }
};

export default api;
