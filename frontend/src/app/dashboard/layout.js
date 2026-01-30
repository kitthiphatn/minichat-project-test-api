'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { getToken, getUser, getWorkspace, clearAuthData } from '@/lib/auth';
import { Menu, Sparkles } from 'lucide-react';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/auth');
            return;
        }

        const userData = getUser();
        const workspaceData = getWorkspace();

        setUser(userData);
        setWorkspace(workspaceData);
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        clearAuthData();
        router.push('/auth');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg shadow-purple-500/20">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <LanguageProvider>
            <ThemeProvider>
                <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-300">
                    {/* Mobile Overlay */}
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    {/* Sidebar */}
                    <aside className={`
                        fixed lg:static inset-y-0 left-0 z-50
                        w-[280px] lg:w-64 flex-shrink-0
                        transform transition-transform duration-300 ease-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        <Sidebar
                            user={user}
                            workspace={workspace}
                            onLogout={handleLogout}
                            isOpen={sidebarOpen}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Mobile Header */}
                        <header className="lg:hidden bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800/50 px-4 py-3 flex items-center gap-3 safe-area-top">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">MiniChat</h1>
                            </div>
                        </header>

                        {/* Page Content */}
                        <main className="flex-1 overflow-y-auto">
                            {children}
                        </main>
                    </div>
                </div>
            </ThemeProvider>
        </LanguageProvider>
    );
}
