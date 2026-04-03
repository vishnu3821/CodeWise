import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Editor from "@monaco-editor/react";
import { Clock, AlertOctagon, CheckCircle, Flag, ChevronLeft, ChevronRight, Play, Upload } from 'lucide-react';
import './TrainingExams.css';

// --- SUB-COMPONENTS ---

const ExamHeader = ({ examTitle, timeLeft, formatTime, onSubmit }) => (
    <div className="exam-session-header">
        <div className="header-left">
            <h3 style={{ margin: 0 }}>{examTitle}</h3>
        </div>
        <div className="header-center">
            <div className={`exam-timer ${timeLeft < 300 ? 'text-red-500' : ''}`}>
                <Clock size={16} style={{ display: 'inline', marginRight: 8 }} />
                {formatTime(timeLeft)}
            </div>
        </div>
        <div className="header-right">
            <button className="btn-submit-test" onClick={onSubmit}>
                Submit Test →
            </button>
        </div>
    </div>
);

const SectionTabs = ({ sections, activeTab, onTabChange }) => (
    <div className="exam-tabs">
        {sections.map(section => (
            <button
                key={section.id}
                className={`exam-tab ${activeTab === section.id ? 'active' : ''}`}
                onClick={() => onTabChange(section.id)}
            >
                {section.name}
            </button>
        ))}
    </div>
);

