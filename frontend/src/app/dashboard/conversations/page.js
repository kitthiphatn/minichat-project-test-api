'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    MessageSquare,
    User,
    Bot,
    Clock,
    CheckCircle,
    Search,
    Filter,
    RefreshCw
} from 'lucide-react';

export default function ConversationsPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        botHandled: 0,
        humanHandled: 0,
        resolved: 0
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();

        // Auto refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        await Promise.all([loadConversations(), loadStats()]);
    };

    const loadConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.clubfivem.com';

            const res = await fetch(`${API_URL}/api/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (data.success) {
                setConversations(data.conversations);
            } else {
                console.error('Failed to load conversations:', data.message);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.clubfivem.com';

            const res = await fetch(`${API_URL}/api/conversations/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
    };

    const filteredConversations = conversations.filter(conv => {
        // Filter by status/mode
        let matchesFilter = true;
        if (filter === 'active') matchesFilter = conv.status === 'active';
        else if (filter === 'bot') matchesFilter = conv.mode === 'bot' && conv.status === 'active';
        else if (filter === 'human') matchesFilter = conv.mode === 'human' && conv.status === 'active';
        else if (filter === 'resolved') matchesFilter = conv.status === 'resolved';

        // Filter by search
        let matchesSearch = true;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            matchesSearch =
                conv.sessionId.toLowerCase().includes(query) ||
                conv.customer?.name?.toLowerCase().includes(query) ||
                conv.customer?.phone?.toLowerCase().includes(query);
        }

        return matchesFilter && matchesSearch;
    });

    const getStatusBadge = (conv) => {
        if (conv.status === 'resolved') {
            return (
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full flex items-center gap-1 w-fit">
                    <CheckCircle className="w-3 h-3" />
                    จบแล้ว
                </span>
            );
        }

        if (conv.mode === 'bot') {
            return (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full flex items-center gap-1 w-fit">
                    <Bot className="w-3 h-3" />
                    Bot {conv.botMode === 'passive' ? '(Passive)' : ''}
                </span>
            );
        }

        if (conv.mode === 'human') {
            return (
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full flex items-center gap-1 w-fit">
                    <User className="w-3 h-3" />
                    {conv.assignedTo?.username || 'Human'}
                </span>
            );
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return `${seconds} วินาทีที่แล้ว`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`;
        return `${Math.floor(seconds / 86400)} วันที่แล้ว`;
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
                        <p className="text-gray-500">กำลังโหลด...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        การสนทนา
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        จัดการการสนทนากับลูกค้า
                    </p>
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    รีเฟรช
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">ทั้งหมด</p>
                        <MessageSquare className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.total}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">กำลังใช้</p>
                        <Clock className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-green-600">
                        {stats.active}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Bot</p>
                        <Bot className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-purple-600">
                        {stats.botHandled}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">คนตอบ</p>
                        <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-blue-600">
                        {stats.humanHandled}
                    </p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ค้นหา Session ID, ชื่อ, เบอร์โทร..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2 overflow-x-auto">
                        {[
                            { value: 'all', label: 'ทั้งหมด' },
                            { value: 'active', label: 'กำลังใช้' },
                            { value: 'bot', label: 'Bot' },
                            { value: 'human', label: 'คนตอบ' },
                            { value: 'resolved', label: 'จบแล้ว' }
                        ].map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                    filter === f.value
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Conversations List */}
            <div className="space-y-3">
                {filteredConversations.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchQuery ? 'ไม่พบการสนทนาที่ค้นหา' : 'ยังไม่มีการสนทนา'}
                        </p>
                    </div>
                ) : (
                    filteredConversations.map((conv) => (
                        <div
                            key={conv._id}
                            onClick={() => router.push(`/dashboard/conversations/${conv.sessionId}`)}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer transition-all hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    {/* Header */}
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {conv.customer?.name || 'ผู้เยี่ยมชม'}
                                        </span>
                                        {getStatusBadge(conv)}
                                    </div>

                                    {/* Session ID */}
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                                        Session: {conv.sessionId}
                                    </p>

                                    {/* Phone */}
                                    {conv.customer?.phone && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            📱 {conv.customer.phone}
                                        </p>
                                    )}

                                    {/* Meta info */}
                                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            {conv.metadata?.messageCount || 0} ข้อความ
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {getTimeAgo(conv.metadata?.lastActivityAt || conv.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Empty State */}
            {conversations.length === 0 && !loading && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        ยังไม่มีการสนทนา
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        เมื่อมีลูกค้าแชทผ่าน Widget จะปรากฏที่นี่
                    </p>
                </div>
            )}
        </div>
    );
}
