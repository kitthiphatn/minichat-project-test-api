'use client';

import React, { useState } from 'react';
import { MessageCircle, Send, X, Minus, Bot } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const UPLOAD_BASE_URL = API_URL.replace(/\/api$/, '');

// Helper to get full logo URL
const getLogoUrl = (logo) => {
    if (!logo) return null;
    if (logo.startsWith('/')) return UPLOAD_BASE_URL + logo;
    return logo;
};

export default function WidgetPreview({
    settings = {
        widgetColor: '#667eea',
        welcomeMessage: 'Hi there! How can I help you?',
        botName: 'Support Agent',
        position: 'right'
    },
    isOpen = true
}) {
    const positionClasses = settings.position === 'left' ? 'left-4' : 'right-4';
    const logoUrl = getLogoUrl(settings.logo);

    return (
        <div className="relative w-full h-[500px] lg:h-[600px] bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-inner group transition-all">
            {/* Mock Website Grid Background */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Mock Website Content */}
            <div className="absolute top-8 left-8 right-8 space-y-4 opacity-10 pointer-events-none select-none">
                <div className="h-8 w-1/3 bg-gray-400 rounded"></div>
                <div className="h-32 w-full bg-gray-400 rounded"></div>
                <div className="flex gap-4">
                    <div className="h-40 w-1/2 bg-gray-400 rounded"></div>
                    <div className="h-40 w-1/2 bg-gray-400 rounded"></div>
                </div>
            </div>

            {/* The Widget */}
            <div className={`absolute bottom-4 ${positionClasses} flex flex-col items-end gap-4 transition-all duration-300 z-10`}>

                {/* Chat Window */}
                <div className={`
                    bg-white dark:bg-gray-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right
                    w-[300px] h-[420px] sm:w-[350px] sm:h-[500px] rounded-2xl
                    ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}
                `}
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
                            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200">
                                <Minus className="w-4 h-4 text-white/90" />
                            </button>
                            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200">
                                <X className="w-4 h-4 text-white/90" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 bg-gray-50/80 dark:bg-gray-900/50 p-4 sm:p-5 overflow-y-auto overflow-x-hidden space-y-5 sm:space-y-6">
                        {/* Welcome Message */}
                        <div className="flex gap-3 max-w-[90%] group">
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

                        {/* Mock User Message */}
                        <div className="flex gap-3 max-w-[90%] ml-auto flex-row-reverse group">
                            <div className="p-3 bg-gray-800 dark:bg-gray-700 rounded-2xl rounded-tr-none shadow-sm text-[13px] sm:text-[14px] leading-relaxed text-white">
                                Hello! Can I test this widget?
                            </div>
                        </div>

                        {/* Mock AI Reply (Typing) */}
                        <div className="flex gap-3 max-w-[90%] visible">
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
                    </div>

                    {/* Input Area */}
                    <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                disabled
                                className="w-full pl-4 pr-11 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none transition-all dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 cursor-not-allowed opacity-75"
                            />
                            <button
                                disabled
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all opacity-50 cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
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

                {/* Floating Action Button (Launcher) */}
                <button
                    className={`
                        w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95
                        ${isOpen ? 'rotate-90 opacity-0 pointer-events-none absolute' : 'rotate-0 opacity-100 relative'}
                    `}
                    style={{ background: settings.widgetColor }}
                >
                    <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
            </div>
        </div>
    );
}
