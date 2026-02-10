const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
// Ensure GEMINI_API_KEY is in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithAI = async (req, res) => {
    try {
        const { message, language, topic, section } = req.body;

        // Security: Disable in Exam Practice
        if (section && section.includes('Exam Practice')) {
            return res.status(403).json({
                message: "CodeWise AI is disabled during exams to ensure fair assessment."
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is missing in backend .env");
            return res.status(500).json({ message: "AI service configuration error." });
        }

        // Construct Context-Aware Prompt
        let contextInstruction = "You are CodeWise AI, a helpful programming tutor.";

        if (language) {
            contextInstruction += ` The user is currently learning ${language}.`;
        }
        if (topic) {
            contextInstruction += ` They are studying the topic: ${topic}.`;
        }

        contextInstruction += `
        Rules:
        1. Provide clear, concise explanations.
        2. Help with syntax, concepts, and debugging.
        3. Do NOT provide direct answers if the user asks for full code solutions to exercises; instead, guide them with logic and hints.
        4. Be encouraging and professional.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `${contextInstruction}\n\nUser Question: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });

    } catch (error) {
        console.error("Gemini API Error:", error);

        if (error.status === 429 || (error.message && error.message.includes('Quota exceeded'))) {
            return res.status(429).json({ message: "AI is experiencing high traffic. Please wait moment." });
        }

        res.status(500).json({ message: "AI service is temporarily unavailable. Try again later." });
    }
};
