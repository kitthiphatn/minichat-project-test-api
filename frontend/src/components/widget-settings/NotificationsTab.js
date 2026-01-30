'use client';

import { useState, useEffect } from 'react';
import { Save, Mail, Send, Webhook, Loader, CheckCircle } from 'lucide-react';

export default function NotificationsTab({ config, workspace, onSave, saving }) {
    const [formData, setFormData] = useState({
        email: {
            enabled: true,
            address: ''
        },
        lineNotify: {
            enabled: false,
            token: ''
        },
        webhook: {
            enabled: false,
            url: '',
            secret: ''
        }
    });

    useEffect(() => {
        if (config) {
            setFormData(config);
        }
    }, [config]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Notifications */}
            <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-center gap-3 mb-4">
                    <input
                        type="checkbox"
                        checked={formData.email.enabled}
                        onChange={(e) => setFormData({
                            ...formData,
                            email: { ...formData.email, enabled: e.target.checked }
                        })}
                        className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <div>
                            <span className="text-sm font-semibold text-gray-900">Email Notifications</span>
                            <p className="text-xs text-gray-600 mt-1">
                                รับการแจ้งเตือนผ่านอีเมลเมื่อมีออเดอร์ใหม่
                            </p>
                        </div>
                    </div>
                </label>

                {formData.email.enabled && (
                    <div className="ml-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            required={formData.email.enabled}
                            value={formData.email.address}
                            onChange={(e) => setFormData({
                                ...formData,
                                email: { ...formData.email, address: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="your@email.com"
                        />
                    </div>
                )}
            </div>

            {/* Line Notify */}
            <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-center gap-3 mb-4">
                    <input
                        type="checkbox"
                        checked={formData.lineNotify.enabled}
                        onChange={(e) => setFormData({
                            ...formData,
                            lineNotify: { ...formData.lineNotify, enabled: e.target.checked }
                        })}
                        className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div className="flex items-center gap-2">
                        <Send className="w-5 h-5 text-green-600" />
                        <div>
                            <span className="text-sm font-semibold text-gray-900">Line Notify</span>
                            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">Optional</span>
                            <p className="text-xs text-gray-600 mt-1">
                                รับการแจ้งเตือนผ่าน LINE
                            </p>
                        </div>
                    </div>
                </label>

                {formData.lineNotify.enabled && (
                    <div className="ml-8 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Line Notify Token *
                            </label>
                            <input
                                type="text"
                                required={formData.lineNotify.enabled}
                                value={formData.lineNotify.token}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    lineNotify: { ...formData.lineNotify, token: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                placeholder="Your Line Notify Token"
                            />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-800">
                                <strong>วิธีการรับ Token:</strong><br />
                                1. ไปที่ <a href="https://notify-bot.line.me/" target="_blank" rel="noopener noreferrer" className="underline">notify-bot.line.me</a><br />
                                2. Login ด้วย LINE<br />
                                3. Generate Token<br />
                                4. นำ Token มาใส่ที่นี่
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Webhook */}
            <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-center gap-3 mb-4">
                    <input
                        type="checkbox"
                        checked={formData.webhook.enabled}
                        onChange={(e) => setFormData({
                            ...formData,
                            webhook: { ...formData.webhook, enabled: e.target.checked }
                        })}
                        className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div className="flex items-center gap-2">
                        <Webhook className="w-5 h-5 text-purple-600" />
                        <div>
                            <span className="text-sm font-semibold text-gray-900">Webhook</span>
                            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">Optional</span>
                            <p className="text-xs text-gray-600 mt-1">
                                ส่งข้อมูลไปยัง API ของคุณเมื่อมีเหตุการณ์เกิดขึ้น
                            </p>
                        </div>
                    </div>
                </label>

                {formData.webhook.enabled && (
                    <div className="ml-8 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Webhook URL *
                            </label>
                            <input
                                type="url"
                                required={formData.webhook.enabled}
                                value={formData.webhook.url}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    webhook: { ...formData.webhook, url: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                placeholder="https://your-api.com/webhook"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Secret Key (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.webhook.secret}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    webhook: { ...formData.webhook, secret: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                placeholder="Your secret key for verification"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                ใช้สำหรับยืนยันความถูกต้องของ webhook request
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="text-xs text-gray-700">
                                <strong>Webhook Events:</strong><br />
                                • <code className="bg-gray-200 px-1 rounded">order.created</code> - เมื่อมีออเดอร์ใหม่<br />
                                • <code className="bg-gray-200 px-1 rounded">order.paid</code> - เมื่อชำระเงินแล้ว<br />
                                • <code className="bg-gray-200 px-1 rounded">message.received</code> - เมื่อมีข้อความใหม่
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {saving ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Notification Settings
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
