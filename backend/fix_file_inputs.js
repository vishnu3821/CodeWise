const db = require('./config/db');

async function fixFileInputs() {
    try {
        console.log('Fixing File Inputs...');

        const fileMappings = {
            'Count lines in notes.txt': 'notes.txt',
            'Sum comma-separated integers in data.csv': 'data.csv',
            'Read a matrix and find max-sum row and column': 'matrix.txt',
            'Count INFO/WARN/ERROR lines in app.log': 'app.log',
            // Ledger is binary, skipping for text-based seeding check
        };

        for (const [title, filename] of Object.entries(fileMappings)) {
            // Get Question ID
            const [qRows] = await db.query("SELECT id FROM questions WHERE title = ?", [title]);
            if (qRows.length > 0) {
                const qId = qRows[0].id;

                // Get current sample input
                const [tcRows] = await db.query("SELECT input FROM test_cases WHERE question_id = ? AND is_sample = 1", [qId]);

                if (tcRows.length > 0) {
                    let currentInput = tcRows[0].input;
                    // Remove the "(filename content):" lines if present from my setup script
                    // My setup script had sample_input like `(notes.txt content):\nhello\nworld`
                    // I want to clean that up.

                    if (currentInput.includes('content):')) {
                        const parts = currentInput.split('content):\n');
                        if (parts.length > 1) {
                            currentInput = parts[1];
                        }
                    }

                    const newInput = `FILE:${filename}\n${currentInput}`;

                    await db.query("UPDATE test_cases SET input = ? WHERE question_id = ? AND is_sample = 1", [newInput, qId]);
                    // Also update sample_input in questions table for consistency if needed, but test_cases is what matters for execution.
                    await db.query("UPDATE questions SET sample_input = ? WHERE id = ?", [newInput, qId]);

                    console.log(`Updated input for: ${title}`);
                }
            }
        }
        console.log('Fix Complete!');

    } catch (err) {
        console.error('Fix failed:', err);
    } finally {
        process.exit();
    }
}

fixFileInputs();
