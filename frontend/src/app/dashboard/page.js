'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Users, TrendingUp, Zap } from 'lucide-react';
import { getWorkspace } from '@/lib/auth';

export default function DashboardPage() {
    const [workspace, setWorkspace] = useState(null);

    useEffect(() => {
        const workspaceData = getWorkspace();
        setWorkspace(workspaceData);
    }, []);

    const stats = [
        {
            name: 'Messages This Month',
            value: workspace?.usage?.messagesThisMonth || 0,
            limit: workspace?.usage?.messagesLimit || 250,
            icon: MessageSquare,
            color: 'bg-blue-500',
        },
        {
            name: 'Active Sessions',
            value: '0',
            icon: Users,
            color: 'bg-green-500',
        },
        {
            name: 'Response Rate',
            value: '100%',
            icon: TrendingUp,
            color: 'bg-purple-500',
        },
        {
            name: 'AI Provider',
            value: workspace?.settings?.aiProvider || 'Groq',
            icon: Zap,
            color: 'bg-yellow-500',
        },
    ];

    const usage = workspace?.usage || {};
    const usagePercentage = ((usage.messagesThisMonth || 0) / (usage.messagesLimit || 250)) * 100;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's your workspace overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                            {stat.limit && (
                                <span className="text-sm font-normal text-gray-500"> / {stat.limit.toLocaleString()}</span>
                            )}
                        </p>
                    </div>
                ))}
            </div>

            {/* Usage Progress */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Monthly Usage</h2>
                        <p className="text-sm text-gray-600">
                            {usage.messagesThisMonth || 0} of {usage.messagesLimit || 250} messages used
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{Math.round(usagePercentage)}%</p>
                        <p className="text-xs text-gray-500">Used</p>
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${
                            usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 70 ? 'bg-yellow-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Resets on {new Date(usage.resetDate).toLocaleDateString()}
                </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left">
                        <MessageSquare className="w-6 h-6 text-purple-600 mb-2" />
                        <p className="font-medium text-gray-900">Create Widget</p>
                        <p className="text-sm text-gray-600">Add a new chatbot widget</p>
                    </button>
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left">
                        <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
                        <p className="font-medium text-gray-900">View Analytics</p>
                        <p className="text-sm text-gray-600">Check performance metrics</p>
                    </button>
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left">
                        <Zap className="w-6 h-6 text-purple-600 mb-2" />
                        <p className="font-medium text-gray-900">Upgrade Plan</p>
                        <p className="text-sm text-gray-600">Unlock more features</p>
                    </button>
                </div>
            </div>
        </div>
    );
}