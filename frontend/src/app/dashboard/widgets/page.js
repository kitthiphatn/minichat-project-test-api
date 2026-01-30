'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Package, BookOpen, CreditCard, Bell, Save, Loader, Code2, AlertCircle, CheckCircle } from 'lucide-react';
import { getToken, getWorkspace } from '@/lib/auth';
import { useLanguage } from '@/contexts/LanguageContext';

// Import tab components
import AIConfigTab from '@/components/widget-settings/AIConfigTab';
import ProductsTab from '@/components/widget-settings/ProductsTab';
import KnowledgeBaseTab from '@/components/widget-settings/KnowledgeBaseTab';
import PaymentSettingsTab from '@/components/widget-settings/PaymentSettingsTab';
import NotificationsTab from '@/components/widget-settings/NotificationsTab';
import EmbedTab from '@/components/widget-settings/EmbedTab';
import WidgetPreview from '@/components/widget-settings/WidgetPreview';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function WidgetSettingsPage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('ai');
    const [workspace, setWorkspace] = useState(null);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Define tabs with translations
    const tabs = [
        { id: 'ai', label: t('widgetSettings.tabs.ai'), icon: Settings },
        { id: 'products', label: t('widgetSettings.tabs.products'), icon: Package },
        { id: 'knowledge', label: t('widgetSettings.tabs.knowledge'), icon: BookOpen },
        { id: 'payment', label: t('widgetSettings.tabs.payment'), icon: CreditCard },
        { id: 'notifications', label: t('widgetSettings.tabs.notifications'), icon: Bell },
        { id: 'embed', label: t('widgetSettings.tabs.embed'), icon: Code2 }
    ];

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchWorkspaceAndConfig();
    }, []);

    const fetchWorkspaceAndConfig = async () => {
        try {
            const token = getToken();
            let workspaceData = getWorkspace();

            if (!workspaceData || !workspaceData._id) {
                console.warn('Local workspace not found, attempting to fetch from API...');
                try {
                    // Fallback: Fetch user's workspaces and use the first one
                    const wsResponse = await axios.get(`${API_URL}/workspaces`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (wsResponse.data.success && wsResponse.data.workspaces.length > 0) {
                        workspaceData = wsResponse.data.workspaces[0];
                        // Optionally update local storage here if needed, but for now just use it in state
                    } else {
                        console.error('No workspaces found for user via API');
                        setLoading(false);
                        return;
                    }
                } catch (apiError) {
                    console.error('Failed to fetch workspace from API:', apiError);
                    setLoading(false);
                    return;
                }
            }

            setWorkspace(workspaceData);

            // Fetch complete widget configuration
            const response = await axios.get(
                `${API_URL}/widget-config/${workspaceData._id}/config`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setConfig(response.data.config);
            }
        } catch (error) {
            console.error('Failed to fetch config', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (section, data) => {
        setSaving(true);
        try {
            const token = getToken();
            let endpoint = '';

            switch (section) {
                case 'products':
                    endpoint = `${API_URL}/widget-config/${workspace._id}/products`;
                    break;
                case 'knowledge':
                    endpoint = `${API_URL}/widget-config/${workspace._id}/knowledge-base`;
                    break;
                case 'payment':
                    endpoint = `${API_URL}/widget-config/${workspace._id}/payment`;
                    break;
                case 'notifications':
                    endpoint = `${API_URL}/widget-config/${workspace._id}/notifications`;
                    break;
                case 'ai':
                    endpoint = `${API_URL}/workspaces/${workspace._id}`; // Update workspace settings
                    break;
            }

            if (section === 'ai') {
                await axios.put(
                    endpoint,
                    { settings: data },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // Update local config for preview immediately
                setConfig(prev => ({
                    ...prev,
                    aiSettings: data
                }));
            } else {
                await axios.put(
                    endpoint,
                    data,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            setShowSuccessModal(true);
            // Re-fetch to ensure everything is synced
            // fetchWorkspaceAndConfig(); 
        } catch (error) {
            console.error('Save error:', error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || t('widgetSettings.common.error');
            setErrorMessage(errorMsg);
            setShowErrorModal(true);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('widgetSettings.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {t('widgetSettings.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                {/* Left Column: Settings (7 cols) */}
                <div className="xl:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {/* Scrollable Tabs Header */}
                        <div className="border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
                            <div className="flex p-2 min-w-max">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === 'ai' && (
                                <AIConfigTab
                                    config={config?.aiSettings}
                                    workspace={workspace}
                                    onSave={(data) => handleSave('ai', data)}
                                    saving={saving}
                                />
                            )}
                            {activeTab === 'products' && (
                                <ProductsTab
                                    config={config?.productCatalog}
                                    workspace={workspace}
                                    onSave={(data) => handleSave('products', data)}
                                    saving={saving}
                                />
                            )}
                            {activeTab === 'knowledge' && (
                                <KnowledgeBaseTab
                                    config={config?.knowledgeBase}
                                    workspace={workspace}
                                    onSave={(data) => handleSave('knowledge', data)}
                                    saving={saving}
                                />
                            )}
                            {activeTab === 'payment' && (
                                <PaymentSettingsTab
                                    config={config?.paymentSettings}
                                    workspace={workspace}
                                    onSave={(data) => handleSave('payment', data)}
                                    saving={saving}
                                />
                            )}
                            {activeTab === 'notifications' && (
                                <NotificationsTab
                                    config={config?.notificationSettings}
                                    workspace={workspace}
                                    onSave={(data) => handleSave('notifications', data)}
                                    saving={saving}
                                />
                            )}
                            {activeTab === 'embed' && (
                                <EmbedTab
                                    workspace={workspace}
                                    config={config} // Pass full config for export
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview (5 cols) */}
                <div className="xl:col-span-5 sticky top-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            Live Preview
                        </h2>
                        <WidgetPreview config={config} workspace={workspace} />
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-700 dark:text-blue-300">
                            💡 {t('widgetSettings.dashboard.live_chat.desc') || 'Settings update in real-time.'}
                        </div>
                    </div>
                </div>

            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 transform animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('widgetSettings.common.success')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                            {t('widgetSettings.ai.saving').replace('Saving...', 'Settings saved.')}
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
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('widgetSettings.common.error')}</h3>
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
