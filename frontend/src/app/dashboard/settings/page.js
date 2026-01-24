'use client';

import React, { useEffect, useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { getToken, getWorkspace } from '@/lib/auth';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SettingsPage() {
    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        welcomeMessage: '',
        widgetColor: '',
        aiProvider: '',
        aiModel: '',
        systemPrompt: ''
    });

    useEffect(() => {
        const workspaceData = getWorkspace();
        if (workspaceData) {
            setWorkspace(workspaceData);
            setFormData({
                name: workspaceData.name || '',
                welcomeMessage: workspaceData.settings?.welcomeMessage || '',
                widgetColor: workspaceData.settings?.widgetColor || '#667eea',
                aiProvider: workspaceData.settings?.aiProvider || 'groq',
                aiModel: workspaceData.settings?.aiModel || 'llama-3.3-70b-versatile',
                systemPrompt: workspaceData.settings?.systemPrompt || ''
            });
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const token = getToken();
            const response = await axios.put(
                `${API_URL}/workspaces/${workspace.id}`,
                {
                    name: formData.name,
                    settings: {
                        welcomeMessage: formData.welcomeMessage,
                        widgetColor: formData.widgetColor,
                        aiProvider: formData.aiProvider,
                        aiModel: formData.aiModel,
                        systemPrompt: formData.systemPrompt
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                const updatedWorkspace = response.data.workspace;
                setWorkspace(updatedWorkspace);
                localStorage.setItem('workspace', JSON.stringify(updatedWorkspace));
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            console.error('Error updating settings:', err);
            setError(err.response?.data?.error || 'Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Customize your workspace and widget behavior</p>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Settings saved successfully!</span>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Workspace Settings */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Workspace Settings</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Workspace Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="My Workspace"
                            />
                        </div>
                    </div>
                </div>

                {/* Widget Customization */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Widget Customization</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Welcome Message
                            </label>
                            <input
                                type="text"
                                name="welcomeMessage"
                                value={formData.welcomeMessage}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Hi there! How can I help you today?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Widget Color
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    name="widgetColor"
                                    value={formData.widgetColor}
                                    onChange={handleChange}
                                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={formData.widgetColor}
                                    onChange={(e) => setFormData({ ...formData, widgetColor: e.target.value })}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="#667eea"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Settings */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Settings</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                AI Provider
                            </label>
                            <select
                                name="aiProvider"
                                value={formData.aiProvider}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="groq">Groq (Recommended - Free)</option>
                                <option value="ollama">Ollama (Local)</option>
                                <option value="openrouter">OpenRouter</option>
                                <option value="anthropic">Anthropic Claude</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                AI Model
                            </label>
                            <input
                                type="text"
                                name="aiModel"
                                value={formData.aiModel}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="llama-3.3-70b-versatile"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Default: llama-3.3-70b-versatile (Groq)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                System Prompt
                            </label>
                            <textarea
                                name="systemPrompt"
                                value={formData.systemPrompt}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="You are a helpful AI assistant..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Customize how the AI behaves and responds
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}