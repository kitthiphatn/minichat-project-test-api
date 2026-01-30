'use client';

import React, { useEffect, useState } from 'react';
import { Copy, RefreshCw, Eye, EyeOff, Code, CheckCircle, Save, Smartphone, Globe, MessageSquare, Send, MessageCircle, X, AlertCircle, Sparkles, Palette, Bot, Zap, Upload, Image, Download, Info } from 'lucide-react';
import { getToken, getWorkspace } from '@/lib/auth';
import axios from 'axios';
import WidgetPreview from '@/components/WidgetPreview';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const UPLOAD_BASE_URL = API_URL.replace(/\/api$/, ''); // Only remove '/api' at the END of URL

// Color Presets
const colorPresets = [
    { name: 'Purple', value: '#667eea', category: 'primary' },
    { name: 'Blue', value: '#3B82F6', category: 'primary' },
    { name: 'Teal', value: '#14B8A6', category: 'primary' },
    { name: 'Rose', value: '#F43F5E', category: 'primary' },
    { name: 'Orange', value: '#F97316', category: 'primary' },
    { name: 'Green', value: '#22C55E', category: 'primary' },
    { name: 'Lavender', value: '#C4B5FD', category: 'pastel' },
    { name: 'Mint', value: '#A7F3D0', category: 'pastel' },
    { name: 'Peach', value: '#FECACA', category: 'pastel' },
    { name: 'Sky', value: '#BAE6FD', category: 'pastel' },
];

// System Prompt Presets
const promptPresets = [
    {
        category: 'Customer Support',
        prompt: 'You are a friendly and helpful customer support agent. Answer questions clearly, be empathetic, and always offer to help further.'
    },
    {
        category: 'Sales Assistant',
        prompt: 'You are a knowledgeable sales assistant. Help customers find the right products, answer questions about features and pricing, and guide them to purchase.'
    },
    {
        category: 'FAQ Bot',
        prompt: 'You answer frequently asked questions. Provide concise, accurate answers. If you don\'t know, suggest contacting support.'
    },
    {
        category: 'Technical Support',
        prompt: 'You are a technical support specialist. Help users troubleshoot issues step-by-step. Ask clarifying questions and provide detailed solutions.'
    },
    {
        category: 'Custom',
        prompt: ''
    },
];

