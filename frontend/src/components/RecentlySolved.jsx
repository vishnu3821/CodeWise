import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecentlySolved.css';
import { Clock, Code } from 'lucide-react';

const RecentlySolved = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecentlySolved();
    }, []);

    const fetchRecentlySolved = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/dashboard/recently-solved', {
                headers: { 'x-auth-token': token }
            });
            setProblems(response.data);
        } catch (error) {
            console.error('Error fetching recently solved:', error);
            if (error.response && error.response.status === 401) {
                // Token invalid or expired
                localStorage.removeItem('token');
                // Optional: Redirect to login or show specific message
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProblemClick = (problem) => {
        // Navigate to detail view, potentially passing state or just ID
        // The user wants "Read-Only" mode. 
        // We can pass `readOnly: true` and the `code` in state.
        // Construct URL based on whether it is a subtopic question or main topic question
        let url = '';

        // If topic_slug is missing (orphaned question), we can't navigate to the standard practice route.
        // We might need a fallback or just alert the user.
        if (!problem.topic_slug) {
            console.warn('Missing topic_slug for question:', problem.problem_id);
            // Fallback: Try to find a generic route or just alert
            // Ideally, every question should have a topic. 
            // For now, let's use a placeholder 'misc' or alert.
            alert("This problem description is incomplete (missing topic link).");
            return;
        }

        if (problem.subtopic_id) {
            url = `/practice/${problem.language}/${problem.topic_slug}/subtopic/${problem.subtopic_id}/questions/${problem.problem_id}`;
        } else {
            url = `/practice/${problem.language}/${problem.topic_slug}/questions/${problem.problem_id}`;
        }

        navigate(url, {
            state: {
                readOnly: true,
                submittedCode: problem.code,
                fromHistory: true
            }
        });
    };

    const timeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;

    if (problems.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-content">
                    <h3>You haven't solved any problems yet.</h3>
                    <button onClick={() => navigate('/dashboard/language-practice')} className="primary-btn">
                        Go to Language Practice
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="language-practice-container fade-in">
            <header className="page-header">
                <div>
                    <h1>Recently Solved Problems</h1>
                    <p>Your latest completed challenges</p>
                </div>
            </header>

            <div className="topics-grid">
                {problems.map((problem, index) => (
                    <div
                        key={problem.submission_id}
                        className={`topic-card ${index === 0 ? 'highlight-card' : ''}`}
                        onClick={() => handleProblemClick(problem)}
                    >
                        <div className="card-icon blue-icon">
                            <Code size={24} />
                        </div>
                        <div className="card-content">
                            <h3>{problem.title}</h3>
                            <div className="card-meta">
                                <span className={`badge ${problem.difficulty.toLowerCase()}`}>
                                    {problem.difficulty}
                                </span>
                                <span className="language-badge">
                                    {problem.language.toUpperCase()}
                                </span>
                            </div>
                            <div className="card-footer-info">
                                <span className="status-text passed">Completed</span>
                                <span className="time-ago">
                                    <Clock size={12} style={{ marginRight: '4px' }} />
                                    {timeAgo(problem.solved_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentlySolved;
