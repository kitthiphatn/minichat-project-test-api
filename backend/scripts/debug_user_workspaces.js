const mongoose = require('mongoose');
const User = require('../src/models/User');
const Workspace = require('../src/models/Workspace');
require('dotenv').config();

const debugWorkspaces = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'ktthiphat.n@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found.`);
            process.exit(1);
        }

        console.log(`User: ${user.username} (${user._id})`);
        console.log(`Role: ${user.role}`);

        const workspaces = await Workspace.find({ owner: user._id });
        console.log(`Found ${workspaces.length} workspaces:`);

        workspaces.forEach(ws => {
            console.log(`- ID: ${ws._id}`);
            console.log(`  Name: ${ws.name}`);
            console.log(`  Plan: ${ws.plan}`);
            console.log(`  Created: ${ws.createdAt}`);
            console.log('---');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugWorkspaces();
