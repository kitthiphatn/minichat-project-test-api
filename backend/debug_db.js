const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('URI:', process.env.MONGODB_URI);

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');
        const Workspace = require('./src/models/Workspace');
        const count = await Workspace.countDocuments();
        console.log('Workspace Count:', count);
        const ws = await Workspace.findOne();
        console.log('First Workspace:', ws ? ws._id : 'None');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}
test();
