/**
 * Script to set admin role for a user
 * Usage: node scripts/set-admin.js <email>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function setAdmin(email) {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }

        // Update role to admin
        user.role = 'admin';
        await user.save();

        console.log(`✅ Successfully set admin role for user: ${user.email} (${user.username})`);
        console.log(`User ID: ${user._id}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
    console.error('Usage: node scripts/set-admin.js <email>');
    console.error('Example: node scripts/set-admin.js user@example.com');
    process.exit(1);
}

setAdmin(email);
