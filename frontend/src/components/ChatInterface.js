'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getProviders, getChatHistory, sendMessage, clearChat } from '../lib/api';

export default function ChatInterface() {
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [providers, setProviders] = useState({});
    const [selectedProvider, setSelectedProvider] = useState('ollama');
    const [selectedModel, setSelectedModel] = useState('llama3');
    const [darkMode, setDarkMode] = useState(false);
    const messagesEndRef = useRef(null);

    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Load dark mode preference and user from localStorage
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);

        // Check for logged in user
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!token || !storedUser) {
            router.push('/auth');
            return;
        }

        setUser(JSON.parse(storedUser));
        setAuthLoading(false);
    }, [router]);

    // Load providers and chat history on mount
    useEffect(() => {
        if (!authLoading) {
            loadProviders();
            loadHistory();
        }
    }, [authLoading]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/auth');
    };

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode.toString());
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Prevent rendering while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black">
                {/* Background Ambience */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />

                <div className="flex flex-col items-center gap-4 z-10">
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                    <p className="text-gray-400 text-sm animate-pulse">Loading workspace...</p>
                </div>
            </div>
        );
    }

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
        <div className={`max-w-5xl mx-auto h-[100dvh] flex flex-col transition-colors ${darkMode ? 'dark' : ''}`}>
            {/* Header */}
            <div className={`rounded-b-none md:rounded-t-xl shadow-lg p-3 md:p-6 transition-colors z-20 ${darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <div className="flex items-center gap-2 md:gap-3">
                            <h1 className={`text-lg md:text-2xl font-bold truncate transition-colors ${darkMode ? 'text-white' : 'text-gray-800'
                                }`}>🤖 Mini Chat</h1>

                            {user && (
                                <span className={`text-xs md:text-sm px-2 py-0.5 rounded-full whitespace-nowrap ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                    Hi, {user.username}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 md:hidden">
                            {/* Mobile Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className={`p-2 rounded-lg transition-colors ${darkMode
                                    ? 'bg-gray-700 text-yellow-400'
                                    : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {darkMode ? '☀️' : '🌙'}
                            </button>

                            {user && (
                                <button
                                    onClick={handleLogout}
                                    className={`p-2 rounded-lg text-xs font-medium transition-colors ${darkMode
                                        ? 'bg-red-900/20 text-red-400'
                                        : 'bg-red-50 text-red-600'
                                        }`}
                                >
                                    Log out
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        {/* Desktop Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-lg transition-colors ${darkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>

                        {user ? (
                            <button
                                onClick={handleLogout}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${darkMode
                                    ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40'
                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                    }`}
                            >
                                Logout
                            </button>
                        ) : (
                            <a
                                href="/auth"
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${darkMode
                                    ? 'bg-purple-900/20 text-purple-400 hover:bg-purple-900/40'
                                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                                    }`}
                            >
                                Login
                            </a>
                        )}
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                        {/* Provider Selection */}
                        <div className="flex items-center gap-2 min-w-fit">
                            <select
                                value={selectedProvider}
                                onChange={handleProviderChange}
                                className={`px-2 py-1.5 md:px-3 md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors cursor-pointer ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                disabled={loading}
                            >
                                {Object.entries(providers).map(([key, provider]) => (
                                    <option key={key} value={key} disabled={!provider.available}>
                                        {provider.name} {!provider.available && '(N/A)'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Model Selection */}
                        <div className="flex items-center gap-2 min-w-fit flex-1 md:flex-initial">
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className={`w-full md:w-auto px-2 py-1.5 md:px-3 md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors cursor-pointer ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                    }`}
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
                            className="p-2 md:px-4 md:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
                            disabled={loading || messages.length === 0}
                            title="Clear Chat"
                        >
                            <span className="md:hidden">🗑️</span>
                            <span className="hidden md:inline">Clear</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className={`flex-1 overflow-y-auto p-3 md:p-6 chat-messages transition-colors relative z-0 ${darkMode ? 'bg-gray-900' : 'bg-white'
                }`}>
                {/* Background Ambience (Fixed & Optimized) */}
                {darkMode && (
                    <>
                        <div className="fixed top-20 left-[-20%] w-[80%] h-[50%] rounded-full bg-purple-900/10 blur-[60px] pointer-events-none" />
                        <div className="fixed bottom-20 right-[-20%] w-[80%] h-[50%] rounded-full bg-blue-900/10 blur-[60px] pointer-events-none" />
                    </>
                )}

                {messages.length === 0 ? (
                    <div className={`flex items-center justify-center h-full transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                                <span className="text-3xl">👋</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold mb-2">Welcome to Mini Chat</h2>
                            <p className="text-sm md:text-base opacity-80">Start a conversation with your AI assistant</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-4xl mx-auto relative z-10 pb-4">
                        {messages.map((msg, index) => (
                            <div
                                key={msg._id || index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
                            >
                                <div
                                    className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : darkMode
                                            ? 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-md'
                                        }`}
                                >
                                    <div className="text-[10px] uppercase tracking-wider font-bold mb-1 opacity-70">
                                        {msg.role === 'user' ? 'You' : msg.model}
                                    </div>
                                    <div className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
                                        {msg.content}
                                    </div>
                                    {msg.role === 'ai' && msg.metadata?.responseTime && (
                                        <div className="text-[10px] mt-2 opacity-50 text-right">
                                            {formatResponseTime(msg.metadata.responseTime)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        {loading && (
                            <div className="flex justify-start fade-in">
                                <div className={`px-4 py-3 rounded-2xl rounded-bl-none border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className={`p-3 md:p-4 border-t transition-colors z-20 ${darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
                }`}>

                {/* Error Banner */}
                {error && (
                    <div className="mb-3 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2 animate-in slide-in-from-bottom-2">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-end gap-2 md:gap-3">
                    <div className="relative flex-1">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Message..."
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none overflow-hidden min-h-[44px] max-h-[120px] text-base md:text-sm transition-colors ${darkMode
                                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500'
                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                                }`}
                            disabled={loading}
                            rows={1}
                            style={{ height: 'auto', minHeight: '44px' }}
                        />
                        <div className={`absolute bottom-2 right-2 text-[10px] ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                            {input.length}/500
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="h-[44px] w-[44px] md:w-auto md:px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                        disabled={loading || !input.trim()}
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span className="hidden md:inline font-medium">Send</span>
                                <span className="md:hidden">➤</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
