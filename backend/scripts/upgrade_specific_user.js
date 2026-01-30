const mongoose = require('mongoose');
const User = require('../src/models/User');
const Workspace = require('../src/models/Workspace');
require('dotenv').config();

const upgradeSpecificUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'ktthiphat.n@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found.`);
            process.exit(1);
        }

        console.log(`Found User: ${user.username} (${user._id})`);

        // Find workspace owned by this user
        const workspace = await Workspace.findOne({ owner: user._id });

        if (!workspace) {
            console.log('No workspace found for this user.');
            process.exit(1);
        }

        console.log(`Found Workspace: ${workspace.name} (${workspace._id})`);
        console.log(`Current Plan: ${workspace.plan}`);

        // Update to BUSINESS
        workspace.plan = 'business';
        await workspace.save();

        console.log(`SUCCESS: Upgraded workspace for ${email} to "business" plan.`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

upgradeSpecificUser();
