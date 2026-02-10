const axios = require('axios');
const fs = require('fs');

async function test() {
    try {
        // Login to get token
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@codewise.com',
            password: 'admin' // Assuming there is an admin user, or I need to create one/use existing credential
        });
        const token = loginRes.data.token;
        console.log('Got token');

        // Fetch Exams
        const res = await axios.get('http://localhost:5001/api/content/exams', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Exams:', res.data);
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

test();
