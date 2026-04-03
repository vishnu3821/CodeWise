import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Terminal, Maximize, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import './TrainingExams.css';

const TrainingExamIntro = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [isPasswordRequired, setIsPasswordRequired] = useState(false);
    const [error, setError] = useState('');

    // Instruction State
    const [showInstructions, setShowInstructions] = useState(false);
    const [instructionData, setInstructionData] = useState(null);
    const [acceptedInstructions, setAcceptedInstructions] = useState(false);

    useEffect(() => {
        const checkExam = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }

                // Try to fetch exam. If 403, it might be password protected.
                const res = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/training-exams/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // If success, it means not protected or we somehow have access (unlikely without header)
                // But getExam returns 403 if protected and no header.
                // So if we are here, it is NOT protected.
                setExamData(res.data);

                if (res.data.pre_exam_message_body) {
                    setInstructionData({
                        title: res.data.pre_exam_message_title,
                        body: res.data.pre_exam_message_body,
                        is_required: res.data.is_message_required !== false
                    });
                }
                setLoading(false);

            } catch (err) {
                if (err.response && err.response.status === 403 && err.response.data.is_password_protected) {
                    setIsPasswordRequired(true);
                    setExamData(err.response.data); // Contains title, duration etc from the 403 response
                    setLoading(false);
                } else if (err.response && err.response.status === 403) {
                    alert(err.response.data.message || "Access Denied");
                    navigate('/dashboard');
                } else {
                    console.error("Failed to load exam info", err);
                    navigate('/dashboard');
                }
            }
        };
        checkExam();
    }, [id, navigate]);

    const handleStart = async () => {
        // Step 1: Password Verification & Fetching Instructions overlay
        if (!showInstructions) {
            if (isPasswordRequired) {
                if (!password) { setError('Password is required'); return; }

                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.post(`${process.env.REACT_APP_API_URL || ""}/api/training-exams/${id}/verify-password`,
                        { password },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (res.data.messageData && res.data.messageData.body) {
                        setInstructionData({
                            title: res.data.messageData.title,
                            body: res.data.messageData.body,
                            is_required: res.data.messageData.is_required !== false
                        });
                        setShowInstructions(true);
                        return; // Wait for user to read instructions
                    }
                } catch (err) {
                    setError('Invalid Password: ' + (err.response?.data?.message || err.message));
                    return;
                }
            } else if (instructionData) {
                // Not password protected, but we fetched instructions in checkExam
                setShowInstructions(true);
                return; // Wait for user to read instructions
            }
        }

        // Step 2: Validate Instructions Accepted
        if (showInstructions && instructionData?.is_required && !acceptedInstructions) {
            setError('You must accept the instructions before starting.');
            return;
        }

        // Send acceptance to backend
        if (instructionData) {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`${process.env.REACT_APP_API_URL || ""}/api/training-exams/${id}/accept-message`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (err) {
                console.error("Could not send instruction acceptance", err);
            }
        }

        // Trigger Fullscreen
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.error(err));
        }

        // Navigate with password state
        navigate(`/training-exams/${id || '1'}/session`, { state: { password } });
    };

    if (loading) return <div className="exam-entry-container" style={{ color: 'white' }}>Loading...</div>;

    if (showInstructions) {
        return (
            <div className="training-exam-page exam-entry-container">
                <div className="exam-entry-card" style={{ maxWidth: '800px', width: '90%' }}>
                    <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                        {instructionData.title || 'Exam Instructions'}
                    </h2>

                    <div style={{
                        maxHeight: '400px',
                        overflowY: 'auto',
                        padding: '1.5rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        textAlign: 'left',
                        whiteSpace: 'pre-wrap',
                        color: '#334155',
                        lineHeight: '1.6'
                    }}>
                        {instructionData.body}
                    </div>

                    {instructionData.is_required && (
                        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                            <input
                                type="checkbox"
                                id="accept-instructions"
                                checked={acceptedInstructions}
                                onChange={(e) => setAcceptedInstructions(e.target.checked)}
                                style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                            />
                            <label htmlFor="accept-instructions" style={{ cursor: 'pointer', fontWeight: 500, color: '#334155', userSelect: 'none' }}>
                                I have read and understood the instructions
                            </label>
                        </div>
                    )}

                    {error && <div style={{ color: '#EF4444', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    <div className="entry-actions">
                        <button className="btn-cancel" onClick={() => setShowInstructions(false)}>
                            Back
                        </button>
                        <button
                            className="btn-start-exam"
                            onClick={handleStart}
                            disabled={instructionData.is_required && !acceptedInstructions}
                            style={{ opacity: (instructionData.is_required && !acceptedInstructions) ? 0.5 : 1 }}
                        >
                            Begin Exam →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="training-exam-page exam-entry-container">
            <div className="exam-entry-card">
                <div className="exam-icon-wrapper">
                    <Terminal size={48} />
                </div>

                <h1>{examData?.title || 'Training Exams'}</h1>

                {isPasswordRequired && (
                    <div style={{ marginBottom: '1.5rem', width: '100%' }}>
                        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <ShieldAlert size={18} />
                            <span>This exam is password protected.</span>
                        </div>
                        <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>
                            Enter Exam Password
                        </label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            placeholder="Required to start..."
                            style={{ width: '100%', padding: '0.75rem' }}
                        />
                        {error && <div style={{ color: '#EF4444', fontSize: '0.9rem', marginTop: '0.5rem', textAlign: 'left' }}>{error}</div>}
                    </div>
                )}

                {!isPasswordRequired && (
                    <div className="exam-badge">
                        <AlertTriangle size={16} />
                        This exam is monitored
                    </div>
                )}

                <div className="exam-rules-list">
                    <div className="rule-item">
                        <div className="rule-icon"><Maximize size={20} /></div>
                        <div className="rule-content">
                            <h4>Full-screen mode required</h4>
                            <p>The browser will lock into full-screen mode upon starting.</p>
                        </div>
                    </div>
                    <div className="rule-item">
                        <div className="rule-icon"><ShieldAlert size={20} /></div>
                        <div className="rule-content">
                            <h4>No tab switching allowed</h4>
                            <p>Moving away triggers immediate auto-submit.</p>
                        </div>
                    </div>
                    <div className="rule-item">
                        <div className="rule-icon"><Clock size={20} /></div>
                        <div className="rule-content">
                            <h4>Time Limit Enforced</h4>
                            <p>Timer starts immediately. Manage your time.</p>
                        </div>
                    </div>
                </div>

                <div className="entry-actions">
                    <button className="btn-cancel" onClick={() => navigate('/dashboard')}>
                        Cancel
                    </button>
                    <button className="btn-start-exam" onClick={handleStart}>
                        Start Exam →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrainingExamIntro;
