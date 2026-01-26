const axios = require('axios');
const Message = require('../models/Message');

/**
 * AI Provider Configurations
 */
const PROVIDERS = {
    ollama: {
        name: 'Ollama (Local)',
        endpoint: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        models: ['llama3', 'mistral', 'phi3', 'gemma'],
    },
    openrouter: {
        name: 'OpenRouter',
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        models: [
            'google/gemini-pro-1.5',
            'google/gemini-flash-1.5',
            'meta-llama/llama-3-8b-instruct',
            'meta-llama/llama-3-70b-instruct',
            'mistralai/mistral-7b-instruct',
            'anthropic/claude-3-haiku',
        ],
    },
    groq: {
        name: 'Groq',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        models: [
            'llama-3.1-8b-instant',
            'llama-3.3-70b-versatile',
            'mixtral-8x7b-32768',
        ],
    },
    anthropic: {
        name: 'Anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229'],
    },
};

/**
 * Call Ollama API
 */
async function callOllama(messages, model) {
    const startTime = Date.now();

    try {
        const url = `${PROVIDERS.ollama.endpoint}/api/chat`;
        const requestData = {
            model: model,
            messages: messages,
            stream: false,
        };

        const response = await axios.post(
            url,
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            }
        );

        const responseTime = Date.now() - startTime;

        return {
            content: response.data.message.content,
            responseTime,
            model,
        };
    } catch (error) {
        console.error('[ERROR] Ollama API call failed:', error.message);
        if (error.response) {
            console.error('[ERROR] Response status:', error.response.status);
            console.error('[ERROR] Response data:', error.response.data);
        }
        throw new Error(`Ollama error: ${error.message}`);
    }
}


/**
 * Call OpenRouter API
 */
async function callOpenRouter(messages, model) {
    const startTime = Date.now();

    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured');
    }

    try {
        const response = await axios.post(
            PROVIDERS.openrouter.endpoint,
            {
                model: model,
                messages: messages,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': process.env.CORS_ORIGIN || 'http://localhost:3000',
                    'X-Title': 'Mini Chat Ollama',
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            }
        );

        const responseTime = Date.now() - startTime;

        return {
            content: response.data.choices[0].message.content,
            responseTime,
            model,
        };
    } catch (error) {
        console.error('[ERROR] OpenRouter API call failed:', error.message);
        throw new Error(`OpenRouter error: ${error.response?.data?.error?.message || error.message}`);
    }
}

/**
 * Call Groq API
 */
async function callGroq(messages, model) {
    const startTime = Date.now();

    if (!process.env.GROQ_API_KEY) {
        throw new Error('Groq API key not configured');
    }

    try {
        const response = await axios.post(
            PROVIDERS.groq.endpoint,
            {
                model: model,
                messages: messages,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            }
        );

        const responseTime = Date.now() - startTime;

        return {
            content: response.data.choices[0].message.content,
            responseTime,
            model,
        };
    } catch (error) {
        console.error('[ERROR] Groq API call failed:', error.message);
        throw new Error(`Groq error: ${error.response?.data?.error?.message || error.message}`);
    }
}

/**
 * Call Anthropic API
 */
async function callAnthropic(messages, model) {
    const startTime = Date.now();

    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('Anthropic API key not configured');
    }

    try {
        // Anthropic uses a different message format
        const anthropicMessages = messages.map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : msg.role,
            content: msg.content,
        }));

        const response = await axios.post(
            PROVIDERS.anthropic.endpoint,
            {
                model: model,
                max_tokens: 1024,
                messages: anthropicMessages,
            },
            {
                headers: {
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
                timeout: 60000,
            }
        );

        const responseTime = Date.now() - startTime;

        return {
            content: response.data.content[0].text,
            responseTime,
            model,
        };
    } catch (error) {
        console.error('[ERROR] Anthropic API call failed:', error.message);
        throw new Error(`Anthropic error: ${error.response?.data?.error?.message || error.message}`);
    }
}

/**
 * Get available providers
 * Checks which API keys are configured and fetches available Ollama models
 */
