import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, CheckCircle, Flame, ArrowRight, Play, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import './DashboardOverview.css';

const DashedCircleProgress = ({ percentage, color }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="circular-progress-container">
            <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="10" />
                <circle
                    cx="60" cy="60" r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="circular-progress-text">{percentage}%</div>
        </div>
    );
};

const DashboardOverview = () => {
    const [stats, setStats] = useState(null);
    const [recentProblems, setRecentProblems] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                setUser(userData);
                const token = localStorage.getItem('token');

                try {
                    const authHeader = { headers: { 'Authorization': `Bearer ${token}` } };

                    // 1. Fetch Stats
                    const statsRes = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/user/progress/profile`, authHeader);
                    setStats(statsRes.data.stats);

                    // 2. Fetch Recent
                    const recentRes = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/dashboard/recently-solved`, authHeader);
                    setRecentProblems(recentRes.data.slice(0, 3)); // Limit to 3 items

                } catch (err) {
                    console.error('Error fetching dashboard data', err);
                    setStats({ solved_questions: 0, completed_topics: 0, c_completion_percentage: 0 });
                }
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading-state" style={{ padding: '2rem' }}>Loading dashboard...</div>;

    const cProgress = stats?.c_completion_percentage || 0;

    return (
        <div className="dashboard-overview">
            <header className="overview-header">
                <h1>Welcome back, {user?.name || 'Coder'}! 👋</h1>
                <p>We've missed you. Ready to continue your journey?</p>
            </header>

            {/* Stats Row */}
            <div className="stats-grid">
                {/* Card 1: Problems Solved */}
                <div className="stat-card">
                    <div className="stat-icon green">
                        <CheckCircle size={28} />
                    </div>
                    <div className="stat-info" style={{ flex: 1 }}>
                        <h3>{stats?.solved_questions || 0}</h3>
                        <p>Problems Solved</p>
                        <div className="stat-progress">
                            <div className="stat-progress-bar" style={{ width: '60%', background: '#16A34A' }}></div>
                        </div>
                    </div>
                </div>

                {/* Card 2: Topics Mastered */}
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Award size={28} />
                    </div>
                    <div className="stat-info" style={{ flex: 1 }}>
                        <h3>{stats?.completed_topics || 0}</h3>
                        <p>Topics Mastered</p>
                        <div className="stat-progress">
                            <div className="stat-progress-bar" style={{ width: '40%', background: '#2563EB' }}></div>
                        </div>
                    </div>
                </div>

                {/* Card 3: C Progress */}
                <div className="stat-card">
                    <div className="stat-icon orange">
                        <Flame size={28} />
                    </div>
                    <div className="stat-info" style={{ flex: 1 }}>
                        <h3>{cProgress}%</h3>
                        <p>C Language Progress</p>
                        <div className="stat-progress">
                            <div className="stat-progress-bar" style={{ width: `${cProgress}%`, background: '#EA580C' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid: Continue Learning + Recently Solved */}
            <div className="content-grid">

                {/* Left: Continue Learning */}
                <div className="learn-card">
                    <div className="learn-content">
                        <h2>Continue Learning</h2>
                        <p>Pick up where you left off in C Language Practice. Master syntax, loops, arrays and user-defined data structures.</p>
                        <Link to="/dashboard/language-practice/c" className="resume-btn">
                            Resume C Language Practice <ArrowRight size={18} />
                        </Link>
                    </div>
                    <DashedCircleProgress percentage={cProgress} color="#0F172A" />
                </div>

                {/* Right: Recently Solved */}
                <div className="recent-widget">
                    <div className="widget-header">
                        <h3>Recently Solved</h3>
                        <Link to="/dashboard/recently-solved" className="view-all-link">View All</Link>
                    </div>

                    <div className="recent-list">
                        {(recentProblems.length > 0 ? recentProblems : [
                            { submission_id: 101, title: "Two Sum", difficulty: "Easy", language: "c", solved_at: new Date().toISOString() },
                            { submission_id: 102, title: "Valid Palindrome", difficulty: "Medium", language: "python", solved_at: new Date().toISOString() },
                            { submission_id: 103, title: "Reverse Linked List", difficulty: "Hard", language: "java", solved_at: new Date().toISOString() }
                        ]).map((prob) => (
                            <div key={prob.submission_id} className="recent-item">
                                <div className="status-icon-small">
                                    <Check size={16} />
                                </div>
                                <div className="recent-details">
                                    <div className="recent-title">{prob.title}</div>
                                    <div className="recent-meta">
                                        <span className={`badge-sm ${prob.difficulty.toLowerCase()}`}>{prob.difficulty}</span>
                                        <span>{prob.language.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
