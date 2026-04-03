import React, { useEffect, useState } from 'react';
import { useTransition } from '../context/TransitionContext';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import {
    Code2, FileQuestion, FileText, Settings, Activity, History, Trash2, Edit, Plus, CheckCircle
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import './ContentManagerDashboard.css';

const ContentManagerDashboard = () => {
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useTransition();
    const { user } = useOutletContext() || {};
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            startLoading();
            try {
                const token = localStorage.getItem('token');
                const activityRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/cm/recent-activity`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setRecentActivity(activityRes.data);
            } catch (error) {
                console.error('Error fetching CM dashboard data:', error);
            } finally {
                stopLoading();
            }
        };

        if (user) {
            fetchDashboardData();
        } else {
            // Just in case user isn't immediate
            stopLoading();
        }
    }, [user, startLoading, stopLoading]);

    if (!user) return null;

    const formatActionText = (activity) => {
        const type = activity.target_type;
        const action = activity.action;
        let detailsObj = {};
        try {
            detailsObj = activity.details ? JSON.parse(activity.details) : {};
        } catch (e) { }

        if (action === 'create' || action === 'add_question') return `Created new ${type}`;
        if (action === 'update') return `Updated ${type}`;
        if (action === 'delete') return `Deleted ${type}`;
        if (action === 'approve') return `Approved ${type}`;
        if (action === 'reject') return `Rejected ${type}`;
        if (action === 'publish') return `Published ${type}`;
        if (action.includes('disable')) return `Disabled ${type}`;
        if (action.includes('restore') || action.includes('enable')) return `Enabled ${type}`;

        return `${action} ${type}`;
    };

    const getActionIcon = (type, action) => {
        if (action.includes('delete') || action.includes('disable')) return <Trash2 size={16} />;
        if (action === 'create' || action === 'add_question') return <Plus size={16} />;
        if (action === 'update') return <Edit size={16} />;
        if (action === 'approve' || action === 'publish') return <CheckCircle size={16} />;

        if (type === 'language') return <Code2 size={16} />;
        if (type === 'question') return <FileQuestion size={16} />;
        if (type === 'exam') return <FileText size={16} />;
        return <Activity size={16} />;
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

    return (
        <>
            <header className="admin-header">
                <div className="admin-title">
                    <h1>Content Studio</h1>
                    <p>Welcome back, {user.name}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <NotificationBell />
                    <span className="badge badge-active">Content Manager</span>
                </div>
            </header>

            <div className="cm-hero" style={{ textAlign: 'left', padding: '0' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Quick Actions</h2>
                <div className="cm-action-grid">
                    <div className="cm-card" onClick={() => navigate('/content-dashboard/languages')}>
                        <div className="cm-card-icon blue"><Code2 size={24} /></div>
                        <h3>Languages</h3>
                        <p>Manage languages & environments</p>
                    </div>
                    <div className="cm-card" onClick={() => navigate('/content-dashboard/questions')}>
                        <div className="cm-card-icon purple"><FileQuestion size={24} /></div>
                        <h3>Questions</h3>
                        <p>Create & edit problems</p>
                    </div>
                    <div className="cm-card" onClick={() => navigate('/content-dashboard/exams')}>
                        <div className="cm-card-icon orange"><FileText size={24} /></div>
                        <h3>Exams</h3>
                        <p>Build & publish tests</p>
                    </div>
                </div>

                <div className="cm-secondary-section">
                    <h2><History size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Recent Activity</h2>
                    <div className="cm-activity-list">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, index) => (
                                <div key={index} className="cm-activity-item">
                                    <div className="cm-activity-icon">
                                        {getActionIcon(activity.target_type, activity.action)}
                                    </div>
                                    <div className="cm-activity-content">
                                        <div className="cm-activity-text">
                                            {formatActionText(activity)}
                                            <span style={{ color: '#94a3b8', fontSize: '0.9em', marginLeft: '6px' }}>
                                                (ID: {activity.target_id})
                                            </span>
                                        </div>
                                        <div className="cm-activity-time">{timeAgo(activity.created_at)}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="cm-activity-empty">No recent activity found.</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContentManagerDashboard;
