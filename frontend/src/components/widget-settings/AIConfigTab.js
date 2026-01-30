'use client';

import { useState, useEffect } from 'react';
import { Save, Loader } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const PROVIDERS = [
    { value: 'groq', label: 'Groq' },
    { value: 'openrouter', label: 'OpenRouter' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'ollama', label: 'Ollama (Local)' }
];

const MODELS = {
    groq: [
        { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
        { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B' },
        { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' }
    ],
    openrouter: [
        { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
        { value: 'google/gemini-pro', label: 'Gemini Pro' },
        { value: 'meta-llama/llama-3-70b-instruct', label: 'Llama 3 70B' }
    ],
    anthropic: [
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' }
    ],
    ollama: [
        { value: 'llama3.2', label: 'Llama 3.2' },
        { value: 'mistral', label: 'Mistral' }
    ]
};

export default function AIConfigTab({ config, workspace, onSave, saving }) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        aiProvider: 'groq',
        aiModel: 'llama-3.3-70b-versatile',
        systemPrompt: 'You are a helpful AI assistant.',
        welcomeMessage: 'Hi there! How can I help you today?',
        botName: 'Support Agent',
        widgetColor: '#667eea',
        position: 'right'
    });

    const PROMPT_PRESETS = [
        {
            category: t('widgetSettings.ai.presets.customerSupport'),
            prompt: 'You are a friendly and helpful customer support agent. Answer questions clearly, be empathetic, and always offer to help further.'
        },
        {
            category: t('widgetSettings.ai.presets.salesAssistant'),
            prompt: 'You are a knowledgeable sales assistant. Help customers find the right products, answer questions about features and pricing, and guide them to purchase.'
        },
        {
            category: t('widgetSettings.ai.presets.faqBot'),
            prompt: 'You answer frequently asked questions. Provide concise, accurate answers. If you don\'t know, suggest contacting support.'
        },
        {
            category: t('widgetSettings.ai.presets.technicalSupport'),
            prompt: 'You are a technical support specialist. Help users troubleshoot issues step-by-step. Ask clarifying questions and provide detailed solutions.'
        }
    ];

    useEffect(() => {
        if (config) {
            setFormData(prev => ({ ...prev, ...config }));
        }
    }, [config]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleProviderChange = (provider) => {
        const defaultModel = MODELS[provider]?.[0]?.value || '';
        setFormData(prev => ({
            ...prev,
            aiProvider: provider,
            aiModel: defaultModel
        }));
    };

    const handlePresetSelect = (preset) => {
        setFormData(prev => ({ ...prev, systemPrompt: preset.prompt }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* AI Provider */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('widgetSettings.ai.provider')}
                </label>
                <select
                    value={formData.aiProvider}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    {PROVIDERS.map(provider => (
                        <option key={provider.value} value={provider.value}>
                            {provider.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* AI Model */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('widgetSettings.ai.model')}
                </label>
                <select
                    value={formData.aiModel}
                    onChange={(e) => handleChange('aiModel', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    {MODELS[formData.aiProvider]?.map(model => (
                        <option key={model.value} value={model.value}>
                            {model.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* System Prompt */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('widgetSettings.ai.systemPrompt')}
                </label>

                {/* Preset Buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {PROMPT_PRESETS.map(preset => (
                        <button
                            key={preset.category}
                            type="button"
                            onClick={() => handlePresetSelect(preset)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                        >
                            {preset.category}
                        </button>
                    ))}
                </div>

                <textarea
                    value={formData.systemPrompt}
                    onChange={(e) => handleChange('systemPrompt', e.target.value)}
                    rows={6}
                    maxLength={2500}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={t('widgetSettings.ai.systemPromptPlaceholder')}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.systemPrompt.length}/2500 {t('widgetSettings.ai.characters')}
                </p>
            </div>

            {/* Welcome Message */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('widgetSettings.ai.welcomeMessage')}
                </label>
                <input
                    type="text"
                    value={formData.welcomeMessage}
                    onChange={(e) => handleChange('welcomeMessage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('widgetSettings.ai.welcomeMessagePlaceholder')}
                />
            </div>

            {/* Bot Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('widgetSettings.ai.botName')}
                </label>
                <input
                    type="text"
                    value={formData.botName}
                    onChange={(e) => handleChange('botName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('widgetSettings.ai.botNamePlaceholder')}
                />
            </div>

            {/* Avatar URL */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('widgetSettings.ai.avatarUrl') || 'Profile Picture URL'}
                </label>
                <div className="flex gap-4">
                    <input
                        type="url"
                        value={formData.logo || ''}
                        onChange={(e) => handleChange('logo', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/avatar.png"
                    />
                    {formData.logo && (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <img src={formData.logo} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('widgetSettings.ai.avatarUrlHelp') || 'Enter a direct link to an image (PNG, JPG, SVG).'}
                </p>
            </div>

            {/* Widget Color */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('widgetSettings.ai.widgetColor')}
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={formData.widgetColor}
                        onChange={(e) => handleChange('widgetColor', e.target.value)}
                        className="w-16 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                        type="text"
                        value={formData.widgetColor}
                        onChange={(e) => handleChange('widgetColor', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#667eea"
                    />
                </div>
            </div>

            {/* Position */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('widgetSettings.ai.position')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => handleChange('position', 'left')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${formData.position === 'left'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        {t('widgetSettings.ai.positionLeft')}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleChange('position', 'right')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${formData.position === 'right'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        {t('widgetSettings.ai.positionRight')}
                    </button>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {saving ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            {t('widgetSettings.ai.saving')}
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            {t('widgetSettings.ai.save')}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
