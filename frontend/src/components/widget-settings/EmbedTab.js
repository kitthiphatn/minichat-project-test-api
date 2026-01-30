'use client';

import { useState } from 'react';
import { Copy, Download, Code, Eye, EyeOff, RefreshCw, CheckCircle, Info, Loader, Shield, Server } from 'lucide-react';
import axios from 'axios';
import { getToken } from '@/lib/auth';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.clubfivem.com/api';
const WIDGET_CDN_URL = process.env.NEXT_PUBLIC_WIDGET_CDN_URL || 'https://cdn.minichat.app/widget.js';

export default function EmbedTab({ workspace, config }) {
    const { t } = useLanguage();
    const [showApiKey, setShowApiKey] = useState(false);
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    // Generate embed code
    const embedCode = workspace?.apiKey
        ? `<!-- MiniChat Widget -->
<script>
  window.miniChatConfig = {
    apiKey: '${workspace.apiKey}',
    position: '${workspace.settings?.position || 'right'}'
  };
</script>
<script src="${WIDGET_CDN_URL}" defer></script>`
        : '<!-- Loading... -->';

    const selfHostedCode = workspace?.apiKey
        ? `<!-- MiniChat Widget (Self-Hosted) -->
<script>
  window.miniChatConfig = {
    apiKey: '${workspace.apiKey}',
    position: '${workspace.settings?.position || 'right'}'
  };
</script>
<script src="minichat-widget.js" defer></script>`
        : '<!-- Loading... -->';

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadWidget = async () => {
        setDownloading(true);
        try {
            const token = getToken();
            const response = await axios.get(`${API_URL}/widget-config/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'minichat-widget.js');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            // alert('✅ Widget downloaded successfully!');
        } catch (error) {
            console.error('Download error:', error);
            alert(t('widgetSettings.common.error') + ': ' + (error.response?.data?.message || error.message));
        } finally {
            setDownloading(false);
        }
    };

    const handleRegenerateKey = async () => {
        if (!confirm(t('widgetSettings.embed.regenerateWarning'))) return;

        setRegenerating(true);
        try {
            const token = getToken();
            const response = await axios.post(
                `${API_URL}/workspaces/${workspace._id}/regenerate-key`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                // Update workspace in localStorage
                const updatedWorkspace = { ...workspace, apiKey: response.data.apiKey };
                localStorage.setItem('workspace', JSON.stringify(updatedWorkspace));
                window.location.reload(); // Reload to update UI
            }
        } catch (error) {
            console.error('Regenerate error:', error);
            alert(t('widgetSettings.common.error') + ': ' + (error.response?.data?.message || error.message));
        } finally {
            setRegenerating(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* CDN Embed (Recommended) */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('widgetSettings.embed.cdnTitle')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('widgetSettings.embed.cdnSubtitle')}</p>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto border border-gray-700 relative group">
                    <div className={`transition-all duration-300 ${showApiKey ? '' : 'filter blur-[5px] select-none hover:blur-[3px]'}`}>
                        <pre>
                            <span className="text-gray-500">&lt;!-- MiniChat Widget --&gt;</span>{'\n'}
                            <span className="text-blue-400">&lt;script&gt;</span>{'\n'}
                            {'  '}window.miniChatConfig = {'{'}{'\n'}
                            {'    '}apiKey: <span className="text-green-400">'{workspace?.apiKey}'</span>,{'\n'}
                            {'    '}position: <span className="text-green-400">'{workspace?.settings?.position || 'right'}'</span>{'\n'}
                            {'  '}{'}'};{'\n'}
                            <span className="text-blue-400">&lt;/script&gt;</span>{'\n'}
                            <span className="text-blue-400">&lt;script</span> <span className="text-purple-400">src</span>=<span className="text-green-400">"{WIDGET_CDN_URL}"</span> <span className="text-purple-400">defer</span><span className="text-blue-400">&gt;&lt;/script&gt;</span>
                        </pre>
                    </div>

                    <div className="absolute top-2 right-2 flex gap-1 bg-gray-800/50 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            title={showApiKey ? "Hide Code" : "Show Code"}
                        >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => handleCopy(embedCode)}
                            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            title="Copy to clipboard"
                        >
                            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="mt-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>{t('widgetSettings.embed.cdnHowTo')}</strong><br />
                        {t('widgetSettings.embed.cdnInstruction')}
                    </p>
                </div>
            </div>

            {/* OR Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">
                        OR
                    </span>
                </div>
            </div>

            {/* Self-Hosted Download */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('widgetSettings.embed.selfHostedTitle')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('widgetSettings.embed.selfHostedSubtitle')}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Server className="w-4 h-4 text-purple-500" />
                                {t('widgetSettings.embed.fileName')}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {t('widgetSettings.embed.fileSize')}
                            </p>
                        </div>
                        <button
                            onClick={handleDownloadWidget}
                            disabled={downloading}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {downloading ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    {t('widgetSettings.embed.downloading')}
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    {t('widgetSettings.embed.download')}
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2">
                            {t('widgetSettings.embed.installSteps')}
                        </p>
                        <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
                            <li>{t('widgetSettings.embed.step1')}</li>
                            <li>{t('widgetSettings.embed.step2')}</li>
                            <li>{t('widgetSettings.embed.step3').replace('minichat-widget.js', 'minichat-widget.js')}</li>
                            <li>{t('widgetSettings.embed.step4')}</li>
                        </ol>

                        <div className="mt-4 bg-gray-900 rounded-lg p-3 font-mono text-xs text-gray-300 overflow-x-auto border border-gray-700 relative group">
                            <div className={`transition-all duration-300 ${showApiKey ? '' : 'filter blur-[5px] select-none hover:blur-[3px]'}`}>
                                <pre>
                                    <span className="text-gray-500">&lt;!-- MiniChat Widget (Self-Hosted) --&gt;</span>{'\n'}
                                    <span className="text-blue-400">&lt;script&gt;</span>{'\n'}
                                    {'  '}window.miniChatConfig = {'{'}{'\n'}
                                    {'    '}apiKey: <span className="text-green-400">'{workspace?.apiKey}'</span>,{'\n'}
                                    {'    '}position: <span className="text-green-400">'{workspace?.settings?.position || 'right'}'</span>{'\n'}
                                    {'  '}{'}'};{'\n'}
                                    <span className="text-blue-400">&lt;/script&gt;</span>{'\n'}
                                    <span className="text-blue-400">&lt;script</span> <span className="text-purple-400">src</span>=<span className="text-green-400">"minichat-widget.js"</span> <span className="text-purple-400">defer</span><span className="text-blue-400">&gt;&lt;/script&gt;</span>
                                </pre>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1 bg-gray-800/50 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                                    title={showApiKey ? "Hide Code" : "Show Code"}
                                >
                                    {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                                <button
                                    onClick={() => handleCopy(selfHostedCode)}
                                    className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Key Management */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('widgetSettings.embed.apiKeyTitle')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('widgetSettings.embed.apiKeySubtitle')}</p>
                    </div>
                    <button
                        onClick={handleRegenerateKey}
                        disabled={regenerating}
                        className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                    >
                        {regenerating ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                {t('widgetSettings.embed.regenerating')}
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                {t('widgetSettings.embed.regenerate')}
                            </>
                        )}
                    </button>
                </div>

                <div className="flex gap-2 mb-4">
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 font-mono text-sm relative overflow-hidden">
                        <span className="text-gray-800 dark:text-gray-200 block truncate">
                            {showApiKey ? workspace?.apiKey : workspace?.apiKey?.replace(/./g, '•')}
                        </span>
                    </div>
                    <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                    >
                        {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => handleCopy(workspace?.apiKey)}
                        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-4">
                    <div className="flex gap-2">
                        <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-400">
                            <strong>{t('widgetSettings.common.required')}:</strong> {t('widgetSettings.embed.apiKeyWarning')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Widget Features Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg p-6 text-gray-900 dark:text-white">
                <h4 className="font-semibold mb-3">{t('widgetSettings.embed.widgetFeatures')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        t('widgetSettings.embed.featureAi'),
                        t('widgetSettings.embed.featureProducts'),
                        t('widgetSettings.embed.featureKnowledge'),
                        t('widgetSettings.embed.featurePayment'),
                        t('widgetSettings.embed.featureBranding'),
                        t('widgetSettings.embed.featureMobile')
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            {feature}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
