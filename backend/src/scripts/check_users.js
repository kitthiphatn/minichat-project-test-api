require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-chat-ollama');
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log('-----------------------------------');
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ID: ${u._id}`);
            console.log(`  Username: ${u.username}`);
            console.log(`  Email: ${u.email}`);
            console.log(`  Provider: ${u.authProvider || 'local'}`);
            console.log('-----------------------------------');
        });

        if (users.length === 0) {
            console.log('No users found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

checkUsers();
