const mongoose = require('mongoose');
const User = require('./src/models/User');
const Workspace = require('./src/models/Workspace');
const crypto = require('crypto');
require('dotenv').config();

const fixAccount = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-chat-ollama');
        console.log('Connected to MongoDB');

        const email = 'ktthiphat.n@gmail.com';
        console.log(`\n🔧 Fixing account for: ${email}`);

        // 1. Find all users with this email
        const users = await User.find({ email: email }).sort({ createdAt: 1 }); // Oldest first
        console.log(`Found ${users.length} user records.`);

        if (users.length === 0) {
            console.log('❌ No user found!');
            process.exit(1);
        }

        // 2. Identify Primary User (The one with the Workspace/Key usually the oldest or the one created first)
        let primaryUser = users[0];
        console.log(`\n👑 Primary User: ${primaryUser.username} (${primaryUser._id})`);
        console.log(`   Provider: ${primaryUser.authProvider}`);

        // 3. Merge Duplicates (if any)
        if (users.length > 1) {
            console.log('\n🔄 Merging duplicates...');
            for (let i = 1; i < users.length; i++) {
                const dup = users[i];
                console.log(`   - Merging ${dup.username} (${dup.authProvider})...`);

                // Copy Auth Provider info if primary is missing it
                if (dup.authProvider !== 'local' && primaryUser.authProvider === 'local') {
                    primaryUser.authProvider = dup.authProvider;
                    primaryUser.providerId = dup.providerId;
                    primaryUser.avatar = dup.avatar || primaryUser.avatar;
                }

                // Delete duplicate workspace
                await Workspace.deleteOne({ owner: dup._id });
                // Delete duplicate user
                await User.deleteOne({ _id: dup._id });
            }
            await primaryUser.save();
            console.log('✅ Merge complete.');
        }

        // 4. Check Workspace & API Key
        let workspace = await Workspace.findOne({ owner: primaryUser._id });

        if (!workspace) {
            console.log('\n⚠️ No workspace found. Creating one...');
            workspace = await Workspace.create({
                name: `${primaryUser.username}'s Workspace`,
                owner: primaryUser._id,
                apiKey: 'mc_' + crypto.randomBytes(16).toString('hex'), // Ensure Key Exists
                plan: 'free'
            });
        } else {
            console.log(`\n🏢 Found Workspace: ${workspace.name}`);
            if (!workspace.apiKey) {
                console.log('⚠️ Missing API Key. Generating new one...');
                workspace.apiKey = 'mc_' + crypto.randomBytes(16).toString('hex');
                await workspace.save();
            } else {
                console.log(`🔑 API Key exists: ${workspace.apiKey}`);
            }
        }

        console.log('\n✅ ACCOUNT FIXED SUCCESSFULLY!');
        console.log('PLEASE ASK USER TO LOGOUT AND LOGIN AGAIN.');

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixAccount();
