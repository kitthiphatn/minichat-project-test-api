# 🚀 Quick Start Guide - Enhanced Chatbot Implementation

## เริ่มต้นด้วยขั้นตอนเหล่านี้

### Phase 1: Product Management (เริ่มต้นที่นี่)

#### Step 1: สร้าง Product Model
```bash
# สร้างไฟล์ /backend/src/models/Product.js
```

```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    compareAtPrice: {
        type: Number,
        min: [0, 'Compare price cannot be negative']
    },
    currency: {
        type: String,
        default: 'THB',
        enum: ['THB', 'USD', 'EUR']
    },
    images: [{
        type: String,
        validate: {
            validator: function(v) {
                return /^(https?:\/\/)|(data:image)/.test(v);
            },
            message: 'Invalid image URL'
        }
    }],
    category: {
        type: String,
        trim: true,
        index: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    stock: {
        available: {
            type: Number,
            default: 0,
            min: [0, 'Stock cannot be negative']
        },
        lowStockAlert: {
            type: Number,
            default: 5
        },
        trackInventory: {
            type: Boolean,
            default: true
        }
    },
    variants: [{
        name: { type: String, required: true },
        options: [String],
        price: Number,
        stock: { type: Number, default: 0 }
    }],
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    metadata: {
        sku: String,
        barcode: String,
        weight: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number,
            unit: { type: String, enum: ['cm', 'inch'], default: 'cm' }
        }
    },
    seo: {
        title: String,
        description: String,
        keywords: [String]
    },
    salesCount: {
        type: Number,
        default: 0
    },
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Indexes
productSchema.index({ workspace: 1, isActive: 1, category: 1 });
productSchema.index({ workspace: 1, tags: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Methods
productSchema.methods.decreaseStock = async function(quantity = 1) {
    if (!this.stock.trackInventory) return;

    if (this.stock.available < quantity) {
        throw new Error('Insufficient stock');
    }

    this.stock.available -= quantity;
    await this.save();
};

productSchema.methods.increaseStock = async function(quantity = 1) {
    this.stock.available += quantity;
    await this.save();
};

productSchema.methods.isLowStock = function() {
    return this.stock.trackInventory &&
           this.stock.available <= this.stock.lowStockAlert;
};

module.exports = mongoose.model('Product', productSchema);
```

#### Step 2: สร้าง Product Controller
```bash
# สร้างไฟล์ /backend/src/controllers/productController.js
```

```javascript
const Product = require('../models/Product');
const Workspace = require('../models/Workspace');

/**
 * @route   GET /api/products
 * @desc    Get all products for workspace
 * @access  Private
 */
exports.getProducts = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const {
            page = 1,
            limit = 20,
            category,
            search,
            isActive,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = { workspace: workspace._id };

        if (category) query.category = category;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$text = { $search: search };
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query
        const products = await Product.find(query)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await Product.countDocuments(query);

        res.json({
            success: true,
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error('[ERROR] Get products failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get products',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private
 */
exports.createProduct = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const productData = {
            ...req.body,
            workspace: workspace._id
        };

        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });

    } catch (error) {
        console.error('[ERROR] Create product failed:', error);

        // Validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private
 */
exports.updateProduct = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const product = await Product.findOne({
            _id: req.params.id,
            workspace: workspace._id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Update fields
        Object.assign(product, req.body);
        await product.save();

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });

    } catch (error) {
        console.error('[ERROR] Update product failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private
 */
exports.deleteProduct = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            workspace: workspace._id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('[ERROR] Delete product failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/products/search
 * @desc    Search products (for widget)
 * @access  Public
 */
exports.searchProducts = async (req, res) => {
    try {
        const { workspaceId, q, category, minPrice, maxPrice, limit = 10 } = req.query;

        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: 'Workspace ID is required'
            });
        }

        // Build query
        const query = {
            workspace: workspaceId,
            isActive: true
        };

        if (q) {
            query.$text = { $search: q };
        }

        if (category) {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        const products = await Product.find(query)
            .select('name description price compareAtPrice images category stock')
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            products
        });

    } catch (error) {
        console.error('[ERROR] Search products failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search products',
            error: error.message
        });
    }
};
```

#### Step 3: สร้าง Product Routes
```bash
# สร้างไฟล์ /backend/src/routes/product.js
```

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
} = require('../controllers/productController');

// Protected routes (ต้อง login)
router.get('/', protect, getProducts);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

