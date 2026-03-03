import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, Filter, Download, UserCheck, UserX, Users, CheckCircle, XCircle } from 'lucide-react';
import './ExamInspectionPanel.css'; // We'll create this CSS next

const ExamInspectionPanel = ({ examId, onClose }) => {
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
            const response = await axios.get(`http://localhost:5001/api/training-exams/${examId}/inspection`, {
                headers: { 'x-auth-token': token }
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

    if (!examId) return null;

    return (
        <div className="inspection-overlay">
            <div className="inspection-panel slide-in-right">
                <div className="panel-header">
                    <h2>Exam Inspection</h2>
                    {stats && <span className="exam-title-badge">{stats.exam_title}</span>}
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div className="panel-loading">Loading stats...</div>
                ) : error ? (
                    <div className="panel-error">{error}</div>
                ) : (
                    <div className="panel-content">
                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card total">
                                <div className="stat-icon"><Users size={20} /></div>
                                <div className="stat-info">
                                    <span className="label">Total Users</span>
                                    <span className="value">{stats.total_users}</span>
                                </div>
                            </div>
                            <div className="stat-card attempted">
                                <div className="stat-icon"><UserCheck size={20} /></div>
                                <div className="stat-info">
                                    <span className="label">Attempted</span>
                                    <span className="value">{stats.attempted_count}</span>
                                </div>
                            </div>
                            <div className="stat-card passed">
                                <div className="stat-icon"><CheckCircle size={20} /></div>
                                <div className="stat-info">
                                    <span className="label">Passed</span>
                                    <span className="value">{stats.passed_count}</span>
                                </div>
                            </div>
                            <div className="stat-card failed">
                                <div className="stat-icon"><XCircle size={20} /></div>
                                <div className="stat-info">
                                    <span className="label">Failed</span>
                                    <span className="value">{stats.failed_count}</span>
                                </div>
                            </div>
                            <div className="stat-card not-attempted">
                                <div className="stat-icon"><UserX size={20} /></div>
                                <div className="stat-info">
                                    <span className="label">Not Attempted</span>
                                    <span className="value">{stats.not_attempted_count}</span>
                                </div>
                            </div>
                        </div>

                        {/* Filters & Actions */}
                        <div className="list-controls">
                            <div className="search-box">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="filter-tabs">
                                <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                                <button className={filter === 'passed' ? 'active' : ''} onClick={() => setFilter('passed')}>Passed</button>
                                <button className={filter === 'failed' ? 'active' : ''} onClick={() => setFilter('failed')}>Failed</button>
                                <button className={filter === 'not_attempted' ? 'active' : ''} onClick={() => setFilter('not_attempted')}>Not Attempted</button>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Marks</th>
                                        <th>Result</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredUsers().map((user, index) => (
                                        <tr key={index}>
                                            <td className="fw-500">{user.username}</td>
                                            <td className="text-muted">{user.email}</td>
                                            <td>{user.marks !== undefined ? user.marks : '-'}</td>
                                            <td>
                                                <span className={`status-badge ${user.status}`}>
                                                    {user.result}
                                                </span>
                                            </td>
                                            <td className="text-small">
                                                {user.attempted_at ? new Date(user.attempted_at).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {getFilteredUsers().length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center p-4">No users found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamInspectionPanel;
