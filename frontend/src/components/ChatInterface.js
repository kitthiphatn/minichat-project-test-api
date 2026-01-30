'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Send, Trash2, Sparkles } from 'lucide-react';
import { getProviders, getChatHistory, sendMessage, clearChat } from '../lib/api';

export default function ChatInterface() {
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [providers, setProviders] = useState({});
    const [selectedProvider, setSelectedProvider] = useState('groq');
    const [selectedModel, setSelectedModel] = useState('llama-3.1-8b-instant');
    const messagesEndRef = useRef(null);

    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!token || !storedUser) {
            router.push('/auth');
            return;
        }

        setUser(JSON.parse(storedUser));
        setAuthLoading(false);
    }, [router]);

    useEffect(() => {
        if (!authLoading) {
            loadProviders();
            loadHistory();
        }
    }, [authLoading]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (authLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse shadow-lg shadow-purple-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-gray-400 text-sm">Loading chat...</p>
                </div>
            </div>
        );
    }

    const loadProviders = async () => {
        try {
            const data = await getProviders();
            setProviders(data.providers);

            const availableProvider = Object.keys(data.providers).find(
                key => data.providers[key].available
            );

            if (availableProvider) {
                setSelectedProvider(availableProvider);
                setSelectedModel(data.providers[availableProvider].models[0]);
            }
        } catch (err) {
            console.error('Failed to load providers:', err);
            setError('Failed to load AI providers.');
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
            setError(err.response?.data?.error || 'Failed to send message.');
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = async () => {
        if (!window.confirm('Clear all messages?')) return;

        try {
            await clearChat();
            setMessages([]);
            setError('');
        } catch (err) {
            console.error('Failed to clear chat:', err);
            setError('Failed to clear chat.');
        }
    };

    const formatResponseTime = (ms) => {
        if (!ms) return '';
        return `${(ms / 1000).toFixed(1)}s`;
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/50 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-gray-100 dark:border-gray-800/50 bg-white dark:bg-gray-900 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">AI Chat</h2>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">Powered by Groq</p>
                    </div>
                </div>
                <button
                    onClick={handleClearChat}
                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
                    disabled={loading || messages.length === 0}
                    title="Clear Chat"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 bg-gray-50/50 dark:bg-gray-950/50">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                                <Sparkles className="w-7 h-7 text-purple-400" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">Start a conversation</h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Type a message to chat with your AI assistant</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 max-w-3xl mx-auto pb-2">
                        {messages.map((msg, index) => (
                            <div
                                key={msg._id || index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
                            >
                                <div
                                    className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-sm shadow-md shadow-purple-500/10'
                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/50 rounded-bl-sm shadow-sm'
                                    }`}
                                >
                                    <div className="text-[10px] uppercase tracking-wider font-bold mb-0.5 opacity-60">
                                        {msg.role === 'user' ? 'You' : msg.model || 'AI'}
                                    </div>
                                    <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                        {msg.content}
                                    </div>
                                    {msg.role === 'ai' && msg.metadata?.responseTime && (
                                        <div className="text-[9px] mt-1.5 opacity-40 text-right">
                                            {formatResponseTime(msg.metadata.responseTime)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start fade-in">
                                <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} className="h-2" />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 border-t border-gray-100 dark:border-gray-800/50 bg-white dark:bg-gray-900 flex-shrink-0">
                {error && (
                    <div className="mb-2.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex items-end gap-2">
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
                            placeholder="Type a message..."
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 dark:focus:border-purple-500/50 resize-none overflow-hidden min-h-[42px] max-h-[100px] text-sm transition-all"
                            disabled={loading}
                            rows={1}
                            style={{ height: 'auto', minHeight: '42px' }}
                        />
                        <div className="absolute bottom-1.5 right-2.5 text-[9px] text-gray-400 dark:text-gray-600">
                            {input.length}/500
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="h-[42px] w-[42px] bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                        disabled={loading || !input.trim()}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
