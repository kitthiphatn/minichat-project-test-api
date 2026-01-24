'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { getToken, getUser, getWorkspace, clearAuthData } from '@/lib/auth';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication
        const token = getToken();
        if (!token) {
            router.push('/auth');
            return;
        }

        // Load user and workspace from localStorage
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0">
                <Sidebar user={user} workspace={workspace} onLogout={handleLogout} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}