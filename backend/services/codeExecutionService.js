const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const TEMP_DIR = path.join(__dirname, '../../temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Static check for input consumption
const checkInputConsumption = (code, language) => {
    // Remove comments
    const codeWithoutComments = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');

    // Check for input reading patterns
    if (language === 'c') {
        const patterns = [
            /scanf\s*\(/,
            /getchar\s*\(/,
            /fgets\s*\(/,
            /fgetc\s*\(/,
            /read\s*\(/,
            /fscanf\s*\(/,
            /getc\s*\(/
        ];
        return patterns.some(p => p.test(codeWithoutComments));
    } else if (language === 'cpp') {
        const patterns = [
            /cin\s*(>>|\.)/,
            /getline\s*\(/,
            /scanf\s*\(/,
            /getchar\s*\(/,
            /fgets\s*\(/
        ];
        return patterns.some(p => p.test(codeWithoutComments));
    }
    return true; // Default true for other languages if supported later
};

const compileC = (filePath, outputId) => {
    return new Promise((resolve, reject) => {
        const outPath = path.join(TEMP_DIR, outputId);
        exec(`gcc "${filePath}" -o "${outPath}"`, (error, stdout, stderr) => {
            if (error) {
                reject({ type: 'Compilation Error', message: stderr });
            } else {
                resolve(outPath);
            }
        });
    });
};

const runBinary = (binaryPath, input) => {
    return new Promise((resolve, reject) => {
        const child = spawn(binaryPath);
        let output = '';
        let errorOutput = '';

        // Timeout (2 seconds for stricter limits)
        const timeout = setTimeout(() => {
            child.kill();
            reject({ type: 'Runtime Error', message: 'Time Limit Exceeded' });
        }, 2000);

        if (input) {
            child.stdin.write(input);
        }
        child.stdin.end();

        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        child.on('close', (code) => {
            clearTimeout(timeout);
            if (code !== 0) {
                // Determine error type based on signal or code
                const msg = errorOutput || `Process exited with code ${code}`;
                reject({ type: 'Runtime Error', message: msg });
            } else {
                // Return both stdout and stderr for visualization parsing
                resolve({ stdout: output, stderr: errorOutput });
            }
        });

        child.on('error', (err) => {
            clearTimeout(timeout);
            reject({ type: 'Runtime Error', message: err.message });
        });
    });
};

const compileCpp = (filePath, outputId) => {
    return new Promise((resolve, reject) => {
        const outPath = path.join(TEMP_DIR, outputId);
        // Compile using g++ with C++17 standard
        exec(`g++ -std=c++17 "${filePath}" -o "${outPath}"`, (error, stdout, stderr) => {
            if (error) {
                reject({ type: 'Compilation Error', message: stderr });
            } else {
                resolve(outPath);
            }
        });
    });
};

exports.checkInputConsumption = checkInputConsumption;

exports.executeBatch = async (code, inputs, language) => {
    console.log(`--- Executing Batch ${language.toUpperCase()} ---`);
    console.log('Code length:', code.length);
    console.log('Test Cases:', inputs.length);

    // 1. Static Check (DISABLED for flexibility)
    // const needsInput = inputs.some(i => i && i.trim().length > 0);
    // if ((language === 'c' || language === 'cpp') && needsInput && !checkInputConsumption(code, language)) {
    //     return {
    //         success: false,
    //         error: {
    //             type: 'Wrong Answer',
    //             message: 'Your program does not process input. Input is ignored.'
    //         }
    //     };
    // }

    const fileId = uuidv4();
    let extension = 'txt';
    let className = 'Main'; // Default for Java

    if (language === 'c') extension = 'c';
    else if (language === 'cpp') extension = 'cpp';
    else if (language === 'python') extension = 'py';
    else if (language === 'java') {
        extension = 'java';
        // Try to extract class name, default to Main if not found
        const match = code.match(/public\s+class\s+(\w+)/);
        if (match) className = match[1];
        else {
            // If no public class, we might need to wrap it or force Main?
            // For now, let's assume they write 'class Main' or we rename the file to Main.java if strictly 'public class Main'
            // If they use a different public class name, file name MUST match.
            // We'll use the extracted name for the file.
            if (code.includes('class Main')) className = 'Main';
        }
    }

    // Java files need to match class name
    const fileName = language === 'java' ? `${className}.java` : `${fileId}.${extension}`;
    // Use a unique directory for Java to avoid class conflicts if concurrent?
    // For simplicity, using one temp dir. Collisions unlikely with UUIDs, but Java needs specific names.
    // If multiple users submit 'Main', we have a problem in the same folder.
    // SOLUTION: Create a unique subfolder for this execution.
    const execDir = path.join(TEMP_DIR, fileId);
    if (!fs.existsSync(execDir)) await fs.promises.mkdir(execDir, { recursive: true });

    const filePath = path.join(execDir, fileName);
    let binaryPath = null;
    let runCommand = null;

    try {
        // 2. Write File
        await fs.promises.writeFile(filePath, code);

        // 3. Compile / Prepare
        if (language === 'cpp') {
            const outPath = path.join(execDir, 'obj_cpp');
            await new Promise((resolve, reject) => {
                exec(`g++ -std=c++17 "${filePath}" -o "${outPath}"`, (err, stdout, stderr) => {
                    if (err) reject({ type: 'Compilation Error', message: stderr });
                    else resolve();
                });
            });
            binaryPath = outPath;
        } else if (language === 'c') {
            const outPath = path.join(execDir, 'obj_c');
            await new Promise((resolve, reject) => {
                exec(`gcc "${filePath}" -o "${outPath}"`, (err, stdout, stderr) => {
                    if (err) reject({ type: 'Compilation Error', message: stderr });
                    else resolve();
                });
            });
            binaryPath = outPath;
        } else if (language === 'java') {
            await new Promise((resolve, reject) => {
                exec(`javac "${filePath}"`, (err, stdout, stderr) => {
                    if (err) reject({ type: 'Compilation Error', message: stderr });
                    else resolve();
                });
            });
            // Java Run Command
            // No binary path in the spawn sense, but we handle it in loop
        }
        // Python needs no compilation

        // 4. Run per test case
        const results = [];
        for (const input of inputs) {
            try {
                let stdout, stderr;

                if (language === 'python') {
                    // Python 3
                    const runRes = await runCommandPromise('python3', [filePath], input);
                    stdout = runRes.stdout; stderr = runRes.stderr;
                } else if (language === 'java') {
                    // Java
                    // classpath is execDir, run className
                    const runRes = await runCommandPromise('java', ['-cp', execDir, className], input);
                    stdout = runRes.stdout; stderr = runRes.stderr;
                } else {
                    // C/C++
                    const runRes = await runBinary(binaryPath, input);
                    stdout = runRes.stdout; stderr = runRes.stderr;
                }

                results.push({ success: true, output: stdout ? stdout.trim() : '', stderr: stderr });
            } catch (err) {
                results.push({ success: false, error: err });
            }
        }

        return { success: true, results: results };

    } catch (error) {
        return { success: false, error: error };
    } finally {
        // Cleanup unique dir
        try {
            if (fs.existsSync(execDir)) {
                await fs.promises.rm(execDir, { recursive: true, force: true });
            }
        } catch (e) { console.error('Cleanup failed', e); }
    }
};

// Helper for spawn-based running (Python/Java)
const runCommandPromise = (cmd, args, input) => {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args);
        let output = '';
        let errorOutput = '';

        const timeout = setTimeout(() => {
            child.kill();
            reject({ type: 'Runtime Error', message: 'Time Limit Exceeded' });
        }, 2000);

        if (input) { child.stdin.write(input); }
        child.stdin.end();

        child.stdout.on('data', d => output += d.toString());
        child.stderr.on('data', d => errorOutput += d.toString());

        child.on('close', code => {
            clearTimeout(timeout);
            if (code !== 0) {
                reject({ type: 'Runtime Error', message: errorOutput || `Exited with ${code}` });
            } else {
                resolve({ stdout: output, stderr: errorOutput });
            }
        });
        child.on('error', err => {
            clearTimeout(timeout);
            reject({ type: 'Runtime Error', message: err.message });
        });
    });
};

// Keep single execution for backward compatibility if needed, but optimized
exports.executeC = async (code, input = '') => {
    const res = await exports.executeBatch(code, [input], 'c');
    if (!res.success) return res;
    return res.results[0];
};

exports.executeCpp = async (code, input = '') => {
    const res = await exports.executeBatch(code, [input], 'cpp');
    if (!res.success) return res;
    return res.results[0];
};
