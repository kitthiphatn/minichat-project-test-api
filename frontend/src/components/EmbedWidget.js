'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minus, Bot, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const UPLOAD_BASE_URL = API_URL.replace(/\/api$/, '');

// Helper to get full logo URL
const getLogoUrl = (logo) => {
    if (!logo) return null;
    if (logo.startsWith('/')) return UPLOAD_BASE_URL + logo;
    return logo;
};

export default function EmbedWidget({
    settings,
    isOpen,
    onToggle
}) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const sessionIdRef = useRef('');

    const [pageContext, setPageContext] = useState(null);

    // Context Listener
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === 'MINICHAT_CONTEXT') {
                setPageContext(event.data);
                console.log('[EmbedWidget] Received context:', event.data.title);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Initialize session ID
    useEffect(() => {
        let sid = localStorage.getItem('widgetSessionId');
        if (!sid) {
            sid = 'sess_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('widgetSessionId', sid);
        }
        sessionIdRef.current = sid;
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const sid = sessionIdRef.current;
            const response = await axios.post(`${API_URL}/chat/message`, {
                message: userMsg.content,
                workspaceId: settings.workspaceId,
                sessionId: sid,
                pageContext: pageContext // Send captured context
            }, {
                headers: {
                    'X-Session-ID': sid
                }
            });

            // Assuming API returns { reply: "..." } or similar structure
            // Matching standard response from widget-template.js logic
            const replyContent = response.data.reply || response.data.message || response.data.aiMessage?.content;

            const botMsg = { role: 'bot', content: replyContent };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMsg = { role: 'bot', content: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const logoUrl = getLogoUrl(settings.logo);
    const positionClasses = settings.position === 'left' ? 'left-0' : 'right-0';
    // Note: In iframe, we usually take up accessible space, but the iframe itself is positioned. 
    // However, the internal div structure mimics the widget being at bottom-right of the iframe.
    // Since the iframe will be resized to fit, we can just fill the container or stick to bottom-right.
    // For "Hosted Iframe", the iframe IS the viewport for the widget.

    return (
        <div className={`relative w-full h-full bg-transparent overflow-hidden font-sans`}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                body { background: transparent; }
            `}</style>

            {/* Chat Window */}
            <div className={`
                absolute bottom-0 ${positionClasses}
                bg-white dark:bg-gray-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-300
                w-full h-full rounded-2xl border border-gray-200 dark:border-gray-800
                ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}
            `}
                style={{
                    // If it's closed, we hide it completely to let the button be visible if we were rendering button here.
                    // But in iframe architecture, the iframe resizes. 
                    // If isOpen is false, the iframe should be small (button size).
                    // If isOpen is true, the iframe should be large.
                    // This component fills the iframe.
                }}
            >
                {/* Header */}
                <div
                    className="py-4 px-4 sm:py-5 sm:px-5 flex items-center justify-between text-white shadow-md relative overflow-hidden flex-shrink-0"
                    style={{ background: settings.widgetColor }}
                >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm border border-white/10 overflow-hidden">
                            {logoUrl ? (
                                <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Bot className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-bold text-[14px] sm:text-[15px] leading-tight text-white/95">{settings.botName || 'Support Agent'}</h3>
                            <div className="flex items-center gap-1.5 opacity-90 mt-0.5">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse border-[1.5px] border-white/20 shadow-sm"></span>
                                <span className="text-xs font-medium text-white/90">Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onToggle(false)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                        >
                            <Minus className="w-4 h-4 text-white/90" />
                        </button>
                        <button
                            onClick={() => onToggle(false)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                        >
                            <X className="w-4 h-4 text-white/90" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 bg-gray-50/80 dark:bg-gray-900/50 p-4 sm:p-5 overflow-y-auto overflow-x-hidden space-y-4">
                    {/* Welcome Message */}
                    <div className="flex gap-3 max-w-[90%] group animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden"
                            style={{ background: settings.widgetColor }}
                        >
                            {logoUrl ? (
                                <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                            ) : 'AI'}
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 text-[13px] sm:text-[14px] leading-relaxed text-gray-700 dark:text-gray-200">
                            {settings.welcomeMessage}
                        </div>
                    </div>

                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-3 max-w-[90%] group animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                            {msg.role === 'bot' && (
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden"
                                    style={{ background: settings.widgetColor }}
                                >
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                                    ) : 'AI'}
                                </div>
                            )}

                            {/* Message Content Renderer */}
                            <div className="flex flex-col gap-2">
                                {msg.type === 'card' && msg.structuredData ? (
                                    /* Product Card */
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden max-w-[280px]">
                                        {msg.structuredData.imageUrl && (
                                            <div className="h-32 w-full bg-gray-100 dark:bg-gray-700 relative">
                                                <img src={msg.structuredData.imageUrl} alt={msg.structuredData.title} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="p-3">
                                            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 mb-1 line-clamp-2">{msg.structuredData.title}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-3">{msg.structuredData.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400">฿{msg.structuredData.price?.toLocaleString()}</span>
                                                <button
                                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                                                    onClick={() => window.open(msg.structuredData.url || '#', '_blank')}
                                                >
                                                    Buy Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Text Bubble */
                                    <div className={`p-3 rounded-2xl shadow-sm text-[13px] sm:text-[14px] leading-relaxed 
                                        ${msg.role === 'user'
                                            ? 'bg-gray-800 dark:bg-gray-700 text-white rounded-tr-none' // User style
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none' // Bot style
                                        }`
                                    }
                                        style={msg.role === 'user' ? { background: settings.widgetColor } : {}}
                                    >
                                        {msg.content}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex gap-3 max-w-[90%] visible animate-in fade-in duration-300">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden"
                                style={{ background: settings.widgetColor }}
                            >
                                {logoUrl ? (
                                    <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                                ) : 'AI'}
                            </div>
                            <div className="px-3 py-3 sm:px-4 sm:py-4 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 flex gap-1.5 items-center">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full pl-4 pr-11 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none transition-all dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/50"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isTyping}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ color: settings.widgetColor }}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="mt-2 sm:mt-3 text-center">
                        <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-gray-600 flex items-center justify-center gap-1.5 opacity-80">
                            Powered by <span className="font-bold text-gray-500 dark:text-gray-500">MiniChat</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* The Floating Button is NOT needed here because the Iframe logic will handle swapping between "Window" and "Button" modes via resizing.
                However, if we are in "Button Mode", we need to render the button. 
                Wait, if the iframe is small, we render the button. If large, we render the window. 
                The 'isOpen' prop determines this.
            */}
            <button
                onClick={() => onToggle(true)}
                className={`
                    absolute bottom-0 right-0
                    w-[60px] h-[60px] rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95
                    ${isOpen ? 'opacity-0 pointer-events-none scale-0' : 'opacity-100 scale-100'}
                `}
                style={{ background: settings.widgetColor }}
            >
                <MessageCircle className="w-7 h-7" />
            </button>
        </div>
    );
}
