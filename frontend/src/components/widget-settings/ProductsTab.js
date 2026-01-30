'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, Package, Image as ImageIcon, Loader, Download, Upload } from 'lucide-react';
import axios from 'axios';
import { getToken } from '@/lib/auth';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProductsTab({ config, workspace, onSave, saving }) {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        compareAtPrice: '',
        images: [''],
        category: '',
        stock: {
            available: 0,
            trackInventory: false
        },
        isActive: true
    });
    const [localSaving, setLocalSaving] = useState(false);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (config?.products) {
            setProducts(config.products);
        }
    }, [config]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            compareAtPrice: '',
            images: [''],
            category: '',
            stock: {
                available: 0,
                trackInventory: false
            },
            isActive: true
        });
        setEditingProduct(null);
    };

    const handleAdd = () => {
        resetForm();
        setShowModal(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            ...product,
            images: product.images?.length > 0 ? product.images : ['']
        });
        setShowModal(true);
    };

    const handleDelete = async (productId) => {
        if (!confirm(t('widgetSettings.products.deleteConfirm'))) return;

        if (!workspace?._id) {
            alert(t('widgetSettings.common.error') + ': Workspace not found');
            return;
        }

        try {
            setLocalSaving(true);
            const token = getToken();
            await axios.delete(
                `${API_URL}/widget-config/${workspace._id}/products/${productId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setProducts(products.filter(p => (p._id || p.id) !== productId));
        } catch (error) {
            console.error('Delete error:', error);
            alert(t('widgetSettings.common.error') + ': ' + (error.response?.data?.message || error.message));
        } finally {
            setLocalSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.price) {
            alert(t('widgetSettings.common.required'));
            return;
        }

        if (!workspace?._id) {
            alert(t('widgetSettings.common.error') + ': Workspace not found');
            return;
        }

        try {
            setLocalSaving(true);
            const token = getToken();

            // Clean up data
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
                images: formData.images.filter(img => img.trim() !== ''),
                stock: {
                    available: parseInt(formData.stock.available) || 0,
                    trackInventory: formData.stock.trackInventory
                }
            };

            if (editingProduct) {
                // Update existing product
                const productId = editingProduct._id || editingProduct.id;
                await axios.put(
                    `${API_URL}/widget-config/${workspace._id}/products/${productId}`,
                    productData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setProducts(products.map(p =>
                    (p._id || p.id) === productId ? { ...productData, _id: productId } : p
                ));
            } else {
                // Add new product
                const response = await axios.post(
                    `${API_URL}/widget-config/${workspace._id}/products`,
                    productData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    setProducts([...products, response.data.product]);
                }
            }

            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Save product error:', error);
            const errorMsg = error.response?.data?.message || error.message;

            if (error.response?.data?.upgradeRequired) {
                alert(`❌ ${errorMsg}\n\n${t('widgetSettings.products.planInfo')}: ${error.response.data.current}/${error.response.data.limit}`);
            } else {
                alert(t('widgetSettings.common.error') + ': ' + errorMsg);
            }
        } finally {
            setLocalSaving(false);
        }
    };

    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleDownloadTemplate = () => {
        // Defines columns matching the Add Product form layout
        const headers = [
            'Product Name',
            'Description',
            'Price',
            'Compare At Price',
            'Category',
            'Product Images (URLs)'
        ];

        // Sample Row
        const sampleData = [
            'Sample T-Shirt',
            '100% Cotton, High Quality',
            '450',
            '590',
            'Clothing',
            'https://example.com/main-image.jpg, https://example.com/side-view.jpg'
        ];

        const csvContent = [
            headers.join(','),
            sampleData.join(',')
        ].join('\n');

        // Add BOM for Excel compatibility
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'minichat_products_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset input value to allow re-uploading the same file if needed
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
                `${API_URL}/workspaces/${workspace._id}/products/import`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                showNotification(response.data.message, 'success');
                // Refresh to show new products after a short delay to let user read the toast
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Import Failed: ' + (error.response?.data?.error || error.message), 'error');
        } finally {
            setImporting(false);
        }
    };

    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        try {
            setExporting(true);
            const token = getToken();
            const response = await axios.get(
                `${API_URL}/workspaces/${workspace._id}/products/export`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'products_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export error:', error);
            showNotification('Export Failed: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setExporting(false);
        }
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({ ...formData, images: newImages });
    };

    const addImageField = () => {
        setFormData({ ...formData, images: [...formData.images, ''] });
    };

    const removeImageField = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages.length > 0 ? newImages : [''] });
    };

    const activeProducts = products.filter(p => p.isActive).length;
    const productLimit = workspace?.usage?.productsLimit || 10;

    return (
        <div className="space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".csv"
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('widgetSettings.products.title')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {activeProducts}/{productLimit} {t('widgetSettings.products.planInfo')} ({workspace?.plan || 'free'} plan)
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                        title="Download CSV Template"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Template</span>
                    </button>
                    <button
                        onClick={handleImportClick}
                        disabled={importing}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm"
                        title="Import CSV"
                    >
                        {importing ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span className="hidden sm:inline">Import</span>
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm"
                        title="Export Products"
                    >
                        {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={activeProducts >= productLimit}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        {t('widgetSettings.products.addProduct')}
                    </button>
                </div>
            </div>

            {/* Product List */}
            {
                products.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <Package className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">{t('widgetSettings.products.noProducts')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{t('widgetSettings.products.noProductsDesc')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map(product => (
                            <div key={product._id || product.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                                {/* Product Image */}
                                {product.images?.[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-40 object-cover rounded-lg mb-3 bg-gray-100 dark:bg-gray-900"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
                                    />
                                ) : (
                                    <div className="w-full h-40 bg-gray-100 dark:bg-gray-900 rounded-lg mb-3 flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                                    </div>
                                )}

                                {/* Product Info */}
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{product.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{product.description}</p>

                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">฿{product.price}</span>
                                        {product.compareAtPrice && (
                                            <span className="text-sm text-gray-400 dark:text-gray-500 line-through ml-2">
                                                ฿{product.compareAtPrice}
                                            </span>
                                        )}
                                    </div>
                                    {product.stock?.trackInventory && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {t('widgetSettings.products.stock')}: {product.stock.available}
                                        </span>
                                    )}
                                </div>

                                {product.category && (
                                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded mb-3">
                                        {product.category}
                                    </span>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        {t('widgetSettings.products.editProduct')}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product._id || product.id)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {t('widgetSettings.products.deleteProduct')}
                                    </button>
                                </div>

                                {!product.isActive && (
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 text-center">
                                        (Inactive)
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            }

            {/* Add/Edit Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700 shadow-xl">
                            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {editingProduct ? t('widgetSettings.products.editProduct') : t('widgetSettings.products.addProduct')}
                                </h3>
                                <button
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('widgetSettings.products.name')} *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('widgetSettings.products.namePlaceholder')}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('widgetSettings.products.description')}
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        placeholder={t('widgetSettings.products.descriptionPlaceholder')}
                                    />
                                </div>

                                {/* Price */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('widgetSettings.products.price')} *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder={t('widgetSettings.products.pricePlaceholder')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('widgetSettings.products.compareAtPrice')}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.compareAtPrice}
                                            onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder={t('widgetSettings.products.compareAtPricePlaceholder')}
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('widgetSettings.products.category')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('widgetSettings.products.categoryPlaceholder')}
                                    />
                                </div>

                                {/* Images */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('widgetSettings.products.images')}
                                    </label>
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <input
                                                type="url"
                                                value={img}
                                                onChange={(e) => handleImageChange(index, e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder={t('widgetSettings.products.imagePlaceholder')}
                                            />
                                            {formData.images.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeImageField(index)}
                                                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addImageField}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {t('widgetSettings.products.addImage')}
                                    </button>
                                </div>

                                {/* Stock */}
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <label className="flex items-center gap-2 mb-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.stock.trackInventory}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                stock: { ...formData.stock, trackInventory: e.target.checked }
                                            })}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('widgetSettings.products.trackInventory')}</span>
                                    </label>

                                    {formData.stock.trackInventory && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t('widgetSettings.products.stockAvailable')}
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.stock.available}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    stock: { ...formData.stock, available: e.target.value }
                                                })}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder={t('widgetSettings.products.stockPlaceholder')}
                                            />
                                        </div>
                                    )}
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
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('widgetSettings.products.active')}</span>
                                    </label>
                                </div>

                                {/* Submit */}
                                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        {t('widgetSettings.products.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={localSaving}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                                    >
                                        {localSaving ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                {t('widgetSettings.products.saving')}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                {editingProduct ? t('widgetSettings.products.update') : t('widgetSettings.products.save')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
