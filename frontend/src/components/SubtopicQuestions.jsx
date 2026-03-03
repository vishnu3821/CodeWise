import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FileCode, ArrowLeft, ChevronRight, CheckCircle } from 'lucide-react';

const SubtopicQuestions = () => {
    const { slug, topicSlug, subtopicId } = useParams();
    const [subtopicName, setSubtopicName] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completedQuestions, setCompletedQuestions] = useState(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch subtopic questions
                const questionsRes = await axios.get(`http://localhost:5001/api/subtopics/${subtopicId}/questions`);
                setSubtopicName(questionsRes.data.subtopic);
                setQuestions(questionsRes.data.questions);

                // Fetch completed questions for user
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const completedRes = await axios.get(`http://localhost:5001/api/users/${user.id}/completed-questions`);
                    setCompletedQuestions(new Set(completedRes.data));
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load questions. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, [subtopicId]);

    if (loading) return <div className="loading-state">Loading questions...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="topic-questions-page">
            <div className="page-header">
                <Link to={`/dashboard/language-practice/${slug}/${topicSlug}`} className="back-link">
                    <ArrowLeft size={20} /> Back to {topicSlug}
                </Link>
                <h1>{subtopicName}</h1>
                <p>Solve these problems to master the concept</p>
            </div>

            <div className="questions-list">
                {questions.length === 0 ? (
                    <div className="empty-state">No questions available for this subtopic yet.</div>
                ) : (
                    questions.map(question => (
                        <Link
                            key={question.id}
                            to={`/dashboard/language-practice/${slug}/${topicSlug}/subtopic/${subtopicId}/${question.id}`}
                            className="question-card"
                        >
                            <div className="question-content">
                                <div className="question-icon-wrapper">
                                    <FileCode size={20} />
                                </div>
                                <div className="question-info">
                                    <span className="question-title">
                                        {question.title}
                                    </span>
                                    <span className={`difficulty-badge ${question.difficulty.toLowerCase()}`}>
                                        {question.difficulty}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {completedQuestions.has(question.id) && (
                                    <span style={{
                                        backgroundColor: '#DCFCE7',
                                        color: '#166534',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        padding: '4px 12px',
                                        borderRadius: '6px'
                                    }}>
                                        Completed
                                    </span>
                                )}
                                <button className="solve-btn">Solve Challenge <ChevronRight size={16} /></button>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default SubtopicQuestions;
