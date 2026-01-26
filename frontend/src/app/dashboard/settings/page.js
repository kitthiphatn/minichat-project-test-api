'use client';

import React, { useEffect, useState } from 'react';
import { Save, AlertCircle, Building2, Bell, Shield, Bot, AlertTriangle, Clock, Globe, Mail, Volume2, Lock, Key, RefreshCw, Trash2, Download, CheckCircle, X } from 'lucide-react';
import { getToken, getWorkspace } from '@/lib/auth';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Lock Screen Component
const LockScreen = ({ onUnlock, loading }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const success = await onUnlock(pin);
        if (!success) {
            setError('Invalid PIN');
            setPin('');
        }
    };

    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-600 max-w-sm w-full transform scale-100 animate-fadeIn">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Security Locked</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                        Enter your PIN to access restricted settings
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            autoFocus
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full text-center text-3xl font-bold tracking-[0.5em] py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent focus:border-purple-600 focus:outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
                            placeholder="••••••"
                            maxLength={6}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400 justify-center animate-bounce-short">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!pin || loading}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Unlock Section'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// PIN Modal for Actions (still needed for specific actions if we want double security, or for setting PIN)
const PinModal = ({ isOpen, onClose, onVerify, title = 'Security Verification', loading }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const success = await onVerify(pin);
        if (!success) {
            setError('Invalid PIN');
            setPin('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 dark:border-gray-700 animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Lock className="w-5 h-5 text-purple-600" /> {title}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Please enter your security PIN to continue.</p>
                    <input
                        type="password"
                        autoFocus
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full text-center text-2xl tracking-widest py-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-purple-500 mb-4"
                        placeholder="••••••"
                        maxLength={6}
                    />
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!pin || loading}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function SettingsPage() {
    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('general');

    // PIN State
    const [pinModalOpen, setPinModalOpen] = useState(false); // For action verification
    const [pendingAction, setPendingAction] = useState(null);
    const [pendingImportFile, setPendingImportFile] = useState(null);
    const [pinSetup, setPinSetup] = useState({ pin: '', pinConfirm: '', isSetting: false });
    const [hasPin, setHasPin] = useState(false);

    // Section Locks
    const [securityUnlocked, setSecurityUnlocked] = useState(false);
    const [dangerUnlocked, setDangerUnlocked] = useState(false);

    // Consolidated Form Data
    const [formData, setFormData] = useState({
        // General
        name: '',
        businessHours: { enabled: false, start: '09:00', end: '17:00' },
        timezone: 'Asia/Bangkok',
        currency: 'THB',
        // Notifications
        emailAlerts: { newLead: true, dailySummary: false },
        soundEnabled: true,
        // Security
        allowedDomains: '',
        apiKey: '',
        dataRetentionDays: 90,
        requirePinForExport: true,
        requirePinForDelete: true,
        pinLength: 4,
        // Automation
        inactivityTimeout: 5,
        offlineMessage: '',
        // Legacy/Shared
        widgetColor: '#667eea'
    });

    useEffect(() => {
        const workspaceData = getWorkspace();
        if (workspaceData) {
            setWorkspace(workspaceData);
            setHasPin(!!workspaceData.settings?.security?.pin);

            // Deep merge or fallback defaults
            setFormData({
                name: workspaceData.name || '',
                businessHours: workspaceData.settings?.businessHours || { enabled: false, start: '09:00', end: '17:00' },
                timezone: workspaceData.settings?.timezone || 'Asia/Bangkok',
                currency: workspaceData.settings?.currency || 'THB',
                emailAlerts: workspaceData.settings?.emailAlerts || { newLead: true, dailySummary: false },
                soundEnabled: workspaceData.settings?.soundEnabled !== undefined ? workspaceData.settings.soundEnabled : true,

                // Security mapping
                allowedDomains: workspaceData.settings?.security?.allowedDomains?.join(', ') || workspaceData.settings?.allowedDomains?.join(', ') || '',
                apiKey: workspaceData.apiKey || '',
                dataRetentionDays: workspaceData.settings?.security?.dataRetentionDays || 90,
                requirePinForExport: workspaceData.settings?.security?.requirePinForExport !== undefined ? workspaceData.settings.security.requirePinForExport : true,
                requirePinForDelete: workspaceData.settings?.security?.requirePinForDelete !== undefined ? workspaceData.settings.security.requirePinForDelete : true,
                pinLength: workspaceData.settings?.security?.pinLength || 4,

                // Automation
                inactivityTimeout: workspaceData.settings?.inactivityTimeout || 5,
                offlineMessage: workspaceData.settings?.offlineMessage || 'We are currently offline. We will get back to you soon!',
                widgetColor: workspaceData.settings?.widgetColor || '#667eea'
            });
        }
    }, []);

    const handleChange = (section, field, value) => {
        setFormData(prev => {
            if (section) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [field]: value
                    }
                };
            }
            return { ...prev, [field]: value };
        });
        setSuccess(false);
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        // Reset lock states when switching tabs (Immediate Lock)
        setSecurityUnlocked(false);
        setDangerUnlocked(false);
        // Reset explicit verification states
        setPinModalOpen(false);
        setPendingAction(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const token = getToken();
            const payload = {
                name: formData.name,
                settings: {
                    businessHours: formData.businessHours,
                    timezone: formData.timezone,
                    currency: formData.currency,
                    emailAlerts: formData.emailAlerts,
                    soundEnabled: formData.soundEnabled,
                    inactivityTimeout: parseInt(formData.inactivityTimeout),
                    offlineMessage: formData.offlineMessage,
                    widgetColor: formData.widgetColor,

                    // Security Object
                    security: {
                        allowedDomains: formData.allowedDomains.split(',').map(d => d.trim()).filter(d => d),
                        dataRetentionDays: parseInt(formData.dataRetentionDays),
                        requirePinForExport: formData.requirePinForExport,
                        requirePinForDelete: formData.requirePinForDelete,
                        pinLength: parseInt(formData.pinLength)
                    }
                }
            };

            const response = await axios.put(
                `${API_URL}/workspaces/${workspace.id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
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

    const verifySectionUnlock = async (pin, section) => {
        try {
            const token = getToken();
            const res = await axios.post(
                `${API_URL}/workspaces/${workspace.id}/pin/verify`,
                { pin },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.valid) {
                if (section === 'security') setSecurityUnlocked(true);
                if (section === 'danger') setDangerUnlocked(true);
                return true;
            }
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const verifyActionPin = async (pin) => {
        try {
            const token = getToken();
            const res = await axios.post(
                `${API_URL}/workspaces/${workspace.id}/pin/verify`,
                { pin },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.valid) {
                setPinModalOpen(false);
                if (pendingAction === 'export') executeExportData();
                if (pendingAction === 'delete') executeDeleteWorkspace();
                if (pendingAction === 'import' && pendingImportFile) executeImportConfig(pendingImportFile);
                setPendingAction(null);
                setPendingImportFile(null);
                return true;
            }
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const handleSetPin = async () => {
        if (pinSetup.pin !== pinSetup.pinConfirm) {
            alert("PINs do not match!");
            return;
        }
        if (pinSetup.pin.length !== formData.pinLength) {
            alert(`PIN must be ${formData.pinLength} digits!`);
            return;
        }

        try {
            const token = getToken();
            await axios.post(
                `${API_URL}/workspaces/${workspace.id}/pin`,
                { pin: pinSetup.pin },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Security PIN updated successfully!');
            setHasPin(true);
            setPinSetup({ pin: '', pinConfirm: '', isSetting: false });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to set PIN');
        }
    };

    const executeExportData = async () => {
        try {
            const token = getToken();
            const response = await axios.get(
                `${API_URL}/workspaces/${workspace.id}/export`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `minichat-history-${workspace.name}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data');
        }
    };

    const handleExportRequest = () => {
        if (hasPin && formData.requirePinForExport) {
            setPendingAction('export');
            setPinModalOpen(true);
        } else {
            executeExportData();
        }
    };

    const executeExportConfig = async () => {
        try {
            const token = getToken();
            const response = await axios.get(
                `${API_URL}/workspaces/${workspace.id}/export-config`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `config-${workspace.name}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Config Export error:', error);
            alert('Failed to export configuration');
        }
    };

    const executeImportConfig = async (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const config = JSON.parse(e.target.result);
                if (!config.settings) {
                    alert('Invalid configuration file format');
                    return;
                }

                const token = getToken();
                await axios.post(
                    `${API_URL}/workspaces/${workspace.id}/import-config`,
                    { config },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                alert('Configuration restored successfully! Page will reload.');
                window.location.reload();
            } catch (error) {
                console.error('Import error:', error);
                alert('Failed to import configuration: ' + (error.response?.data?.error || error.message));
            }
        };
        reader.readAsText(file);
    };

    const handleImportConfigClick = () => {
        document.getElementById('config-upload').click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        e.target.value = null;

        if (hasPin) {
            setPendingAction('import');
            setPendingImportFile(file);
            setPinModalOpen(true);
        } else {
            if (confirm('⚠️ WARNING: This will overwrite your current workspace settings. Continue?')) {
                executeImportConfig(file);
            }
        }
    };

    const executeDeleteWorkspace = async () => {
        setLoading(true);
        try {
            const token = getToken();
            await axios.delete(
                `${API_URL}/workspaces/${workspace.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Workspace deleted successfully');
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Delete error:', error);
            alert(error.response?.data?.error || 'Failed to delete workspace');
            setLoading(false);
        }
    };

    const handleDeleteRequest = () => {
        if (!confirm('⚠️ DANGER: Are you sure you want to delete this workspace? This action CANNOT be undone.')) return;

        if (hasPin && formData.requirePinForDelete) {
            setPendingAction('delete');
            setPinModalOpen(true);
        } else {
            if (!confirm('Final Confirmation: Delete this workspace?')) return;
            executeDeleteWorkspace();
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Building2 },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'automation', label: 'Automation', icon: Bot },
        { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, color: 'text-red-600' },
    ];

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <PinModal
                isOpen={pinModalOpen}
                onClose={() => { setPinModalOpen(false); setPendingAction(null); }}
                onVerify={verifyActionPin}
                title={pendingAction === 'delete' ? 'Confirm Deletion' : 'Security Verification'}
            />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workspace Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your workspace configuration</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-500/30 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-800 dark:text-green-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Settings saved successfully!</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === tab.id
                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                } ${tab.color || ''}`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="md:col-span-3 space-y-6">
                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-fadeIn">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-gray-400" /> General Information
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Workspace Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange(null, 'name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <select
                                                value={formData.timezone}
                                                onChange={(e) => handleChange(null, 'timezone', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                                                <option value="UTC">UTC</option>
                                                <option value="America/New_York">New York (EST)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => handleChange(null, 'currency', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="THB">THB (฿)</option>
                                            <option value="USD">USD ($)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">Business Hours</h4>
                                            <p className="text-sm text-gray-500">Only show widget or appear online during these hours</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.businessHours.enabled}
                                                onChange={(e) => handleChange('businessHours', 'enabled', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>
                                    {formData.businessHours.enabled && (
                                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
                                                <input
                                                    type="time"
                                                    value={formData.businessHours.start}
                                                    onChange={(e) => handleChange('businessHours', 'start', e.target.value)}
                                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                            <span className="text-gray-400">-</span>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 mb-1 block">End Time</label>
                                                <input
                                                    type="time"
                                                    value={formData.businessHours.end}
                                                    onChange={(e) => handleChange('businessHours', 'end', e.target.value)}
                                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-fadeIn">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-gray-400" /> Notification Preferences
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">New Lead Alert</h4>
                                            <p className="text-sm text-gray-500">Get an email when a visitor starts a new chat</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.emailAlerts.newLead}
                                            onChange={(e) => handleChange('emailAlerts', 'newLead', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                                            <Volume2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">Sound Notifications</h4>
                                            <p className="text-sm text-gray-500">Play a sound when a new message arrives</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.soundEnabled}
                                            onChange={(e) => handleChange(null, 'soundEnabled', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab - LOCKED */}
                    {activeTab === 'security' && (
                        <div className="relative min-h-[400px]">
                            {/* LOCK OVERLAY */}
                            {hasPin && !securityUnlocked && (
                                <LockScreen onUnlock={(pin) => verifySectionUnlock(pin, 'security')} loading={false} />
                            )}

                            {/* CONTENT (Conditional Render for F12 Protection: Only render if unlocked or no pin) */}
                            {(!hasPin || securityUnlocked) ? (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Shield className="w-6 h-6 text-purple-600" /> Security configuration
                                        </h3>

                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Card 1: PIN & Policies */}
                                            <div className="p-6 bg-gray-50 dark:bg-gray-700/20 rounded-xl border border-gray-200 dark:border-gray-600">
                                                <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-600 pb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${hasPin ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-200 text-gray-500'}`}>
                                                            <Lock className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 dark:text-white">Supervisor PIN</h4>
                                                            <p className="text-sm text-gray-500">Master code for sensitive actions</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!pinSetup.isSetting ? (
                                                            <button
                                                                onClick={() => setPinSetup({ ...pinSetup, isSetting: true })}
                                                                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-600 hover:text-purple-600 dark:hover:text-white transition-all shadow-sm"
                                                            >
                                                                {hasPin ? 'Change PIN' : 'Set Master PIN'}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => setPinSetup({ pin: '', pinConfirm: '', isSetting: false })}
                                                                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* PIN Setup Form */}
                                                {pinSetup.isSetting && (
                                                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-purple-100 dark:border-gray-600 shadow-sm mb-6 animate-fadeIn">
                                                        <div className="flex flex-col md:flex-row gap-6 mb-4">
                                                            <div className="flex-1 space-y-4">
                                                                <div>
                                                                    <label className="text-sm font-medium mb-2 block">New PIN</label>
                                                                    <input
                                                                        type="password"
                                                                        placeholder="••••••"
                                                                        value={pinSetup.pin}
                                                                        maxLength={formData.pinLength}
                                                                        onChange={(e) => setPinSetup({ ...pinSetup, pin: e.target.value.replace(/[^0-9]/g, '') })}
                                                                        className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 transition-all font-mono tracking-widest text-lg text-gray-900 dark:text-white"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 space-y-4">
                                                                <div>
                                                                    <label className="text-sm font-medium mb-2 block">Confirm PIN</label>
                                                                    <input
                                                                        type="password"
                                                                        placeholder="••••••"
                                                                        value={pinSetup.pinConfirm}
                                                                        maxLength={formData.pinLength}
                                                                        onChange={(e) => setPinSetup({ ...pinSetup, pinConfirm: e.target.value.replace(/[^0-9]/g, '') })}
                                                                        className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 transition-all font-mono tracking-widest text-lg text-gray-900 dark:text-white"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-1.5">
                                                                <button
                                                                    onClick={() => handleChange(null, 'pinLength', 4)}
                                                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${formData.pinLength === 4 ? 'bg-white dark:bg-gray-600 shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                                                                >
                                                                    4-Digits
                                                                </button>
                                                                <button
                                                                    onClick={() => handleChange(null, 'pinLength', 6)}
                                                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${formData.pinLength === 6 ? 'bg-white dark:bg-gray-600 shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                                                                >
                                                                    6-Digits
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={handleSetPin}
                                                                disabled={!pinSetup.pin || pinSetup.pin.length !== formData.pinLength || pinSetup.pin !== pinSetup.pinConfirm}
                                                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium shadow-md shadow-purple-500/20"
                                                            >
                                                                Save PIN
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Protection Rules */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <label className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${formData.requirePinForExport ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800' : 'bg-white border-transparent hover:bg-gray-100 dark:bg-gray-800'}`}>
                                                        <div className="pt-0.5">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.requirePinForExport}
                                                                onChange={(e) => handleChange(null, 'requirePinForExport', e.target.checked)}
                                                                disabled={!hasPin}
                                                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4 translate-y-0.5"
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="block font-medium text-gray-900 dark:text-white text-sm">Protect Data Export</span>
                                                            <span className="text-xs text-gray-500">Require PIN to download chat history</span>
                                                        </div>
                                                    </label>

                                                    <label className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${formData.requirePinForDelete ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-white border-transparent hover:bg-gray-100 dark:bg-gray-800'}`}>
                                                        <div className="pt-0.5">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.requirePinForDelete}
                                                                onChange={(e) => handleChange(null, 'requirePinForDelete', e.target.checked)}
                                                                disabled={!hasPin}
                                                                className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4 translate-y-0.5"
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="block font-medium text-gray-900 dark:text-white text-sm">Protect Deletion</span>
                                                            <span className="text-xs text-gray-500">Require PIN to delete workspace</span>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Card 2: Environment & Access */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Allowed Domains */}
                                                <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col">
                                                    <div className="mb-3">
                                                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                            <Globe className="w-4 h-4 text-blue-500" /> Domain Whitelist
                                                        </h4>
                                                        <p className="text-xs text-gray-500 mt-1">Restrict widget to specific websites</p>
                                                    </div>
                                                    <textarea
                                                        value={formData.allowedDomains}
                                                        onChange={(e) => handleChange(null, 'allowedDomains', e.target.value)}
                                                        className="flex-1 w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-mono"
                                                        placeholder="*.example.com&#10;myshop.com"
                                                    />
                                                </div>

                                                {/* Data & API */}
                                                <div className="space-y-6">
                                                    {/* Retention */}
                                                    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                                            <Clock className="w-4 h-4 text-orange-500" /> Data Retention
                                                        </h4>
                                                        <select
                                                            value={formData.dataRetentionDays}
                                                            onChange={(e) => handleChange(null, 'dataRetentionDays', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-orange-500"
                                                        >
                                                            <option value="30">Keep for 30 Days</option>
                                                            <option value="90">Keep for 3 Months (Recommended)</option>
                                                            <option value="365">Keep for 1 Year</option>
                                                            <option value="-1">Keep Forever (No Expiry)</option>
                                                        </select>
                                                    </div>

                                                    {/* API Key */}
                                                    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                                            <Key className="w-4 h-4 text-gray-400" /> Developer API
                                                        </h4>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                readOnly
                                                                value={formData.apiKey}
                                                                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs font-mono text-gray-600 dark:text-gray-300 truncate"
                                                            />
                                                            <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-colors" title="Regenerate Key">
                                                                <RefreshCw className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                // Placeholder BG to create depth behind the lock screen
                                <div className="filter blur-md opacity-20 pointer-events-none select-none bg-white dark:bg-gray-800 rounded-2xl h-[600px] w-full" aria-hidden="true"></div>
                            )}
                        </div>
                    )}

                    {/* Automation Tab */}
                    {activeTab === 'automation' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-fadeIn">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Bot className="w-5 h-5 text-gray-400" /> Chat Automation
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Inactivity Timeout (Minutes)
                                    </label>
                                    <p className="text-xs text-gray-500 mb-4">Automatically end chat session if user is inactive</p>
                                    <input
                                        type="range"
                                        min="1"
                                        max="60"
                                        value={formData.inactivityTimeout}
                                        onChange={(e) => handleChange(null, 'inactivityTimeout', e.target.value)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
                                    />
                                    <div className="mt-2 text-right font-medium text-purple-600">{formData.inactivityTimeout} minutes</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Offline Message</label>
                                    <textarea
                                        value={formData.offlineMessage}
                                        onChange={(e) => handleChange(null, 'offlineMessage', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-32"
                                        placeholder="We are currently offline..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Danger Zone Tab - LOCKED */}
                    {activeTab === 'danger' && (
                        <div className="relative min-h-[400px]">
                            {/* LOCK OVERLAY */}
                            {hasPin && !dangerUnlocked && (
                                <LockScreen onUnlock={(pin) => verifySectionUnlock(pin, 'danger')} loading={false} />
                            )}

                            {/* CONTENT (Conditional Render) */}
                            {(!hasPin || dangerUnlocked) ? (
                                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-200 dark:border-red-900/50 animate-fadeIn">
                                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-6 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" /> Danger Zone
                                    </h3>
                                    <div className="space-y-6">
                                        {/* Configuration Management Section */}
                                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <RefreshCw className="w-5 h-5 text-gray-500" /> Configuration Backup & Restore
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                                                    <h5 className="font-medium text-sm text-gray-900 dark:text-white mb-1">Backup Configuration</h5>
                                                    <p className="text-xs text-gray-500 mb-3">Save settings as JSON snapshot</p>
                                                    <button
                                                        onClick={executeExportConfig}
                                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Download className="w-4 h-4" /> Download JSON
                                                    </button>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                                                    <h5 className="font-medium text-sm text-gray-900 dark:text-white mb-1">Restore Configuration</h5>
                                                    <p className="text-xs text-gray-500 mb-3">Load settings from JSON file</p>
                                                    <input
                                                        type="file"
                                                        id="config-upload"
                                                        accept=".json"
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                    />
                                                    <button
                                                        onClick={handleImportConfigClick}
                                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400"
                                                    >
                                                        <RefreshCw className="w-4 h-4" /> Upload JSON
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-100 dark:border-red-900/30">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">Export Chat History</h4>
                                                <p className="text-sm text-gray-500">Download all your chat data as CSV</p>
                                            </div>
                                            <button
                                                onClick={handleExportRequest}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium"
                                            >
                                                <Download className="w-4 h-4" /> Export Data
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-100 dark:border-red-900/30">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">Delete Workspace</h4>
                                                <p className="text-sm text-gray-500">Permanently delete this workspace and all data</p>
                                            </div>
                                            <button
                                                onClick={handleDeleteRequest}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete Workspace
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Placeholder BG to create depth behind the lock screen
                                <div className="filter blur-md opacity-20 pointer-events-none select-none bg-red-50 dark:bg-red-900/10 rounded-2xl h-[600px] w-full" aria-hidden="true"></div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}