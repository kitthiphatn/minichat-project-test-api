'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Settings, CreditCard, LogOut, Sparkles, Sun, Moon, Languages, X, Shield } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Sidebar({ user, workspace, onLogout, isOpen, onClose }) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const { language, changeLanguage, t } = useLanguage();

    const navigation = [
        { name: t('sidebar.dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { name: t('sidebar.widgets'), href: '/dashboard/widgets', icon: MessageSquare },
        { name: t('sidebar.settings'), href: '/dashboard/settings', icon: Settings },
        { name: t('sidebar.billing'), href: '/dashboard/billing', icon: CreditCard },
    ];

    if (user?.role === 'admin') {
        navigation.push({ name: 'Admin', href: '/dashboard/admin', icon: Shield });
    }

    const toggleLanguage = () => {
        changeLanguage(language === 'en' ? 'th' : 'en');
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors duration-300">
            {/* Mobile Close Button */}
            <button
                onClick={onClose}
                className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-50"
            >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">MiniChat</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('sidebar.platform_subtitle')}</p>
                </div>
            </div>

            {/* Workspace Info */}
            {workspace && (
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('sidebar.workspace')}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1 truncate" title={workspace.name}>
                        {workspace.name}
                    </p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                        {workspace.plan || 'free'} {t('sidebar.plan')}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                }
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile & Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
                {/* Theme & Language Toggles Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500"
                        title={theme === 'dark' ? t('sidebar.theme_light') : t('sidebar.theme_dark')}
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                    </button>

                    {/* Language Toggle */}
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500"
                        title="Change Language"
                    >
                        <Languages className="w-4 h-4" />
                        <span>{language === 'en' ? 'EN' : 'TH'}</span>
                    </button>
                </div>

                {user && (
                    <div className="flex items-center gap-3 pt-1">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    {t('sidebar.logout')}
                </button>
            </div>
        </div>
    );
}