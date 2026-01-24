const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAuth() {
    try {
        console.log('='.repeat(60));
        console.log('🧪 Testing Auth System');
        console.log('='.repeat(60));

        // Generate unique email for testing
        const timestamp = Date.now();
        const testUser = {
            username: `testuser${timestamp}`,
            email: `test${timestamp}@example.com`,
            password: 'Test123456'
        };

        // Test 1: Registration
        console.log('\n📝 Test 1: User Registration');
        console.log('Request:', JSON.stringify(testUser, null, 2));

        const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
        console.log('✅ Registration successful!');
        console.log('Response:', JSON.stringify(registerResponse.data, null, 2));

        const token = registerResponse.data.token;
        const userId = registerResponse.data.user.id;
        const workspaceId = registerResponse.data.workspace?.id;

        // Test 2: Login
        console.log('\n🔐 Test 2: User Login');
        const loginData = {
            email: testUser.email,
            password: testUser.password
        };
        console.log('Request:', JSON.stringify(loginData, null, 2));

        const loginResponse = await axios.post(`${API_URL}/auth/login`, loginData);
        console.log('✅ Login successful!');
        console.log('Response:', JSON.stringify(loginResponse.data, null, 2));

        // Test 3: Get Me (Protected Route)
        console.log('\n👤 Test 3: Get Current User (Protected Route)');
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('✅ Protected route accessed successfully!');
        console.log('Response:', JSON.stringify(meResponse.data, null, 2));

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS PASSED!');
        console.log('='.repeat(60));
        console.log(`User ID: ${userId}`);
        console.log(`Workspace ID: ${workspaceId}`);
        console.log(`Token: ${token.substring(0, 20)}...`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ TEST FAILED!');
        console.error('Error:', error.response?.data || error.message);
        process.exit(1);
    }
}

testAuth();