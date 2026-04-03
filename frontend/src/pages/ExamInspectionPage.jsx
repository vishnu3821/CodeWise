import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Users, UserCheck, UserX, CheckCircle, XCircle, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import './ExamInspectionPage.css';

const ExamInspectionPage = () => {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, passed, failed, not_attempted
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (examId) {
            fetchInspectionStats();
        }
    }, [examId]);

    const fetchInspectionStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/training-exams/${examId}/inspection`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStats(response.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load inspection data.');
            setLoading(false);
        }
    };

    const getFilteredUsers = () => {
        if (!stats) return [];

        let users = [];

        // Combine lists based on filter logic
        if (filter === 'all') {
            users = [
                ...stats.attempted_users.map(u => ({ ...u, status: u.result === 'Pass' ? 'passed' : 'failed' })),
                ...stats.not_attempted_users.map(u => ({ ...u, status: 'not_attempted', marks: '-', result: 'Not Attempted' }))
            ];
        } else if (filter === 'passed') {
            users = stats.attempted_users.filter(u => u.result === 'Pass').map(u => ({ ...u, status: 'passed' }));
        } else if (filter === 'failed') {
            users = stats.attempted_users.filter(u => u.result === 'Fail').map(u => ({ ...u, status: 'failed' }));
        } else if (filter === 'not_attempted') {
            users = stats.not_attempted_users.map(u => ({ ...u, status: 'not_attempted', marks: '-', result: 'Not Attempted' }));
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            users = users.filter(u =>
                u.username.toLowerCase().includes(lowerTerm) ||
                u.email.toLowerCase().includes(lowerTerm)
            );
        }

        return users;
    };

    const handleResetAttempt = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to grant a re-attempt for ${username}?\n\nThis will delete their current score and tab tracking data. They will have to take the exam from scratch.`)) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL || ""}/api/training-exams/admin/${examId}/reset-attempt/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Re-attempt granted successfully.');
            fetchInspectionStats(); // Reload stats after reset
        } catch (err) {
            console.error(err);
            alert('Failed to reset attempt: ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    return (
        <div className="inspection-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/admin-dashboard/exams')}>
                    <ArrowLeft size={20} /> Back to Exams
                </button>
                <h1>Exam Inspection {stats && <span className="exam-badge">{stats.exam_title}</span>}</h1>
            </header>

            {loading ? (
                <div className="page-loading">
                    <div className="loader"></div>
                    <p>Loading exam statistics...</p>
                </div>
            ) : error ? (
                <div className="page-error">
                    <XCircle size={48} />
                    <p>{error}</p>
                    <button onClick={() => navigate('/admin-dashboard/exams')}>Go Back</button>
                </div>
            ) : (
                <div className="page-content">
                    {/* Stats Overview */}
                    <div className="stats-overview">
                        <div className="stat-box total">
                            <div className="icon-wrapper"><Users size={24} /></div>
                            <div className="stat-details">
                                <span className="label">Total Assignees</span>
                                <span className="number">{stats.total_users}</span>
                            </div>
                        </div>
                        <div className="stat-box attempted">
                            <div className="icon-wrapper"><UserCheck size={24} /></div>
                            <div className="stat-details">
                                <span className="label">Attempted</span>
                                <span className="number">{stats.attempted_count}</span>
                            </div>
                        </div>
                        <div className="stat-box passed">
                            <div className="icon-wrapper"><CheckCircle size={24} /></div>
                            <div className="stat-details">
                                <span className="label">Passed</span>
                                <span className="number">{stats.passed_count}</span>
                            </div>
                        </div>
                        <div className="stat-box failed">
                            <div className="icon-wrapper"><XCircle size={24} /></div>
                            <div className="stat-details">
                                <span className="label">Failed</span>
                                <span className="number">{stats.failed_count}</span>
                            </div>
                        </div>
                        <div className="stat-box not-attempted">
                            <div className="icon-wrapper"><UserX size={24} /></div>
                            <div className="stat-details">
                                <span className="label">Not Attempted</span>
                                <span className="number">{stats.not_attempted_count}</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls & Table */}
                    <div className="data-section">
                        <div className="controls-bar">
                            <div className="tabs">
                                <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All Students</button>
                                <button className={filter === 'passed' ? 'active' : ''} onClick={() => setFilter('passed')}>Passed</button>
                                <button className={filter === 'failed' ? 'active' : ''} onClick={() => setFilter('failed')}>Failed</button>
                                <button className={filter === 'not_attempted' ? 'active' : ''} onClick={() => setFilter('not_attempted')}>Not Attempted</button>
                            </div>
                            <div className="search-wrapper">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Email Address</th>
                                        <th>Score</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'center' }}>Tab Switches</th>
                                        <th>Attempted On</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredUsers().map((user, index) => (
                                        <tr key={index}>
                                            <td className="font-medium">
                                                <div className="user-cell">
                                                    <div className="avatar-placeholder">{user.username.charAt(0)}</div>
                                                    {user.username}
                                                </div>
                                            </td>
                                            <td className="text-secondary">{user.email}</td>
                                            <td className="font-mono">{user.marks !== undefined ? user.marks : '-'}</td>
                                            <td>
                                                <span className={`status-pill ${user.status}`}>
                                                    {user.result}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {user.status !== 'not_attempted' ? (
                                                    <span style={{ color: user.tab_switches > 0 ? '#EF4444' : '#10B981', fontWeight: 600 }}>
                                                        {user.tab_switches} {user.tab_switches > 0 && <AlertTriangle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginBottom: 2 }} />}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="text-secondary">
                                                {user.attempted_at ? new Date(user.attempted_at).toLocaleString() : '-'}
                                            </td>
                                            <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                {user.status !== 'not_attempted' ? (
                                                    <button
                                                        className="btn-action btn-primary"
                                                        style={{ background: '#F59E0B', color: 'white', border: 'none', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', borderRadius: '4px' }}
                                                        onClick={() => handleResetAttempt(user.user_id, user.username)}
                                                        title="Delete attempt & let student retake exam"
                                                    >
                                                        <RefreshCw size={14} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} /> Re-attempt
                                                    </button>
                                                ) : (
                                                    <span style={{ color: '#CBD5E1', fontSize: '0.8rem' }}>Not Available</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {getFilteredUsers().length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="empty-state">
                                                No students found matching current filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamInspectionPage;
