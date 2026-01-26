const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../src/models/User');
const Workspace = require('../src/models/Workspace');
const Message = require('../src/models/Message');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        console.log('\nChecking User Indexes...');
        console.log(await User.collection.getIndexes());

        console.log('\nChecking Workspace Indexes...');
        console.log(await Workspace.collection.getIndexes());

        console.log('\nChecking Message Indexes...');
        // Message model might not be loaded if not required elsewhere, but here we required it.
        // If Message model doesn't exist yet (it might not have been created in previous steps?), we skip.
        if (Message) {
            console.log(await Message.collection.getIndexes());
        } else {
            console.log('Message model not found/loaded');
        }

        console.log('\n✓ Index check complete');
        process.exit(0);
    } catch (error) {
        console.error('Index check failed:', error);
        process.exit(1);
    }
}

check();
