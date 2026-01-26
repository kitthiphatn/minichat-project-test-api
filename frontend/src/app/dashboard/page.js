'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Users, TrendingUp, Zap } from 'lucide-react';
import { getWorkspace, getUser } from '@/lib/auth';
import DashboardChat from '../../components/DashboardChat';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardPage() {
    const [workspace, setWorkspace] = useState(null);
    const [user, setUser] = useState(null);
    const { t } = useLanguage();

    useEffect(() => {
        const workspaceData = getWorkspace();
        const userData = getUser();
        setWorkspace(workspaceData);
        setUser(userData);
    }, []);

    const stats = [
        {
            name: t('dashboard.stats.messages'),
            value: workspace?.usage?.messagesThisMonth || 0,
            limit: workspace?.usage?.messagesLimit || 250,
            icon: MessageSquare,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600',
        },
        {
            name: t('dashboard.stats.sessions'),
            value: '0',
            icon: Users,
            color: 'bg-gradient-to-br from-green-500 to-emerald-600',
        },
        {
            name: t('dashboard.stats.response_rate'),
            value: '100%',
            icon: TrendingUp,
            color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
        },
        {
            name: t('dashboard.stats.ai_provider'),
            value: workspace?.settings?.aiProvider || 'Groq',
            icon: Zap,
            color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
        },
    ];

    const usage = workspace?.usage || {};
    const usagePercentage = ((usage.messagesThisMonth || 0) / (usage.messagesLimit || 250)) * 100;

    return (
        <div className="p-4 md:p-8 transition-colors duration-300">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">{t('dashboard.title')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors">{t('dashboard.welcome')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 transition-all hover:-translate-y-1 duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-md`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.name}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                            {stat.limit && (
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-500"> / {stat.limit.toLocaleString()}</span>
                            )}
                        </p>
                    </div>
                ))}
            </div>

            {/* Usage Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 mb-8 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.usage.title')}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {usage.messagesThisMonth || 0} {t('dashboard.usage.messages_used')}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{Math.round(usagePercentage)}%</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{t('dashboard.usage.used')}</p>
                    </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${usagePercentage > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' : usagePercentage > 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'
                            }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {t('dashboard.usage.reset_on')} {new Date(usage.resetDate).toLocaleDateString()}
                </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 mb-8 transition-all">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.quick_actions.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-left group">
                        <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-medium text-gray-900 dark:text-white">{t('dashboard.quick_actions.create_widget')}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.quick_actions.create_widget_desc')}</p>
                    </button>
                    <button className="p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-left group">
                        <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-medium text-gray-900 dark:text-white">{t('dashboard.quick_actions.view_analytics')}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.quick_actions.view_analytics_desc')}</p>
                    </button>
                    <button className="p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-left group">
                        <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-medium text-gray-900 dark:text-white">{t('dashboard.quick_actions.upgrade_plan')}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.quick_actions.upgrade_plan_desc')}</p>
                    </button>
                </div>
            </div>

            {/* Test Chat Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        {t('dashboard.live_chat.title')}
                    </h2>
                    <DashboardChat user={user} />
                </div>

                {/* Side Instructions */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/30 h-fit backdrop-blur-sm">
                    <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">{t('dashboard.live_chat.how_to_test')}</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-400 mb-4 opacity-90">
                        {t('dashboard.live_chat.desc')}
                    </p>

                    <ul className="space-y-3 text-sm text-purple-800 dark:text-purple-300">
                        <li className="flex items-start gap-3">
                            <span className="bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold shadow-sm">1</span>
                            <span>{t('dashboard.live_chat.step1')}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold shadow-sm">2</span>
                            <span>{t('dashboard.live_chat.step2')}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold shadow-sm">3</span>
                            <span>{t('dashboard.live_chat.step3')}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}