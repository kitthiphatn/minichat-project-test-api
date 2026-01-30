const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Workspace = require('../models/Workspace');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { parse } = require('csv-parse/sync');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @desc    Get all workspaces for current user
// @route   GET /api/workspaces
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const workspaces = await Workspace.find({ owner: req.user.id });
        res.json({ success: true, workspaces });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Get single workspace
// @route   GET /api/workspaces/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        res.json({ success: true, workspace });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Create new workspace
// @route   POST /api/workspaces
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, error: 'Workspace name is required' });
        }

        const workspace = await Workspace.create({
            name: name.trim(),
            owner: req.user.id,
            plan: 'free'
        });

        res.status(201).json({ success: true, workspace });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private
// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, settings } = req.body;
        const updates = {};

        if (name) updates.name = name;

        if (settings) {
            Object.keys(settings).forEach(key => {
                if (key === 'security' && typeof settings[key] === 'object') {
                    // Flatten security keys manually or handle specifically
                    // For Mongoose $set, we can use dot notation "settings.security.key"
                    Object.keys(settings.security).forEach(secKey => {
                        if (secKey !== 'pin') { // Protect PIN
                            updates[`settings.security.${secKey}`] = settings.security[secKey];
                        }
                    });
                } else {
                    updates[`settings.${key}`] = settings[key];
                }
            });
        }

        const workspace = await Workspace.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        res.json({ success: true, workspace });
    } catch (error) {
        console.error('Update workspace error:', error);
        // Return actual error message to help debugging (especially validation errors)
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error',
            details: error.errors // Mongoose validation errors
        });
    }
});

// @desc    Set or Update Security PIN
// @route   POST /api/workspaces/:id/pin
// @access  Private
router.post('/:id/pin', protect, async (req, res) => {
    try {
        const { pin, oldPin } = req.body;
        const workspace = await Workspace.findOne({ _id: req.params.id, owner: req.user.id });

        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

        // If setting PIN for the first time or changing it
        if (workspace.settings.security?.pin && !oldPin) {
            return res.status(400).json({ error: 'Current PIN required to set a new one' });
        }

        // Verify old PIN if exists
        if (workspace.settings.security?.pin) {
            const isMatch = await bcrypt.compare(oldPin, workspace.settings.security.pin);
            if (!isMatch) return res.status(401).json({ error: 'Invalid current PIN' });
        }

        // Hash new PIN
        const salt = await bcrypt.genSalt(10);
        const hashedPin = await bcrypt.hash(pin, salt);

        // Ensure structure
        if (!workspace.settings) workspace.settings = {};
        if (!workspace.settings.security) workspace.settings.security = {};

        // Update PIN
        workspace.settings.security.pin = hashedPin;

        // Auto-update length if changed
        if ([4, 6].includes(pin.length)) {
            workspace.settings.security.pinLength = pin.length;
        }

        workspace.markModified('settings');
        await workspace.save();

        res.json({ success: true, message: 'Security PIN updated successfully' });
    } catch (error) {
        console.error('PIN Update Error:', error);
        res.status(500).json({ error: error.message || 'Server Error' });
    }
});

