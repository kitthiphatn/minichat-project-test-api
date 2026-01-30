const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Connect to DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const Workspace = require('./src/models/Workspace');

const run = async () => {
    await connectDB();

    try {
        // Find the first workspace (assuming single user/workspace for this context)
        const workspace = await Workspace.findOne();

        if (!workspace) {
            console.log('No workspace found');
            return;
        }

        console.log('Workspace ID:', workspace._id);
        console.log('Settings Logo:', workspace.settings.logo);

        const imagePath = workspace.settings.logo;

        // Mock getImageBase64 logic from widget.js (UPDATED)
        console.log('--- Testing getImageBase64 Logic (UPDATED) ---');

        let localPath = imagePath;
        const baseUrl = 'https://api.clubfivem.com';
        if (localPath && localPath.includes(baseUrl)) {
            console.log('Stripping base URL...');
            localPath = localPath.replace(baseUrl, '');
        }
        console.log('Local Path:', localPath);

        if (localPath && localPath.startsWith('/uploads/')) {
            // Logic from widget.js
            // __dirname in widget.js was backend/src/routes -> we simulate backend/src/routes
            // The debug script is in backend/
            // effective path join in widget.js: path.join(__dirname, '../..', localPath)

            // Simulation: 
            // We need to resolve against backend root.
            const fullPath = path.join(__dirname, localPath);

            console.log('Calculated Full Path:', fullPath);
            console.log('File Exists?', fs.existsSync(fullPath));

            if (fs.existsSync(fullPath)) {
                console.log('File found. Attempting read...');
                const stats = fs.statSync(fullPath);
                console.log('File size:', stats.size);

                // Try converting to base64
                const fileBuffer = fs.readFileSync(fullPath);
                const ext = path.extname(fullPath).substring(1);
                const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
                console.log(`[Success] Would return: data:${mimeType};base64,... (length: ${fileBuffer.toString('base64').length})`);

            } else {
                console.log('File NOT found.');
                // Listing uploads dir
                const uploadsDir = path.join(__dirname, 'uploads');
                console.log('Listing backend/uploads content:');
                if (fs.existsSync(uploadsDir)) {
                    console.log(fs.readdirSync(uploadsDir));
                } else {
                    console.log('uploads dir does not exist at:', uploadsDir);
                }
            }
        } else {
            console.log('Logo path does not start with /uploads/ after stripping base URL');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

run();
