import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { List, ArrowLeft, ChevronRight, CheckCircle } from 'lucide-react';

const LanguageTopics = () => {
    const { language: slug } = useParams(); // Match route param ':language'
    const [languageName, setLanguageName] = useState('');
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5001/api/languages/${slug}/topics`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLanguageName(response.data.language);
                setTopics(response.data.topics);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching topics:', err);
                setError('Failed to load topics. Please try again later.');
                setLoading(false);
            }
        };

        fetchTopics();
    }, [slug]);

    if (loading) return <div className="loading-state">Loading topics...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="language-topics-page">
            <div className="page-header">
                <Link to="/dashboard/language-practice" className="back-link">
                    <ArrowLeft size={20} /> Back to Languages
                </Link>
                <h1>{languageName} Topics</h1>
                <p>Master {languageName} step by step</p>
            </div>

            <div className="topics-list">
                {topics.map(topic => (
                    <Link
                        key={topic.id}
                        to={`/dashboard/language-practice/${slug}/${topic.slug}`}
                        className="topic-card"
                    >
                        <div className="topic-content">
                            <div className="topic-icon-wrapper">
                                <List size={20} />
                            </div>
                            <span className="topic-name">{topic.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {topic.is_completed && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontSize: '0.8rem', fontWeight: 600, background: '#ECFDF5', padding: '4px 8px', borderRadius: '12px' }}>
                                    <CheckCircle size={14} /> Completed
                                </div>
                            )}
                            <ChevronRight className="topic-arrow" size={20} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default LanguageTopics;
