const { executeBatch } = require('./services/codeExecutionService');

async function test() {
    try {
        const res = await executeBatch('print("Hello Piston!")', [''], 'python');
        console.log("Response:", JSON.stringify(res, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
