'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Settings, CreditCard, LogOut, Sparkles } from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Widgets', href: '/dashboard/widgets', icon: MessageSquare },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
];

export default function Sidebar({ user, workspace, onLogout }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">MiniChat</h1>
                    <p className="text-xs text-gray-500">SaaS Platform</p>
                </div>
            </div>

            {/* Workspace Info */}
            {workspace && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Workspace</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1 truncate" title={workspace.name}>
                        {workspace.name}
                    </p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        {workspace.plan || 'free'} plan
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-purple-50 text-purple-700'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile & Logout */}
            <div className="border-t border-gray-200 p-4">
                {user && (
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}