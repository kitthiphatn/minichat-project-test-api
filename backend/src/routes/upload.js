const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { protect } = require('../middleware/auth');
const Workspace = require('../models/Workspace');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage (temp storage, will be processed)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `temp-logo-${req.user.id}-${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
};

// Multer upload config
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: fileFilter
});

/**
 * Resize image to 64x64 if not already that size
 */
async function resizeLogoTo64x64(inputPath, outputPath) {
    const metadata = await sharp(inputPath).metadata();

    // If already 64x64, just copy
    if (metadata.width === 64 && metadata.height === 64) {
        fs.copyFileSync(inputPath, outputPath);
        return;
    }

    // Resize to 64x64, maintaining aspect ratio and filling with cover
    await sharp(inputPath)
        .resize(64, 64, {
            fit: 'cover',
            position: 'center'
        })
        .toFile(outputPath);
}

/**
 * @route   POST /api/upload/logo
 * @desc    Upload a logo image (auto-resized to 64x64)
 * @access  Private
 */
router.post('/logo', protect, upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Get the workspace
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            // Delete uploaded temp file if workspace not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        // Delete old logo if exists
        if (workspace.settings.logo) {
            const oldLogoPath = path.join(uploadsDir, path.basename(workspace.settings.logo));
            if (fs.existsSync(oldLogoPath)) {
                fs.unlinkSync(oldLogoPath);
            }
        }

        // Generate final filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const finalFilename = `logo-${req.user.id}-${uniqueSuffix}.png`;
        const finalPath = path.join(uploadsDir, finalFilename);

        // Resize image to 64x64
        await resizeLogoTo64x64(req.file.path, finalPath);

        // Delete the temp file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Generate public URL for the logo
        const logoUrl = `/uploads/${finalFilename}`;

        // Update workspace settings
        workspace.settings.logo = logoUrl;
        await workspace.save();

        res.json({
            success: true,
            logoUrl: logoUrl,
            message: 'Logo uploaded and resized to 64x64 successfully'
        });
    } catch (error) {
        console.error('Error uploading logo:', error);
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
});

/**
 * @route   DELETE /api/upload/logo
 * @desc    Delete current logo
 * @access  Private
 */
router.delete('/logo', protect, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ owner: req.user.id });
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        // Delete the logo file if exists
        if (workspace.settings.logo) {
            const logoPath = path.join(uploadsDir, path.basename(workspace.settings.logo));
            if (fs.existsSync(logoPath)) {
                fs.unlinkSync(logoPath);
            }
        }

        // Clear logo from settings
        workspace.settings.logo = '';
        await workspace.save();

        res.json({ success: true, message: 'Logo deleted successfully' });
    } catch (error) {
        console.error('Error deleting logo:', error);
        res.status(500).json({ success: false, message: error.message || 'Delete failed' });
    }
});

module.exports = router;
