const axios = require('axios');

// This script creates president accounts by calling the API endpoints
// Make sure the server is running first

const API_BASE_URL = 'http://localhost:4005';

const createPresidentAccounts = async () => {
  try {
    console.log('🚀 Starting to create president accounts via API...');
    
    // First, let's check if the server is running
    try {
      await axios.get(`${API_BASE_URL}/`);
      console.log('✅ Server is running');
    } catch (error) {
      console.error('❌ Server is not running. Please start the server first with: npm run dev');
      return;
    }

    // Get the President role ID
    let presidentRoleId;
    try {
      const rolesResponse = await axios.get(`${API_BASE_URL}/api/roles`);
      const presidentRole = rolesResponse.data.data.find(role => role.key === 'President');
      if (!presidentRole) {
        console.error('❌ President role not found. Please run the seed script first: npm run seed');
        return;
      }
      presidentRoleId = presidentRole._id;
      console.log('✅ Found President role:', presidentRoleId);
    } catch (error) {
      console.error('❌ Error fetching roles:', error.response?.data || error.message);
      return;
    }

    // Create Mahmoud's account
    const mahmoudData = {
      firstName: 'Mahmoud',
      lastName: 'President',
      nationalID: '12345678901',
      dateOfBirth: '1995-01-01',
      email: 'mahmoud@president.com',
      password: 'password123',
      phoneNumber: '+1234567890'
    };

    // Create Nour's account
    const nourData = {
      firstName: 'Nour',
      lastName: 'President',
      nationalID: '12345678902',
      dateOfBirth: '1995-02-01',
      email: 'nour@president.com',
      password: 'password123',
      phoneNumber: '+1234567891'
    };

    // Note: The signup endpoint requires a photo upload, so we'll need to use a different approach
    // Let's create a direct database script instead
    
    console.log('\n📋 Account Details to Create:');
    console.log('Mahmoud:', mahmoudData);
    console.log('Nour:', nourData);
    console.log('\n⚠️  Note: The signup API requires photo upload, so this approach won\'t work directly.');
    console.log('Please use the create-president-accounts.js script with a running MongoDB instance instead.');

  } catch (error) {
    console.error('❌ Error creating president accounts:', error.message);
  }
};

// Run the script
createPresidentAccounts();

