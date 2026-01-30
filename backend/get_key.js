
const mongoose = require('mongoose');
const Workspace = require('./src/models/Workspace');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mini-chat-ollama', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');

    // Find the most recent workspace
    const workspace = await Workspace.findOne().sort({ createdAt: -1 });

    if (workspace) {
        console.log(`API_KEY=${workspace.apiKey}`);
        console.log(`WORKSPACE_ID=${workspace._id}`);
    } else {
        console.log('No workspace found');
    }

    mongoose.connection.close();
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
