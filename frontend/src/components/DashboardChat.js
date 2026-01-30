'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Send, Trash2, Bot, Sparkles } from 'lucide-react';
import { getProviders, sendMessage, clearChat } from '../lib/api';

export default function DashboardChat({ user }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [providers, setProviders] = useState({});
    const [selectedProvider, setSelectedProvider] = useState('groq');
    const [selectedModel, setSelectedModel] = useState('llama-3.1-8b-instant');
    const messagesEndRef = useRef(null);
    const [isProviderLoaded, setIsProviderLoaded] = useState(false);

    useEffect(() => {
        setMessages([{
            role: 'ai',
            content: `Hello ${user?.username || 'there'}! I'm your AI assistant. Test me out by typing a message below.`,
            model: 'System'
        }]);
        loadProviders();
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
            setIsProviderLoaded(true);
        } catch (err) {
            console.error('Failed to load providers:', err);
            setError('Could not connect to AI service.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setError('');
        setLoading(true);

        const tempUserMsg = { role: 'user', content: userMsg };
        setMessages(prev => [...prev, tempUserMsg]);

        try {
            const data = await sendMessage(userMsg, selectedProvider, selectedModel);
            setMessages(prev => [...prev, data.aiMessage]);
        } catch (err) {
            console.error('Failed:', err);
            setError('Failed to get response.');
            setMessages(prev => [...prev, { role: 'system', content: 'Failed to send message. Please check your backend connections.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        setMessages([{
            role: 'ai',
            content: 'Chat cleared. Ready for new test!',
            model: 'System'
        }]);
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800/50 overflow-hidden flex flex-col h-[500px] md:h-[600px] transition-all duration-300">
            {/* Header */}
            <div className="px-4 md:px-5 py-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800/50 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Test Your Bot</h3>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500">Live preview of your chat settings</p>
                        </div>
                    </div>

                    <button
                        onClick={handleClear}
                        className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        title="Clear Chat"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <select
                            value={selectedProvider}
                            onChange={(e) => {
                                const provider = e.target.value;
                                setSelectedProvider(provider);
                                if (providers[provider]?.models?.length > 0) {
                                    setSelectedModel(providers[provider].models[0]);
                                }
                            }}
                            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 dark:focus:border-purple-500/50 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-1.5 pl-7 pr-3 transition-all cursor-pointer font-medium appearance-none"
                            disabled={!isProviderLoaded}
                        >
                            <option value="groq">GROQ</option>
                        </select>
                        <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${providers[selectedProvider]?.available
                            ? 'bg-green-500 animate-pulse'
                            : 'bg-red-500'
                            }`}></span>
                    </div>

                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 dark:focus:border-purple-500/50 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-1.5 px-3 transition-all cursor-pointer"
                        disabled={!isProviderLoaded}
                    >
                        {isProviderLoaded ? (
                            providers[selectedProvider]?.models?.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))
                        ) : (
                            <option>Loading models...</option>
                        )}
                    </select>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-950/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-sm shadow-md shadow-purple-500/10'
                            : msg.model === 'System'
                                ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs py-2 px-3.5 rounded-xl border border-dashed border-gray-200 dark:border-gray-700/50'
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/50 rounded-bl-sm shadow-sm'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start fade-in">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 md:p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800/50 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message to test..."
                        className="flex-1 min-w-0 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 dark:focus:border-purple-500/50 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all text-sm"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="flex-shrink-0 w-10 h-10 md:w-auto md:px-4 md:py-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
