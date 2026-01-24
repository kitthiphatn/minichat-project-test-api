'use client';

import React, { useEffect, useState } from 'react';
import { Copy, RefreshCw, Eye, EyeOff, Code, CheckCircle } from 'lucide-react';
import { getToken, getWorkspace, setAuthData } from '@/lib/auth';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function WidgetsPage() {
    const [workspace, setWorkspace] = useState(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const workspaceData = getWorkspace();
        setWorkspace(workspaceData);
    }, []);

    const handleRegenerateKey = async () => {
        if (!confirm('Are you sure you want to regenerate the API key? Your current widget will stop working until you update the key.')) {
            return;
        }

        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.post(
                `${API_URL}/workspaces/${workspace.id}/regenerate-key`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                const updatedWorkspace = { ...workspace, apiKey: response.data.apiKey };
                setWorkspace(updatedWorkspace);
                localStorage.setItem('workspace', JSON.stringify(updatedWorkspace));
                alert('API key regenerated successfully!');
            }
        } catch (error) {
            console.error('Error regenerating API key:', error);
            alert('Failed to regenerate API key. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const embedCode = workspace?.apiKey ? `<script src="${window.location.origin}/widget.js" data-api-key="${workspace.apiKey}"></script>` : '';

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Widgets</h1>
                <p className="text-gray-600 mt-1">Manage your chatbot widgets and API keys</p>
            </div>

            {/* API Key Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">API Key</h2>
                        <p className="text-sm text-gray-600">Use this key to authenticate your widget</p>
                    </div>
                    <button
                        onClick={handleRegenerateKey}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Regenerate
                    </button>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Code className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <code className="flex-1 text-sm font-mono text-gray-900">
                        {showApiKey ? workspace?.apiKey : workspace?.apiKey?.replace(/./g, '•')}
                    </code>
                    <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                        title={showApiKey ? 'Hide' : 'Show'}
                    >
                        {showApiKey ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}
                    </button>
                    <button
                        onClick={() => handleCopy(workspace?.apiKey)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                        title="Copy"
                    >
                        {copied ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                            <Copy className="w-4 h-4 text-gray-600" />
                        )}
                    </button>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                    ⚠️ Keep your API key secure. Do not share it publicly.
                </p>
            </div>

            {/* Embed Code Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Embed Code</h2>
                        <p className="text-sm text-gray-600">Copy and paste this code into your website</p>
                    </div>
                    <button
                        onClick={() => handleCopy(embedCode)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-all"
                    >
                        <Copy className="w-4 h-4" />
                        Copy Code
                    </button>
                </div>

                <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 overflow-x-auto">
                    <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                        {embedCode}
                    </pre>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium mb-2">📝 Installation Instructions:</p>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Copy the embed code above</li>
                        <li>Paste it before the closing <code className="bg-blue-100 px-1 rounded">&lt;/body&gt;</code> tag of your website</li>
                        <li>Save and reload your page</li>
                        <li>The chatbot widget will appear in the bottom-right corner</li>
                    </ol>
                </div>
            </div>

            {/* Widget Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Widget Preview</h2>
                <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600 mb-2">Widget preview coming soon...</p>
                        <p className="text-sm text-gray-500">Install the widget on your site to see it in action</p>
                    </div>
                </div>
            </div>
        </div>
    );
}