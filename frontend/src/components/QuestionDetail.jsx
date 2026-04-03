import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import {
    ArrowLeft, Play, Send, RotateCcw,
    ChevronUp, ChevronDown, CheckCircle, XCircle,
    AlertTriangle, Terminal
} from 'lucide-react';
import './QuestionDetail.css';

const QuestionDetail = () => {
    const { language: slug, topicSlug, subtopicId, questionId } = useParams();
    const location = useLocation();
    const { readOnly, submittedCode } = location.state || {};

    const [question, setQuestion] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [testCases, setTestCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Editor State
    // Default code setup based on language
    const getDefaultCode = (lang) => {
        const lowerLang = lang ? lang.toLowerCase() : 'c';
        if (lowerLang === 'cpp' || lowerLang === 'c++') {
            return '// Write your code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}';
        }
        if (lowerLang === 'sql') {
            return '-- Write your query here';
        }
        if (lowerLang === 'java') {
            return '// Write your code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}';
        }
        if (lowerLang === 'python') {
            return '# Write your code here\nprint("Hello World")';
        }
        // Default C
        return '// Write your code here\n#include <stdio.h>\n\nint main() {\n    printf("Hello World");\n    return 0;\n}';
    };

    const [code, setCode] = useState(readOnly && submittedCode ? submittedCode : getDefaultCode(slug));
    const [editorMounted, setEditorMounted] = useState(false);
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
    const [runResults, setRunResults] = useState(null); // Array of case results

    // ... 

    // Helper to render formatting for SQL Table if needed (Hardcoded for this specific task requirement)
    const EmployeesTable = () => (
        <div className="desc-section">
            <h3>Preloaded Table: employees</h3>
            <div className="table-responsive" style={{ fontSize: '0.85rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '8px', textAlign: 'left' }}>emp_id</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>emp_name</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>department</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>salary</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>hire_date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '6px 8px' }}>1</td>
                            <td style={{ padding: '6px 8px' }}>Arjun Rao</td>
                            <td style={{ padding: '6px 8px' }}>Engineering</td>
                            <td style={{ padding: '6px 8px' }}>75000.00</td>
                            <td style={{ padding: '6px 8px' }}>2022-01-15</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '6px 8px' }}>2</td>
                            <td style={{ padding: '6px 8px' }}>Meera Iyer</td>
                            <td style={{ padding: '6px 8px' }}>HR</td>
                            <td style={{ padding: '6px 8px' }}>52000.00</td>
                            <td style={{ padding: '6px 8px' }}>2021-06-20</td>
                        </tr>
                        <tr style={{ background: '#f8fafc' }}>
                            <td style={{ padding: '6px 8px', textAlign: 'center' }} colSpan="5">... (10 rows total)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );

    const [executing, setExecuting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);

    // UI State
    const [consoleExpanded, setConsoleExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('run'); // 'run' (Run Results) or 'submit' (Submission Result)
    const [activeCaseIndex, setActiveCaseIndex] = useState(0);

    const editorRef = useRef(null);

    // ... (useEffect remains same) ...

    useEffect(() => {
        const fetchQuestionAndDraft = async () => {
            try {
                // Fetch Question
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/questions/${questionId}`);
                setQuestion(response.data);
                // Check if explanation exists in response, otherwise set null
                setExplanation(response.data.explanation || null);

                // Determine the correct default code: use DB default if valid, else fallback to language default
                const dbDefaultCode = response.data.default_code;
                const langDefaultCode = getDefaultCode(slug);
                const properDefaultCode = (dbDefaultCode && dbDefaultCode.trim().length > 0) ? dbDefaultCode : langDefaultCode;

                // If not readOnly (e.g. not viewing past submission), try to fetch draft
                if (!readOnly) {
                    const userStr = localStorage.getItem('user');
                    const user = userStr ? JSON.parse(userStr) : null;
                    if (user) {
                        try {
                            const draftRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/questions/${questionId}/draft`, {
                                params: { userId: user.id, language: slug || 'c' }
                            });

                            let draftCode = draftRes.data.code;

                            // Check for "bad" draft: if we are in SQL mode but the draft looks like C/C++ or old default
                            const isSql = (slug && slug.toLowerCase() === 'sql');
                            if (draftCode && isSql) {
                                if (draftCode.includes('#include <stdio.h>') ||
                                    draftCode.includes('#include <iostream>') ||
                                    draftCode.trim() === 'SELECT * FROM employees;') {
                                    console.log('Detected incorrect/old boilerplate in draft for SQL. Discarding draft.');
                                    draftCode = null; // Force reset
                                }
                            }

                            if (draftCode) {
                                setCode(draftCode);
                            } else {
                                // No draft (or bad draft discarded), use correct default
                                setCode(properDefaultCode);
                            }
                        } catch (draftErr) {
                            console.error('Error fetching draft:', draftErr);
                            // Fallback if draft fetch fails
                            setCode(properDefaultCode);
                        }
                    } else {
                        setCode(properDefaultCode);
                    }
                } else {
                    // Read only mode - usually handled by state init, but if we need to enforce DB default if submission missing?
                    // (readonly usually comes with submittedCode)
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load question details.');
                setLoading(false);
            }
        };

        fetchQuestionAndDraft();
    }, [questionId, readOnly]);

    // Autosave Hook
    useEffect(() => {
        if (readOnly || !questionId) return;

        if (code) {
            setSaveStatus('saving');
        }

        const timer = setTimeout(async () => {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (user && code) {
                try {
                    await axios.post(`${process.env.REACT_APP_API_URL}/api/questions/${questionId}/draft`, {
                        userId: user.id,
                        language: slug || 'c',
                        code: code
                    });
                    setSaveStatus('saved');
                } catch (err) {
                    console.error('Autosave failed:', err);
                    setSaveStatus('error');
                }
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [code, questionId, readOnly]);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        setEditorMounted(true);
    };

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to reset your code?')) {
            const defaultCode = getDefaultCode(slug);
            setCode(defaultCode);

            try {
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                if (user) {
                    await axios.post(`${process.env.REACT_APP_API_URL}/api/questions/${questionId}/draft`, {
                        userId: user.id,
                        language: slug || 'c',
                        code: defaultCode
                    });
                }
            } catch (err) {
                console.error('Error resetting draft:', err);
            }
        }
    };

    const handleRun = async () => {
        setExecuting(true);
        setRunResults(null);
        setSubmissionResult(null);
        setConsoleExpanded(true);
        setActiveTab('run');
        setActiveCaseIndex(0);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/code/run-cases`, {
                code,
                question_id: questionId,
                language: slug || 'c'
            });
            setRunResults(response.data);
        } catch (err) {
            console.error('Run error:', err);
            setRunResults({ status: 'Error', error: err.response?.data?.message || 'Failed to execute code.' });
        } finally {
            setExecuting(false);
        }
    };

    const handleSubmit = async () => {
        setExecuting(true);
        setRunResults(null);
        setSubmissionResult(null);
        setConsoleExpanded(true);
        setActiveTab('submit');

        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/code/submit`, {
                code,
                question_id: questionId,
                language: slug || 'c',
                user_id: user ? user.id : null
            });

            setSubmissionResult(response.data);
        } catch (err) {
            console.error('Submit error:', err);
            setSubmissionResult({ status: 'Error', message: 'Submission failed. Please try again.' });
        } finally {
            setExecuting(false);
        }
    };

    const renderSqlTable = (data) => {
        if (!data || !Array.isArray(data) || data.length === 0) return <span className="text-dim">No rows returned</span>;
        const columns = Object.keys(data[0]);
        return (
            <div className="table-responsive" style={{ margin: 0, maxHeight: '300px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ background: '#334155', color: '#f8fafc' }}>
                            {columns.map(col => (
                                <th key={col} style={{ padding: '6px 10px', textAlign: 'left', border: '1px solid #475569', whiteSpace: 'nowrap' }}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.05)' }}>
                                {columns.map(col => (
                                    <td key={col} style={{ padding: '6px 10px', border: '1px solid #475569', whiteSpace: 'nowrap' }}>{row[col]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    if (loading) return <div className="loading-state">Loading problem...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="question-detail-page">
            <header className="ide-header">
                <Link
                    to={subtopicId
                        ? `/dashboard/language-practice/${slug}/${topicSlug}/subtopic/${subtopicId}`
                        : `/dashboard/language-practice/${slug}/${topicSlug}`
                    }
                    className="back-btn"
                >
                    <ArrowLeft size={18} /> Back
                </Link>
                <div className="problem-meta">
                    <h2>{question.title}</h2>
                    <span className={`difficulty-badge ${question.difficulty.toLowerCase()}`}>
                        {question.difficulty}
                    </span>

                    {!readOnly && (
                        <div className="save-status">
                            {saveStatus === 'saving' && <span className="status-text">Saving...</span>}
                            {saveStatus === 'saved' && (
                                <span className="status-text saved">
                                    <CheckCircle size={14} /> Saved
                                </span>
                            )}
                            {saveStatus === 'error' && <span className="status-text error">Save Failed</span>}
                        </div>
                    )}
                </div>
                <div style={{ width: 60 }}></div> {/* Spacer */}
            </header>

            <div className="ide-workspace">
                {/* Left Panel: Problem Statement */}
                <div className="problem-panel">
                    <div className="problem-content-wrapper">
                        <div className="desc-section">
                            <h3>Problem</h3>
                            <div className="desc-content">
                                {question.description}
                            </div>
                        </div>

                        <div className="desc-section">
                            <h3>Constraints</h3>
                            <div className="code-block-display">{question.constraints}</div>
                        </div>

                        <div className="desc-section">
                            <h3>Sample Test Cases</h3>
                            {question.testCases && question.testCases.map((tc, index) => (
                                <div key={index} className="test-case-display">
                                    <div className="io-pair">
                                        <span className="io-label">Input:</span>
                                        <div className="io-value">{tc.input || '(Empty)'}</div>
                                    </div>
                                    <div className="io-pair">
                                        <span className="io-label">Output:</span>
                                        {slug === 'sql' ? (
                                            <div className="table-responsive" style={{ marginTop: 8 }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid #334155' }}>
                                                    <thead>
                                                        <tr style={{ background: '#334155', color: '#f8fafc' }}>
                                                            {['emp_id', 'emp_name', 'department', 'salary', 'hire_date'].map(h => (
                                                                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', border: '1px solid #475569' }}>{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tc.expected_output.split('\n').map((line, i) => {
                                                            const cols = line.split('|').map(c => c.trim());
                                                            if (cols.length < 2) return null; // Skip empty/malformed lines
                                                            return (
                                                                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.05)' }}>
                                                                    {cols.map((val, cIndex) => (
                                                                        <td key={cIndex} style={{ padding: '6px 10px', border: '1px solid #475569', color: '#cbd5e1' }}>{val}</td>
                                                                    ))}
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="io-value">{tc.expected_output}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Explanation Section - Hidden in Exam Mode */}
                        {explanation && !location.pathname.includes('/exam-practice') && (
                            <div className="desc-section explanation-box">
                                <div className="explanation-header">Explanation</div>
                                <div className="explanation-content">
                                    {explanation}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Editor & Console */}
                <div className="editor-panel">
                    <div className="editor-toolbar">
                        <div className="file-tab">
                            <Code2Icon size={14} />
                            <span>{slug === 'cpp' ? 'main.cpp' : slug === 'sql' ? 'query.sql' : 'main.c'}</span>
                        </div>
                        <div className="toolbar-actions">
                            <button
                                className="btn-icon btn-secondary"
                                onClick={handleReset}
                                disabled={readOnly || executing}
                                title="Reset Code"
                            >
                                <RotateCcw size={16} />
                            </button>
                            <button
                                className="btn-icon btn-primary"
                                onClick={handleRun}
                                disabled={executing}
                            >
                                {executing && activeTab === 'run' ? <div className="loader-spinner" /> : <Play size={16} />}
                                Run
                            </button>
                            <button
                                className="btn-icon btn-primary"
                                onClick={handleSubmit}
                                disabled={readOnly || executing}
                                style={{ backgroundColor: '#22c55e' }} // Green for submit
                            >
                                {executing && activeTab === 'submit' ? <div className="loader-spinner" /> : <Send size={16} />}
                                Submit
                            </button>
                        </div>
                    </div>

                    <div className="monaco-wrapper">
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            language={slug === 'cpp' ? 'cpp' : slug === 'sql' ? 'sql' : 'c'}
                            value={code}
                            onChange={(value) => !readOnly && setCode(value)}
                            onMount={handleEditorDidMount}
                            options={{
                                readOnly: readOnly,
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 16 },
                                fontLigatures: true,
                                fontFamily: "'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace"
                            }}
                        />
                    </div>

                    {/* Collapsible Console */}
                    <div
                        className="console-panel"
                        style={{ height: consoleExpanded ? '40%' : '40px' }}
                    >
                        <div className="console-header" onClick={() => setConsoleExpanded(!consoleExpanded)}>
                            <div className="console-tabs">
                                <div className="console-tab">
                                    <Terminal size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                                    Console
                                </div>
                                <div
                                    className={`console-tab ${activeTab === 'run' ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); setActiveTab('run'); setConsoleExpanded(true); }}
                                >
                                    Test Cases
                                </div>
                                <div
                                    className={`console-tab ${activeTab === 'submit' ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); setActiveTab('submit'); setConsoleExpanded(true); }}
                                >
                                    Submit Result
                                </div>
                            </div>
                            {consoleExpanded ? <ChevronDown size={16} color="#94a3b8" /> : <ChevronUp size={16} color="#94a3b8" />}
                        </div>

                        {consoleExpanded && (
                            <div className="console-content">
                                {activeTab === 'run' && (
                                    <div className="run-results-container">
                                        {!runResults && !executing && <div className="text-dim">Run code to see test case results...</div>}
                                        {executing && (
                                            <div className="loading-container">
                                                <div className="loader-spinner"></div>
                                                <span>Running Test Cases...</span>
                                            </div>
                                        )}
                                        {runResults && (
                                            <div className="run-results">
                                                <div className="run-status-header">
                                                    <span className={`status-title ${!runResults.results || runResults.status === 'Accepted' ? 'text-success' : 'text-error'}`}>
                                                        {runResults.status}
                                                    </span>
                                                </div>
                                                {runResults.error && (
                                                    <div className="output-error" style={{ margin: '1rem', padding: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', color: '#DC2626' }}>
                                                        <strong>Error:</strong> {runResults.error}
                                                    </div>
                                                )}

                                                {runResults.results && (
                                                    <div className="test-cases-tabs">
                                                        {runResults.results.map((result, index) => (
                                                            <button
                                                                key={index}
                                                                className={`case-tab-btn ${activeCaseIndex === index ? 'active' : ''} ${result.status === 'Passed' ? 'pass' : 'fail'}`}
                                                                onClick={() => setActiveCaseIndex(index)}
                                                            >
                                                                {result.status === 'Passed' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                                Case {index + 1}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {runResults.results && runResults.results[activeCaseIndex] && (
                                                    <div className="case-details">
                                                        {runResults.results[activeCaseIndex].status === 'Error' ? (
                                                            <div className="output-error">
                                                                <strong>Runtime Error:</strong>
                                                                <pre>{runResults.results[activeCaseIndex].error?.message}</pre>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="io-group">
                                                                    <label>Input</label>
                                                                    <div className="io-box">{runResults.results[activeCaseIndex].input}</div>
                                                                </div>
                                                                <div className="io-group">
                                                                    <label>Output</label>
                                                                    {runResults.results[activeCaseIndex].userOutputJson ? (
                                                                        <div className={`io-box ${runResults.results[activeCaseIndex].status === 'Passed' ? '' : 'border-error'}`} style={{ overflowX: 'auto', padding: 0 }}>
                                                                            {renderSqlTable(runResults.results[activeCaseIndex].userOutputJson)}
                                                                        </div>
                                                                    ) : (
                                                                        <div className={`io-box ${runResults.results[activeCaseIndex].status === 'Passed' ? '' : 'border-error'}`}>
                                                                            {runResults.results[activeCaseIndex].userOutput}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="io-group">
                                                                    <label>Expected</label>
                                                                    {runResults.results[activeCaseIndex].expectedOutputJson ? (
                                                                        <div className="io-box" style={{ overflowX: 'auto', padding: 0 }}>
                                                                            {renderSqlTable(runResults.results[activeCaseIndex].expectedOutputJson)}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="io-box">{runResults.results[activeCaseIndex].expectedOutput}</div>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'submit' && (
                                    <>
                                        {!submissionResult && !executing && <div className="text-dim">Submit code to see results...</div>}
                                        {executing && (
                                            <div className="loading-container">
                                                <div className="loader-spinner"></div>
                                                <span>Running test cases...</span>
                                            </div>
                                        )}
                                        {submissionResult && (
                                            <div className="submission-result">
                                                {submissionResult.status === 'Passed' ? (
                                                    <div className="status-passed">
                                                        <div className="tick-wrapper">
                                                            <CheckCircle size={56} className="tick-icon" strokeWidth={3} />
                                                        </div>
                                                        <div className="success-text">All Test Cases Passed!</div>
                                                    </div>
                                                ) : (
                                                    <div className="status-failed">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                                            <XCircle size={28} />
                                                            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{submissionResult.status}</span>
                                                        </div>
                                                        {submissionResult.failed_test_case_index !== undefined && (
                                                            <p style={{ marginBottom: 8, fontSize: '1rem' }}>
                                                                Failed on test case <strong>#{submissionResult.failed_test_case_index + 1}</strong>
                                                            </p>
                                                        )}
                                                        {submissionResult.message && <pre style={{
                                                            background: 'rgba(0,0,0,0.2)',
                                                            padding: 12,
                                                            borderRadius: 6,
                                                            fontFamily: 'Fira Code',
                                                            fontSize: '0.9rem',
                                                            whiteSpace: 'pre-wrap'
                                                        }}>{submissionResult.message}</pre>}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

// Simple icon wrapper if needed, or import specifically
const Code2Icon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16.5 22.5L20 19L16.5 15.5" /><path d="M10 22.5L13.5 19L10 15.5" /><path d="M7 19L3.5 15.5L7 12" /><path d="M17 12L20.5 8.5L17 5" /><path d="M10.5 5L7 8.5L10.5 12" /><path d="M3.5 8.5L7 5" />
    </svg>
);

export default QuestionDetail;
