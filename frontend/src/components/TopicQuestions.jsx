import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileCode, ArrowLeft, ChevronRight, CheckCircle, Folder } from 'lucide-react';
import './TopicQuestions.css';

const TopicQuestions = () => {
    const { language: slug, topicSlug, subtopicId } = useParams();
    const [topicName, setTopicName] = useState('');
    const [questions, setQuestions] = useState([]);
    const [subtopics, setSubtopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completedQuestions, setCompletedQuestions] = useState(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // If subtopicId is present, fetch questions for that subtopic directly
                if (subtopicId) {
                    const questionsRes = await axios.get(`http://localhost:5001/api/subtopics/${subtopicId}/questions`, config);
                    setTopicName(questionsRes.data.topic || 'Practice');
                    setQuestions(questionsRes.data.questions);
                    setSubtopics([]);
                } else {
                    // Existing logic for main topic view
                    let subtopicsRes = null;
                    try {
                        subtopicsRes = await axios.get(`http://localhost:5001/api/topics/${topicSlug}/subtopics?language=${slug}`, config);
                    } catch (e) {
                        // Ignore
                    }

                    if (subtopicsRes && subtopicsRes.data.subtopics && subtopicsRes.data.subtopics.length > 0) {
                        if (subtopicsRes.data.subtopics.length === 1) {
                            const singleSubtopic = subtopicsRes.data.subtopics[0];
                            const questionsRes = await axios.get(`http://localhost:5001/api/subtopics/${singleSubtopic.id}/questions`, config);
                            setTopicName(subtopicsRes.data.topic);
                            setQuestions(questionsRes.data.questions);
                            setSubtopics([]);
                        } else {
                            setTopicName(subtopicsRes.data.topic);
                            setSubtopics(subtopicsRes.data.subtopics);
                        }
                    } else {
                        const questionsRes = await axios.get(`http://localhost:5001/api/topics/${topicSlug}/questions?language=${slug}`, config);
                        setTopicName(questionsRes.data.topic);
                        setQuestions(questionsRes.data.questions);
                    }
                }

                // Fetch completed questions for user (only needed if viewing questions list, not subtopics)
                // Actually, if viewing subtopics, completed count is in subtopic object now.
                // But for questions list view (when no subtopics or drilled down), we still need this.
                if (subtopicId || subtopics.length === 0) {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        const completedRes = await axios.get(`http://localhost:5001/api/users/${user.id}/completed-questions`, config);
                        setCompletedQuestions(new Set(completedRes.data));
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load content. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, [topicSlug, subtopicId]);

    if (loading) return <div className="loading-state">Loading questions...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="topic-questions-page">
            <div className="page-header">
                <Link
                    to={subtopicId ? `/dashboard/language-practice/${slug}/${topicSlug}` : `/dashboard/language-practice/${slug}`}
                    className="back-link"
                >
                    <ArrowLeft size={18} /> {subtopicId ? 'Back to Subtopics' : 'Back to Topics'}
                </Link>
                <h1>{topicName} Practice</h1>
                <p>Solve these problems to master the concept</p>
            </div>

            {subtopics.length > 0 ? (
                <div className="subtopics-grid">
                    {subtopics.map(subtopic => {
                        const total = subtopic.total_questions || 0;
                        const completed = subtopic.completed_questions || 0;
                        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                        const isCode = subtopic.name.toLowerCase().includes('switch') || subtopic.name.toLowerCase().includes('code');

                        return (
                            <Link
                                key={subtopic.id}
                                to={`/dashboard/language-practice/${slug}/${topicSlug}/subtopic/${subtopic.id}`}
                                className="subtopic-card"
                            >
                                <div className="subtopic-header">
                                    <div className="subtopic-icon">
                                        {isCode ? <FileCode size={28} /> : <Folder size={28} />}
                                    </div>
                                    <div className="subtopic-info">
                                        <div className="subtopic-title-row">
                                            <h3 className="subtopic-title">{subtopic.name}</h3>
                                            <span className="subtopic-questions-count">{total} Questions</span>
                                        </div>
                                        <p className="subtopic-description">{subtopic.description || `Practice ${subtopic.name} concepts.`}</p>
                                    </div>
                                </div>

                                <div className="subtopic-progress-section">
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="progress-text">
                                        {percentage}% Complete
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="questions-list">
                    {questions.length === 0 ? (
                        <div className="empty-state">No questions available for this topic yet.</div>
                    ) : (
                        questions.map(question => (
                            <Link
                                key={question.id}
                                to={subtopicId
                                    ? `/practice/${slug}/${topicSlug}/subtopic/${subtopicId}/questions/${question.id}`
                                    : `/practice/${slug}/${topicSlug}/questions/${question.id}`
                                }
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
            )}
        </div>
    );
};

export default TopicQuestions;
