require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy init
        // Actually there isn't a direct "listModels" on the instance in some versions?
        // Let's try to just run a generation with a fallback model or see if we can debug.

        // Better: use the model's distinct method if available, but SDK specific.
        // For now, let's try 'gemini-1.5-flash-latest' or just logging the key (masked).
        console.log("Using Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");

        const m = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await m.generateContent("Test");
        console.log("Response:", result.response.text());
    } catch (error) {
        console.error("Error details:", error);
    }
}

listModels();
