'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Paperclip, Smile, Loader2, RotateCcw, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { sendMessage } from '@/lib/api';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function WidgetPreview({ config, workspace }) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const [sessionId, setSessionId] = useState('');

    // Default styles based on config
    const styles = {
        primaryColor: config?.aiSettings?.widgetColor || config?.widgetColor || '#2563eb',
        position: config?.aiSettings?.position || config?.position || 'right',
        botName: config?.aiSettings?.botName || config?.botName || 'Support Agent',
        welcomeMessage: config?.aiSettings?.welcomeMessage || config?.welcomeMessage || 'Hello! How can I help you?',
    };

    useEffect(() => {
        // Initialize or reset session
        setSessionId(`preview-${Date.now()}`);
        setMessages([
            { role: 'assistant', content: styles.welcomeMessage }
        ]);
    }, [config, workspace]); // Reset when config changes

    useEffect(() => {
        // Prevent page scroll, only scroll the widget container
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [messages, isTyping, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setInput('');

        // Add user message immediately
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        try {
            // Send to Real Backend API
            // Pass workspace._id to enable backend context injection (Product Catalog, Payments, etc.)
            const response = await sendMessage(userMsg, 'groq', 'llama-3.1-8b-instant', workspace?._id);

            if (response && response.aiMessage) {
                setMessages(prev => [...prev, response.aiMessage]);
            }
        } catch (error) {
            console.error('Preview chat error:', error);
            setMessages(prev => [...prev, {
                role: 'system',
                content: 'Error: Could not connect to AI. Please check your API usage or settings.'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleReset = () => {
        setSessionId(`preview-${Date.now()}`);
        setMessages([{ role: 'assistant', content: styles.welcomeMessage }]);
    };

    return (
        <div className="relative h-[600px] w-full bg-gray-100 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <p className="text-gray-400 font-medium text-sm">Live Preview (Interactive)</p>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white/50 dark:bg-black/20 px-2 py-1 rounded transition-colors"
                >
                    <RotateCcw className="w-3 h-3" />
                    Reset Chat
                </button>
            </div>

            {/* Widget Container */}
            <div className={`absolute bottom-8 ${styles.position === 'left' ? 'left-8' : 'right-8'} flex flex-col items-end space-y-4 z-20`}>

                {/* Chat Window */}
                <div
                    className={`transition-all duration-300 transform origin-bottom-${styles.position === 'left' ? 'left' : 'right'} ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'
                        } w-[350px] h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700`}
                >
                    {/* Header */}
                    <div
                        style={{ backgroundColor: styles.primaryColor }}
                        className="p-4 flex items-center justify-between text-white"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
                                {(config?.aiSettings?.logo || config?.logo) ? (
                                    <img
                                        src={config?.aiSettings?.logo || config?.logo}
                                        alt="Bot"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="relative flex items-center justify-center w-full h-full">
                                        <MessageCircle className="w-6 h-6" />
                                        <Star className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300 absolute top-2 right-2 border-white rounded-full" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">{styles.botName}</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-xs opacity-90">Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900/50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role !== 'user' && msg.role !== 'system' && (
                                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden mr-2"
                                        style={{ backgroundColor: styles.primaryColor }}
                                    >
                                        {(config?.aiSettings?.logo || config?.logo) ? (
                                            <img
                                                src={config?.aiSettings?.logo || config?.logo}
                                                alt="Bot"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : 'AI'}
                                    </div>
                                )}
                                {/* Message Bubble */}
                                <div className={`
                                    max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
                                    ${msg.role === 'user'
                                        ? 'rounded-tr-none shadow-md'
                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm'
                                    } ${msg.role === 'system' ? 'w-full text-center text-xs text-red-500 bg-red-50 border-red-100' : ''}`}
                                    style={msg.role === 'user' ? { backgroundColor: styles.primaryColor, color: 'white' } : {}}
                                >
                                    {msg.content}
                                </div>

                                {/* Product Card (if type is card) */}
                                {msg.type === 'card' && msg.structuredData && (
                                    <div className="mt-1 w-full max-w-[300px] bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md transition-transform hover:scale-[1.02]">
                                        {msg.structuredData.imageUrl && (
                                            <div className="h-32 w-full bg-gray-100 dark:bg-gray-900 overflow-hidden relative">
                                                <img
                                                    src={msg.structuredData.imageUrl}
                                                    alt={msg.structuredData.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-3">
                                            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 line-clamp-1" title={msg.structuredData.title}>
                                                {msg.structuredData.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                {msg.structuredData.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="font-bold text-primary dark:text-blue-400" style={{ color: styles.primaryColor }}>
                                                    ฿{msg.structuredData.price?.toLocaleString()}
                                                </span>
                                                <a
                                                    href={msg.structuredData.url || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] px-2 py-1 rounded text-white font-medium transition-opacity hover:opacity-90"
                                                    style={{ background: styles.primaryColor }}
                                                >
                                                    View
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                        <form onSubmit={handleSend} className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                disabled={isTyping}
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm disabled:opacity-50"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <Paperclip className="w-4 h-4" />
                                </button>
                                <button type="submit"
                                    disabled={!input.trim() || isTyping}
                                    style={{ color: input.trim() && !isTyping ? styles.primaryColor : undefined }}
                                    className={`p-1.5 transition-colors ${(!input.trim() || isTyping) && 'text-gray-300 cursor-not-allowed'}`}
                                >
                                    {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        </form>
                        <div className="flex justify-center mt-2">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                Powered by <span className="font-semibold text-gray-500 dark:text-gray-400">MiniChat</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Launcher Button Wrapper */}
                {!isOpen && (
                    <div className="flex items-center gap-2 group">
                        {/* Drag Handle (Visible on hover) */}
                        <div className={`p-2 rounded-full bg-black/10 dark:bg-white/10 cursor-move opacity-0 group-hover:opacity-100 transition-opacity ${styles.position === 'left' ? 'order-last' : 'order-first'}`}>
                            <div className="w-4 h-4 text-gray-500 dark:text-gray-400">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="5 9 2 12 5 15"></polyline>
                                    <polyline points="9 5 12 2 15 5"></polyline>
                                    <polyline points="15 19 12 22 9 19"></polyline>
                                    <polyline points="19 9 22 12 19 15"></polyline>
                                    <circle cx="12" cy="12" r="1"></circle>
                                </svg>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(true)}
                            style={{ backgroundColor: styles.primaryColor }}
                            className="w-14 h-14 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white transform hover:scale-110 transition-all duration-300"
                        >
                            <div className="relative">
                                <MessageCircle className="w-8 h-8" />
                                <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 absolute -top-1 -right-1" />
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
