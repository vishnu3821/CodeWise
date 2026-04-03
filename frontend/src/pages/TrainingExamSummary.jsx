import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import './TrainingExams.css';

const TrainingExamSummary = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    // Use state result if available, otherwise fetch
    const [result, setResult] = useState(state?.result || null);
    const [loading, setLoading] = useState(!state?.result);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!result) {
            const fetchResult = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/training-exams/${id}/result`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setResult(res.data);
                    setLoading(false);
                } catch (err) {
                    setError("Could not load results. You may not have attempted this exam yet.");
                    setLoading(false);
                }
            };
            fetchResult();
        }
    }, [id, result]);

    if (loading) return <div className="training-exam-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Results...</div>;

    if (error) return (
        <div className="training-exam-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h3>Error</h3>
            <p>{error}</p>
            <button className="btn-cancel" onClick={() => navigate('/training-exams')}>Back to Exams</button>
        </div>
    );

    // Parse attempt_data if it's from DB and stringified
    let details = [];
    try {
        if (result && Array.isArray(result.results)) {
            details = result.results;
        } else if (result && result.attempt_data) {
            const parsed = typeof result.attempt_data === 'string' ? JSON.parse(result.attempt_data) : result.attempt_data;
            if (Array.isArray(parsed)) details = parsed;
        }
    } catch (e) {
        console.error("Error parsing details", e);
    }

    // Calculate stats if not provided directly
    const score = result?.score !== undefined ? result.score : 0;
    const totalMarks = result?.total_marks || result?.totalMarks || 0;
    const safeDetails = Array.isArray(details) ? details : [];
    const totalQuestions = safeDetails.length;
    const correctAnswers = safeDetails.filter(r => r.correct).length;
    const submitted = safeDetails.filter(r => r.status !== 'unattempted').length;

    return (
        <div className="training-exam-page" style={{ padding: '2rem', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="exam-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '3rem' }}>
                <div style={{ background: '#F0FDFA', color: '#0F8C79', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                    <CheckCircle size={48} />
                </div>

                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Assessment Completed</h1>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>
                    You have successfully submitted the exam. Here is your performance summary.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748B' }}>Score Obtained</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>{score} / {totalMarks}</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748B' }}>Accuracy</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>
                            {submitted > 0 ? Math.round((correctAnswers / submitted) * 100) : 0}%
                        </div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748B' }}>Attempted</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F8C79' }}>{submitted}</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748B' }}>Correct</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>{correctAnswers}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn-cancel" onClick={() => navigate('/training-exams')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={16} /> Back to List
                    </button>
                    {/* Add Retry only if we allowed it, current task says 1 attempt. So no retry logic visible here */}
                </div>
            </div>
        </div>
    );
};

export default TrainingExamSummary;
