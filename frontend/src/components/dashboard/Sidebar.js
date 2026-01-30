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
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800/50 transition-colors duration-300">
            {/* Mobile Close Button */}
            <button
                onClick={onClose}
                className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-50"
            >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800/50">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">MiniChat</h1>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{t('sidebar.platform_subtitle')}</p>
                </div>
            </div>

            {/* Workspace Info */}
            {workspace && (
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800/50">
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">{t('sidebar.workspace')}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate" title={workspace.name}>
                        {workspace.name}
                    </p>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20">
                        {workspace.plan || 'free'} {t('sidebar.plan')}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`
                                flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-100 dark:border-purple-500/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                                }
                            `}
                        >
                            <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile & Footer */}
            <div className="border-t border-gray-100 dark:border-gray-800/50 p-4 space-y-3">
                {/* Theme & Language Toggles */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-500/30"
                        title={theme === 'dark' ? t('sidebar.theme_light') : t('sidebar.theme_dark')}
                    >
                        {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                        <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                    </button>

                    <button
                        onClick={toggleLanguage}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-500/30"
                        title="Change Language"
                    >
                        <Languages className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'EN' : 'TH'}</span>
                    </button>
                </div>

                {/* User Info */}
                {user && (
                    <div className="flex items-center gap-3 px-1 pt-1">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shadow-purple-500/20 ring-2 ring-white dark:ring-gray-900">
                            {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user.username}</p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    {t('sidebar.logout')}
                </button>
            </div>
        </div>
    );
}
