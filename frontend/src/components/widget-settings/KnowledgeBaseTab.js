'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, BookOpen, Loader, Download, Upload, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import axios from 'axios';
import { getToken } from '@/lib/auth';
import { useLanguage } from '@/contexts/LanguageContext';

export default function KnowledgeBaseTab({ config, workspace, onSave, saving }) {
    const { t } = useLanguage();
    const [faqs, setFaqs] = useState([]);
    const [customInstructions, setCustomInstructions] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: '',
        order: 0,
        isActive: true
    });

    // Pagination & Accordion State
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedFaq, setExpandedFaq] = useState(null);
    const itemsPerPage = 10;

    const [notification, setNotification] = useState(null);
    const [importing, setImporting] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false); // Dropdown for header actions
    const fileInputRef = useRef(null);
    const actionsMenuRef = useRef(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        if (config) {
            setFaqs(config.faqs || []);
            setCustomInstructions(config.customInstructions || '');
        }
    }, [config]);

    // Close actions menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
                setShowActionsMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const resetForm = () => {
        setFormData({
            question: '',
            answer: '',
            category: '',
            order: 0,
            isActive: true
        });
        setEditingFaq(null);
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleDownloadTemplate = () => {
        const headers = ['Question', 'Answer', 'Category'];
        const sampleData = ['ระยะเวลาจัดส่งกี่วัน?', 'ปกติ 2-3 วันทำการครับ', 'Shipping'];
        const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'minichat_faq_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            showNotification('Please upload a CSV file.', 'error');
            return;
        }

        try {
            setImporting(true);
            const token = getToken();
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `${API_URL}/workspaces/${workspace._id}/faqs/import`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                }
            );

            if (response.data.success) {
                showNotification(response.data.message, response.data.partial ? 'warning' : 'success');
                setTimeout(() => window.location.reload(), 2000);
            }
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Import Failed: ' + (error.response?.data?.error || error.message), 'error');
        } finally {
            setImporting(false);
        }
    };

    const handleAdd = () => {
        // Limit Check for Free Plan
        if (workspace?.plan === 'free' && faqs.length >= 10) {
            showNotification(t('widgetSettings.knowledge.limitReached') || 'Free plan limit reached (Max 10 FAQs).', 'error');
            return;
        }
        resetForm();
        setShowModal(true);
    };

    const handleEdit = (faq, index) => {
        setEditingFaq(index);
        setFormData(faq);
        setShowModal(true);
    };

    const handleDelete = (index) => {
        if (!confirm(t('widgetSettings.knowledge.deleteConfirm'))) return;
        setFaqs(faqs.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.question || !formData.answer) {
            showNotification(t('widgetSettings.common.required') || 'Please fill in all required fields.', 'error');
            return;
        }

        if (editingFaq !== null) {
            const newFaqs = [...faqs];
            newFaqs[editingFaq] = formData;
            setFaqs(newFaqs);
        } else {
            setFaqs([...faqs, formData]);
        }

        setShowModal(false);
        resetForm();
    };

    const handleSaveAll = () => {
        onSave({
            faqs,
            customInstructions
        });
    };

    // Pagination Logic
    const totalPages = Math.ceil(faqs.length / itemsPerPage);
    const currentFaqs = faqs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleExpand = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            setExpandedFaq(null); // Collapse all on page change
        }
    };

    // Calculate Limit
    const isFreePlan = workspace?.plan === 'free';
    const limit = 10;
    const canAdd = !isFreePlan || faqs.length < limit;

    return (
        <div className="space-y-6 relative">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />

            {/* Toast Notification */}
            {notification && (
                <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-lg shadow-xl border flex items-center gap-3 animate-slide-in-up ${notification.type === 'error' ? 'bg-white border-red-500 text-red-600' :
                    notification.type === 'warning' ? 'bg-white border-yellow-500 text-yellow-600' :
                        'bg-white border-green-500 text-green-600'
                    }`}>
                    {notification.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    <span className="font-medium">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-4 hover:bg-gray-100 p-1 rounded-full"><X className="w-4 h-4 text-gray-400" /></button>
                </div>
            )}

            {/* FAQ Section */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('widgetSettings.knowledge.title')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {isFreePlan ? `${faqs.length}/${limit} FAQs (Free Plan)` : `${faqs.length} FAQs`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {/* Actions Dropdown */}
                        <div className="relative" ref={actionsMenuRef}>
                            <button
                                onClick={() => setShowActionsMenu(!showActionsMenu)}
                                className="flex items-center justify-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                            >
                                <span className="hidden sm:inline">Actions</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {showActionsMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-10 py-1">
                                    <button
                                        onClick={() => { handleDownloadTemplate(); setShowActionsMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Template
                                    </button>
                                    <button
                                        onClick={() => { handleImportClick(); setShowActionsMenu(false); }}
                                        disabled={importing}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Upload className="w-4 h-4" /> Import CSV
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleAdd}
                            disabled={!canAdd}
                            className={`flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${canAdd ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Plus className="w-5 h-5" />
                            {t('widgetSettings.knowledge.addFaq')}
                        </button>
                    </div>
                </div>

                {/* FAQ List */}
                {faqs.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                        {/* ... No FAQs ... */}
                        <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">{t('widgetSettings.knowledge.noFaqs')}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {currentFaqs.map((faq, index) => {
                            const globalIndex = (currentPage - 1) * itemsPerPage + index;
                            const isExpanded = expandedFaq === globalIndex;

                            return (
                                <div key={globalIndex} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                                    {/* Header (Always Visible) */}
                                    <div
                                        className="p-4 flex items-center gap-4 cursor-pointer"
                                        onClick={() => toggleExpand(globalIndex)}
                                    >
                                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>

                                        <div className="flex-1 flex items-center gap-3 overflow-hidden">
                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded shrink-0">
                                                Q
                                            </span>
                                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{faq.question}</h4>
                                            {faq.category && (
                                                <span className="hidden sm:inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded shrink-0">
                                                    {faq.category}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleEdit(faq, globalIndex)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(globalIndex)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Body (Collapsible) */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pl-14 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="flex items-start gap-2">
                                                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded mt-0.5">
                                                    A
                                                </span>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{faq.answer}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, faqs.length)} of {faqs.length} results
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="flex items-center px-4 text-sm font-medium text-gray-900 dark:text-white">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Instructions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('widgetSettings.knowledge.customInstructions')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('widgetSettings.knowledge.customInstructionsSubtitle')}
                </p>
                <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    rows={8}
                    maxLength={5000}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={t('widgetSettings.knowledge.customInstructionsPlaceholder')}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {customInstructions.length}/5000 {t('widgetSettings.knowledge.characters')}
                </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {saving ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            {t('widgetSettings.knowledge.saving')}
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            {t('widgetSettings.knowledge.save')}
                        </>
                    )}
                </button>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full border border-gray-100 dark:border-gray-700 shadow-xl">
                        <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editingFaq !== null ? t('widgetSettings.knowledge.editFaq') : t('widgetSettings.knowledge.addFaq')}
                            </h3>
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Question */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('widgetSettings.knowledge.question')} *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={t('widgetSettings.knowledge.questionPlaceholder')}
                                />
                            </div>

                            {/* Answer */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('widgetSettings.knowledge.answer')} *
                                </label>
                                <textarea
                                    required
                                    value={formData.answer}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder={t('widgetSettings.knowledge.answerPlaceholder')}
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('widgetSettings.knowledge.category')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={t('widgetSettings.knowledge.categoryPlaceholder')}
                                />
                            </div>

                            {/* Active Status */}
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('widgetSettings.knowledge.active')}</span>
                                </label>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    {t('widgetSettings.knowledge.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    {editingFaq !== null ? t('widgetSettings.knowledge.editFaq') : t('widgetSettings.knowledge.addFaq')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