// @desc    Verify Security PIN
// @route   POST /api/workspaces/:id/pin/verify
// @access  Private
router.post('/:id/pin/verify', protect, async (req, res) => {
    try {
        const { pin } = req.body;
        const workspace = await Workspace.findOne({ _id: req.params.id, owner: req.user.id });

        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

        // Check if PIN is set
        if (!workspace.settings.security?.pin) {
            return res.json({ success: true, valid: true, message: 'No PIN set' });
        }

        const isMatch = await bcrypt.compare(pin, workspace.settings.security.pin);
        if (!isMatch) return res.status(401).json({ success: false, valid: false, error: 'Invalid PIN' });

        res.json({ success: true, valid: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @desc    Regenerate API key
// @route   POST /api/workspaces/:id/regenerate-key
// @access  Private
router.post('/:id/regenerate-key', protect, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        // Generate new API key
        workspace.apiKey = 'mc_' + crypto.randomBytes(16).toString('hex');
        await workspace.save();

        res.json({ success: true, apiKey: workspace.apiKey });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Export chat history
// @route   GET /api/workspaces/:id/export
// @access  Private
router.get('/:id/export', protect, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        const Message = require('../models/Message'); // Ensure correct path
        // For demo: Export all messages. In production: Filter by workspace association.
        const messages = await Message.find().sort({ createdAt: -1 }).limit(1000).lean();

        if (!messages || messages.length === 0) {
            // Return empty CSV with headers if no messages
            return res.status(200).send('createdAt,role,content,provider,model,sessionId\n');
        }

        // Convert to CSV
        const fields = ['createdAt', 'role', 'content', 'provider', 'model', 'sessionId'];
        const csvContent = [
            fields.join(','),
            ...messages.map(msg => {
                return fields.map(field => {
                    let val = msg[field] || '';
                    if (field === 'createdAt') val = new Date(val).toISOString();
                    // Escape quotes and wrap in quotes
                    val = String(val).replace(/"/g, '""');
                    return `"${val}"`;
                }).join(',');
            })
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="chat-history-${workspace.name}-${Date.now()}.csv"`);
        res.status(200).send(csvContent);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Export workspace configuration (JSON Snapshot)
// @route   GET /api/workspaces/:id/export-config
// @access  Private
router.get('/:id/export-config', protect, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        // Create clean snapshot
        const snapshot = {
            version: '1.0',
            exportedAt: new Date(),
            name: workspace.name,
            settings: JSON.parse(JSON.stringify(workspace.settings))
        };

        // SANITIZATION: Remove secrets
        if (snapshot.settings.security) {
            delete snapshot.settings.security.pin; // NEVER export PIN hash
        }
        // Remove potentially sensitive or unrelated internal fields if any

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="config-${workspace.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json"`);
        res.send(JSON.stringify(snapshot, null, 2));

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Import workspace configuration
// @route   POST /api/workspaces/:id/import-config
// @access  Private
router.post('/:id/import-config', protect, async (req, res) => {
    try {
        const { config } = req.body; // Expect JSON object

        if (!config || !config.settings) {
            return res.status(400).json({ success: false, error: 'Invalid configuration file' });
        }

        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        // Import Name (Optional)
        // if (config.name) workspace.name = config.name; 

        // Import Settings with Deep Merge Strategy
        // We iterate over the IMPORTED settings and apply them to the workspace
        // This allows Partial Imports if needed, but usually it's a full restore

        const settingsToImport = config.settings;

        Object.keys(settingsToImport).forEach(key => {
            // SECURITY: Skip imported security PINs to prevent overwriting with unknown/malicious PINs
            if (key === 'security') {
                if (!workspace.settings.security) workspace.settings.security = {};

                // Merge security settings but EXCLUDE PIN
                if (settingsToImport.security) {
                    Object.keys(settingsToImport.security).forEach(secKey => {
                        if (secKey !== 'pin') {
                            workspace.settings.security[secKey] = settingsToImport.security[secKey];
                        }
                    });
                }
            } else {
                // Standard fields (businessHours, notifications, customization)
                workspace.settings[key] = settingsToImport[key];
            }
        });

        workspace.markModified('settings');
        await workspace.save();

        res.json({ success: true, message: 'Configuration imported successfully', workspace });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        // Check if user has other workspaces
        const workspaceCount = await Workspace.countDocuments({ owner: req.user.id });
        if (workspaceCount <= 1) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete your only workspace'
            });
        }

        await workspace.deleteOne();

        res.json({ success: true, message: 'Workspace deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Export products to CSV
// @route   GET /api/workspaces/:id/products/export
// @access  Private
router.get('/:id/products/export', protect, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        const products = workspace.productCatalog?.products || [];

        // Definition of headers matching the Import format
        const headers = ['Product Name', 'Description', 'Price', 'Compare At Price', 'Category', 'Product Images (URLs)'];

        if (products.length === 0) {
            // Return empty CSV with headers
            const BOM = '\uFEFF';
            return res.status(200).send(BOM + headers.join(',') + '\n');
        }

        const processField = (val) => {
            if (val === undefined || val === null) return '';
            const stringVal = String(val);
            // Escape double quotes and wrap in double quotes
            return `"${stringVal.replace(/"/g, '""')}"`;
        };

        const csvRows = products.map(product => {
            return [
                processField(product.name),
                processField(product.description),
                processField(product.price),
                processField(product.compareAtPrice),
                processField(product.category),
                processField(product.images ? product.images.join(', ') : '')
            ].join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const BOM = '\uFEFF'; // Add BOM for Excel compatibility

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="products_export_${workspace.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.csv"`);
        res.status(200).send(BOM + csvContent);

    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Import products from CSV
// @route   POST /api/workspaces/:id/products/import
// @access  Private
router.post('/:id/products/import', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a CSV file' });
        }

        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        const fileContent = req.file.buffer.toString('utf-8');

        // Parse CSV
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            bom: true // Handle Excel BOM
        });

        const newProducts = [];
        let skippedIds = 0;

        // Helper to find key case-insensitively
        const findKey = (obj, targetKey) => {
            const keys = Object.keys(obj);
            return keys.find(k => k.trim().toLowerCase() === targetKey.trim().toLowerCase());
        };

        for (const record of records) {
            // Helper to get value using fuzzy key matching
            const getValue = (targetKey) => {
                const key = findKey(record, targetKey);
                return key ? record[key] : undefined;
            };

            // Mapping Logic (Matches Form Layout)
            // Column Order: Product Name -> Description -> Price -> Compare At Price -> Category -> Product Images (URLs)

            // 1. Basic Fields
            const name = getValue('Product Name');
            const description = getValue('Description');
            const priceVal = getValue('Price');
            const price = parseFloat(priceVal);
            const compareVal = getValue('Compare At Price');
            const compareAtPrice = compareVal ? parseFloat(compareVal) : undefined;
            const category = getValue('Category');

            // 2. Image Handling
            // "Product Images (URLs)" contains all images, comma separated
            const images = [];

            const imagesVal = getValue('Product Images (URLs)') || getValue('Product Images'); // Try both names
            if (imagesVal && imagesVal.trim()) {
                const urlList = imagesVal.split(',').map(url => url.trim()).filter(url => url);
                images.push(...urlList);
            }

            // Validation
            if (!name || isNaN(price)) {
                // Debug log for first skip
                if (skippedIds === 0) {
                    console.log('Skipping record (missing name or price):', record);
                    console.log('Detected Keys:', Object.keys(record));
                }
                skippedIds++;
                continue; // Skip invalid records
            }

            newProducts.push({
                name,
                description,
                price,
                compareAtPrice,
                category,
                images: images,
                stock: { available: 100, trackInventory: false }, // Default
                isActive: true, // Default to true
                createdAt: new Date()
            });
        }

        // Initialize productCatalog if missing
        if (!workspace.productCatalog) {
            workspace.productCatalog = { products: [] };
        }

        // Add new products to existing list
        workspace.productCatalog.products.push(...newProducts);

        // Limit check could be added here based on plan

        await workspace.save();

        res.json({
            success: true,
            message: `Selected ${newProducts.length} products to import. ${newProducts.length} imported successfully. ${skippedIds} skipped.`,
            count: newProducts.length
        });

    } catch (error) {
        console.error('Import Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to process CSV' });
    }
});

// @desc    Import FAQs from CSV
// @route   POST /api/workspaces/:id/faqs/import
// @access  Private
router.post('/:id/faqs/import', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a CSV file' });
        }

        const workspace = await Workspace.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        const fileContent = req.file.buffer.toString('utf-8');

        // Parse CSV
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            bom: true
        });

        const newFaqs = [];
        let skippedIds = 0;

        // Helper to find key case-insensitively
        const findKey = (obj, targetKey) => {
            const keys = Object.keys(obj);
            return keys.find(k => k.trim().toLowerCase() === targetKey.trim().toLowerCase());
        };

        for (const record of records) {
            const getValue = (targetKey) => {
                const key = findKey(record, targetKey);
                return key ? record[key] : undefined;
            };

            const question = getValue('Question');
            const answer = getValue('Answer');
            const category = getValue('Category');

            if (!question || !answer) {
                skippedIds++;
                continue;
            }

            newFaqs.push({
                question,
                answer,
                category,
                isActive: true,
                order: 0
            });
        }

        // Initialize knowledgeBase if missing
        if (!workspace.knowledgeBase) {
            workspace.knowledgeBase = { faqs: [] };
        }
        if (!workspace.knowledgeBase.faqs) {
            workspace.knowledgeBase.faqs = [];
        }

        // Enforce Limit for Free Plan
        if (workspace.plan === 'free') {
            const currentCount = workspace.knowledgeBase.faqs.length;
            const remaining = 10 - currentCount;

            if (remaining <= 0) {
                return res.status(403).json({
                    success: false,
                    error: 'Free plan limit reached (Max 10 FAQs). Upgrade to add more.'
                });
            }

            if (newFaqs.length > remaining) {
                // Determine if we should partial import or block
                // User requirement implies "do this for freeplan", usually means don't exceed.
                // I will trim the newFaqs to fit the limit and warn the user.
                const allowedFaqs = newFaqs.slice(0, remaining);
                const deniedCount = newFaqs.length - remaining;

                workspace.knowledgeBase.faqs.push(...allowedFaqs);
                await workspace.save();

                return res.json({
                    success: true,
                    message: `Imported ${allowedFaqs.length} FAQs. ${deniedCount} skipped due to Free plan limit (Max 10). ${skippedIds} invalid rows skipped.`,
                    count: allowedFaqs.length,
                    partial: true
                });
            }
        }

        // Add all (if not free or within limit)
        workspace.knowledgeBase.faqs.push(...newFaqs);
        await workspace.save();

        res.json({
            success: true,
            message: `Imported ${newFaqs.length} FAQs successfully. ${skippedIds} skipped due to missing question or answer.`,
            count: newFaqs.length
        });

    } catch (error) {
        console.error('Import Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to process CSV' });
    }
});

// @desc    [ADMIN] Update Workspace Plan
// @route   PUT /api/workspaces/:id/plan
// @access  Private (Admin Only)
router.put('/:id/plan', protect, async (req, res) => {
    try {
        // 1. Verify Admin Role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized. Admin access required.' });
        }

        const { plan } = req.body;
        const validPlans = ['free', 'starter', 'pro', 'business'];

        if (!plan || !validPlans.includes(plan)) {
            return res.status(400).json({
                success: false,
                error: `Invalid plan. Must be one of: ${validPlans.join(', ')}`
            });
        }

        // 2. Find and Update Workspace (Any workspace, since we are admin)
        const workspace = await Workspace.findById(req.params.id);

        if (!workspace) {
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        workspace.plan = plan;
        await workspace.save();

        console.log(`[ADMIN] Workspace ${workspace._id} plan updated to ${plan} by ${req.user.email}`);

        res.json({
            success: true,
            message: `Workspace plan updated to ${plan}`,
            plan: workspace.plan
        });

    } catch (error) {
        console.error('Admin Plan Update Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    [ADMIN] Bulk Update Workspace Plans
// @route   PUT /api/workspaces/bulk/plan
// @access  Private (Admin Only)
router.put('/bulk/plan', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const { userIds, plan } = req.body;
        const validPlans = ['free', 'starter', 'pro', 'business'];

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ success: false, error: 'No users selected' });
        }

        if (!plan || !validPlans.includes(plan)) {
            return res.status(400).json({ success: false, error: 'Invalid plan' });
        }

        // Update all workspaces owned by these users
        const result = await Workspace.updateMany(
            { owner: { $in: userIds } },
            { $set: { plan: plan } }
        );

        console.log(`[ADMIN] Bulk plan update to ${plan} for ${result.modifiedCount} workspaces by ${req.user.email}`);

        res.json({
            success: true,
            message: `Updated plan to ${plan} for ${result.modifiedCount} workspaces`,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error('Bulk Plan Update Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;