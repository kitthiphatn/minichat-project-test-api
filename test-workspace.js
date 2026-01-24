const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let workspaceId = '';

async function testWorkspaceAPIs() {
    try {
        console.log('='.repeat(60));
        console.log('🧪 Testing Workspace Management APIs');
        console.log('='.repeat(60));

        // Step 1: Login to get token
        console.log('\n📝 Step 1: Login');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'test1769223862757@example.com', // Use existing test user
            password: 'Test123456'
        });
        authToken = loginResponse.data.token;
        workspaceId = loginResponse.data.workspace.id;
        console.log('✅ Login successful!');
        console.log('Workspace ID:', workspaceId);

        // Step 2: Get all workspaces
        console.log('\n📂 Step 2: Get All Workspaces');
        const workspacesResponse = await axios.get(`${API_URL}/workspaces`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Got workspaces:', workspacesResponse.data.workspaces.length);
        console.log('Workspaces:', JSON.stringify(workspacesResponse.data.workspaces, null, 2));

        // Step 3: Get single workspace
        console.log('\n📋 Step 3: Get Single Workspace');
        const workspaceResponse = await axios.get(`${API_URL}/workspaces/${workspaceId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Got workspace:', workspaceResponse.data.workspace.name);

        // Step 4: Update workspace name
        console.log('\n✏️ Step 4: Update Workspace Name');
        const updateResponse = await axios.put(
            `${API_URL}/workspaces/${workspaceId}`,
            {
                name: 'Updated Test Workspace',
                settings: {
                    welcomeMessage: 'Hello! Updated welcome message!',
                    widgetColor: '#FF5733'
                }
            },
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        console.log('✅ Workspace updated!');
        console.log('New name:', updateResponse.data.workspace.name);
        console.log('New settings:', updateResponse.data.workspace.settings);

        // Step 5: Create new workspace
        console.log('\n➕ Step 5: Create New Workspace');
        const createResponse = await axios.post(
            `${API_URL}/workspaces`,
            { name: 'Second Test Workspace' },
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        const newWorkspaceId = createResponse.data.workspace._id;
        console.log('✅ New workspace created!');
        console.log('Workspace ID:', newWorkspaceId);
        console.log('API Key:', createResponse.data.workspace.apiKey);

        // Step 6: List workspaces again
        console.log('\n📂 Step 6: List Workspaces Again');
        const workspaces2Response = await axios.get(`${API_URL}/workspaces`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Got workspaces:', workspaces2Response.data.workspaces.length);

        // Step 7: Regenerate API key
        console.log('\n🔄 Step 7: Regenerate API Key');
        const oldApiKey = createResponse.data.workspace.apiKey;
        const regenerateResponse = await axios.post(
            `${API_URL}/workspaces/${newWorkspaceId}/regenerate-key`,
            {},
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        console.log('✅ API key regenerated!');
        console.log('Old key:', oldApiKey);
        console.log('New key:', regenerateResponse.data.apiKey);

        // Step 8: Delete workspace
        console.log('\n🗑️ Step 8: Delete Second Workspace');
        await axios.delete(`${API_URL}/workspaces/${newWorkspaceId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Workspace deleted!');

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL WORKSPACE API TESTS PASSED!');
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

testWorkspaceAPIs();