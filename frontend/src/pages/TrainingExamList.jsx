import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Terminal, Clock, BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import './TrainingExams.css';

const TrainingExamList = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }

                console.log("Fetching exams...");
                const res = await axios.get('http://localhost:5001/api/training-exams', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Exams received:", res.data);
                setExams(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load exams", err);
                setError(err.response?.data?.message || err.message || "Failed to load exams");
                setLoading(false);
            }
        };
        fetchExams();
    }, [navigate]);

    if (loading) return <div className="training-exam-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Exams...</div>;

    if (error) return (
        <div className="training-exam-page" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <div className="exam-card" style={{ padding: '2rem', textAlign: 'center', borderColor: '#EF4444' }}>
                <h3 style={{ color: '#EF4444' }}>Error</h3>
                <p>{error}</p>
                <button className="btn-cancel" onClick={() => window.location.reload()}>Retry</button>
            </div>
        </div>
    );

    return (
        <div className="training-exam-page" style={{ padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'transparent',
                                border: 'none',
                                color: '#64748b',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                marginBottom: '16px',
                                padding: '4px 8px',
                                marginLeft: '-8px',
                                borderRadius: '6px',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.background = '#f1f5f9'; }}
                            onMouseOut={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
                        >
                            <ArrowLeft size={16} /> Back to Dashboard
                        </button>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Training Exams</h1>
                        <p style={{ color: '#64748B' }}>Select an exam to begin your practice session.</p>
                    </div>
                    <div>
                        <NotificationBell />
                    </div>
                </div>

                {exams.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px' }}>
                        <h3 style={{ color: '#64748B' }}>No Exams Found</h3>
                        <p style={{ color: '#94A3B8' }}>The list provided by the server is empty.</p>
                        <button className="btn-cancel" onClick={() => window.location.reload()}>Refresh</button>

                        {/* DEBUG SECTION */}
                        <div style={{ marginTop: '2rem', textAlign: 'left', background: '#F1F5F9', padding: '1rem', borderRadius: '8px' }}>
                            <strong>Debug Info:</strong>
                            <pre style={{ fontSize: '0.8rem' }}>{JSON.stringify(exams, null, 2)}</pre>
                        </div>
                    </div>
                ) : (
                    <div className="exams-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {exams.map(exam => (
                            <div key={exam.id} className="exam-card" style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                border: '1px solid #E2E8F0',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ background: '#F0FDFA', color: '#0F8C79', padding: '1rem', borderRadius: '12px' }}>
                                        <Terminal size={24} />
                                    </div>
                                    {/* (exam.title === 'TEST_2' || exam.title.toLowerCase().includes('soon')) check removed */}
                                </div>

                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{exam.title}</h3>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>{exam.description}</p>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        <Clock size={16} />
                                        <span>{exam.duration_minutes} Minutes</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.9rem' }}>
                                        <BookOpen size={16} />
                                        <span>{exam.sections ? exam.sections.join(', ') : 'General'}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn-start-exam"
                                    style={{
                                        width: '100%',
                                        background: exam.status === 'completed' ? '#10B981' : '#0F8C79',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        if (exam.status === 'completed') {
                                            navigate(`/training-exams/${exam.id}/summary`);
                                        } else {
                                            navigate(`/training-exams/${exam.id}/intro`);
                                        }
                                    }}
                                >
                                    {exam.status === 'completed' ? 'View Results →' : 'Start Assessment →'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default TrainingExamList;
