'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Users, TrendingUp, Zap } from 'lucide-react';
import { getWorkspace, getUser, getToken } from '@/lib/auth';
import axios from 'axios';
import DashboardChat from '../../components/DashboardChat';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardPage() {
    const [workspace, setWorkspace] = useState(null);
    const [user, setUser] = useState(null);
    const { t } = useLanguage();

    useEffect(() => {
        // Initial load from local storage/cache (fast)
        const cachedWorkspace = getWorkspace();
        const cachedUser = getUser();
        if (cachedWorkspace) setWorkspace(cachedWorkspace);
        if (cachedUser) setUser(cachedUser);

        // Fetch fresh data from server (sync)
        const fetchFreshData = async () => {
            try {
                const token = getToken();
                if (!token) return;

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.clubfivem.com/api'}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    const { data: user, workspace } = response.data;
                    setUser(user);
                    setWorkspace(workspace);
                    // Update local storage to keep it fresh
                    // We need to import setAuthData for this, or just do it manually if lazy, 
                    // but better to use setAuthData if we can import it.
                    // Let's assume we can modify imports below.
                    localStorage.setItem('user', JSON.stringify(user));
                    if (workspace) {
                        localStorage.setItem('workspace', JSON.stringify(workspace));
                    }
                }
            } catch (error) {
                console.error('Failed to sync dashboard data:', error);
            }
        };

        fetchFreshData();
    }, []);

    const stats = [
        {
            name: t('dashboard.stats.messages'),
            value: workspace?.usage?.messagesThisMonth || 0,
            limit: workspace?.usage?.messagesLimit || 250,
            icon: MessageSquare,
            gradient: 'from-blue-500 to-cyan-400',
            shadow: 'shadow-blue-500/20',
            bg: 'bg-blue-50 dark:bg-blue-500/10',
        },
        {
            name: t('dashboard.stats.sessions'),
            value: '0',
            icon: Users,
            gradient: 'from-emerald-500 to-green-400',
            shadow: 'shadow-emerald-500/20',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        },
        {
            name: t('dashboard.stats.response_rate'),
            value: '100%',
            icon: TrendingUp,
            gradient: 'from-violet-500 to-purple-400',
            shadow: 'shadow-violet-500/20',
            bg: 'bg-violet-50 dark:bg-violet-500/10',
        },
        {
            name: t('dashboard.stats.ai_provider'),
            value: workspace?.settings?.aiProvider || 'Groq',
            icon: Zap,
            gradient: 'from-amber-500 to-orange-400',
            shadow: 'shadow-amber-500/20',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
        },
    ];

    const usage = workspace?.usage || {};
    const usagePercentage = ((usage.messagesThisMonth || 0) / (usage.messagesLimit || 250)) * 100;

    return (
        <div className="p-4 md:p-6 lg:p-8 transition-colors duration-300 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('dashboard.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">{t('dashboard.welcome')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5 mb-6 md:mb-8">
                {stats.map((stat, index) => (
                    <div
                        key={stat.name}
                        className={`bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 dark:border-gray-800/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md fade-in`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className={`w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-md ${stat.shadow} mb-3`}>
                            <stat.icon className="w-5 h-5 md:w-[22px] md:h-[22px] text-white" />
                        </div>
                        <p className="text-[11px] md:text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wider">{stat.name}</p>
                        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                            {stat.limit && (
                                <span className="text-xs md:text-sm font-normal text-gray-400 dark:text-gray-500"> / {stat.limit.toLocaleString()}</span>
                            )}
                        </p>
                    </div>
                ))}
            </div>

            {/* Usage Progress */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800/50 mb-6 md:mb-8 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.usage.title')}</h2>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                            {usage.messagesThisMonth || 0} {t('dashboard.usage.messages_used')}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">{Math.round(usagePercentage)}%</p>
                        <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('dashboard.usage.used')}</p>
                    </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${usagePercentage > 90
                            ? 'bg-gradient-to-r from-red-500 to-rose-500'
                            : usagePercentage > 70
                                ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
                                : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                            }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                </div>
                <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {t('dashboard.usage.reset_on')} {new Date(usage.resetDate).toLocaleDateString()}
                </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800/50 mb-6 md:mb-8 transition-all">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.quick_actions.title')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button className="p-4 border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl hover:border-purple-300 dark:hover:border-purple-500/30 hover:bg-purple-50/50 dark:hover:bg-purple-500/5 transition-all text-left group">
                        <MessageSquare className="w-5 h-5 text-purple-500 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-semibold text-sm text-gray-800 dark:text-white">{t('dashboard.quick_actions.create_widget')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('dashboard.quick_actions.create_widget_desc')}</p>
                    </button>
                    <button className="p-4 border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl hover:border-purple-300 dark:hover:border-purple-500/30 hover:bg-purple-50/50 dark:hover:bg-purple-500/5 transition-all text-left group">
                        <TrendingUp className="w-5 h-5 text-purple-500 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-semibold text-sm text-gray-800 dark:text-white">{t('dashboard.quick_actions.view_analytics')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('dashboard.quick_actions.view_analytics_desc')}</p>
                    </button>
                    <button className="p-4 border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl hover:border-purple-300 dark:hover:border-purple-500/30 hover:bg-purple-50/50 dark:hover:bg-purple-500/5 transition-all text-left group">
                        <Zap className="w-5 h-5 text-purple-500 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-semibold text-sm text-gray-800 dark:text-white">{t('dashboard.quick_actions.upgrade_plan')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('dashboard.quick_actions.upgrade_plan_desc')}</p>
                    </button>
                </div>
            </div>

            {/* Test Chat Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                        {t('dashboard.live_chat.title')}
                    </h2>
                    <DashboardChat user={user} />
                </div>

                {/* Side Instructions */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-500/5 dark:to-indigo-500/5 rounded-2xl p-5 md:p-6 border border-purple-100 dark:border-purple-500/10 h-fit">
                    <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2 text-sm">{t('dashboard.live_chat.how_to_test')}</h3>
                    <p className="text-xs text-purple-700 dark:text-purple-400 mb-4 opacity-80 leading-relaxed">
                        {t('dashboard.live_chat.desc')}
                    </p>

                    <ul className="space-y-3 text-xs text-purple-800 dark:text-purple-300">
                        <li className="flex items-start gap-3">
                            <span className="bg-purple-200 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">1</span>
                            <span>{t('dashboard.live_chat.step1')}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-purple-200 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">2</span>
                            <span>{t('dashboard.live_chat.step2')}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-purple-200 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">3</span>
                            <span>{t('dashboard.live_chat.step3')}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
