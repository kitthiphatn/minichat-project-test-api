'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Search, Package, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [planLimit, setPlanLimit] = useState({ current: 0, limit: 10 });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        compareAtPrice: '',
        category: '',
        images: [''],
        stock: { available: 0, lowStockAlert: 5, trackInventory: true },
        isActive: true
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [selectedCategory]);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (selectedCategory) params.append('category', selectedCategory);
            if (searchQuery) params.append('search', searchQuery);

            const response = await axios.get(`${API_URL}/products?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProducts(response.data.products);

            // Get plan limits from workspace
            const workspaceRes = await axios.get(`${API_URL}/workspaces`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (workspaceRes.data.workspaces?.[0]?.usage) {
                const usage = workspaceRes.data.workspaces[0].usage;
                setPlanLimit({
                    current: usage.productsCount || 0,
                    limit: usage.productsLimit || 10
                });
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/products/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            if (editingProduct) {
                await axios.put(`${API_URL}/products/${editingProduct._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('อัพเดทสินค้าสำเร็จ!');
            } else {
                const response = await axios.post(`${API_URL}/products`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    alert('เพิ่มสินค้าสำเร็จ!');
                }
            }

            resetForm();
            fetchProducts();
        } catch (error) {
            if (error.response?.status === 403 && error.response?.data?.upgradeRequired) {
                alert(`❌ ${error.response.data.message}\n\nปัจจุบัน: ${error.response.data.current}/${error.response.data.limit} สินค้า`);
            } else {
                alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('ลบสินค้าสำเร็จ!');
            fetchProducts();
        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice || '',
            category: product.category || '',
            images: product.images.length > 0 ? product.images : [''],
            stock: product.stock,
            isActive: product.isActive
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            compareAtPrice: '',
            category: '',
            images: [''],
            stock: { available: 0, lowStockAlert: 5, trackInventory: true },
            isActive: true
        });
        setEditingProduct(null);
        setShowForm(false);
    };

    const addImageField = () => {
        setFormData({ ...formData, images: [...formData.images, ''] });
    };

    const updateImage = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({ ...formData, images: newImages });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
                    <p className="text-gray-600">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">จัดการสินค้า</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                ใช้งาน: {planLimit.current}/{planLimit.limit} สินค้า
                                {planLimit.current >= planLimit.limit && (
                                    <span className="ml-2 text-red-600 font-medium">
                                        (ถึงขีดจำกัดแล้ว - กรุณาอัปเกรดแพลน)
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            disabled={planLimit.current >= planLimit.limit}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                        >
                            <Plus className="w-5 h-5" />
                            เพิ่มสินค้า
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="ค้นหาสินค้า..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && fetchProducts()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">ทุกหมวดหมู่</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <button
                            onClick={fetchProducts}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            ค้นหา
                        </button>
                    </div>
                </div>

                {/* Product Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">
                                    {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ชื่อสินค้า *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            คำอธิบาย *
                                        </label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                ราคา (บาท) *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                ราคาเปรียบเทียบ (ถ้ามี)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.compareAtPrice}
                                                onChange={(e) => setFormData({ ...formData, compareAtPrice: parseFloat(e.target.value) || '' })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            หมวดหมู่
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="เช่น Electronics, Fashion"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            รูปภาพ (URL)
                                        </label>
                                        {formData.images.map((img, index) => (
                                            <input
                                                key={index}
                                                type="url"
                                                value={img}
                                                onChange={(e) => updateImage(index, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addImageField}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            + เพิ่มรูปภาพ
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                จำนวนสต็อก
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.stock.available}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    stock: { ...formData.stock, available: parseInt(e.target.value) || 0 }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                แจ้งเตือนสต็อกต่ำ
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.stock.lowStockAlert}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    stock: { ...formData.stock, lowStockAlert: parseInt(e.target.value) || 5 }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="isActive" className="text-sm text-gray-700">
                                            เปิดใช้งานสินค้า
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                                        >
                                            {editingProduct ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                                        >
                                            ยกเลิก
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">ยังไม่มีสินค้า</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 text-blue-600 hover:text-blue-700"
                            >
                                เพิ่มสินค้าแรก
                            </button>
                        </div>
                    ) : (
                        products.map(product => (
                            <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                                {product.images[0] && (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                        {!product.isActive && (
                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                                ปิดใช้งาน
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <span className="text-lg font-bold text-blue-600">
                                                ฿{product.price.toLocaleString()}
                                            </span>
                                            {product.compareAtPrice && (
                                                <span className="text-sm text-gray-400 line-through ml-2">
                                                    ฿{product.compareAtPrice.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-sm ${product.stock.available > product.stock.lowStockAlert ? 'text-green-600' : 'text-red-600'}`}>
                                            สต็อก: {product.stock.available}
                                        </span>
                                    </div>

                                    {product.category && (
                                        <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mb-3">
                                            {product.category}
                                        </span>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            แก้ไข
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            ลบ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
