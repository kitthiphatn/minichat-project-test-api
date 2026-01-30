const axios = require('axios');
const Message = require('../models/Message');
const Workspace = require('../models/Workspace');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

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
/**
 * Send message to AI
 */
exports.sendMessage = async (req, res) => {
    try {
        // Check for session ID or API Key
        const sessionId = req.headers['x-session-id'];
        const { message, provider = 'groq', model = 'llama-3.1-8b-instant', apiKey } = req.body;

        // Verify authentication (Session ID or API Key)
        if (!sessionId && !apiKey) {
            return res.status(401).json({ error: 'Authentication required (Session ID or API Key)' });
        }

        // Validate input
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required and must be a string' });
        }

        if (message.length > 5000) {
            return res.status(400).json({ error: 'Message must be less than 5000 characters' });
        }

        if (!PROVIDERS[provider]) {
            return res.status(400).json({ error: 'Invalid provider' });
        }

        // Save user message (only if session ID exists)
        let userMessage;
        if (sessionId) {
            userMessage = await Message.create({
                role: 'user',
                content: message,
                provider,
                model,
                sessionId,
            });
            console.log(`[INFO] User message saved: ${message.substring(0, 50)}...`);
        }

        // Find or create conversation
        let conversation = null;
        if (sessionId && req.body.workspaceId) {
            conversation = await Conversation.findOrCreate(sessionId, req.body.workspaceId);
            await conversation.updateActivity();
        }

        // Fetch Workspace Context (Critical for RAG/Context Injection)
        // If not attached, fetch it.
        if (!req.workspace && req.body.workspaceId) {
            try {
                req.workspace = await Workspace.findById(req.body.workspaceId);
            } catch (err) {
                console.error('Failed to fetch workspace context:', err);
            }
        }

        // --- CHECK MODE (HUMAN/PASSIVE) ---
        // 1. Human Mode: Bot SHOULD NOT REPLY (unless it's a system message or we force it, but generally silent)
        if (conversation && conversation.mode === 'human' && conversation.botPaused) {
            console.log(`[INFO] Conversation ${sessionId} is in human mode, bot is paused`);

            // If Socket.IO is available, notify the human agent
            if (req.io && conversation.assignedTo) {
                req.io.to(`user_${conversation.assignedTo}`).emit('customer_message', {
                    sessionId: sessionId,
                    message: message,
                    timestamp: new Date(),
                    userMessage: userMessage ? userMessage.toResponse() : null
                });
            }

            // Return success but NO AI MESSAGE
            return res.json({
                success: true,
                message: null, // No AI response
                userMessage: userMessage ? userMessage.toResponse() : null,
                aiMessage: null,
                conversationMode: 'human',
                note: 'Bot is paused. Human agent will respond.'
            });
        }

        // 2. Passive Bot Mode: Bot matches ONLY specific intents (e.g. Help / ? question)
        if (conversation && conversation.botMode === 'passive') {
            const isQuestion = message.includes('?') ||
                message.toLowerCase().includes('help') ||
                message.toLowerCase().includes('ช่วย') ||
                message.toLowerCase().includes('สอบถาม');

            if (!isQuestion) {
                // Determine if we should wake up based on strict intent?
                // For now, if not a question, stay silent.
                console.log(`[INFO] Bot is passive. Ignoring non-question: "${message}"`);
                return res.json({
                    success: true,
                    message: null,
                    userMessage: userMessage ? userMessage.toResponse() : null,
                    aiMessage: null,
                    conversationMode: 'bot_passive',
                    note: 'Bot is in passive mode. Ignored non-question.'
                });
            }

            // If it IS a question, re-activate the bot? Or just answer once?
            // "activateBot" sets mode='bot' and botMode='active'.
            // Let's activate it so it continues the conversation naturally.
            console.log(`[INFO] Bot passive mode activated by question: "${message}"`);
            await conversation.activateBot();
            // Fallthrough to normal LLM logic...
        }

        // --- CONTEXT BUILDER ---
        const buildSystemContext = (workspace) => {
            let context = "";

            if (!workspace) return context;

            // 1. Payment Info
            if (workspace.paymentSettings && workspace.paymentSettings.enabled) {
                context += "\n\n--- PAYMENT INFORMATION ---\n";
                const methods = workspace.paymentSettings.methods || {};
                if (methods.bankTransfer && methods.bankTransfer.enabled) {
                    context += `Bank Transfer: Available\n`;
                    context += `Bank: ${methods.bankTransfer.bank}\n`;
                    context += `Account Number: ${methods.bankTransfer.accountNumber}\n`;
                    context += `Account Name: ${methods.bankTransfer.accountName}\n`;
                }
                if (methods.qrCode && methods.qrCode.enabled) {
                    context += `QR Code Payment: Available (PromptPay)\n`;
                }
                context += "If the customer asks how to pay, provide these details clearly.";
            }

            // 2. Knowledge Base (FAQs)
            if (workspace.knowledgeBase && workspace.knowledgeBase.faqs && workspace.knowledgeBase.faqs.length > 0) {
                context += "\n\n--- KNOWLEDGE BASE (FAQs) ---\n";
                const activeFaqs = workspace.knowledgeBase.faqs.filter(f => f.isActive);
                activeFaqs.forEach(faq => {
                    context += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
                });
                context += "Use these Q&A pairs to answer matching questions accurately.";
            }

            // 3. Product Catalog (Summary)
            // Limit to active products, take recent 20 to avoid token limits
            if (workspace.productCatalog && workspace.productCatalog.products && workspace.productCatalog.products.length > 0) {
                context += "\n\n--- PRODUCT CATALOG (Recent Items) ---\n";
                // Add explicit instruction about using this catalog
                context += "INSTRUCTION: The following is the OFFICIAL and ONLY source of truth for product prices and stock. Do not use outside knowledge. All prices are in Thai Baht (THB) unless specified.\n\n";

                const activeProducts = workspace.productCatalog.products
                    .filter(p => p.isActive)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 20); // Limit to 20 products

                const currency = workspace.settings.currency || 'THB';

                activeProducts.forEach(p => {
                    const priceInfo = p.compareAtPrice && p.compareAtPrice > p.price
                        ? `Sale Price: ${p.price} ${currency} (Reduced from ${p.compareAtPrice} ${currency})`
                        : `Price: ${p.price} ${currency}`;

                    context += `- Product: ${p.name}\n  ${priceInfo}\n  Stock: ${p.stock ? p.stock.available : 'Unknown'}\n  Description: ${p.description ? p.description.substring(0, 150).replace(/\n/g, ' ') + '...' : 'No description'}\n---\n`;
                });
                context += "\nUsage Rule: When asked about price, quote the 'Sale Price' if available. Never invent prices.";
            } else {
                context += "\n\n--- PRODUCT CATALOG ---\nNo products currently available.";
            }

            // 4. Custom Instructions (Low Priority Default)
            if (workspace.knowledgeBase && workspace.knowledgeBase.customInstructions) {
                context += `\n\n--- ADDITIONAL INSTRUCTIONS ---\n${workspace.knowledgeBase.customInstructions}\n`;
            }

            return context;
        };

        const workspaceContext = buildSystemContext(req.workspace);

        // Helper: Create Notification
        const createNotification = async (workspaceId, type, title, message, priority = 'medium') => {
            try {
                await Notification.create({
                    workspace: workspaceId,
                    type,
                    title,
                    message,
                    priority,
                    isRead: false
                });
                console.log(`[INFO] Notification created: ${title}`);
            } catch (err) {
                console.error('[ERROR] Failed to create notification:', err);
            }
        };


        // --- PRODUCT INTERCEPTOR (REAL CATALOG) ---
        // Basic keyword search to see if user wants a specific product
        // If match found, return a CARD immediately
        try {
            if (req.workspace && req.workspace.productCatalog && req.workspace.productCatalog.products.length > 0) {
                const lowerMsg = message.toLowerCase();
                const products = req.workspace.productCatalog.products.filter(p => p.isActive);

                // Very simple matching strategy: if message contains "buy" or "price" or "show" AND a product name
                // OR if message is just a product name
                // Enhanced to match partial names better but avoid false positives
                // Enhanced matching strategy
                const foundProduct = products.find(p => {
                    const pName = p.name.toLowerCase();
                    const userQuery = lowerMsg;

                    // 1. Exact match or Message contains Product Name
                    if (userQuery.includes(pName)) return true;

                    // 2. Product Name contains User Query (Partial match)
                    // e.g. User says "iPhone 17" -> Matches "iPhone 17 Pro"
                    // Constraint: User query must be significant enough (> 3 chars) to avoid matching common letters
                    if (userQuery.length > 3 && pName.includes(userQuery)) return true;

                    return false;
                });

                // Trigger "Card" response if strong intent found
                const intentKeywords = ['buy', 'order', 'purchase', 'want', 'get', 'price', 'show', 'see', 'ซื้อ', 'ราคา', 'อยากได้', 'สนใจ', 'มี', 'รับ', 'เอา'];
                const hasIntent = intentKeywords.some(k => lowerMsg.includes(k));

                if (foundProduct && (hasIntent || lowerMsg.length < 50)) { // Short message match or Intent match
                    const productCard = {
                        type: 'card',
                        content: `Here are the details for ${foundProduct.name}.`,
                        structuredData: {
                            title: foundProduct.name,
                            description: foundProduct.description || 'Great choice!',
                            price: foundProduct.price,
                            imageUrl: (foundProduct.images && foundProduct.images.length > 0) ? foundProduct.images[0] : '',
                            url: foundProduct.metadata?.url || '#' // Or generate a checkout link if possible
                        }
                    };

                    let aiMessageResponse = null;
                    if (sessionId) {
                        const aiMessage = await Message.create({
                            role: 'ai',
                            content: productCard.content,
                            type: 'card',
                            structuredData: productCard.structuredData,
                            provider,
                            model: 'system-catalog',
                            sessionId,
                            metadata: { responseTime: 5 }
                        });
                        aiMessageResponse = aiMessage.toResponse();
                    }

                    return res.json({
                        success: true,
                        message: productCard.content,
                        userMessage: userMessage ? userMessage.toResponse() : null,
                        aiMessage: aiMessageResponse
                    });
                }
            }
        } catch (interceptorError) {
            console.error('[ERROR] Product Interceptor failed:', interceptorError);
            // Continue to LLM if interceptor fails
        }

        // --- PAYMENT INTERCEPTOR (Auto-Reply) ---
        // Detects payment/purchase intent and returns payment info immediately
        // Also triggers a "New Order" notification to the admin
        try {
            const paymentKeywords = ['pay', 'payment', 'transfer', 'buy now', 'checkout', 'ชำระเงิน', 'จ่ายเงิน', 'โอนเงิน', 'บัญชี', 'พร้อมเพย์', 'ตกลงซื้อ', 'รับค่ะ', 'รับครับ', 'เอาครับ', 'เอาค่ะ', 'ซื้อ', 'f', 'cf', 'จัดมา'];
            const isPaymentIntent = paymentKeywords.some(k => message.toLowerCase().includes(k));

            if (req.workspace && req.workspace.paymentSettings && isPaymentIntent) {
                const methods = req.workspace.paymentSettings.methods || {};
                let paymentInfo = `Here is the payment information:\n\n`;
                let hasPaymentInfo = false;

                if (methods.bankTransfer && methods.bankTransfer.enabled) {
                    paymentInfo += `🏦 **Bank Transfer**\nBank: ${methods.bankTransfer.bank}\nAccount: ${methods.bankTransfer.accountNumber}\nName: ${methods.bankTransfer.accountName}\n\n`;
                    hasPaymentInfo = true;
                }
                if (methods.qrCode && methods.qrCode.enabled) {
                    paymentInfo += `📱 **Scan to Pay**\n(PromptPay QR Code Available)\n\n`;
                    hasPaymentInfo = true;
                }

                paymentInfo += `Please upload the slip after payment.`;

                if (hasPaymentInfo) {
                    // 1. Send Response to User (Fast, no LLM)
                    let aiMessageResponse = null;
                    if (sessionId) {
                        const aiMessage = await Message.create({
                            role: 'ai',
                            content: paymentInfo,
                            provider: 'system', // specific provider for analytics
                            model: 'system-payment',
                            sessionId,
                            metadata: { responseTime: 2 } // Mock response time
                        });
                        aiMessageResponse = aiMessage.toResponse();

                        // 2. Create Notification for Admin
                        await createNotification(
                            req.workspace._id,
                            'new_order',
                            'New Purchase Intent',
                            `Customer in session ${sessionId} is attempting to pay/buy. Message: "${message}"`,
                            'high'
                        );
                    }

                    return res.json({
                        success: true,
                        message: paymentInfo,
                        userMessage: userMessage ? userMessage.toResponse() : null,
                        aiMessage: aiMessageResponse
                    });
                }
            }
        } catch (paymentError) {
            console.error('[ERROR] Payment Interceptor failed:', paymentError);
        }

        // --- LLM CALL ---

        const history = sessionId ? await Message.getChatHistory(sessionId, 10) : [];
        let formattedMessages = history.map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.content,
        }));

        if (!sessionId) {
            formattedMessages.push({ role: 'user', content: message });
        }

        // Construct System Prompt
        const baseSystemPrompt = req.workspace?.settings?.systemPrompt || "You are a helpful AI sales assistant.";
        const finalSystemPrompt = `
SYSTEM INSTRUCTIONS:
1. You are a helpful AI customer support assistant.
2. Your goal is to politely answer questions and assist customers.
3. Be CONCISE and SHORT. Do not be verbose.
4. DO NOT aggressively push products.
5. STRICTLY LIMIT your knowledge to the provided Context below.
6. If a product is not in the catalog, say you don't have it.
7. Currency is THB (Thai Baht).

${baseSystemPrompt}
${workspaceContext}
`;

        // Add System Message
        formattedMessages.unshift({ role: 'system', content: finalSystemPrompt });

        // Add Page Context (RAG-lite) if exists
        if (req.body.pageContext) {
            formattedMessages.push({
                role: 'system',
                content: `--- CURRENT PAGE CONTEXT ---\nURL: ${req.body.pageContext.url}\nTitle: ${req.body.pageContext.title}\nContent: ${req.body.pageContext.content}\n--- END CONTEXT ---`
            });
        }

        // Add Language Instruction for Ollama
        if (provider === 'ollama') {
            formattedMessages.unshift({
                role: 'system',
                content: 'ตรวจสอบภาษาของคำถาม: ตอบให้ตรงกับภาษาที่ผู้ใช้ถาม (ไทย/อังกฤษ)'
            });
        }

        // Call appropriate AI provider
        let aiResponse;
        try {
            switch (provider) {
                case 'ollama': aiResponse = await callOllama(formattedMessages, model); break;
                case 'openrouter': aiResponse = await callOpenRouter(formattedMessages, model); break;
                case 'groq': aiResponse = await callGroq(formattedMessages, model); break;
                case 'anthropic': aiResponse = await callAnthropic(formattedMessages, model); break;
                default: throw new Error('Invalid provider');
            }

            console.log(`[INFO] AI response received in ${aiResponse.responseTime}ms`);

            let aiMessageResponse = null;
            if (sessionId) {
                const aiMessage = await Message.create({
                    role: 'ai',
                    content: aiResponse.content,
                    provider,
                    model: aiResponse.model,
                    sessionId,
                    metadata: { responseTime: aiResponse.responseTime },
                });
                aiMessageResponse = aiMessage.toResponse();
            }

            res.json({
                success: true,
                message: aiResponse.content,
                userMessage: userMessage ? userMessage.toResponse() : null,
                aiMessage: aiMessageResponse,
            });
        } catch (aiError) {
            // ... existing error handling ...
            console.error('[ERROR] AI provider error:', aiError.message);
            // ... (keep existing error handling block)
            let errorMessageResponse = null;
            if (sessionId) {
                try {
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
                    errorMessageResponse = errorMessage.toResponse();
                } catch (dbError) {
                    console.error('[ERROR] Failed to save error message:', dbError.message);
                }
            }

            res.status(500).json({
                error: aiError.message,
                userMessage: userMessage ? userMessage.toResponse() : null,
                aiMessage: errorMessageResponse,
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
