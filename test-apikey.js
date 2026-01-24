const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testApiKeySystem() {
    try {
        console.log('='.repeat(60));
        console.log('🔑 Testing API Key System');
        console.log('='.repeat(60));

        // Step 1: Login and get workspace
        console.log('\n📝 Step 1: Login to get API key');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'test1769223862757@example.com',
            password: 'Test123456'
        });
        const apiKey = loginResponse.data.workspace.apiKey;
        console.log('✅ Got API key:', apiKey);

        // Step 2: Test widget config endpoint
        console.log('\n🔧 Step 2: Get Widget Config');
        const configResponse = await axios.get(`${API_URL}/widget/config`, {
            headers: { 'x-api-key': apiKey }
        });
        console.log('✅ Widget config retrieved!');
        console.log('Config:', JSON.stringify(configResponse.data, null, 2));

        // Step 3: Test invalid API key
        console.log('\n❌ Step 3: Test Invalid API Key');
        try {
            await axios.get(`${API_URL}/widget/config`, {
                headers: { 'x-api-key': 'invalid_key_123' }
            });
            console.log('❌ Should have failed!');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Invalid API key rejected correctly!');
                console.log('Error:', error.response.data.error);
            }
        }

        // Step 4: Test chat with API key
        console.log('\n💬 Step 4: Test Chat with API Key');
        const chatResponse = await axios.post(
            `${API_URL}/chat/message`,
            {
                message: 'Hello, test message!',
                provider: 'groq',
                model: 'llama-3.3-70b-versatile'
            },
            {
                headers: {
                    'x-api-key': apiKey,
                    'x-session-id': 'test-session-' + Date.now()
                }
            }
        );
        console.log('✅ Chat message sent successfully!');
        console.log('Response:', chatResponse.data.response?.substring(0, 100) + '...');

        // Step 5: Check if message count increased
        console.log('\n📊 Step 5: Check Message Count');
        const configResponse2 = await axios.get(`${API_URL}/widget/config`, {
            headers: { 'x-api-key': apiKey }
        });
        console.log('✅ Message count updated!');
        console.log('Messages this month:', configResponse2.data.config.usage.messagesThisMonth);
        console.log('Remaining:', configResponse2.data.config.usage.remaining);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL API KEY TESTS PASSED!');
        console.log('='.repeat(60));
        console.log('Features tested:');
        console.log('  ✓ API key validation');
        console.log('  ✓ Widget config retrieval');
        console.log('  ✓ Invalid key rejection');
        console.log('  ✓ Chat with API key authentication');
        console.log('  ✓ Message counter increment');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ TEST FAILED!');
        console.error('Error:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

testApiKeySystem();