exports.getProviders = async (req, res) => {
    try {
        // Fetch available Ollama models dynamically
        let ollamaModels = ['llama3', 'mistral', 'phi3', 'gemma']; // Default fallback
        let ollamaAvailable = false; // 📝 NOTE: Force disabled Ollama as per user request to use Groq only

        /*
        try {
            const ollamaResponse = await axios.get(`${PROVIDERS.ollama.endpoint}/api/tags`, {
                timeout: 3000,
            });

            if (ollamaResponse.data && ollamaResponse.data.models) {
                // Extract model names from Ollama API response
                ollamaModels = ollamaResponse.data.models.map(m => {
                    // Remove ':latest' suffix for cleaner display
                    return m.name.replace(':latest', '');
                });
                console.log('[INFO] Fetched Ollama models:', ollamaModels);
            }
        } catch (ollamaError) {
            console.warn('[WARN] Could not fetch Ollama models, using defaults:', ollamaError.message);
            ollamaAvailable = false;
        }
        */

        const providers = {
            ollama: {
                ...PROVIDERS.ollama,
                models: ollamaModels,
                available: ollamaAvailable,
            },
            openrouter: {
                ...PROVIDERS.openrouter,
                available: !!process.env.OPENROUTER_API_KEY,
            },
            groq: {
                ...PROVIDERS.groq,
                available: !!process.env.GROQ_API_KEY,
            },
            anthropic: {
                ...PROVIDERS.anthropic,
                available: !!process.env.ANTHROPIC_API_KEY,
            },
        };

        res.json({ providers });
    } catch (error) {
        console.error('[ERROR] Failed to get providers:', error);
        res.status(500).json({ error: 'Failed to get providers' });
    }
};

/**
 * Get chat history
 */
exports.getChatHistory = async (req, res) => {
    try {
        // Get sessionId from header
        const sessionId = req.headers['x-session-id'];

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const { limit = 50 } = req.query;
        const messages = await Message.getChatHistory(sessionId, parseInt(limit));

        res.json({ messages });
    } catch (error) {
        console.error('[ERROR] Failed to get chat history:', error);
        res.status(500).json({ error: 'Failed to get chat history' });
    }
};

/**
 * Send message to AI
 */
exports.sendMessage = async (req, res) => {
    try {
        // Get sessionId from header
        const sessionId = req.headers['x-session-id'];

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const { message, provider = 'ollama', model = 'llama3' } = req.body;

        // Validate input
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required and must be a string' });
        }

        if (message.length > 500) {
            return res.status(400).json({ error: 'Message must be less than 500 characters' });
        }

        if (!PROVIDERS[provider]) {
            return res.status(400).json({ error: 'Invalid provider' });
        }

        // Save user message
        const userMessage = await Message.create({
            role: 'user',
            content: message,
            provider,
            model,
            sessionId,
        });

        console.log(`[INFO] User message saved: ${message.substring(0, 50)}...`);

        // Get conversation history (last 10 messages for context)
        const history = await Message.getChatHistory(sessionId, 10);

        // Format messages for AI API
        let formattedMessages = history.map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.content,
        }));

        // Add system prompt for Ollama to ensure Thai responses
        if (provider === 'ollama') {
            formattedMessages = [
                {
                    role: 'system',
                    content: 'ตรวจสอบภาษาของคำถาม: ถ้าเป็นภาษาอังกฤษล้วนๆ ให้ตอบเป็นภาษาอังกฤษ แต่ถ้ามีภาษาไทยปนอยู่ หรือเป็นภาษาไทยทั้งหมด ให้ตอบเป็นภาษาไทยเท่านั้น'
                },
                ...formattedMessages
            ];
        }

        // Call appropriate AI provider
        let aiResponse;
        try {
            switch (provider) {
                case 'ollama':
                    aiResponse = await callOllama(formattedMessages, model);
                    break;
                case 'openrouter':
                    aiResponse = await callOpenRouter(formattedMessages, model);
                    break;
                case 'groq':
                    aiResponse = await callGroq(formattedMessages, model);
                    break;
                case 'anthropic':
                    aiResponse = await callAnthropic(formattedMessages, model);
                    break;
                default:
                    throw new Error('Invalid provider');
            }

            console.log(`[INFO] AI response received in ${aiResponse.responseTime}ms`);

            // Save AI message
            const aiMessage = await Message.create({
                role: 'ai',
                content: aiResponse.content,
                provider,
                model: aiResponse.model,
                sessionId,
                metadata: {
                    responseTime: aiResponse.responseTime,
                },
            });

            res.json({
                userMessage: userMessage.toResponse(),
                aiMessage: aiMessage.toResponse(),
            });
        } catch (aiError) {
            console.error('[ERROR] AI provider error:', aiError.message);

            // Save error message
            const errorMessage = await Message.create({
                role: 'ai',
                content: `Sorry, I encountered an error: ${aiError.message}`,
                provider,
                model,
                sessionId,
                metadata: {
                    error: aiError.message,
                },
            });

            res.status(500).json({
                error: aiError.message,
                userMessage: userMessage.toResponse(),
                aiMessage: errorMessage.toResponse(),
            });
        }
    } catch (error) {
        console.error('[ERROR] Failed to send message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

/**
 * Clear chat history
 */
exports.clearChat = async (req, res) => {
    try {
        // Get sessionId from header
        const sessionId = req.headers['x-session-id'];

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const result = await Message.clearHistory(sessionId);

        res.json({
            message: 'Chat history cleared successfully',
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error('[ERROR] Failed to clear chat:', error);
        res.status(500).json({ error: 'Failed to clear chat' });
    }
};
