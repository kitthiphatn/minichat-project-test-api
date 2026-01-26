const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function getApiKey() {
    try {
        console.log('🔍 Retrieving API Key...');

        // Try to login with the test account from test-apikey.js
        try {
            const loginResponse = await axios.post(`${API_URL}/auth/login`, {
                email: 'test1769223862757@example.com',
                password: 'Test123456'
            });

            console.log('\n✅ SUCCEES! Here is your API Key:');
            console.log('='.repeat(40));
            console.log(loginResponse.data.workspace.apiKey);
            console.log('='.repeat(40));
            console.log('\n👉 Copy this key and paste it into minichat-widget-v2.html');
            console.log('   at: data-api-key="YOUR_API_KEY_HERE"');

        } catch (loginError) {
            console.log('Login failed, trying to register a new user...');
            // If login fails, try to register
            const email = `user_${Date.now()}@example.com`;
            const password = 'Password123!';

            const registerResponse = await axios.post(`${API_URL}/auth/register`, {
                name: 'MiniChat Admin',
                email: email,
                password: password,
                workspaceName: 'My Workspace'
            });

            console.log('\n✅ REGISTERED NEW USER & RETRIEVED KEY:');
            console.log('='.repeat(40));
            console.log(registerResponse.data.workspace.apiKey);
            console.log('='.repeat(40));
            console.log(`(Account: ${email} / ${password})`);
            console.log('\n👉 Copy this key and paste it into minichat-widget-v2.html');
        }

    } catch (error) {
        console.error('❌ Failed to retrieve key:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('   Is the backend server running?');
        }
    }
}

getApiKey();
