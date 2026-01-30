'use client';

import React, { useState, useEffect } from 'react';
import { Users, Briefcase, TrendingUp, Activity, Search, Shield, Trash2, Edit, MoreVertical, Settings, Clock, Save, Eye, CheckSquare, Square, X, PieChart } from 'lucide-react';
import { getToken } from '@/lib/auth';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminPage() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);
    const [logs, setLogs] = useState([]);
    const [systemSettings, setSystemSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, workspaces, logs, settings
    const [searchTerm, setSearchTerm] = useState('');

    // --- BULK ACTIONS STATE ---
    const [selectedUsers, setSelectedUsers] = useState([]); // Array of user IDs
    const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [targetPlan, setTargetPlan] = useState('free');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = getToken();
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch stats
            const statsRes = await axios.get(`${API_URL}/admin/stats`, { headers });
            setStats(statsRes.data.stats);

            // Fetch users
            const usersRes = await axios.get(`${API_URL}/admin/users?limit=50`, { headers });
            setUsers(usersRes.data.users);

            // Fetch workspaces
            const workspacesRes = await axios.get(`${API_URL}/admin/workspaces?limit=50`, { headers });
            setWorkspaces(workspacesRes.data.workspaces);

            // Fetch Logs
            const logsRes = await axios.get(`${API_URL}/admin/logs?limit=20`, { headers });
            setLogs(logsRes.data.logs);

            // Fetch Settings
            const settingsRes = await axios.get(`${API_URL}/admin/settings`, { headers });
            setSystemSettings(settingsRes.data.settings);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            if (error.response?.status === 403) {
                alert('Access denied. Admin privileges required.');
                window.location.href = '/dashboard';
            }
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const token = getToken();
            await axios.delete(`${API_URL}/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('User deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const handleUpdateSetting = async (key, value) => {
        try {
            const token = getToken();
            await axios.put(`${API_URL}/admin/settings`, { key, value }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Setting updated successfully');
            fetchData();
        } catch (error) {
            console.error('Error updating setting:', error);
            alert('Failed to update setting');
        }
    };

    // --- BULK ACTION HANDLERS ---
    const toggleSelectUser = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u._id));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users? THIS CANNOT BE UNDONE.`)) return;

        // Note: Ideally backend should have a bulk delete endpoint. 
        // For now, we loop (not atomic, but works for MVP).
        setIsBulkActionLoading(true);
        const token = getToken();
        try {
            for (const userId of selectedUsers) {
                await axios.delete(`${API_URL}/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            alert(`Successfully deleted ${selectedUsers.length} users.`);
            setSelectedUsers([]);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Partial error during bulk delete.');
        } finally {
            setIsBulkActionLoading(false);
        }
    };

    const handleBulkPlanUpdate = async () => {
        if (!targetPlan) return;
        setIsBulkActionLoading(true);
        try {
            const token = getToken();
            await axios.put(`${API_URL}/workspaces/bulk/plan`, {
                userIds: selectedUsers,
                plan: targetPlan
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`Successfully updated plan to "${targetPlan}" for ${selectedUsers.length} users.`);
            setShowPlanModal(false);
            setSelectedUsers([]);
            fetchData(); // Refresh data to show new stats
        } catch (err) {
            console.error(err);
            alert('Failed to update plans. Check console.');
        } finally {
            setIsBulkActionLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- CHART DATA PREP ---
    // Simple distribution count from `workspaces` data because `stats.plans` might be simplistic
    const planCounts = {
        free: 0,
        starter: 0,
        pro: 0,
        business: 0
    };
    workspaces.forEach(ws => {
        const p = ws.plan || 'free';
        if (planCounts[p] !== undefined) planCounts[p]++;
    });

    // Calculate total users (simple logic)
    const totalTrackedPlans = Object.values(planCounts).reduce((a, b) => a + b, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 pb-32">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-8 h-8 text-purple-600" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Admin Dashboard
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage users, workspaces, and system settings
                    </p>
                </div>

                {/* --- FLOATING ACTION BAR --- */}
                {selectedUsers.length > 0 && activeTab === 'users' && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4 duration-200">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 pr-4 mr-2">
                            {selectedUsers.length} Selected
                        </span>

                        <button
                            onClick={() => setShowPlanModal(true)}
                            className="flex items-center gap-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full transition-colors"
                        >
                            <Briefcase className="w-4 h-4" /> Change Plan
                        </button>

                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-full transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>

                        <button
                            onClick={() => setSelectedUsers([])}
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* --- CHANGE PLAN MODAL --- */}
                {showPlanModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl transform scale-100 transition-all">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Change Plan for {selectedUsers.length} Users</h3>
                            <p className="text-sm text-gray-500 mb-6">Select the new plan to apply to all selected users' workspaces.</p>

                            <div className="space-y-3 mb-8">
                                {['free', 'starter', 'pro', 'business'].map(plan => (
                                    <label key={plan} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${targetPlan === plan ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="plan"
                                                value={plan}
                                                checked={targetPlan === plan}
                                                onChange={(e) => setTargetPlan(e.target.value)}
                                                className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                            />
                                            <span className="capitalize font-medium text-gray-900 dark:text-white">{plan} Plan</span>
                                        </div>
                                        {targetPlan === plan && <CheckSquare className="w-5 h-5 text-purple-600" />}
                                    </label>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowPlanModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkPlanUpdate}
                                    disabled={isBulkActionLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isBulkActionLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div> : <Save className="w-4 h-4" />}
                                    Confirm Update
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards (Existing Code) */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Note: Keeping original stats cards structure but omitted generic content for brevity if unchanged. Assumed kept. */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                {stats.totalUsers}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Users</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                {stats.totalWorkspaces}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Workspaces</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">30 days</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                {stats.activeUsers}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Premium</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                {stats.plans.premium}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Subscriptions</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex gap-4 px-6">
                            {['overview', 'users', 'workspaces', 'logs', 'settings'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                                        ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div>
                                <div className="mb-6">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                {/* CHECKBOX HEADER */}
                                                <th className="py-3 px-4 w-12">
                                                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                                                        {selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length ?
                                                            <CheckSquare className="w-5 h-5 text-purple-600" /> :
                                                            <Square className="w-5 h-5" />
                                                        }
                                                    </button>
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Created</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((user) => (
                                                <tr key={user._id} className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedUsers.includes(user._id) ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}>
                                                    {/* CHECKBOX CELL */}
                                                    <td className="py-3 px-4">
                                                        <button onClick={() => toggleSelectUser(user._id)} className="text-gray-400">
                                                            {selectedUsers.includes(user._id) ?
                                                                <CheckSquare className="w-5 h-5 text-purple-600" /> :
                                                                <Square className="w-5 h-5" />
                                                            }
                                                        </button>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                                                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                                                    {user.username.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {user.username}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                        {user.email}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Workspaces Tab */}
                        {activeTab === 'workspaces' && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Workspace</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Owner</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Plan</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {workspaces.map((workspace) => (
                                            <tr key={workspace._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                                                    {workspace.name}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {workspace.owner?.username || 'Unknown'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${['pro', 'business'].includes(workspace.plan)
                                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {workspace.plan || 'free'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(workspace.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Logs Tab */}
                        {activeTab === 'logs' && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Action</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Details</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr key={log._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                                                    {log.action}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {log.user?.username || 'Unknown'}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {log.details}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                {/* PLAN DISTRIBUTION STATS */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-purple-600" /> Plan Distribution (Static)
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {Object.entries(planCounts).map(([plan, count]) => {
                                            const percentage = totalTrackedPlans > 0 ? Math.round((count / totalTrackedPlans) * 100) : 0;
                                            return (
                                                <div key={plan} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="capitalize font-semibold text-gray-700 dark:text-gray-300">{plan}</span>
                                                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400">{percentage}%</span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{count}</div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                                                        <div className="bg-purple-600 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Configuration</h3>
                                    {systemSettings.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No settings configured yet.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {systemSettings.map((setting) => (
                                                <div key={setting.id} className="flex flex-col gap-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{setting.key}</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            defaultValue={setting.value}
                                                            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                                            onBlur={(e) => handleUpdateSetting(setting.key, e.target.value)}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500">{setting.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add New Setting Placeholder */}
                                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Manual Override (Expert)</h4>
                                        <p className="text-xs text-gray-500 mb-4">Use the <strong>Users Tab &gt; Select &gt; Change Plan</strong> to perform manual plan overrides.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Recent Activity
                                    </h3>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        {logs.slice(0, 5).map((log) => (
                                            <div key={log._id} className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        by {log.user?.username || 'Unknown'} • {log.details}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(log.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                        {logs.length === 0 && (
                                            <div className="p-4 text-center text-gray-500 text-sm">No activity recorded yet settings.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
