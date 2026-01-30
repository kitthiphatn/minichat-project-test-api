const mongoose = require('mongoose');
const Workspace = require('../src/models/Workspace');
require('dotenv').config();

const upgradeWorkspace = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the latest workspace
        const workspace = await Workspace.findOne().sort({ createdAt: -1 });

        if (!workspace) {
            console.log('No workspace found.');
            process.exit(1);
        }

        console.log(`Found Workspace: ${workspace.name} (${workspace._id})`);
        console.log(`Current Plan: ${workspace.plan}`);

        // Update to PRO
        workspace.plan = 'pro';
        await workspace.save();

        console.log(`SUCCESS: Upgraded workspace to "pro" plan.`);
        console.log('You can now test Gemini integration.');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

upgradeWorkspace();
