'use client';

import { useState, useEffect, useRef } from 'react';
import { getProviders, getChatHistory, sendMessage, clearChat } from '../lib/api';

export default function ChatInterface() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [providers, setProviders] = useState({});
    const [selectedProvider, setSelectedProvider] = useState('ollama');
    const [selectedModel, setSelectedModel] = useState('llama3');
    const messagesEndRef = useRef(null);

    // Load providers and chat history on mount
    useEffect(() => {
        loadProviders();
        loadHistory();
    }, []);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadProviders = async () => {
        try {
            const data = await getProviders();
            setProviders(data.providers);

            // Find first available provider
            const availableProvider = Object.keys(data.providers).find(
                key => data.providers[key].available
            );

            if (availableProvider) {
                setSelectedProvider(availableProvider);
                setSelectedModel(data.providers[availableProvider].models[0]);
            }
        } catch (err) {
            console.error('Failed to load providers:', err);
            setError('Failed to load AI providers. Please check if the backend is running.');
        }
    };

    const loadHistory = async () => {
        try {
            const history = await getChatHistory();
            setMessages(history);
        } catch (err) {
            console.error('Failed to load history:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!input.trim()) return;

        if (input.length > 500) {
            setError('Message must be less than 500 characters');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const data = await sendMessage(input, selectedProvider, selectedModel);

            setMessages(prev => [...prev, data.userMessage, data.aiMessage]);
            setInput('');
        } catch (err) {
            console.error('Failed to send message:', err);
            setError(err.response?.data?.error || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = async () => {
        if (!window.confirm('Are you sure you want to clear all messages?')) {
            return;
        }

        try {
            await clearChat();
            setMessages([]);
            setError('');
        } catch (err) {
            console.error('Failed to clear chat:', err);
            setError('Failed to clear chat. Please try again.');
        }
    };

    const handleProviderChange = (e) => {
        const provider = e.target.value;
        setSelectedProvider(provider);

        // Update model to first available for this provider
        if (providers[provider]?.models?.length > 0) {
            setSelectedModel(providers[provider].models[0]);
        }
    };

    const formatResponseTime = (ms) => {
        if (!ms) return '';
        return `${(ms / 1000).toFixed(1)}s`;
    };

    return (
        <div className="max-w-5xl mx-auto h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white rounded-t-xl shadow-lg p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">🤖 Mini Chat Ollama</h1>

                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Provider Selection */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Provider:</label>
                            <select
                                value={selectedProvider}
                                onChange={handleProviderChange}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={loading}
                            >
                                {Object.entries(providers).map(([key, provider]) => (
                                    <option key={key} value={key} disabled={!provider.available}>
                                        {provider.name} {!provider.available && '(Not configured)'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Model Selection */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Model:</label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={loading}
                            >
                                {providers[selectedProvider]?.models?.map((model) => (
                                    <option key={model} value={model}>
                                        {model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Chat Button */}
                        <button
                            onClick={handleClearChat}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            disabled={loading || messages.length === 0}
                        >
                            Clear Chat
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 bg-white overflow-y-auto p-6 chat-messages">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <p className="text-xl mb-2">👋 Welcome to Mini Chat Ollama!</p>
                            <p className="text-sm">Send a message to get started</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={msg._id || index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg p-4 message-bubble ${msg.role === 'user'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                                        }`}
                                >
                                    <div className="text-xs font-semibold mb-1 opacity-75">
                                        {msg.role === 'user' ? '👤 You' : `🤖 AI (${msg.model})`}
                                    </div>
                                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                                    {msg.role === 'ai' && msg.metadata?.responseTime && (
                                        <div className="text-xs mt-2 opacity-60">
                                            Response time: {formatResponseTime(msg.metadata.responseTime)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        {loading && (
                            <div className="flex justify-start fade-in">
                                <div className="max-w-[70%] rounded-lg p-4 bg-gray-100 border border-gray-200">
                                    <div className="text-xs font-semibold mb-1 opacity-75">
                                        🤖 AI ({selectedModel})
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot"></div>
                                        </div>
                                        <span className="text-sm text-gray-600">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="bg-white rounded-b-xl shadow-lg border-t border-gray-200">
                {/* Error Message */}
                {error && (
                    <div className="px-6 pt-4">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            ⚠️ {error}
                        </div>
                    </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 chat-input"
                            disabled={loading}
                            maxLength={500}
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-primary"
                            disabled={loading || !input.trim()}
                        >
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </div>

                    {/* Character Counter */}
                    <div className="mt-2 text-xs text-gray-500 text-right">
                        {input.length}/500
                    </div>
                </form>
            </div>
        </div>
    );
}
