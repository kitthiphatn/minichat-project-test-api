const mongoose = require('mongoose');
const User = require('./src/models/User');
const Workspace = require('./src/models/Workspace');
require('dotenv').config();

const transferOwnership = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const targetEmail = 'ktthiphat.n@gmail.com';
        const targetUser = await User.findOne({ email: targetEmail });

        if (!targetUser) {
            console.error(`Target user ${targetEmail} not found!`);
            process.exit(1);
        }

        console.log(`Target Super User: ${targetUser.username} (${targetUser._id})`);

        // List of specific Workspace IDs to transfer (orphans identified previously)
        // Or better, find all workspaces and check if their owner exists
        const workspaces = await Workspace.find();

        let updateCount = 0;

        for (const ws of workspaces) {
            // Check if current owner exists
            const ownerExists = await User.exists({ _id: ws.owner });

            if (!ownerExists) {
                console.log(`Transferring ORPHAN workspace: "${ws.name}" (${ws._id})`);
                console.log(`   Old Owner ID: ${ws.owner} (Not found in DB)`);

                await Workspace.updateOne(
                    { _id: ws._id },
                    { $set: { owner: targetUser._id } }
                );

                console.log(`   -> New Owner: ${targetUser.username}`);
                updateCount++;
            } else if (ws.owner.toString() === targetUser._id.toString()) {
                console.log(`Skipping: "${ws.name}" already owned by target.`);
            } else {
                console.log(`Skipping: "${ws.name}" owned by valid user ${ws.owner}.`);
            }
        }

        console.log(`\nOwnership transfer complete. Updated ${updateCount} workspaces.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

transferOwnership();
