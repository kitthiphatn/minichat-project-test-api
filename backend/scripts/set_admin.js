const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const setAdminRole = async () => {
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

        user.role = 'admin';
        await user.save();

        console.log(`SUCCESS: User ${email} is now an ADMIN.`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

setAdminRole();
