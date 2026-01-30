'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, Filter, Eye, CheckCircle, XCircle, Truck, Clock, DollarSign } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
};

const STATUS_LABELS = {
    pending: 'รอดำเนินการ',
    confirmed: 'ยืนยันแล้ว',
    processing: 'กำลังดำเนินการ',
    shipped: 'จัดส่งแล้ว',
    delivered: 'ส่งถึงแล้ว',
    cancelled: 'ยกเลิก',
    refunded: 'คืนเงิน'
};

const PAYMENT_STATUS_COLORS = {
    pending: 'text-yellow-600',
    paid: 'text-green-600',
    failed: 'text-red-600',
    refunded: 'text-gray-600'
};

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        paymentStatus: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchOrders();
        fetchStats();
    }, [filters]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await axios.get(`${API_URL}/orders?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/orders/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const viewOrderDetail = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedOrder(response.data.order);
            setShowDetail(true);
        } catch (error) {
            console.error('Error fetching order detail:', error);
            alert('ไม่สามารถโหลดรายละเอียดออเดอร์ได้');
        }
    };

    const updateOrderStatus = async (orderId, newStatus, note = '') => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/orders/${orderId}/status`,
                { status: newStatus, note },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('อัพเดทสถานะสำเร็จ!');
            fetchOrders();
            if (selectedOrder?._id === orderId) {
                viewOrderDetail(orderId);
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
        }
    };

    const markAsPaid = async (orderId) => {
        const transactionId = prompt('กรอกเลขที่ธุรกรรม (ถ้ามี):');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/orders/${orderId}/payment`,
                { transactionId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('ยืนยันการชำระเงินสำเร็จ!');
            fetchOrders();
            if (selectedOrder?._id === orderId) {
                viewOrderDetail(orderId);
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
        }
    };

    const addTracking = async (orderId) => {
        const trackingNumber = prompt('กรอกเลขพัสดุ:');
        if (!trackingNumber) return;

        const carrier = prompt('ขนส่ง (Kerry/ThaiPost/Flash/J&T/DHL):', 'Kerry');
        if (!carrier) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/orders/${orderId}/shipping`,
                { trackingNumber, carrier },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('เพิ่มเลขพัสดุสำเร็จ!');
            fetchOrders();
            if (selectedOrder?._id === orderId) {
                viewOrderDetail(orderId);
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
        }
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
                {/* Header & Stats */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">จัดการออเดอร์</h1>

                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">ออเดอร์ทั้งหมด</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                                    </div>
                                    <Package className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">ยอดขายรวม</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            ฿{stats.totalRevenue?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-green-500" />
                                </div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">รอดำเนินการ</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-yellow-500" />
                                </div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">ชำระเงินแล้ว</p>
                                        <p className="text-2xl font-bold text-purple-600">{stats.paidOrders}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-purple-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">ทุกสถานะ</option>
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <select
                            value={filters.paymentStatus}
                            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">สถานะชำระเงิน</option>
                            <option value="pending">รอชำระ</option>
                            <option value="paid">ชำระแล้ว</option>
                            <option value="failed">ล้มเหลว</option>
                        </select>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เลขที่ออเดอร์</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ลูกค้า</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ยอดรวม</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชำระเงิน</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                            ยังไม่มีออเดอร์
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-medium text-blue-600">{order.orderNumber}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{order.customer.name}</div>
                                                    <div className="text-sm text-gray-500">{order.customer.phone}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-semibold text-gray-900">
                                                    ฿{order.pricing.total.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[order.status]}`}>
                                                    {STATUS_LABELS[order.status]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`font-medium ${PAYMENT_STATUS_COLORS[order.payment.status]}`}>
                                                    {order.payment.status === 'paid' ? '✓ ชำระแล้ว' : 'รอชำระ'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString('th-TH')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => viewOrderDetail(order._id)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    ดูรายละเอียด
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Order Detail Modal */}
                {showDetail && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">ออเดอร์ #{selectedOrder.orderNumber}</h2>
                                    <button
                                        onClick={() => setShowDetail(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Customer Info */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold mb-3">ข้อมูลลูกค้า</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-600">ชื่อ:</span> {selectedOrder.customer.name}</p>
                                            <p><span className="text-gray-600">เบอร์:</span> {selectedOrder.customer.phone}</p>
                                            {selectedOrder.customer.email && (
                                                <p><span className="text-gray-600">อีเมล:</span> {selectedOrder.customer.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Status */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold mb-3">สถานะออเดอร์</h3>
                                        <select
                                            value={selectedOrder.status}
                                            onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                                        >
                                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                        <div className="flex gap-2 mt-2">
                                            {selectedOrder.payment.status !== 'paid' && (
                                                <button
                                                    onClick={() => markAsPaid(selectedOrder._id)}
                                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm"
                                                >
                                                    ยืนยันชำระเงิน
                                                </button>
                                            )}
                                            {!selectedOrder.shipping.trackingNumber && (
                                                <button
                                                    onClick={() => addTracking(selectedOrder._id)}
                                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
                                                >
                                                    เพิ่มเลขพัสดุ
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="mb-6">
                                    <h3 className="font-semibold mb-3">รายการสินค้า</h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-sm">สินค้า</th>
                                                    <th className="px-4 py-2 text-right text-sm">ราคา</th>
                                                    <th className="px-4 py-2 text-right text-sm">จำนวน</th>
                                                    <th className="px-4 py-2 text-right text-sm">รวม</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {selectedOrder.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium">{item.productName}</div>
                                                            {item.variant && (
                                                                <div className="text-sm text-gray-500">{item.variant}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">฿{item.price.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right font-medium">฿{item.subtotal.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50">
                                                <tr>
                                                    <td colSpan="3" className="px-4 py-2 text-right">ค่าจัดส่ง:</td>
                                                    <td className="px-4 py-2 text-right">฿{selectedOrder.pricing.shipping.toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="3" className="px-4 py-2 text-right font-bold">ยอดรวมทั้งหมด:</td>
                                                    <td className="px-4 py-2 text-right font-bold text-lg text-blue-600">
                                                        ฿{selectedOrder.pricing.total.toLocaleString()}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                {/* Timeline */}
                                {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-3">ประวัติการดำเนินการ</h3>
                                        <div className="space-y-3">
                                            {selectedOrder.timeline.map((event, idx) => (
                                                <div key={idx} className="flex gap-3">
                                                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium">{event.note}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(event.createdAt).toLocaleString('th-TH')}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