const QuestionNavigator = ({ questions, answers, currentQId, onJump, reviewList }) => {
    const attempted = questions.filter(q => answers[q.id]).length;
    const progress = Math.round((attempted / questions.length) * 100) || 0;

    return (
        <div className="exam-panel">
            <div className="panel-header">
                <h4>Question Navigator</h4>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{progress}% Done</span>
            </div>
            <div className="panel-body">
                <div style={{ height: '4px', background: '#E2E8F0', borderRadius: 2, marginBottom: '1rem' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: '#0F8C79', borderRadius: 2 }}></div>
                </div>
                <div className="nav-grid">
                    {questions.map((q, idx) => {
                        const isAnswered = !!answers[q.id];
                        const isReview = reviewList.includes(q.id);
                        const isCurrent = currentQId === q.id;

                        let className = 'nav-item';
                        if (isCurrent) className += ' active';
                        if (isReview) className += ' review';
                        else if (isAnswered) className += ' attempted';

                        return (
                            <button key={q.id} className={className} onClick={() => onJump(q.id)}>
                                {isReview ? <Flag size={12} fill="currentColor" /> : idx + 1}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const ViolationOverlay = ({ countdown }) => (
    <div className="violation-overlay">
        <div className="violation-card">
            <div style={{ background: '#FEF2F2', display: 'inline-block', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                <AlertOctagon size={48} color="#EF4444" />
            </div>
            <h2 style={{ color: '#1E293B', marginBottom: '0.5rem' }}>VIOLATION DETECTED</h2>
            <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '0.5rem 1rem', borderRadius: '20px', display: 'inline-block', fontSize: '0.9rem', fontWeight: 600 }}>
                REASON: TAB SWITCH / WINDOW BLUR
            </div>
            <p style={{ color: '#64748B', margin: '1.5rem 0' }}>
                You have navigated away from the exam window.<br />
                This is a severe violation of the proctoring rules.
            </p>
            <div className="countdown-large">{countdown}</div>
            <p style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Auto-submitting exam...</p>
            <div style={{ height: '4px', background: '#F1F5F9', marginTop: '1rem', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#EF4444', transition: 'width 1s linear', width: `${(countdown / 3) * 100}%` }}></div>
            </div>
        </div>
    </div>
);

const SubmissionModal = ({ sections, answers, totalQuestions, onCancel, onConfirm, timeRemaining }) => {
    // Basic stats calculation for display
    const summary = sections.map(sec => {
        const attempted = sec.questions.filter(q => answers[q.id]).length;
        return { name: sec.name, total: sec.questions.length, attempted, unattempted: sec.questions.length - attempted };
    });
    const totalAttempted = summary.reduce((acc, curr) => acc + curr.attempted, 0);
    const totalUnattempted = summary.reduce((acc, curr) => acc + curr.unattempted, 0);

    return (
        <div className="submission-modal-overlay">
            <div className="submission-modal">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#F0FDFA', color: '#0F8C79', display: 'inline-block', padding: '0.75rem', borderRadius: '50%' }}>
                        <CheckCircle size={32} />
                    </div>
                    <h2 style={{ marginTop: '1rem' }}>Submission Summary</h2>
                    <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Please review your attempt details below.</p>
                </div>

                <table className="stats-table">
                    <thead>
                        <tr>
                            <th>Section</th>
                            <th style={{ textAlign: 'center' }}>Total</th>
                            <th style={{ textAlign: 'center' }}>Attempted</th>
                            <th style={{ textAlign: 'center' }}>Unattempted</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary.map((s, i) => (
                            <tr key={i}>
                                <td>{s.name}</td>
                                <td style={{ textAlign: 'center' }}>{s.total}</td>
                                <td style={{ textAlign: 'center', color: '#0F8C79' }}>{s.attempted}</td>
                                <td style={{ textAlign: 'center', color: '#EF4444' }}>{s.unattempted}</td>
                            </tr>
                        ))}
                        <tr style={{ background: '#F8FAFC', fontWeight: 600 }}>
                            <td>Overall</td>
                            <td style={{ textAlign: 'center' }}>{totalQuestions}</td>
                            <td style={{ textAlign: 'center', color: '#0F8C79' }}>{totalAttempted}</td>
                            <td style={{ textAlign: 'center', color: '#64748B' }}>{totalUnattempted}</td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <Clock size={16} />
                        TIME REMAINING: {timeRemaining}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Confirming will end your session immediately.
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-cancel" onClick={onCancel}>Cancel</button>
                    <button className="btn-start-exam" onClick={onConfirm} style={{ background: '#10B981' }}>Confirm Submit →</button>
                </div>
            </div>
        </div>
    );
};

const TabWarningModal = ({ currentSwitches, onContinue }) => {
    const isFinalWarning = currentSwitches === 3;
    return (
        <div className="submission-modal-overlay">
            <div className="submission-modal" style={{ border: '2px solid #EF4444', maxWidth: '450px' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#FEF2F2', color: '#EF4444', display: 'inline-block', padding: '0.75rem', borderRadius: '50%' }}>
                        <AlertOctagon size={48} />
                    </div>
                    <h2 style={{ marginTop: '1rem', color: '#1E293B' }}>
                        {isFinalWarning ? "FINAL WARNING" : "Tab Switch Detected"}
                    </h2>
                    <p style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        {isFinalWarning
                            ? "Final warning. Your next switch will auto-submit the exam."
                            : `Warning: Tab switch detected (${currentSwitches}/3)`
                        }
                    </p>
                    {!isFinalWarning && (
                        <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '1rem' }}>
                            You have {3 - currentSwitches} attempt(s) remaining before your exam is automatically terminated.
                        </p>
                    )}
                </div>
                <button
                    className="btn-start-exam"
                    style={{ width: '100%', background: '#EF4444' }}
                    onClick={onContinue}
                >
                    Acknowledge & Continue Exam
                </button>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const TrainingExamSession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // Add useLocation import
    const examPassword = location.state?.password || '';

    // Data State
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState(null);

    // Session State
    const [activeTab, setActiveTab] = useState(null); // Section ID
    const [currentQuestionIndices, setCurrentQuestionIndices] = useState({}); // { sectionId: questionIndex }
    const [answers, setAnswers] = useState({}); // { questionId: { value: optionIndex/code, type: 'mcq'/'coding' } }
    const [reviewList, setReviewList] = useState([]); // [questionId]

    // Timer & Proctoring
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    // Tab Switch Proctoring
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [showTabWarning, setShowTabWarning] = useState(false);

    // Coding specific
    const [codingLanguage, setCodingLanguage] = useState('c');
    const [runResult, setRunResult] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [consoleTab, setConsoleTab] = useState('test_results'); // 'test_results', 'output', 'errors'
    const [consoleExpanded, setConsoleExpanded] = useState(false);

    // Resizable Split Pane Logic
    const [leftPaneWidth, setLeftPaneWidth] = useState(40); // 40%
    const isResizing = useRef(false);

    const handleMouseMove = useCallback((e) => {
        if (!isResizing.current) return;
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 20 && newWidth < 80) setLeftPaneWidth(newWidth);
    }, []);

    const handleMouseUp = useCallback(() => {
        if (isResizing.current) {
            isResizing.current = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const handleMouseDown = (e) => {
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    };

    // 1. Fetch Exam
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }

                const headers = { Authorization: `Bearer ${token}` };
                if (examPassword) headers['x-exam-password'] = examPassword;

                const res = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/training-exams/${id}`, { headers });

                const examData = res.data;
                if (!examData) throw new Error("No exam data returned");

                setExam(examData);
                setTimeLeft(examData.duration_minutes * 60);

                // Set initial active tab and indices
                if (examData.sections && examData.sections.length > 0) {
                    setActiveTab(examData.sections[0].id);
                    const initialIndices = {};
                    examData.sections.forEach(s => initialIndices[s.id] = 0);
                    setCurrentQuestionIndices(initialIndices);
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to load exam", err);
                if (err.response && err.response.status === 403) {
                    setPageError("Access Denied: Password incorrect or missing.");
                    // Optional: redirect back to intro after a delay?
                } else {
                    setPageError(err.response?.data?.message || err.message || "Failed to load exam");
                }
                setLoading(false);
            }
        };
        fetchExam();
    }, [id, navigate, examPassword]);

    // 2. Timer
    useEffect(() => {
        if (loading || showSummary || isSubmitting || pageError) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, showSummary, isSubmitting, pageError]);

    // 3. Proctoring (Tab Switch Detection)
    useEffect(() => {
        // Only run proctoring if exam is actively running (not loading, not paused by another overlay, etc)
        // Wait until we are fully loaded to start tracking
        if (loading || showSummary || isSubmitting || pageError || showTabWarning) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setTabSwitchCount(prev => {
                    const newCount = prev + 1;
                    if (newCount > 3) {
                        // Force auto-submit instantly
                        handleSubmit(true, true, "Tab Switch Limit Exceeded");
                    } else {
                        // Show warning modal
                        setShowTabWarning(true);
                    }
                    return newCount;
                });
            }
        };

        const handleBlur = () => {
            // Optional: Uncomment the line below to ALSO treat losing window focus as a tab switch
            // if (!document.hidden) handleVisibilityChange(); 
        };

        const timeout = setTimeout(() => {
            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('blur', handleBlur);
        }, 2000);

        return () => {
            clearTimeout(timeout);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
        };
    }, [loading, showSummary, isSubmitting, pageError, showTabWarning]);


    // Handlers
    const handleAnswer = (qId, value, type) => {
        setAnswers(prev => ({
            ...prev,
            [qId]: {
                value,
                type,
                language: type === 'coding' ? codingLanguage : undefined
            }
        }));
    };

    const toggleReview = (qId) => {
        setReviewList(prev => prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]);
    };

    const handleJump = (qId) => {
        const section = exam.sections.find(s => s.questions.some(q => q.id === qId));
        if (section) {
            setActiveTab(section.id);
            const idx = section.questions.findIndex(q => q.id === qId);
            setCurrentQuestionIndices(prev => ({ ...prev, [section.id]: idx }));
        }
    };

    const handlePrev = () => {
        setCurrentQuestionIndices(prev => ({
            ...prev,
            [activeTab]: Math.max(0, prev[activeTab] - 1)
        }));
    };

    const handleNext = () => {
        const currentSectionIndex = exam.sections.findIndex(s => s.id === activeTab);
        const currentSection = exam.sections[currentSectionIndex];
        const nextSection = exam.sections[currentSectionIndex + 1];

        if (currentQuestionIndices[activeTab] < currentSection.questions.length - 1) {
            setCurrentQuestionIndices(prev => ({
                ...prev,
                [activeTab]: prev[activeTab] + 1
            }));
        } else if (nextSection) {
            setActiveTab(nextSection.id);
        }
    };

    const handleRunCode = async (questionId, code) => {
        setIsRunning(true);
        setRunResult(null);
        try {
            const currentSection = exam.sections.find(s => s.id === activeTab);
            const question = currentSection.questions.find(q => q.id === questionId);
            const inputs = question.test_cases ? question.test_cases.map(tc => tc.input) : [];

            const token = localStorage.getItem('token');
            // Execute Code API
            const res = await axios.post(`${process.env.REACT_APP_API_URL || ""}/api/training-exams/${id}/execute-code`, {
                code: code || "",
                questionId,
                language: codingLanguage,
                action: 'run'
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (res.data) {
                setRunResult(res.data);
                setConsoleExpanded(true);
            } else {
                setRunResult({ status: 'Error', message: "No response from server" });
                setConsoleExpanded(true);
                setConsoleTab('errors');
            }

        } catch (err) {
            console.error(err);
            setRunResult({ status: 'Error', message: err.response?.data?.message || err.message || "Execution Failed" });
            setConsoleExpanded(true);
            setConsoleTab('errors');
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async (force = false, isAutoSubmit = false, reason = null) => {
        if (!force && !showSummary) {
            setShowSummary(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${process.env.REACT_APP_API_URL || ""}/api/training-exams/${id}/submit`, {
                answers,
                tabSwitchCount,
                autoSubmitted: isAutoSubmit,
                terminationReason: reason
            }, { headers: { Authorization: `Bearer ${token}` } });

            // Attempt to exit fullscreen but don't block submission flow
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(err => console.warn("Exit fullscreen failed:", err));
            }

            // Navigate immediately to summary. The summary page will load results from DB if passed state is missing.
            navigate(`/training-exams/${id}/summary`, { state: { result: res.data } });

        } catch (err) {
            console.error("Submission error", err);
            // Safe fallback
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(() => { });
            }
            setIsSubmitting(false); // Reset submitting state on error
            alert(`Submission failed: ${err.response?.data?.message || err.message}`);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Render Logic
    if (loading) return <div className="training-exam-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Exam Session...</div>;

    if (pageError) return (
        <div className="training-exam-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h2 style={{ color: '#EF4444' }}>Error Loading Exam</h2>
            <p>{pageError}</p>
            <button className="btn-cancel" onClick={() => navigate('/training-exams')}>Back to List</button>
        </div>
    );

    const currentSection = exam.sections.find(s => s.id === activeTab);
    if (!currentSection) return <div>Section not found</div>;
    const currentQIdx = currentQuestionIndices[activeTab] || 0;
    const currentQuestion = currentSection.questions[currentQIdx];

    if (!currentQuestion) return (
        <div className="training-exam-page">
            <ExamHeader
                examTitle={exam.title}
                timeLeft={timeLeft}
                formatTime={formatTime}
                onSubmit={() => handleSubmit(false)}
            />
            <SectionTabs
                sections={exam.sections}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                Question not found. Please try navigating to another section.
            </div>
        </div>
    );

    return (
        <div className="training-exam-page">
            <ExamHeader
                examTitle={exam.title}
                timeLeft={timeLeft}
                formatTime={formatTime}
                onSubmit={() => handleSubmit(false)}
            />

            <SectionTabs
                sections={exam.sections}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div
                className={`exam-layout-split ${currentSection.type === 'coding' ? 'coding-mode' : ''}`}
                style={currentSection.type === 'coding' ? { display: 'flex', padding: 0, gap: 0, background: '#1E1E1E', borderTop: '1px solid #333' } : {}}
            >
                {/* LEFT PANEL */}
                <div
                    className="exam-panel"
                    style={currentSection.type === 'coding' ? {
                        width: `${leftPaneWidth}%`,
                        borderRadius: 0,
                        border: 'none',
                        borderRight: '1px solid #333',
                        background: 'white',
                        height: '100%',
                        overflow: 'hidden'
                    } : {}}
                >
                    <div className="panel-header" style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '0.75rem 1.5rem' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {currentSection.type === 'coding' && <span style={{ background: '#F1F5F9', color: '#64748B', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.8rem' }}>Question {currentQIdx + 1}</span>}
                            <span>{currentSection.name === 'Coding' ? currentQuestion.title : `Question ${currentQIdx + 1}`}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {currentSection.type === 'coding' && (
                                <span style={{ fontSize: '0.75rem', background: '#FEF08A', color: '#854D0E', padding: '0.2rem 0.5rem', borderRadius: 12, fontWeight: 600 }}>
                                    {currentQuestion.difficulty || 'Easy'}
                                </span>
                            )}
                            <div style={{ fontSize: '0.85rem', background: '#F0FDFA', color: '#0F8C79', padding: '0.2rem 0.6rem', borderRadius: 4, fontWeight: 600 }}>
                                +{currentQuestion.marks} Marks
                            </div>
                        </div>
                    </div>

                    <div className="panel-body" style={currentSection.type === 'coding' ? { padding: '1.5rem', paddingBottom: '3rem' } : {}}>
                        {currentSection.type === 'coding' && (
                            <div className="coding-nav-grid" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
                                {currentSection.questions.map((q, idx) => {
                                    const isAnswered = !!answers[q.id]?.value && answers[q.id]?.value.length > 5;
                                    const isCurrent = currentQIdx === idx;
                                    let bg = '#F1F5F9';
                                    let color = '#64748B';
                                    let border = '1px solid #E2E8F0';

                                    if (isCurrent) { bg = '#0F172A'; color = 'white'; border = '1px solid #0F172A'; }
                                    else if (isAnswered) { bg = '#DCFCE7'; color = '#166534'; border = '1px solid #DCFCE7'; }

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => handleJump(q.id)}
                                            style={{
                                                width: '32px', height: '32px', borderRadius: '6px',
                                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                                                background: bg, color: color, border: border,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Coding Problem Detailed Sections */}
                        {currentSection.type === 'coding' ? (
                            <div className="coding-problem-details">
                                <div style={{ whiteSpace: 'pre-wrap', color: '#334155', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '2rem' }} dangerouslySetInnerHTML={{ __html: currentQuestion.description }} />

                                {currentQuestion.input_format && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{ color: '#0F172A', fontSize: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>Input Format</h4>
                                        <div style={{ color: '#475569', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{currentQuestion.input_format}</div>
                                    </div>
                                )}

                                {currentQuestion.output_format && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{ color: '#0F172A', fontSize: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>Output Format</h4>
                                        <div style={{ color: '#475569', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{currentQuestion.output_format}</div>
                                    </div>
                                )}

                                {currentQuestion.constraints && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{ color: '#0F172A', fontSize: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>Constraints</h4>
                                        <pre style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: 4, color: '#334155', fontSize: '0.85rem', fontFamily: 'monospace', margin: 0 }}>
                                            {currentQuestion.constraints}
                                        </pre>
                                    </div>
                                )}

                                {(currentQuestion.sample_input || currentQuestion.sample_output) && (
                                    <div style={{ marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                        {currentQuestion.sample_input && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Sample Input</div>
                                                <pre style={{ background: 'white', padding: '0.5rem', borderRadius: 4, border: '1px solid #E2E8F0', margin: 0, fontFamily: 'monospace' }}>{currentQuestion.sample_input}</pre>
                                            </div>
                                        )}
                                        {currentQuestion.sample_output && (
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Sample Output</div>
                                                <pre style={{ background: 'white', padding: '0.5rem', borderRadius: 4, border: '1px solid #E2E8F0', margin: 0, fontFamily: 'monospace' }}>{currentQuestion.sample_output}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentQuestion.explanation && (
                                    <div style={{ marginBottom: '1.5rem', background: '#FEFCE8', padding: '1rem', borderRadius: '8px', border: '1px solid #FEF08A' }}>
                                        <h4 style={{ color: '#854D0E', fontSize: '0.9rem', marginBottom: '0.5rem', margin: 0 }}>Explanation</h4>
                                        <div style={{ color: '#713F12', fontSize: '0.85rem', whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{currentQuestion.explanation}</div>
                                    </div>
                                )}

                                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ fontSize: '0.8rem', background: '#F1F5F9', color: '#64748B', padding: '0.2rem 0.5rem', borderRadius: 12 }}>Time Limit: {currentQuestion.time_limit || 2000} ms</div>
                                    <div style={{ fontSize: '0.8rem', background: '#F1F5F9', color: '#64748B', padding: '0.2rem 0.5rem', borderRadius: 12 }}>Memory Limit: {currentQuestion.memory_limit || 128} MB</div>
                                    <div style={{ fontSize: '0.8rem', background: '#F4F4F5', color: '#52525B', padding: '0.2rem 0.5rem', borderRadius: 12 }}>
                                        Hidden Test Cases: {currentQuestion.hidden_test_cases_count || 0}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // MCQ Text Layout
                            <div className="question-text">
                                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>{currentQuestion.title}</h3>
                                <div style={{ whiteSpace: 'pre-wrap', color: '#334155', lineHeight: '1.6', fontSize: '1rem' }}>
                                    {currentQuestion.description || "No description available."}
                                </div>
                            </div>
                        )}

                        {currentSection.type === 'mcq' && (
                            <div className="mcq-options">
                                {currentQuestion.options.map((opt, idx) => {
                                    const isSelected = answers[currentQuestion.id]?.value === idx;
                                    return (
                                        <div
                                            key={idx}
                                            className={`mcq-option ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleAnswer(currentQuestion.id, idx, 'mcq')}
                                        >
                                            <div className="option-circle"></div>
                                            <span>{opt}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {currentSection.type !== 'coding' && (
                        <div className="panel-footer" style={{ padding: '1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn-cancel" style={{ width: 'auto' }} onClick={handlePrev} disabled={currentQIdx === 0}>
                                <ChevronLeft size={16} style={{ marginRight: 4 }} /> Previous
                            </button>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-cancel" style={{ width: 'auto', border: 'none', color: '#D97706' }} onClick={() => toggleReview(currentQuestion.id)}>
                                    <Flag size={16} fill={reviewList.includes(currentQuestion.id) ? "currentColor" : "none"} />
                                </button>
                                <button
                                    className="btn-start-exam"
                                    style={{ width: 'auto' }}
                                    onClick={handleNext}
                                    disabled={currentQIdx === currentSection.questions.length - 1 && !exam.sections[exam.sections.findIndex(s => s.id === activeTab) + 1]}
                                >
                                    {currentQIdx === currentSection.questions.length - 1 && exam.sections[exam.sections.findIndex(s => s.id === activeTab) + 1]
                                        ? `Proceed to ${exam.sections[exam.sections.findIndex(s => s.id === activeTab) + 1].name}`
                                        : 'Next'} <ChevronRight size={16} style={{ marginLeft: 4 }} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RESIZER */}
                {currentSection.type === 'coding' && (
                    <div
                        style={{
                            width: '12px', background: '#1E1E1E', cursor: 'col-resize', position: 'relative', zIndex: 10,
                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}
                        onMouseDown={handleMouseDown}
                    >
                        <div style={{ width: '4px', height: '40px', background: '#475569', borderRadius: '4px' }}></div>
                    </div>
                )}

                {/* RIGHT PANEL - IDE OR MCQ NAVIGATOR */}
                {currentSection.type === 'mcq' ? (
                    <QuestionNavigator
                        questions={currentSection.questions}
                        answers={answers}
                        currentQId={currentQuestion.id}
                        onJump={handleJump}
                        reviewList={reviewList}
                    />
                ) : (
                    <div className="exam-panel" style={{ width: `${100 - leftPaneWidth}%`, borderRadius: 0, background: '#1E1E1E', border: 'none', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>

                        {/* IDE TOP BAR */}
                        <div className="ide-top-bar" style={{ background: '#252526', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 1rem', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <select
                                    style={{ background: '#3C3C3C', border: '1px solid #444', color: '#E2E8F0', padding: '0.25rem 0.5rem', borderRadius: 4, fontSize: '0.85rem', outline: 'none' }}
                                    value={codingLanguage}
                                    onChange={(e) => setCodingLanguage(e.target.value)}
                                >
                                    <option value="c">C</option>
                                    <option value="cpp">C++</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    style={{ background: 'transparent', border: '1px solid #444', color: '#E2E8F0', padding: '0.3rem 0.8rem', borderRadius: 4, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', opacity: isRunning ? 0.5 : 1 }}
                                    onClick={() => handleRunCode(currentQuestion.id, answers[currentQuestion.id]?.value || currentQuestion.default_code || '')}
                                    disabled={isRunning}
                                >
                                    {isRunning ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2, margin: 0 }}></span> : <Play size={14} fill="currentColor" />}
                                    Run Code
                                </button>
                                <button
                                    style={{ background: '#0F8C79', border: 'none', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 4, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                                    onClick={() => {
                                        // Save answer into state. Exam grades it securely on Submit Exam.
                                        handleAnswer(currentQuestion.id, answers[currentQuestion.id]?.value || currentQuestion.default_code || '', 'coding')
                                        // Auto advance logic or notification
                                        alert("Draft Saved! Proceed to next question or wait to Submit Exam.");
                                        handleNext();
                                    }}
                                >
                                    <Upload size={14} /> Submit (Save Draft)
                                </button>
                            </div>
                        </div>

                        {/* MONACO EDITOR */}
                        <div style={{ flex: '1 1 0', minHeight: 0, position: 'relative' }}>
                            <Editor
                                height="100%"
                                language={codingLanguage}
                                theme="vs-dark"
                                value={answers[currentQuestion.id]?.value || currentQuestion.default_code || "// Write your code here \n"}
                                onChange={(val) => handleAnswer(currentQuestion.id, val, 'coding')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    fontFamily: "'Fira Code', 'Monaco', monospace",
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                    padding: { top: 16 }
                                }}
                            />
                        </div>

                        {/* CONSOLE PANEL */}
                        <div className="ide-console" style={{
                            height: consoleExpanded ? '300px' : '40px',
                            flexShrink: 0,
                            borderTop: '1px solid #333',
                            background: '#1E1E1E',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'height 0.2s ease-out'
                        }}>
                            {/* Console Tabs */}
                            <div style={{ display: 'flex', background: '#252526', padding: '0 1rem', gap: '1rem', borderBottom: '1px solid #333' }}>
                                <button
                                    style={{ background: 'none', border: 'none', color: consoleExpanded ? '#E2E8F0' : '#888', padding: '0.5rem 0', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    onClick={() => setConsoleExpanded(!consoleExpanded)}
                                >
                                    Console <span style={{ fontSize: '0.7rem' }}>{consoleExpanded ? '▼' : '▲'}</span>
                                </button>
                                {['Test Results'].map(tab => ( // Simulating tabs
                                    <button
                                        key={tab}
                                        style={{ background: 'none', border: 'none', color: consoleTab === 'test_results' ? '#10B981' : '#888', borderBottom: consoleTab === 'test_results' ? '2px solid #10B981' : '2px solid transparent', padding: '0.5rem 0', fontSize: '0.85rem', cursor: 'pointer' }}
                                        onClick={() => { setConsoleTab('test_results'); setConsoleExpanded(true); }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Console Content */}
                            {consoleExpanded && (
                                <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, fontFamily: 'monospace', color: '#E2E8F0', fontSize: '0.9rem' }}>
                                    {runResult ? (
                                        <div className="test-results">
                                            {runResult.status === 'Accepted' || runResult.status === 'Passed' ? (
                                                <h4 style={{ color: '#4ADE80', margin: '0 0 1rem 0' }}>✓ All Sample Test Cases Passed</h4>
                                            ) : runResult.status === 'Error' ? (
                                                <h4 style={{ color: '#F87171', margin: '0 0 1rem 0' }}>Object Compilation/Runtime Error</h4>
                                            ) : (
                                                <h4 style={{ color: '#F87171', margin: '0 0 1rem 0' }}>✗ Wrong Answer</h4>
                                            )}

                                            {runResult.status === 'Error' && (
                                                <div style={{ background: '#2A1010', color: '#F87171', padding: '1rem', borderRadius: 6, border: '1px solid #501515' }}>
                                                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{runResult.message || runResult.compilation_error || runResult.runtime_error}</pre>
                                                </div>
                                            )}

                                            {runResult.results && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {runResult.results.map((r, i) => (
                                                        <div key={i} style={{ background: '#252526', border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
                                                            <div style={{ padding: '0.5rem 1rem', background: '#2A2A2B', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontWeight: 600 }}>Case {i + 1}</span>
                                                                <span style={{ color: r.status === 'Passed' ? '#4ADE80' : '#F87171', fontWeight: 600 }}>{r.status}</span>
                                                            </div>
                                                            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                <div>
                                                                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>Input</div>
                                                                    <div style={{ background: '#1E1E1E', padding: '0.5rem', borderRadius: 4, color: '#CCC' }}>{r.input}</div>
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>Expected Output</div>
                                                                    <div style={{ background: '#1E1E1E', padding: '0.5rem', borderRadius: 4, color: '#CCC' }}>{r.expectedOutput || 'N/A'}</div>
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>Your Output</div>
                                                                    <div style={{ background: '#1E1E1E', padding: '0.5rem', borderRadius: 4, color: r.status === 'Passed' ? '#CCC' : '#F87171' }}>{r.userOutput || (r.error ? r.error.message : '-')}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ color: '#666', fontStyle: 'italic' }}>Run your code to see results here.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Overlays */}
            {isSubmitting && (
                <div className="violation-overlay" style={{ zIndex: 2000 }}>
                    <div className="submission-card">
                        <span className="spinner"></span>
                        <h3 style={{ marginTop: '1rem', color: '#1E293B' }}>Submitting Assessment...</h3>
                        <p style={{ color: '#64748B' }}>Please keep this window open.</p>
                    </div>
                </div>
            )}

            {showTabWarning && !isSubmitting && (
                <TabWarningModal
                    currentSwitches={tabSwitchCount}
                    onContinue={() => setShowTabWarning(false)}
                />
            )}

            {showSummary && !isSubmitting && !showTabWarning && (
                <SubmissionModal
                    sections={exam.sections}
                    answers={answers}
                    totalQuestions={Object.values(exam.sections).reduce((acc, s) => acc + s.questions.length, 0)}
                    onCancel={() => setShowSummary(false)}
                    onConfirm={() => handleSubmit(true)}
                    timeRemaining={formatTime(timeLeft)}
                />
            )}
        </div>
    );
};

export default TrainingExamSession;
