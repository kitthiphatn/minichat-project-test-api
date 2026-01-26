const mongoose = require('mongoose');
const User = require('./src/models/User');
const Workspace = require('./src/models/Workspace');
require('dotenv').config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-chat-ollama');
        console.log('Connected to MongoDB');

        const email = 'ktthiphat.n@gmail.com';
        console.log(`\n🔍 Searching for users with email: ${email}`);

        const users = await User.find({ email: email });
        console.log(`Found ${users.length} user record(s):`);

        for (const u of users) {
            console.log(`\nUser ID: ${u._id}`);
            console.log(` - Username: ${u.username}`);
            console.log(` - Provider: ${u.authProvider} (ID: ${u.providerId})`);

            const workspace = await Workspace.findOne({ owner: u._id });
            if (workspace) {
                console.log(` - Workspace: ${workspace.name} (ID: ${workspace._id})`);
                console.log(` - API Key: ${workspace.apiKey}`);
            } else {
                console.log(` - ❌ NO WORKSPACE FOUND`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkData();
