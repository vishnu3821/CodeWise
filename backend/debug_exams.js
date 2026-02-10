async function debug() {
    try {
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'cm@codewise.com', password: 'ContentManager@123' })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        if (!loginRes.ok) throw new Error(JSON.stringify(loginData));

        const token = loginData.token;
        console.log('Token acquired.');

        const examRes = await fetch('http://localhost:5001/api/content/exams', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const examBody = await examRes.text();
        console.log('Exam API Status:', examRes.status);

        try {
            const json = JSON.parse(examBody);
            console.log('Response JSON:', json);
        } catch (e) {
            console.log('Response Text:', examBody);
        }

    } catch (e) {
        console.error('Fatal Error:', e);
    }
}
debug();
