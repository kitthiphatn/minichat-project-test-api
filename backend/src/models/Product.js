const mongoose = require('mongoose');

/**
 * Product Schema
 * Manages product catalog for e-commerce functionality
 */
const productSchema = new mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: [true, 'Workspace is required'],
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
            min: [0, 'Compare price cannot be negative'],
            default: null
        },
        currency: {
            type: String,
            default: 'THB',
            enum: ['THB', 'USD', 'EUR', 'GBP']
        },
        images: [{
            type: String,
            validate: {
                validator: function (v) {
                    return /^(https?:\/\/|\/uploads\/)/.test(v);
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
                default: 5,
                min: [0, 'Low stock alert cannot be negative']
            },
            trackInventory: {
                type: Boolean,
                default: true
            }
        },
        variants: [{
            name: {
                type: String,
                required: true,
                trim: true
            },
            options: [{
                type: String,
                trim: true
            }],
            price: {
                type: Number,
                min: 0
            },
            stock: {
                type: Number,
                default: 0,
                min: 0
            },
            sku: String
        }],
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        metadata: {
            sku: {
                type: String,
                unique: true,
                sparse: true,
                trim: true
            },
            barcode: {
                type: String,
                trim: true
            },
            weight: {
                type: Number,
                min: 0
            },
            dimensions: {
                length: Number,
                width: Number,
                height: Number,
                unit: {
                    type: String,
                    enum: ['cm', 'in'],
                    default: 'cm'
                }
            }
        },
        seo: {
            title: {
                type: String,
                maxlength: 70
            },
            description: {
                type: String,
                maxlength: 160
            },
            keywords: [{
                type: String,
                trim: true
            }]
        },
        stats: {
            views: {
                type: Number,
                default: 0
            },
            sales: {
                type: Number,
                default: 0
            },
            revenue: {
                type: Number,
                default: 0
            }
        }
    },
    {
        timestamps: true
    }
);

// Indexes for performance
productSchema.index({ workspace: 1, isActive: 1 });
productSchema.index({ workspace: 1, category: 1 });
productSchema.index({ workspace: 1, tags: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

/**
 * Check if product is in stock
 */
productSchema.methods.isInStock = function (quantity = 1, variantName = null) {
    if (!this.stock.trackInventory) return true;

    if (variantName) {
        const variant = this.variants.find(v => v.name === variantName);
        return variant ? variant.stock >= quantity : false;
    }

    return this.stock.available >= quantity;
};

/**
 * Check if stock is low
 */
productSchema.methods.isLowStock = function () {
    if (!this.stock.trackInventory) return false;
    return this.stock.available <= this.stock.lowStockAlert;
};

/**
 * Decrease stock
 */
productSchema.methods.decreaseStock = async function (quantity = 1, variantName = null) {
    if (!this.stock.trackInventory) return;

    if (variantName) {
        const variant = this.variants.find(v => v.name === variantName);
        if (variant) {
            variant.stock -= quantity;
        }
    } else {
        this.stock.available -= quantity;
    }

    await this.save();
};

/**
 * Format for API response
 */
productSchema.methods.toResponse = function () {
    return {
        _id: this._id,
        name: this.name,
        description: this.description,
        price: this.price,
        compareAtPrice: this.compareAtPrice,
        currency: this.currency,
        images: this.images,
        category: this.category,
        tags: this.tags,
        stock: this.stock,
        variants: this.variants,
        isActive: this.isActive,
        metadata: this.metadata,
        seo: this.seo,
        stats: this.stats,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

/**
 * Static method to search products
 */
productSchema.statics.searchProducts = async function (workspaceId, query, options = {}) {
    const {
        category,
        tags,
        minPrice,
        maxPrice,
        inStock = true,
        limit = 20,
        skip = 0,
        sort = { createdAt: -1 }
    } = options;

    const filter = {
        workspace: workspaceId,
        isActive: true
    };

    if (query) {
        filter.$text = { $search: query };
    }

    if (category) {
        filter.category = category;
    }

    if (tags && tags.length > 0) {
        filter.tags = { $in: tags };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (inStock) {
        filter['stock.available'] = { $gt: 0 };
    }

    return await this.find(filter)
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .lean();
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