export default function WidgetsPage() {
    const [workspace, setWorkspace] = useState(null);
    const [activeTab, setActiveTab] = useState('appearance');
    const [loading, setLoading] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedPreset, setSelectedPreset] = useState('Custom');
    const [generatingPrompt, setGeneratingPrompt] = useState(false);
    const [promptTopic, setPromptTopic] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [downloadingWidget, setDownloadingWidget] = useState(false);
    const logoInputRef = React.useRef(null);

    // Widget Customization State
    const [widgetSettings, setWidgetSettings] = useState({
        widgetColor: '#667eea',
        welcomeMessage: 'Hi there! How can I help you?',
        botName: 'Support Agent',
        position: 'right',
        systemPrompt: 'You are a helpful AI assistant.',
        logo: '',
        chatBackground: ''
    });

    useEffect(() => {
        // Initial load from local storage
        const workspaceData = getWorkspace();
        if (workspaceData) {
            setWorkspace(workspaceData);
            if (workspaceData.settings) {
                setWidgetSettings(prev => ({ ...prev, ...workspaceData.settings }));
            }
        }

        // Fetch fresh data from API to ensure ID is valid
        const fetchLatestWorkspace = async () => {
            try {
                const token = getToken();
                if (!token) return;

                const response = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success && response.data.workspace) {
                    const freshWorkspace = response.data.workspace;
                    // Ensure ID consistency
                    if (!freshWorkspace.id && freshWorkspace._id) {
                        freshWorkspace.id = freshWorkspace._id;
                    }

                    setWorkspace(freshWorkspace);
                    localStorage.setItem('workspace', JSON.stringify(freshWorkspace));

                    if (freshWorkspace.settings) {
                        console.log('Logo URL from API:', freshWorkspace.settings.logo);
                        setWidgetSettings(prev => ({ ...prev, ...freshWorkspace.settings }));
                    }
                }
            } catch (error) {
                console.error('Failed to refresh workspace data', error);
            }
        };

        fetchLatestWorkspace();
    }, []);

    const handleSettingChange = (key, value) => {
        console.log(`Setting changed: ${key} = ${value}`);
        setWidgetSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveSettings = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const workspaceId = workspace.id || workspace._id;

            if (!workspaceId || workspaceId === 'undefined') {
                throw new Error('Invalid Workspace ID: Please try refreshing the page.');
            }

            const response = await axios.put(
                `${API_URL}/workspaces/${workspaceId}`,
                {
                    settings: {
                        ...workspace.settings,
                        ...widgetSettings
                    }
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                const updatedWorkspace = response.data.workspace;
                // Ensure ID consistency
                if (!updatedWorkspace.id && updatedWorkspace._id) {
                    updatedWorkspace.id = updatedWorkspace._id;
                }

                setWorkspace(updatedWorkspace);
                localStorage.setItem('workspace', JSON.stringify(updatedWorkspace));
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Failed to save settings', error);
            setErrorMessage(error.response?.data?.message || error.message || 'Failed to save settings');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateKey = async () => {
        if (!workspace) {
            setErrorMessage('Workspace data not loaded. Please refresh the page.');
            setShowErrorModal(true);
            return;
        }
        if (!confirm('Are you sure? This will invalidate your current API key.')) return;
        try {
            const token = getToken();
            const workspaceId = workspace.id || workspace._id;

            if (!workspaceId || workspaceId === 'undefined') {
                throw new Error('Invalid Workspace ID: Please try refreshing the page.');
            }

            const response = await axios.post(
                `${API_URL}/workspaces/${workspaceId}/regenerate-key`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                const newApiKey = response.data.apiKey;
                const updatedWorkspace = { ...workspace, apiKey: newApiKey };
                setWorkspace(updatedWorkspace);
                localStorage.setItem('workspace', JSON.stringify(updatedWorkspace));
                // Show success feedback
                alert('API Key regenerated successfully!');
            }
        } catch (error) {
            console.error('Failed to regenerate API key', error);
            setErrorMessage(error.response?.data?.message || error.message || 'Failed to regenerate key');
            setShowErrorModal(true);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePresetSelect = (preset) => {
        setSelectedPreset(preset.category);
        if (preset.category !== 'Custom') {
            handleSettingChange('systemPrompt', preset.prompt);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setErrorMessage('Invalid file type. Only JPG, PNG, and WebP are allowed.');
            setShowErrorModal(true);
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setErrorMessage('File too large. Maximum size is 10MB.');
            setShowErrorModal(true);
            return;
        }

        setUploadingLogo(true);
        try {
            const token = getToken();
            const formData = new FormData();
            formData.append('logo', file);

            const response = await axios.post(
                `${API_URL}/upload/logo`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                // Build full URL for the logo
                const fullLogoUrl = UPLOAD_BASE_URL + response.data.logoUrl;
                handleSettingChange('logo', fullLogoUrl);

                // Also refresh workspace data from API to ensure localStorage is updated
                const meResponse = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (meResponse.data.success && meResponse.data.workspace) {
                    const freshWorkspace = meResponse.data.workspace;
                    if (!freshWorkspace.id && freshWorkspace._id) {
                        freshWorkspace.id = freshWorkspace._id;
                    }
                    setWorkspace(freshWorkspace);
                    localStorage.setItem('workspace', JSON.stringify(freshWorkspace));
                }

                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Failed to upload logo', error);
            setErrorMessage(error.response?.data?.message || 'Failed to upload logo');
            setShowErrorModal(true);
        } finally {
            setUploadingLogo(false);
            // Clear the input
            if (logoInputRef.current) {
                logoInputRef.current.value = '';
            }
        }
    };

    const handleDownloadWidget = async () => {
        setDownloadingWidget(true);
        try {
            const token = getToken();
            const response = await axios.get(`${API_URL}/widget/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' // Important for file download
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `minichat-widget-${workspace?.id?.slice(-8)}.js`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setShowSuccessModal(true);
        } catch (error) {
            console.error('Failed to download widget', error);
            setErrorMessage('Failed to download widget. Please try again.');
            setShowErrorModal(true);
        } finally {
            setDownloadingWidget(false);
        }
    };

    const handleGeneratePrompt = async () => {
        if (!promptTopic.trim()) return;

        setGeneratingPrompt(true);
        try {
            const token = getToken();
            const response = await axios.post(
                `${API_URL}/chat/message`,
                {
                    apiKey: workspace?.apiKey,
                    message: `Create a detailed system prompt (approx 2500 chars) for an AI Assistant specifically for: "${promptTopic}". 
                    
Structure it strictly like this:
1. Role: "You are the AI Assistant for [Project Name based on '${promptTopic}']".
2. System Info: Detailed summary of what the system does.
3. Key Features: List 8-10 potential features relevant to this topic.
4. Strict Rules: expressly FORBID answering questions unrelated to "${promptTopic}". If off-topic, say "I can only help with [Project Name] related questions."
5. Tone: Professional and helpful.

Output ONLY the final system prompt text. Do not include "Here is the prompt" or quotes.`
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success && response.data.message) {
                const generatedPrompt = response.data.message.substring(0, 2500);
                handleSettingChange('systemPrompt', generatedPrompt);
                setSelectedPreset('Custom');
            }
        } catch (error) {
            console.error('Failed to generate prompt', error);
            setErrorMessage('Failed to generate prompt. Please try again.');
            setShowErrorModal(true);
        } finally {
            setGeneratingPrompt(false);
            setPromptTopic('');
        }
    };

    const embedCode = workspace?.apiKey ? `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-api-key="${workspace.apiKey}"></script>` : '';

    return (
        <div className="p-4 md:p-6 lg:p-8 min-h-screen lg:h-[calc(100vh-64px)] overflow-hidden flex flex-col max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Widget Configuration</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">Customize appearance, AI behavior, and install your chat widget</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 sm:gap-2 border-b border-gray-100 dark:border-gray-800/50 mb-6 flex-shrink-0 overflow-x-auto pb-px">
                {[
                    { id: 'appearance', label: 'Appearance', icon: Palette },
                    { id: 'aiSettings', label: 'AI Settings', icon: Sparkles },
                    { id: 'installation', label: 'Installation', icon: Code },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 px-3 sm:px-4 font-medium text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab.id
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 dark:bg-purple-400 rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 h-full">
                        {/* Settings Form - Left Panel */}
                        <div className="lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 lg:pb-8">

                            {/* Brand Settings */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Bot className="w-5 h-5 text-purple-500" />
                                    Branding
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bot Name</label>
                                        <input
                                            type="text"
                                            value={widgetSettings.botName}
                                            onChange={(e) => handleSettingChange('botName', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="e.g. Support Bot"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Welcome Message</label>
                                        <textarea
                                            value={widgetSettings.welcomeMessage}
                                            onChange={(e) => handleSettingChange('welcomeMessage', e.target.value)}
                                            rows="2"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="Hi there! How can I help you?"
                                        />
                                    </div>

                                    {/* Logo Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo (64x64)</label>
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                                                {widgetSettings.logo ? (
                                                    <img
                                                        key={widgetSettings.logo}
                                                        src={widgetSettings.logo.startsWith('/') ? UPLOAD_BASE_URL + widgetSettings.logo : widgetSettings.logo}
                                                        alt="Logo"
                                                        className="w-full h-full object-cover rounded-lg"
                                                        onError={(e) => {
                                                            console.log('Logo load error:', e.target.src);
                                                            e.target.onerror = null;
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <Image className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                ref={logoInputRef}
                                                onChange={handleLogoUpload}
                                                accept="image/jpeg,image/png,image/webp"
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => logoInputRef.current?.click()}
                                                disabled={uploadingLogo}
                                                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <Upload className="w-4 h-4" />
                                                {uploadingLogo ? 'Uploading...' : 'Upload'}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP • Max 10MB</p>
                                    </div>
                                </div>
                            </div>

                            {/* Theme Settings */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-purple-500" />
                                    Theme
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Colors</label>
                                        <div className="flex flex-wrap gap-2">
                                            {colorPresets.filter(c => c.category === 'primary').map(color => (
                                                <button
                                                    key={color.value}
                                                    onClick={() => handleSettingChange('widgetColor', color.value)}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all ${widgetSettings.widgetColor === color.value ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                                    style={{ backgroundColor: color.value }}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pastel Colors</label>
                                        <div className="flex flex-wrap gap-2">
                                            {colorPresets.filter(c => c.category === 'pastel').map(color => (
                                                <button
                                                    key={color.value}
                                                    onClick={() => handleSettingChange('widgetColor', color.value)}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all ${widgetSettings.widgetColor === color.value ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                                    style={{ backgroundColor: color.value }}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Color</label>
                                        <div className="flex gap-3">
                                            <input
                                                type="color"
                                                value={widgetSettings.widgetColor}
                                                onChange={(e) => handleSettingChange('widgetColor', e.target.value)}
                                                className="h-10 w-14 flex-shrink-0 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-1"
                                            />
                                            <input
                                                type="text"
                                                value={widgetSettings.widgetColor}
                                                onChange={(e) => handleSettingChange('widgetColor', e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono uppercase bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleSettingChange('position', 'left')}
                                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${widgetSettings.position === 'left'
                                                    ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/20 dark:border-purple-500 dark:text-purple-300'
                                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                                                    }`}
                                            >
                                                Bottom Left
                                            </button>
                                            <button
                                                onClick={() => handleSettingChange('position', 'right')}
                                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${widgetSettings.position === 'right'
                                                    ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/20 dark:border-purple-500 dark:text-purple-300'
                                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                                                    }`}
                                            >
                                                Bottom Right
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveSettings}
                                disabled={loading}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        {/* Live Preview - Right Panel */}
                        <div className="lg:col-span-8 h-full pb-8 mt-8 lg:mt-0">
                            <div className="lg:sticky lg:top-0 h-full flex flex-col">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-green-500" />
                                        Live Preview
                                    </h2>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                        Updates automatically
                                    </div>
                                </div>
                                <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 relative overflow-hidden">
                                    <WidgetPreview settings={widgetSettings} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Settings Tab */}
                {activeTab === 'aiSettings' && (
                    <div className="max-w-4xl mx-auto space-y-6 pb-8">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-purple-500" />
                                System Prompt
                            </h2>

                            {/* Preset Categories */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Presets</label>
                                <div className="flex flex-wrap gap-2">
                                    {promptPresets.map(preset => (
                                        <button
                                            key={preset.category}
                                            onClick={() => handlePresetSelect(preset)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedPreset === preset.category
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {preset.category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* AI Generate */}
                            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                                <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    AI Generate from Topic
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        value={promptTopic}
                                        onChange={(e) => setPromptTopic(e.target.value)}
                                        placeholder="e.g. E-commerce store, Restaurant booking..."
                                        className="flex-1 px-4 py-2 border border-purple-200 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                    <button
                                        onClick={handleGeneratePrompt}
                                        disabled={generatingPrompt || !promptTopic.trim()}
                                        className="sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        {generatingPrompt ? 'Generating...' : 'Generate AI Prompt'}
                                    </button>
                                </div>
                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">Uses 1 message from your quota</p>
                            </div>

                            {/* Custom Prompt */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your System Prompt</label>
                                    <span className={`text-xs ${widgetSettings.systemPrompt.length > 2400 ? 'text-red-500' : 'text-gray-500'}`}>
                                        {widgetSettings.systemPrompt.length}/2500
                                    </span>
                                </div>
                                <textarea
                                    value={widgetSettings.systemPrompt}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 2500) {
                                            handleSettingChange('systemPrompt', e.target.value);
                                            setSelectedPreset('Custom');
                                        }
                                    }}
                                    rows="6"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                                    placeholder="You are a helpful AI assistant..."
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveSettings}
                            disabled={loading}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}

                {/* Installation Tab */}
                {activeTab === 'installation' && (
                    <div className="max-w-4xl mx-auto space-y-6 pb-8">
                        {/* Installation content (Embed Code & Instructions) */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Globe className="w-6 h-6 text-blue-500" />
                                Web Integration
                            </h2>

                            {/* Download Widget Section */}
                            <div className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 bg-purple-600 rounded-lg">
                                        <Download className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                            Download Your Widget
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Get a pre-configured widget file with all your customizations embedded. Just upload and use!
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                minichat-widget-{workspace?.id?.slice(-8)}.js
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                ~45KB • Includes all your settings
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleDownloadWidget}
                                            disabled={downloadingWidget}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                                        >
                                            <Download className="w-4 h-4" />
                                            {downloadingWidget ? 'Downloading...' : 'Download'}
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                                            <CheckCircle className="w-3 h-3" />
                                            Colors: {widgetSettings.widgetColor}
                                        </span>
                                        {widgetSettings.logo && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                                                <CheckCircle className="w-3 h-3" />
                                                Logo uploaded
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                                            <CheckCircle className="w-3 h-3" />
                                            Position: {widgetSettings.position}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                                        <Info className="w-4 h-4" />
                                        How to use:
                                    </h4>
                                    <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                                        <li>Download the widget file</li>
                                        <li>Upload it to your website's server</li>
                                        <li>Add <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">&lt;script src="minichat-widget.js"&gt;&lt;/script&gt;</code> before &lt;/body&gt;</li>
                                        <li>Done! Widget will appear automatically</li>
                                    </ol>
                                </div>
                            </div>

                            {/* OR Divider */}
                            <div className="relative mb-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                                        OR use CDN (Advanced)
                                    </span>
                                </div>
                            </div>

                            {/* Embed Code - Moved to Top */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Embed Code</label>
                                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto border border-gray-700 relative group">
                                    <pre>{embedCode}</pre>
                                    <button
                                        onClick={() => handleCopy(embedCode)}
                                        className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                    Paste this code before the closing <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&lt;/body&gt;</code> tag of your website.
                                </p>
                            </div>

                            {/* API Key */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Your API Key</label>
                                    <button onClick={handleRegenerateKey} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3" /> Regenerate
                                    </button>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800/50 rounded-lg p-3 font-mono text-sm relative group overflow-hidden">
                                        <span className="text-gray-800 dark:text-gray-200 block truncate">
                                            {showApiKey ? workspace?.apiKey : workspace?.apiKey?.replace(/./g, '•')}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="flex-1 sm:flex-none p-3 border border-gray-100 dark:border-gray-800/50 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center"
                                        >
                                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleCopy(workspace?.apiKey)}
                                            className="flex-1 sm:flex-none p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center"
                                        >
                                            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Future Integration: Telegram */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800/50 opacity-60">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                                        <Send className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Telegram</h3>
                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded">Coming Soon</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Connect your bot to a Telegram channel or group.</p>
                            </div>

                            {/* Future Integration: LINE */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800/50 opacity-60">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">LINE OA</h3>
                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded">Coming Soon</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Integrate with LINE Official Account for automatic replies.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 transform animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Saved Successfully!</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                            Your widget settings have been updated and are live now.
                        </p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 transform animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Save Failed</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                            {errorMessage}
                        </p>
                        <button
                            onClick={() => setShowErrorModal(false)}
                            className="w-full py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}