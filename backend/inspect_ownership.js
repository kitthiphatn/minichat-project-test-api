const mongoose = require('mongoose');
const User = require('./src/models/User');
const Workspace = require('./src/models/Workspace');
require('dotenv').config();

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const targetEmail = 'ktthiphat.n@gmail.com';
        const targetUser = await User.findOne({ email: targetEmail });

        if (!targetUser) {
            console.log(`Target user ${targetEmail} not found!`);
        } else {
            console.log(`Target User: ${targetUser.username} (${targetUser.email}) ID: ${targetUser._id} Role: ${targetUser.role}`);
        }

        const workspaces = await Workspace.find().populate('owner', 'username email');
        console.log(`\nFound ${workspaces.length} workspaces:`);

        workspaces.forEach(ws => {
            console.log(`- Workspace: "${ws.name}" (ID: ${ws._id})`);
            console.log(`  Owner: ${ws.owner ? `${ws.owner.username} (${ws.owner.email}) [${ws.owner._id}]` : 'UNKNOWN'}`);
            console.log(`  Plan: ${ws.plan}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

inspect();
