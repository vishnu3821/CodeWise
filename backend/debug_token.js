const jwt = require('jsonwebtoken');

async function debug() {
    try {
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'cm@codewise.com', password: 'ContentManager@123' })
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            console.error("Login Failed:", loginData);
            return;
        }

        const token = loginData.token;
        console.log("Token:", token);

        const decoded = jwt.decode(token);
        console.log("Decoded Payload:", decoded);

    } catch (e) {
        console.error('Error:', e);
    }
}
debug();