// Public routes (สำหรับ widget)
router.get('/search', searchProducts);

module.exports = router;
```

#### Step 4: เพิ่ม Routes ใน Server
```javascript
// ใน /backend/src/server.js เพิ่ม
const productRoutes = require('./routes/product');
app.use('/api/products', productRoutes);
```

#### Step 5: ทดสอบ API
```bash
# 1. สร้างสินค้า
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "เสื้อยืดสีขาว",
    "description": "เสื้อยืดคอกลม 100% cotton",
    "price": 299,
    "compareAtPrice": 399,
    "category": "เสื้อผ้า",
    "tags": ["เสื้อ", "cotton"],
    "stock": {
      "available": 50
    },
    "images": ["https://example.com/image.jpg"]
  }'

# 2. ดึงรายการสินค้า
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. ค้นหาสินค้า (Public API)
curl "http://localhost:5000/api/products/search?workspaceId=YOUR_WORKSPACE_ID&q=เสื้อ"
```

---

## Phase 2: Order Management

#### Step 1: สร้าง Order Model
```bash
# สร้างไฟล์ /backend/src/models/Order.js
```

```javascript
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
        index: true
    },
    orderNumber: {
        type: String,
        unique: true
    },
    customer: {
        name: { type: String, required: true },
        email: String,
        phone: { type: String, required: true },
        sessionId: String
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        productName: String,
        variant: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    pricing: {
        subtotal: Number,
        discount: { type: Number, default: 0 },
        discountCode: String,
        shipping: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        total: { type: Number, required: true },
        currency: { type: String, default: 'THB' }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
        index: true
    },
    payment: {
        method: {
            type: String,
            enum: ['bank_transfer', 'qr_code', 'credit_card', 'cash'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        },
        paidAt: Date,
        transactionId: String,
        slipImage: String
    },
    shipping: {
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: { type: String, default: 'Thailand' }
        },
        method: String,
        trackingNumber: String,
        carrier: String,
        shippedAt: Date,
        estimatedDelivery: Date
    },
    notes: [{
        text: String,
        createdBy: String,
        createdAt: { type: Date, default: Date.now }
    }],
    timeline: [{
        status: String,
        note: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Auto-generate order number
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Add timeline entry when status changes
orderSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        this.timeline.push({
            status: this.status,
            note: `Order status changed to ${this.status}`,
            createdAt: new Date()
        });
    }
    next();
});

// Indexes
orderSchema.index({ workspace: 1, status: 1, createdAt: -1 });
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
```

---

## Phase 3: Frontend Product Management Dashboard

#### Step 1: สร้าง Products Page
```bash
# สร้างไฟล์ /frontend/src/app/dashboard/products/page.js
```

```javascript
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        สินค้า
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        จัดการสินค้าทั้งหมดของคุณ
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    <Plus className="w-4 h-4" />
                    เพิ่มสินค้า
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาสินค้า..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">ยังไม่มีสินค้า</p>
                    <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        เพิ่มสินค้าแรก
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Product Image */}
                            <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                                {product.images?.[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                                    {product.description}
                                </p>

                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <span className="text-lg font-bold text-purple-600">
                                            ฿{product.price.toLocaleString()}
                                        </span>
                                        {product.compareAtPrice && (
                                            <span className="ml-2 text-sm text-gray-400 line-through">
                                                ฿{product.compareAtPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        คงเหลือ: {product.stock.available}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                                        <Edit className="w-4 h-4" />
                                        แก้ไข
                                    </button>
                                    <button className="px-3 py-2 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

---

## 🎯 Next Immediate Steps

1. **สร้าง Database Models** (วันนี้)
   - Product ✅
   - Order
   - Lead
   - Flow

2. **สร้าง APIs** (พรุ่งนี้)
   - Product CRUD APIs ✅
   - Order APIs
   - Search & Filter

3. **สร้าง Frontend Dashboard** (วันที่ 3)
   - Product Management Page
   - Order Management Page

4. **ทดสอบ End-to-End** (วันที่ 4)
   - สร้างสินค้า
   - แสดงในแชท
   - สั่งซื้อ
   - จัดการออเดอร์

---

## 📞 Need Help?

ถ้ามีปัญหาหรือสงสัย:
1. ตรวจสอบ error logs
2. ทดสอบ API ด้วย Postman
3. ตรวจสอบ Database connection
4. Review code ใน CHATBOT_ARCHITECTURE_PLAN.md

**เริ่มต้นได้เลย! 🚀**
