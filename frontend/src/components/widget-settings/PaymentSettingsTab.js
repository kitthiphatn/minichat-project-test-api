'use client';

import { useState, useEffect } from 'react';
import { Save, Upload, Loader, CreditCard } from 'lucide-react';

export default function PaymentSettingsTab({ config, workspace, onSave, saving }) {
    const [formData, setFormData] = useState({
        enabled: false,
        methods: {
            qrCode: {
                enabled: false,
                imageUrl: '',
                promptPayId: ''
            },
            bankTransfer: {
                enabled: false,
                bank: '',
                accountNumber: '',
                accountName: ''
            }
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
            {/* Enable Payment */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div>
                        <span className="text-sm font-semibold text-gray-900">Enable Payment</span>
                        <p className="text-xs text-gray-600 mt-1">
                            เปิดใช้งานระบบชำระเงินใน Widget
                        </p>
                    </div>
                </label>
            </div>

            {formData.enabled && (
                <>
                    {/* QR Code (PromptPay) */}
                    <div className="border border-gray-200 rounded-lg p-6">
                        <label className="flex items-center gap-3 mb-4">
                            <input
                                type="checkbox"
                                checked={formData.methods.qrCode.enabled}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    methods: {
                                        ...formData.methods,
                                        qrCode: { ...formData.methods.qrCode, enabled: e.target.checked }
                                    }
                                })}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                            <div>
                                <span className="text-sm font-semibold text-gray-900">QR Code (PromptPay)</span>
                                <p className="text-xs text-gray-600 mt-1">
                                    แสดง QR Code สำหรับชำระเงิน
                                </p>
                            </div>
                        </label>

                        {formData.methods.qrCode.enabled && (
                            <div className="space-y-4 ml-8">
                                {/* QR Code Image URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        QR Code Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.methods.qrCode.imageUrl}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            methods: {
                                                ...formData.methods,
                                                qrCode: { ...formData.methods.qrCode, imageUrl: e.target.value }
                                            }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://example.com/qr-code.png"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        อัพโหลด QR Code ของคุณและใส่ URL ที่นี่
                                    </p>
                                </div>

                                {/* PromptPay ID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        PromptPay ID (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.methods.qrCode.promptPayId}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            methods: {
                                                ...formData.methods,
                                                qrCode: { ...formData.methods.qrCode, promptPayId: e.target.value }
                                            }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0812345678 or 1234567890123"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        เบอร์โทรศัพท์หรือเลขบัตรประชาชน
                                    </p>
                                </div>

                                {/* Preview */}
                                {formData.methods.qrCode.imageUrl && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preview
                                        </label>
                                        <img
                                            src={formData.methods.qrCode.imageUrl}
                                            alt="QR Code"
                                            className="w-48 h-48 object-contain border border-gray-300 rounded-lg"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Invalid+QR'; }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bank Transfer */}
                    <div className="border border-gray-200 rounded-lg p-6">
                        <label className="flex items-center gap-3 mb-4">
                            <input
                                type="checkbox"
                                checked={formData.methods.bankTransfer.enabled}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    methods: {
                                        ...formData.methods,
                                        bankTransfer: { ...formData.methods.bankTransfer, enabled: e.target.checked }
                                    }
                                })}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                            <div>
                                <span className="text-sm font-semibold text-gray-900">Bank Transfer</span>
                                <p className="text-xs text-gray-600 mt-1">
                                    แสดงข้อมูลบัญชีธนาคารสำหรับโอนเงิน
                                </p>
                            </div>
                        </label>

                        {formData.methods.bankTransfer.enabled && (
                            <div className="space-y-4 ml-8">
                                {/* Bank Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bank Name *
                                    </label>
                                    <input
                                        type="text"
                                        required={formData.methods.bankTransfer.enabled}
                                        value={formData.methods.bankTransfer.bank}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            methods: {
                                                ...formData.methods,
                                                bankTransfer: { ...formData.methods.bankTransfer, bank: e.target.value }
                                            }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="ธนาคารกสิกรไทย"
                                    />
                                </div>

                                {/* Account Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Number *
                                    </label>
                                    <input
                                        type="text"
                                        required={formData.methods.bankTransfer.enabled}
                                        value={formData.methods.bankTransfer.accountNumber}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            methods: {
                                                ...formData.methods,
                                                bankTransfer: { ...formData.methods.bankTransfer, accountNumber: e.target.value }
                                            }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="123-4-56789-0"
                                    />
                                </div>

                                {/* Account Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Name *
                                    </label>
                                    <input
                                        type="text"
                                        required={formData.methods.bankTransfer.enabled}
                                        value={formData.methods.bankTransfer.accountName}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            methods: {
                                                ...formData.methods,
                                                bankTransfer: { ...formData.methods.bankTransfer, accountName: e.target.value }
                                            }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="นายสมชาย ใจดี"
                                    />
                                </div>

                                {/* Preview */}
                                {formData.methods.bankTransfer.bank && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <p className="text-xs font-semibold text-gray-500 mb-2">PREVIEW</p>
                                        <div className="space-y-1">
                                            <p className="text-sm"><span className="font-medium">Bank:</span> {formData.methods.bankTransfer.bank}</p>
                                            <p className="text-sm"><span className="font-medium">Account:</span> {formData.methods.bankTransfer.accountNumber}</p>
                                            <p className="text-sm"><span className="font-medium">Name:</span> {formData.methods.bankTransfer.accountName}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

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
                            Save Payment Settings
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
