import React, { useEffect, useState } from 'react';
import { useTransition } from '../context/TransitionContext';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
    LayoutDashboard, Users, FileText, CheckCircle, XCircle,
    LogOut, AlertCircle, Eye, Shield, Activity, X, Search, Trash2, EyeOff, Bell, Briefcase
} from 'lucide-react';
import './AdminDashboard.css';
import PushNotificationsPage from './PushNotificationsPage';
import AdminPlacementPrepMonitor from './AdminPlacementPrepMonitor';


const AdminDashboard = () => {
    const navigate = useNavigate();
    const { tab, id } = useParams();
    const { startLoading, stopLoading } = useTransition();
    const [stats, setStats] = useState({
        pending_questions: 0, pending_notes: 0, pending_exams: 0,
        published_items: 0, disabled_items: 0, pending_issues: 0
    });
    const [activeTab, setActiveTab] = useState('overview'); // overview, review, users, audit
    const [reviewQueue, setReviewQueue] = useState([]);
    const [users, setUsers] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [languages, setLanguages] = useState([]);

    // Modal State
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedLog, setSelectedLog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Exam Password State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [examPassword, setExamPassword] = useState('');
    const [examPasswordConfirm, setExamPasswordConfirm] = useState('');
    const [showExamPassword, setShowExamPassword] = useState(false);
    const [passwordSetSuccess, setPasswordSetSuccess] = useState(false);

    // Pre-Exam Message State
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [preExamMessage, setPreExamMessage] = useState({ title: '', body: '', is_required: true });



    // Helpers
    const tryParseJSON = (jsonString) => {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return jsonString; // Return as is if not JSON
        }
    };

    const formatLogMessage = (log) => {
        const details = tryParseJSON(log.details);

        switch (log.action) {
            case 'approve':
                return 'Content approved and published';
            case 'reject':
                return `Content rejected. Reason: ${details.comment || 'No reason provided'}`;
            case 'disable_language':
                return 'Language disabled';
            case 'enable_language':
                return 'Language enabled';
            case 'activate_user':
                return 'User account activated';
            case 'deactivate_user':
                return 'User account deactivated';
            case 'create_user':
                return 'User created';
            default:
                // Fallback for generic updates or unknown actions
                if (details && typeof details === 'object') {
                    // If it's a simple key-value update, try to make it readable
                    const keys = Object.keys(details);
                    if (keys.length > 0) return `Updated ${keys.join(', ')}`;
                }
                return log.action.replace(/_/g, ' ');
        }
    };

    // Add User State
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    // Disabled Content State
    const [contentManagers, setContentManagers] = useState([]);
    const [activeContentTab, setActiveContentTab] = useState('questions');
    const [disabledItems, setDisabledItems] = useState({ questions: [], notes: [], languages: [], exams: [] });
    const [viewDisabledItem, setViewDisabledItem] = useState(null);

    // URL Routing Logic
    const slugToTab = {
        'Review Queue': 'review',
        'Reported issues': 'issues',
        'languages': 'languages',
        'user managemt': 'users',
        'content manager': 'content-managers',
        'disbaled-content': 'disabled',
        'exam-managment': 'exams',
        'audit logs': 'audit',
        'push-notifications': 'push-notifications',
        'placement-prep-monitor': 'placement-prep'
    };

    const tabToSlug = Object.fromEntries(Object.entries(slugToTab).map(([k, v]) => [v, k]));

    useEffect(() => {
        if (tab) {
            const mappedTab = slugToTab[decodeURIComponent(tab)];
            if (mappedTab) {
                setActiveTab(mappedTab);
            } else {
                // If slug doesn't match, maybe default to overview or correct it
                setActiveTab('overview');
            }
        } else {
            setActiveTab('overview');
        }
    }, [tab]);

    const handleTabChange = (newTab) => {
        if (newTab === 'overview') {
            navigate('/admin-dashboard');
        } else {
            const slug = tabToSlug[newTab];
            if (slug) {
                navigate(`/admin-dashboard/${slug}`);
            } else {
                // Fallback
                setActiveTab(newTab);
            }
        }
    };

    useEffect(() => {
        setSearchQuery(''); // Reset search on tab change
        if (activeTab === 'review') fetchQueue();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'content-managers') fetchContentManagers();
        if (activeTab === 'audit') fetchLogs();
        if (activeTab === 'languages') fetchLanguages();
        if (activeTab === 'disabled') fetchDisabledContent();
    }, [activeTab]);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchStats = async () => {
        try {
            startLoading();
            const res = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/admin/stats`, getAuthHeader());
            setStats(res.data);
        } catch (err) { console.error(err); }
        finally { stopLoading(); }
    };

    const fetchContentManagers = async () => {
        try {
            startLoading();
            const res = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/admin/users`, getAuthHeader());
            setContentManagers(res.data);
        } catch (err) { console.error(err); }
        finally { stopLoading(); }
    };

    const fetchQueue = async () => {
        try {
            startLoading();
            const res = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/admin/review-queue`, getAuthHeader());
            setReviewQueue(res.data);
        } catch (err) { console.error(err); }
        finally { stopLoading(); }
    };

    const fetchUsers = async () => {
        try {
            startLoading();
            const res = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/users`, getAuthHeader());
            console.log('Fetched Users:', res.data); // Debug logging
            setUsers(res.data);
        } catch (err) { console.error(err); }
        finally { stopLoading(); }
    };

    const fetchLogs = async () => {
        try {
            startLoading();
            const res = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/admin/audit-logs`, getAuthHeader());
            setAuditLogs(res.data);
        } catch (err) { console.error(err); }
        finally { stopLoading(); }
    };

    // Exam Management State
    const [adminExams, setAdminExams] = useState([]);

    const fetchAdminExams = async () => {
        try {
            startLoading();
            const res = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/training-exams/admin/list`, getAuthHeader());
            setAdminExams(res.data);
        } catch (err) { console.error(err); }
        finally { stopLoading(); }
    };

    useEffect(() => {
        if (activeTab === 'exams') fetchAdminExams();
    }, [activeTab]);

    const handleDeleteExam = async (id) => {
        if (!window.confirm('Are you sure you want to archive this exam? It will no longer be visible to students, but you can still inspect past results.')) return;
        try {
            startLoading();
            await axios.delete(`${process.env.REACT_APP_API_URL || ""}/api/training-exams/admin/${id}`, getAuthHeader());
            // Update the state to mark as archived instead of removing
            setAdminExams(adminExams.map(exam => exam.id === id ? { ...exam, status: 'archived' } : exam));
            alert('Exam archived successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to archive exam: ' + (err.response?.data?.message || err.message));
        } finally {
            stopLoading();
        }
    };

    const fetchLanguages = async () => {
        try {
            startLoading();
            const res = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/languages`, getAuthHeader());
            setLanguages(res.data);
        } catch (err) { console.error(err); }
        finally { stopLoading(); }
    };

    const fetchDisabledContent = async () => {
        try {
            startLoading();
            // Fetch Disabled Questions (status=inactive or disabled)
            const resQ = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/questions?status=disabled`, getAuthHeader());
            // Fallback for older data that might use is_active=0 but status!=disabled (if any)
            // But getQuestions handles status param.

            // Fetch All Notes and filter
            const resN = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/notes`, getAuthHeader());
            const disabledNotes = resN.data.filter(n => n.status === 'disabled' || n.is_active === 0 || n.is_active === false);

            // Fetch All Languages and filter
            const resL = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/languages`, getAuthHeader());
            const disabledLangs = resL.data.filter(l => l.is_active === 0 || l.is_active === false);

            // Fetch All Exams and filter
            const resE = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/exams?status=disabled`, getAuthHeader());

            setDisabledItems({
                questions: resQ.data,
                notes: disabledNotes,
                languages: disabledLangs,
                exams: resE.data
            });
        } catch (err) { console.error(err); }
        finally { stopLoading(); }
    };

    const handleRestoreContent = async (type, id) => {
        if (!window.confirm('Are you sure you want to restore this item? It will be published/enabled.')) return;
        try {
            let url = '';
            // Map plural types to singular or specific endpoints if needed, but new admin route is consistent
            // Actually, type from tabs is 'questions', 'notes', 'languages', 'exams'
            // Route is /admin/content/:type/:id/status

            // Special case for languages using old route or mapped?
            // "languages" -> route expects 'languages' or 'language'?
            // adminController toggleLanguageStatus is at /admin/languages/:id/status

            if (type === 'languages') {
                url = `${process.env.REACT_APP_API_URL || ""}/api/content/admin/languages/${id}/status`;
            } else {
                url = `${process.env.REACT_APP_API_URL || ""}/api/content/admin/content/${type}/${id}/status`;
            }

            await axios.patch(url, { is_active: true }, getAuthHeader());
            fetchDisabledContent();
            fetchStats();
            setViewDisabledItem(null); // Close modal if open
        } catch (err) {
            alert('Failed to restore item');
        }
    };

    const handleViewDisabledItem = (type, item) => {
        setViewDisabledItem({ ...item, type });
    };

    const handleOpenReview = async (type, id) => {
        try {
            startLoading();
            const res = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/admin/item/${type}/${id}`, getAuthHeader());
            setSelectedItem({ ...res.data, type }); // Ensure type is present

            // Reset password state for new review
            setPasswordSetSuccess(res.data.is_password_protected === 1);
            setExamPassword('');
            setExamPasswordConfirm('');

            setIsModalOpen(true);
        } catch (err) {
            alert('Failed to fetch details');
        } finally {
            stopLoading();
        }
    };

    const handleSetPassword = async () => {
        if (examPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        if (examPassword !== examPasswordConfirm) {
            alert('Passwords do not match');
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API_URL || ""}/api/training-exams/${selectedItem.id}/set-password`,
                { password: examPassword }, getAuthHeader());
            setPasswordSetSuccess(true);
            setIsPasswordModalOpen(false);
            alert('Password set successfully. You can now publish this exam.');
        } catch (err) {
            alert('Failed to set password: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSetPreExamMessage = async () => {
        if (!preExamMessage.title.trim() || !preExamMessage.body.trim()) {
            alert('Title and body are required.');
            return;
        }
        try {
            await axios.post(`${process.env.REACT_APP_API_URL || ""}/api/training-exams/${selectedItem.id}/pre-exam-message`, preExamMessage, getAuthHeader());
            alert('Pre-exam message saved successfully.');
            setIsMessageModalOpen(false);

            // update local selected array
            setSelectedItem(prev => ({
                ...prev,
                pre_exam_message_title: preExamMessage.title,
                pre_exam_message_body: preExamMessage.body,
                is_message_required: preExamMessage.is_required
            }));
            fetchAdminExams(); // Refresh to catch changes in grid
        } catch (err) {
            alert('Failed to save message: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleReviewAction = async (action) => {
        if (!selectedItem) return;

        // Block approval for exams if password not set
        if (action === 'approve' && selectedItem.type === 'exams') {
            if (!passwordSetSuccess && !selectedItem.is_password_protected) {
                alert('You must set an exam password before publishing.');
                return;
            }
            try {
                await axios.post(`${process.env.REACT_APP_API_URL || ""}/api/training-exams/${selectedItem.id}/publish`, {}, getAuthHeader());
                alert(`Exam published successfully`);
                setIsModalOpen(false);
                fetchQueue();
                fetchStats();
                return;
            } catch (err) {
                alert('Publish failed: ' + (err.response?.data?.message || err.message));
                return;
            }
        }

        const comment = action === 'reject' ? prompt('Enter rejection reason:') : '';
        if (action === 'reject' && !comment) return;

        try {
            await axios.post(`${process.env.REACT_APP_API_URL || ""}/api/content/admin/review/${selectedItem.type}/${selectedItem.id}`,
                { action, comment }, getAuthHeader()
            );
            alert(`Item ${action}ed successfully`);
            setIsModalOpen(false);
            fetchQueue();
            fetchStats();
        } catch (err) {
            alert('Action failed');
        }
    };

    const handleToggleUser = async (id, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;
        try {
            await axios.patch(`${process.env.REACT_APP_API_URL || ""}/api/content/admin/users/${id}/status`,
                { is_active: !currentStatus }, getAuthHeader()
            );
            fetchUsers();
        } catch (err) {
            alert('Action failed');
        }
    };

    const handleToggleLanguage = async (id, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this language?`)) return;
        try {
            // Using Admin route for Audit Log
            await axios.patch(`${process.env.REACT_APP_API_URL || ""}/api/content/admin/languages/${id}/status`,
                { is_active: !currentStatus }, getAuthHeader()
            );
            fetchLanguages();
        } catch (err) {
            alert('Action failed');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete this user? This cannot be undone.')) return;
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL || ""}/api/content/admin/users/${id}`, getAuthHeader());
            setUsers(users.filter(user => user.id !== id));
            alert('User deleted successfully');
            if (selectedItem && selectedItem.id === id) setIsModalOpen(false);
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const [reportedIssues, setReportedIssues] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);

    useEffect(() => {
        if (activeTab === 'issues') fetchIssues();
    }, [activeTab]);

    const fetchIssues = async () => {
        try {
            startLoading();
            const res = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/issues`, getAuthHeader());
            setReportedIssues(res.data);
        } catch (err) { console.error(err); }
        finally { stopLoading(); }
    };

    const handleUpdateIssueStatus = async (id, status) => {
        if (!window.confirm(`Mark this issue as ${status}?`)) return;
        try {
            await axios.patch(`${process.env.REACT_APP_API_URL || ""}/api/issues/${id}/status`, { status }, getAuthHeader());
            // Update local state
            setReportedIssues(prev => prev.map(issue => issue.id === id ? { ...issue, status } : issue));

            // Also update selectedIssue if it's open
            if (selectedIssue && selectedIssue.id === id) {
                setSelectedIssue(prev => ({ ...prev, status }));
            }
            alert('Status updated successfully');
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleAddUser = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL || ""}/api/content/admin/users`, newUser, getAuthHeader());
            alert('Content Manager created successfully');
            setIsAddUserModalOpen(false);
            setNewUser({ name: '', email: '', password: '' });
            fetchUsers();
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                {/* ... existing nav items ... */}
                <div className="admin-logo">
                    <Shield size={28} className="text-blue-500" /> CodeWise
                </div>
                <nav className="admin-nav">
                    <div className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleTabChange('overview')}>
                        <LayoutDashboard size={20} /> Overview
                    </div>
                    <div className={`admin-nav-item ${activeTab === 'review' ? 'active' : ''}`} onClick={() => handleTabChange('review')}>
                        <FileText size={20} /> Review Queue
                        {reviewQueue.length > 0 && <span className="badge badge-question" style={{ marginLeft: 'auto' }}>{reviewQueue.length}</span>}
                    </div>
                    <div className={`admin-nav-item ${activeTab === 'issues' ? 'active' : ''}`} onClick={() => handleTabChange('issues')}>
                        <AlertCircle size={20} /> Reported Issues
                        {/* We could add badge here if we had the count in stats */}
                    </div>
                    <div className={`admin-nav-item ${activeTab === 'push-notifications' ? 'active' : ''}`} onClick={() => handleTabChange('push-notifications')}>
                        <Bell size={20} /> Push Notifications
                    </div>
                    <div className={`admin-nav-item ${activeTab === 'languages' ? 'active' : ''}`} onClick={() => handleTabChange('languages')}>
                        <Activity size={20} /> Languages
                    </div>
                    <div className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => handleTabChange('users')}>
                        <Users size={20} /> User Management
                    </div>
                    <div className={`admin-nav-item ${activeTab === 'content-managers' ? 'active' : ''}`} onClick={() => handleTabChange('content-managers')}>
                        <Users size={20} /> Content Managers
                    </div>
                    <div className={`admin-nav-item ${activeTab === 'placement-prep' ? 'active' : ''}`} onClick={() => handleTabChange('placement-prep')}>
                        <Briefcase size={20} /> Placement Prep Monitor
                    </div>
                    <div className={`admin-nav-item ${activeTab === 'disabled' ? 'active' : ''}`} onClick={() => handleTabChange('disabled')}>
                        <XCircle size={20} /> Disabled Content
                    </div>
                    <div className={`admin-nav-item ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => handleTabChange('exams')}>
                        <FileText size={20} /> Exam Management
                    </div>
                    <div className={`admin-nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => handleTabChange('audit')}>
                        <Activity size={20} /> Audit Logs
                    </div>
                </nav>
                <div className="admin-logout" onClick={handleLogout}>
                    <LogOut size={20} /> Logout
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="admin-title">
                        <h1>Admin Console</h1>
                        <p>Welcome back, Admin</p>
                    </div>
                </header>

                {activeTab === 'push-notifications' && <PushNotificationsPage />}
                {activeTab === 'placement-prep' && <AdminPlacementPrepMonitor companyId={id} />}

                {/* ... existing tabs ... */}
                {activeTab === 'overview' && (
                    <>
                        {/* ... stats grid ... */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <span className="stat-value text-yellow-500">{stats.pending_notes + stats.pending_questions + stats.pending_exams}</span>
                                <span className="stat-label">Pending Reviews</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value text-green-500">{stats.published_items}</span>
                                <span className="stat-label">Live Content</span>
                            </div>
                            <div className="stat-card" onClick={() => handleTabChange('disabled')} style={{ cursor: 'pointer' }}>
                                <span className="stat-value text-gray-500">{stats.disabled_items}</span>
                                <span className="stat-label">Disabled items</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">{stats.pending_questions}</span>
                                <span className="stat-label">Questions Queue</span>
                            </div>
                        </div>
                    </>
                )}

                {/* ... review, languages, userstabs ... */}
                {activeTab === 'issues' && (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Page / Description</th>
                                    <th>Reported By</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportedIssues.map(issue => (
                                    <tr key={issue.id}>
                                        <td>
                                            <span className={`badge badge-${issue.status.toLowerCase()}`}>{issue.status.replace('_', ' ')}</span>
                                        </td>
                                        <td>
                                            {issue.page_url && <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '2px' }}>{new URL(issue.page_url).pathname}</div>}
                                            <div style={{ fontWeight: 500 }}>{issue.description.substring(0, 60)}{issue.description.length > 60 && '...'}</div>
                                        </td>
                                        <td>
                                            <div>{issue.reported_by_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{issue.reported_by_role}</div>
                                        </td>
                                        <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button className="btn-action btn-primary" onClick={() => setSelectedIssue(issue)}>
                                                <Eye size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {reportedIssues.length === 0 && (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>No reported issues found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'review' && (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Title</th>
                                    <th>Submitted</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviewQueue.map(item => (
                                    <tr key={`${item.type}-${item.id}`}>
                                        <td>
                                            <span className={`badge badge-${item.type}`}>{item.type}</span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{item.title}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{item.description?.substring(0, 50)}...</div>
                                        </td>
                                        <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button className="btn-action btn-primary" onClick={() => handleOpenReview(item.type, item.id)}>
                                                <Eye size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {reviewQueue.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No items pending review</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'languages' && (
                    <div className="admin-table-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                            <h2>Manage Languages</h2>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Language</th>
                                    <th>Slug</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {languages.map(lang => (
                                    <tr key={lang.id}>
                                        <td style={{ fontWeight: 500 }}>{lang.name}</td>
                                        <td>{lang.slug}</td>
                                        <td>
                                            <span className={`badge ${lang.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                                {lang.is_active ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`btn-action ${lang.is_active ? 'btn-danger' : 'btn-success'}`}
                                                onClick={() => handleToggleLanguage(lang.id, lang.is_active)}
                                            >
                                                {lang.is_active ? 'Disable' : 'Enable'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'users' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2>User Management</h2>
                            <div className="search-box" style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid #E2E8F0',
                                        width: '250px'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Last Active</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.filter(u =>
                                        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        u.email.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).map(u => (
                                        <tr key={u.id}>
                                            <td style={{ fontWeight: 500 }}>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td><span className={`badge badge-${u.role === 'admin' ? 'notes' : 'inactive'}`}>{u.role.replace('_', ' ')}</span></td>
                                            <td>
                                                <span className={`badge ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                                    {u.is_active ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td>{u.last_active ? new Date(u.last_active).toLocaleDateString() : 'N/A'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn-action btn-primary" onClick={() => { setSelectedItem({ ...u, type: 'user' }); setIsModalOpen(true); }} title="View Details">
                                                        <Eye size={16} />
                                                    </button>
                                                    {u.role !== 'admin' && (
                                                        <>
                                                            <button
                                                                className={`btn-action ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                                                                onClick={() => handleToggleUser(u.id, u.is_active)}
                                                                title={u.is_active ? 'Suspend User' : 'Activate User'}
                                                            >
                                                                {u.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                                            </button>
                                                            <button
                                                                className="btn-action btn-danger"
                                                                onClick={() => handleDeleteUser(u.id)}
                                                                title="Delete User"
                                                            >
                                                                <LogOut size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'content-managers' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2>Content Managers</h2>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="search-box" style={{ position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                                            borderRadius: '8px',
                                            border: '1px solid #E2E8F0',
                                            width: '200px'
                                        }}
                                    />
                                </div>
                                <button className="btn-action btn-primary" onClick={() => setIsAddUserModalOpen(true)}>
                                    <Users size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Add Content Manager
                                </button>
                            </div>
                        </div>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Last Active</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contentManagers.filter(u =>
                                        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        u.email.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).map(u => (
                                        <tr key={u.id}>
                                            <td style={{ fontWeight: 500 }}>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className={`badge ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                                    {u.is_active ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td>{u.last_active ? new Date(u.last_active).toLocaleDateString() : 'N/A'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn-action btn-primary" onClick={() => { setSelectedItem({ ...u, type: 'user' }); setIsModalOpen(true); }} title="View Details">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className={`btn-action ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                                                        onClick={() => handleToggleUser(u.id, u.is_active)}
                                                        title={u.is_active ? 'Suspend User' : 'Activate User'}
                                                    >
                                                        {u.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                                    </button>
                                                    <button
                                                        className="btn-action btn-danger"
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        title="Delete User"
                                                    >
                                                        <LogOut size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'exams' && (
                    <div className="admin-table-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                            <h2>Exam Management</h2>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Pass %</th>
                                    <th>Protected</th>
                                    <th>Attempts</th>
                                    <th>Pass / Fail</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminExams.map(exam => (
                                    <tr key={exam.id} style={{ opacity: exam.status === 'archived' ? 0.6 : 1 }}>
                                        <td style={{ fontWeight: 500 }}>{exam.title}</td>
                                        <td>
                                            <span className={`badge ${exam.status === 'published' ? 'badge-active' : 'badge-inactive'}`}>
                                                {exam.status === 'published' ? 'Published' : 'Archived'}
                                            </span>
                                        </td>
                                        <td>{exam.pass_percentage}%</td>
                                        <td>
                                            {exam.is_password_protected ? (
                                                <span className="badge badge-active">Yes</span>
                                            ) : (
                                                <span className="badge badge-inactive">No</span>
                                            )}
                                        </td>
                                        <td>{exam.total_attempts}</td>
                                        <td>
                                            <span style={{ color: '#16A34A', fontWeight: 600 }}>{exam.passed_count}</span>{' / '}
                                            <span style={{ color: '#DC2626', fontWeight: 600 }}>{exam.failed_count}</span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-action btn-primary"
                                                style={{ marginRight: '8px', backgroundColor: '#4F46E5' }}
                                                onClick={() => navigate(`/admin-dashboard/exams/${exam.id}/inspect`)}
                                            >
                                                <Eye size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Inspect
                                            </button>
                                            <button
                                                className="btn-action btn-primary"
                                                onClick={() => {
                                                    setSelectedItem({ id: exam.id, title: exam.title, type: 'exam' });
                                                    setExamPassword('');
                                                    setExamPasswordConfirm('');
                                                    setIsPasswordModalOpen(true);
                                                }}
                                            >
                                                Reset Password
                                            </button>
                                            {exam.status !== 'archived' && (
                                                <button
                                                    className="btn-action btn-danger"
                                                    onClick={() => handleDeleteExam(exam.id)}
                                                    title="Archive Exam"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {adminExams.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No exams found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* User Detail Modal (Reusing generic Modal structure or adding specific one here) */}
                {isModalOpen && selectedItem && selectedItem.type === 'user' && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '500px' }}>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={24} className="text-blue-500" /> User Details
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{
                                    width: '100px', height: '100px', borderRadius: '50%', background: '#F1F5F9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1rem',
                                    overflow: 'hidden',
                                    border: '2px solid #E2E8F0'
                                }}>
                                    {selectedItem.profile_picture ? (
                                        <img
                                            src={selectedItem.profile_picture.startsWith('http') ? selectedItem.profile_picture : `${process.env.REACT_APP_API_URL || ""}${selectedItem.profile_picture}`}
                                            alt={selectedItem.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                console.error('Image load failed:', e.target.src);
                                                e.target.style.display = 'none';
                                                e.target.parentNode.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
                                            }}
                                        />
                                    ) : (
                                        <Users size={48} color="#94A3B8" />
                                    )}
                                </div>
                                <h3 style={{ fontSize: '1.5rem', color: '#0F172A' }}>{selectedItem.name}</h3>
                                <div style={{ color: '#64748B' }}>{selectedItem.email}</div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <span className={`badge badge-${selectedItem.role === 'admin' ? 'notes' : selectedItem.role === 'content_manager' ? 'question' : 'inactive'}`}>
                                        {selectedItem.role.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', color: '#64748B', display: 'block' }}>Account Status</label>
                                        <div style={{ fontWeight: 600, color: selectedItem.is_active ? '#16A34A' : '#DC2626' }}>
                                            {selectedItem.is_active ? 'Active' : 'Suspended'}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', color: '#64748B', display: 'block' }}>Joined Date</label>
                                        <div style={{ fontWeight: 600 }}>{new Date(selectedItem.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', color: '#64748B', display: 'block' }}>Last Active</label>
                                        <div style={{ fontWeight: 600 }}>{selectedItem.last_active ? new Date(selectedItem.last_active).toLocaleString() : 'Never'}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', color: '#64748B', display: 'block' }}>User ID</label>
                                        <div style={{ fontWeight: 600 }}>#{selectedItem.id}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', color: '#64748B', display: 'block' }}>Problems Solved</label>
                                        <div style={{ fontWeight: 600 }}>{selectedItem.solved_count || 0}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                {selectedItem.role !== 'admin' && (
                                    <button
                                        className={`btn-action ${selectedItem.is_active ? 'btn-danger' : 'btn-success'}`}
                                        style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}
                                        onClick={async () => {
                                            await handleToggleUser(selectedItem.id, selectedItem.is_active);
                                            setIsModalOpen(false);
                                        }}
                                    >
                                        {selectedItem.is_active ? <><XCircle size={18} style={{ marginRight: '8px' }} /> Suspend User</> : <><CheckCircle size={18} style={{ marginRight: '8px' }} /> Activate User</>}
                                    </button>
                                )}
                                {selectedItem.role !== 'admin' && (
                                    <button
                                        className="btn-action btn-danger"
                                        style={{ flex: 1, justifyContent: 'center', padding: '0.75rem', backgroundColor: '#EF4444', color: 'white' }}
                                        onClick={() => handleDeleteUser(selectedItem.id)}
                                    >
                                        <LogOut size={18} style={{ marginRight: '8px' }} /> Delete User
                                    </button>
                                )}
                                <button className="btn-cancel" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'disabled' && (
                    <div className="admin-table-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>Disabled Content Management</h2>
                        </div>

                        {/* Content Type Tabs */}
                        <div className="tabs-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
                            {['questions', 'notes', 'languages', 'exams'].map(tab => (
                                <button
                                    key={tab}
                                    className={`tab-btn ${activeContentTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveContentTab(tab)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: 'none',
                                        background: 'none',
                                        borderBottom: activeContentTab === tab ? '2px solid #3B82F6' : '2px solid transparent',
                                        color: activeContentTab === tab ? '#3B82F6' : '#64748B',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {tab} ({disabledItems[tab]?.length || 0})
                                </button>
                            ))}
                        </div>

                        {/* Content Table */}
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name/Title</th>
                                    <th>Type</th>
                                    <th>Disabled By</th>
                                    <th>Disabled On</th>
                                    <th>Reason</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disabledItems[activeContentTab]?.map(item => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 500 }}>
                                            {item.title || item.name}
                                            {item.exam_code && <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Code: {item.exam_code}</div>}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${activeContentTab === 'questions' ? 'question' : activeContentTab === 'notes' ? 'notes' : 'inactive'}`}>
                                                {activeContentTab === 'exams' ? item.type : activeContentTab.slice(0, -1)}
                                            </span>
                                        </td>
                                        <td>{item.disabled_by_name || 'Unknown'}</td>
                                        <td>{item.disabled_at ? new Date(item.disabled_at).toLocaleDateString() : 'N/A'}</td>
                                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.disabled_reason || 'No reason provided'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn-action btn-primary"
                                                    onClick={() => handleViewDisabledItem(activeContentTab, item)}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className="btn-action btn-success"
                                                    onClick={() => handleRestoreContent(activeContentTab, item.id)}
                                                    title="Restore"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!disabledItems[activeContentTab] || disabledItems[activeContentTab].length === 0) && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                <XCircle size={32} opacity={0.5} />
                                                <p>No disabled {activeContentTab} found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}



                {activeTab === 'audit' && (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Admin</th>
                                    <th>Action</th>
                                    <th>Target</th>
                                    <th>Message</th>
                                    <th>Time</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map(log => (
                                    <tr key={log.id}>
                                        <td style={{ fontWeight: 500 }}>{log.admin_name}</td>
                                        <td>
                                            <span className="badge badge-inactive" style={{ textTransform: 'none' }}>
                                                {log.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>{log.target_type} #{log.target_id}</td>
                                        <td>{formatLogMessage(log)}</td>
                                        <td>{new Date(log.created_at).toLocaleString()}</td>
                                        <td>
                                            <button
                                                className="btn-action btn-primary"
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <Eye size={16} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Audit Log Details Modal */}
            {selectedLog && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '600px' }}>
                        <button className="modal-close" onClick={() => setSelectedLog(null)}>
                            <X size={24} />
                        </button>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={24} className="text-blue-500" /> Audit Action Details
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Action</label>
                                <div style={{ fontWeight: 500 }}>{selectedLog.action}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Target</label>
                                <div style={{ fontWeight: 500 }}>{selectedLog.target_type} #{selectedLog.target_id}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Admin</label>
                                <div style={{ fontWeight: 500 }}>{selectedLog.admin_name}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Timestamp</label>
                                <div style={{ fontWeight: 500 }}>{new Date(selectedLog.created_at).toLocaleString()}</div>
                            </div>
                        </div>

                        <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Message / Reason</label>
                            <div style={{ fontSize: '1rem', color: '#334155' }}>
                                {formatLogMessage(selectedLog)}
                            </div>
                        </div>

                        <details style={{ background: '#F1F5F9', borderRadius: '8px', overflow: 'hidden' }}>
                            <summary style={{ padding: '0.75rem 1rem', cursor: 'pointer', fontWeight: 500, color: '#475569' }}>
                                Technical Details (JSON)
                            </summary>
                            <div style={{ padding: '1rem', overflowX: 'auto' }}>
                                <pre style={{ fontSize: '0.85rem', color: '#334155', margin: 0 }}>
                                    {JSON.stringify(tryParseJSON(selectedLog.details), null, 2)}
                                </pre>
                            </div>
                        </details>
                    </div>
                </div>
            )}

            {/* Reported Issue Detail Modal */}
            {selectedIssue && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '800px', maxWidth: '90vw' }}>
                        <button className="modal-close" onClick={() => setSelectedIssue(null)}>
                            <X size={24} />
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={24} className="text-red-500" /> Issue Report #{selectedIssue.id}
                            </h2>
                            <span className={`badge badge-${selectedIssue.status.toLowerCase()}`}>{selectedIssue.status.replace('_', ' ')}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
                            {/* Left: Content */}
                            <div>
                                <h4 style={{ marginBottom: '0.5rem', color: '#64748B' }}>Screenshot</h4>
                                <div style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', cursor: 'zoom-in' }} onClick={() => window.open(`${process.env.REACT_APP_API_URL || ""}${selectedIssue.screenshot_url}`, '_blank')}>
                                    <img
                                        src={`${process.env.REACT_APP_API_URL || ""}${selectedIssue.screenshot_url}`}
                                        alt="Issue Screenshot"
                                        style={{ width: '100%', display: 'block' }}
                                    />
                                </div>

                                <h4 style={{ marginBottom: '0.5rem', color: '#64748B' }}>Description</h4>
                                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', fontSize: '1rem', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-wrap' }}>
                                    {selectedIssue.description}
                                </div>
                            </div>

                            {/* Right: Meta */}
                            <div style={{ fontSize: '0.9rem' }}>
                                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <h5 style={{ marginBottom: '0.5rem', color: '#64748B' }}>Reported By</h5>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{selectedIssue.reported_by_name}</div>
                                    <div style={{ color: '#64748B', marginBottom: '0.5rem' }}>{selectedIssue.reported_by_email}</div>
                                    <div className="badge badge-inactive" style={{ display: 'inline-block' }}>{selectedIssue.reported_by_role}</div>
                                </div>

                                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <h5 style={{ marginBottom: '0.5rem', color: '#64748B' }}>Context</h5>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <span style={{ color: '#64748B' }}>Date:</span>{' '}
                                        {new Date(selectedIssue.created_at).toLocaleString()}
                                    </div>
                                    {selectedIssue.page_url && (
                                        <div>
                                            <div style={{ color: '#64748B', marginBottom: '0.25rem' }}>Page URL:</div>
                                            <a href={selectedIssue.page_url} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all', color: '#3B82F6' }}>
                                                {selectedIssue.page_url}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                                    <h5 style={{ marginBottom: '0.5rem', color: '#64748B' }}>Actions</h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {selectedIssue.status !== 'IN_REVIEW' && selectedIssue.status !== 'RESOLVED' && (
                                            <button className="btn-action btn-primary" onClick={() => handleUpdateIssueStatus(selectedIssue.id, 'IN_REVIEW')}>
                                                Mark as In Review
                                            </button>
                                        )}
                                        {selectedIssue.status !== 'RESOLVED' && (
                                            <button className="btn-action btn-success" onClick={() => handleUpdateIssueStatus(selectedIssue.id, 'RESOLVED')}>
                                                <CheckCircle size={16} style={{ marginRight: 6 }} /> Mark as Resolved
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {isModalOpen && selectedItem && selectedItem.type !== 'user' && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '1rem' }}>{selectedItem.title}</h2>

                        {/* ... (existing content) ... */}

                        {selectedItem.status === 'pending_delete' && (
                            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={20} />
                                <div>
                                    <strong style={{ display: 'block' }}>Deletion Request</strong>
                                    This item has been requested for permanent deletion.
                                </div>
                            </div>
                        )}

                        <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <h4>Metadata</h4>
                            <p><strong>Description:</strong> {selectedItem.description}</p>
                            {selectedItem.language_name && <p><strong>Language:</strong> {selectedItem.language_name}</p>}
                            <p><strong>Type:</strong> {selectedItem.type}</p>
                            {selectedItem.type === 'exam' && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <strong>Password Protection:</strong>
                                        {passwordSetSuccess || selectedItem.is_password_protected ? (
                                            <span className="badge badge-active">Enabled</span>
                                        ) : (
                                            <span className="badge badge-inactive">Not Set</span>
                                        )}
                                        <button
                                            className="btn-action"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginLeft: 'auto' }}
                                            onClick={() => setIsPasswordModalOpen(true)}
                                        >
                                            {passwordSetSuccess || selectedItem.is_password_protected ? 'Change Password' : 'Set Password'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <strong>Pre-Exam Message:</strong>
                                        {selectedItem.pre_exam_message_title ? (
                                            <span className="badge badge-active">Set</span>
                                        ) : (
                                            <span className="badge badge-inactive">Not Set</span>
                                        )}
                                        <button
                                            className="btn-action"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginLeft: 'auto', backgroundColor: '#e2e8f0', color: '#334155' }}
                                            onClick={() => {
                                                setPreExamMessage({
                                                    title: selectedItem.pre_exam_message_title || '',
                                                    body: selectedItem.pre_exam_message_body || '',
                                                    is_required: selectedItem.is_message_required !== false
                                                });
                                                setIsMessageModalOpen(true);
                                            }}
                                        >
                                            {selectedItem.pre_exam_message_title ? 'Edit Message' : 'Set Pre-Exam Message'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Specific Content Preview */}
                        {selectedItem.type === 'question' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <h5 style={{ marginBottom: '0.5rem', color: '#64748B' }}>Problem Details</h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <strong>Difficulty:</strong> <span className={`badge badge-${selectedItem.difficulty?.toLowerCase()}`}>{selectedItem.difficulty}</span>
                                        </div>
                                        <div>
                                            <strong>Tags:</strong> {selectedItem.tags || 'None'}
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1rem' }}>
                                        <strong>Input Format:</strong>
                                        <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{selectedItem.input_format || 'N/A'}</div>
                                    </div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <strong>Output Format:</strong>
                                        <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{selectedItem.output_format || 'N/A'}</div>
                                    </div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <strong>Constraints:</strong>
                                        <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{selectedItem.constraints || 'N/A'}</div>
                                    </div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <strong>Hints:</strong>
                                        <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{selectedItem.hints || 'N/A'}</div>
                                    </div>
                                </div>

                                {selectedItem.code_template && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h5 style={{ marginBottom: '0.5rem', color: '#64748B' }}>Code Templates</h5>
                                        {(() => {
                                            const templates = tryParseJSON(selectedItem.code_template);
                                            return Array.isArray(templates) ? templates.map((t, i) => (
                                                <div key={i} style={{ marginBottom: '0.5rem' }}>
                                                    <strong>{t.language}:</strong>
                                                    <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: '0.75rem', borderRadius: '6px', overflowX: 'auto', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                                        {t.code}
                                                    </pre>
                                                </div>
                                            )) : <div>Invalid Template Data</div>;
                                        })()}
                                    </div>
                                )}

                                {selectedItem.test_cases && (
                                    <div>
                                        <h5 style={{ marginBottom: '0.5rem', color: '#64748B' }}>Test Cases</h5>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {(() => {
                                                const cases = tryParseJSON(selectedItem.test_cases);
                                                return Array.isArray(cases) ? cases.map((tc, i) => (
                                                    <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
                                                        <div style={{ background: '#F1F5F9', padding: '0.5rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>Case #{i + 1}</span>
                                                            {tc.isHidden && <span className="badge badge-inactive">Hidden</span>}
                                                        </div>
                                                        <div style={{ padding: '0.5rem', fontSize: '0.9rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                            <div>
                                                                <div style={{ color: '#64748B', fontSize: '0.8rem' }}>Input</div>
                                                                <pre style={{ background: '#F8FAFC', padding: '0.25rem', margin: 0, whiteSpace: 'pre-wrap' }}>{tc.input}</pre>
                                                            </div>
                                                            <div>
                                                                <div style={{ color: '#64748B', fontSize: '0.8rem' }}>Output</div>
                                                                <pre style={{ background: '#F8FAFC', padding: '0.25rem', margin: 0, whiteSpace: 'pre-wrap' }}>{tc.output}</pre>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )) : <div>No test cases</div>;
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedItem.type === 'notes' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4>Full Note Preview</h4>
                                <a href={`${process.env.REACT_APP_API_URL || ""}${selectedItem.file_url}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', textDecoration: 'underline' }}>
                                    Open PDF in new tab
                                </a>
                                <iframe
                                    src={`${process.env.REACT_APP_API_URL || ""}${selectedItem.file_url}`}
                                    width="100%"
                                    height="400px"
                                    style={{ marginTop: '10px', border: '1px solid #E2E8F0', borderRadius: '6px' }}
                                ></iframe>
                            </div>
                        )}

                        {selectedItem.type === 'exam' && selectedItem.questions && (
                            <div style={{ marginBottom: '1.5rem', maxHeight: '500px', overflowY: 'auto' }}>
                                <h4>Exam Content Preview</h4>
                                <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#64748B' }}>
                                    <div><strong>Duration:</strong> {selectedItem.duration_minutes} mins</div>
                                    <div><strong>Pass %:</strong> {selectedItem.pass_percentage}%</div>
                                    <div><strong>Total Questions:</strong> {selectedItem.questions.length}</div>
                                </div>

                                {['english', 'maths', 'coding'].map(module => {
                                    const moduleQs = selectedItem.questions.filter(q => q.module === module);
                                    if (moduleQs.length === 0) return null;
                                    return (
                                        <div key={module} style={{ marginBottom: '1.5rem', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                                            <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', fontWeight: 600, textTransform: 'capitalize', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                                                {module} Module
                                                <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748B' }}>{moduleQs.length} Questions</span>
                                            </div>
                                            <div style={{ padding: '0.5rem' }}>
                                                {moduleQs.map((q, idx) => (
                                                    <div key={q.id} style={{ padding: '0.75rem', borderBottom: idx < moduleQs.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                            <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{idx + 1}. {q.title}</span>
                                                            <span className="badge" style={{ background: '#F1F5F9', color: '#64748B' }}>{q.marks} pts</span>
                                                        </div>

                                                        {q.question_type === 'mcq' && q.options && (
                                                            <div style={{ marginLeft: '1rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                                                <div style={{ color: '#64748B', marginBottom: '0.25rem' }}>Options:</div>
                                                                <ul style={{ margin: 0, paddingLeft: '1.5rem', listStyle: 'none' }}>
                                                                    {tryParseJSON(q.options).map((opt, i) => (
                                                                        <li key={i} style={{
                                                                            color: i === parseInt(q.correct_option) ? '#16A34A' : '#475569',
                                                                            fontWeight: i === parseInt(q.correct_option) ? 600 : 400
                                                                        }}>
                                                                            {String.fromCharCode(65 + i)}. {opt}
                                                                            {i === parseInt(q.correct_option) && ' ✓'}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {q.question_type === 'descriptive' && (
                                                            <div style={{ marginLeft: '1rem', marginTop: '0.5rem', fontSize: '0.9rem', background: '#ecfdf5', padding: '0.5rem', borderRadius: '4px', color: '#065f46' }}>
                                                                <strong>Solution:</strong> {q.model_answer || 'N/A'}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {selectedItem.status === 'pending_delete' ? (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                                <button className="btn-action btn-danger" style={{ flex: 1, padding: '1rem', backgroundColor: '#EF4444', color: 'white' }} onClick={() => handleReviewAction('approve')}>
                                    <Trash2 size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                    Confirm Permanent Delete
                                </button>
                                <button className="btn-action btn-success" style={{ flex: 1, padding: '1rem', backgroundColor: '#64748B', color: 'white' }} onClick={() => handleReviewAction('reject')}>
                                    <XCircle size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                    Cancel Deletion (Restore)
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                                <button className="btn-action btn-success" style={{ flex: 1, padding: '1rem' }} onClick={() => handleReviewAction('approve')}>
                                    <CheckCircle size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                    Approve & Publish
                                </button>
                                <button className="btn-action btn-danger" style={{ flex: 1, padding: '1rem' }} onClick={() => handleReviewAction('reject')}>
                                    <XCircle size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                    Reject & Request Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Pre-Exam Message Editor Full-Screen Modal */}
            {isMessageModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 1200, padding: 0, backgroundColor: '#f8fafc' }}>
                    <div className="modal-content" style={{ width: '100vw', height: '100vh', maxWidth: '100%', borderRadius: 0, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Set Exam Instructions for Students</h2>
                            <button className="modal-close" style={{ position: 'static' }} onClick={() => setIsMessageModalOpen(false)}>
                                <X size={28} />
                            </button>
                        </div>

                        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>Message Title (required)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={preExamMessage.title}
                                    onChange={(e) => setPreExamMessage({ ...preExamMessage, title: e.target.value })}
                                    placeholder="e.g., Important Exam Instructions"
                                    style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>Message Body (required)</label>
                                <textarea
                                    className="input-field"
                                    value={preExamMessage.body}
                                    onChange={(e) => setPreExamMessage({ ...preExamMessage, body: e.target.value })}
                                    placeholder="e.g., Please ensure you have a stable internet connection..."
                                    style={{ width: '100%', flex: 1, minHeight: '300px', padding: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                                <input
                                    type="checkbox"
                                    id="force-accept"
                                    checked={preExamMessage.is_required}
                                    onChange={(e) => setPreExamMessage({ ...preExamMessage, is_required: e.target.checked })}
                                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                                />
                                <label htmlFor="force-accept" style={{ cursor: 'pointer', fontWeight: 500, color: '#334155', userSelect: 'none' }}>
                                    Force student to accept before starting
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                <button className="btn-cancel" onClick={() => setIsMessageModalOpen(false)} style={{ padding: '0.75rem 2rem' }}>Cancel</button>
                                <button className="btn-action btn-primary" onClick={handleSetPreExamMessage} style={{ padding: '0.75rem 2rem' }}>Save Message</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Exam Password Modal */}
            {isPasswordModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 1100 }}>
                    <div className="modal-content" style={{ width: '400px' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Set Exam Password</h3>
                        <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#64748B' }}>
                            Protect this exam with a password before publishing.
                        </p>
                        <div style={{ marginBottom: '1rem', position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
                            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <input
                                    type={showExamPassword ? "text" : "password"}
                                    className="input-field"
                                    value={examPassword}
                                    onChange={(e) => setExamPassword(e.target.value)}
                                    placeholder="Enter password"
                                    style={{ width: '100%', paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowExamPassword(!showExamPassword)}
                                    style={{
                                        position: 'absolute', right: '0.5rem', background: 'none', border: 'none',
                                        color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center'
                                    }}
                                >
                                    {showExamPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm Password</label>
                            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <input
                                    type={showExamPassword ? "text" : "password"}
                                    className="input-field"
                                    value={examPasswordConfirm}
                                    onChange={(e) => setExamPasswordConfirm(e.target.value)}
                                    placeholder="Confirm password"
                                    style={{ width: '100%', paddingRight: '2.5rem' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button className="btn-action" onClick={() => {
                                setIsPasswordModalOpen(false);
                                setShowExamPassword(false);
                                setExamPassword('');
                                setExamPasswordConfirm('');
                            }}>Cancel</button>
                            <button className="btn-action btn-primary" onClick={handleSetPassword}>Set Password</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Disabled Item Details Modal */}
            {viewDisabledItem && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '600px' }}>
                        <button className="modal-close" onClick={() => setViewDisabledItem(null)}>
                            <X size={24} />
                        </button>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={24} className="text-red-500" /> Disabled Content Details
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Title / Name</label>
                                <div style={{ fontWeight: 500 }}>{viewDisabledItem.title || viewDisabledItem.name}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Type</label>
                                <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                    {viewDisabledItem.type || (viewDisabledItem.exam_code ? 'Exam' : 'Language')}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Disabled By</label>
                                <div style={{ fontWeight: 500 }}>{viewDisabledItem.disabled_by_name || 'Unknown'}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Disabled On</label>
                                <div style={{ fontWeight: 500 }}>
                                    {viewDisabledItem.disabled_at ? new Date(viewDisabledItem.disabled_at).toLocaleString() : 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#FEF2F2', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #FECACA' }}>
                            <label style={{ fontSize: '0.85rem', color: '#B91C1C', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Reason for Disabling</label>
                            <div style={{ fontSize: '1rem', color: '#7F1D1D' }}>
                                {viewDisabledItem.disabled_reason || 'No reason provided'}
                            </div>
                        </div>

                        {/* Content Preview (Basic) */}
                        <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
                            <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Content Description</label>
                            <div style={{ color: '#334155', fontSize: '0.9rem' }}>
                                {viewDisabledItem.description || 'No description available'}
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn-action btn-success"
                                onClick={() => handleRestoreContent(viewDisabledItem.type ? viewDisabledItem.type + 's' : 'languages', viewDisabledItem.id)}
                            >
                                <CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Restore Content
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {isAddUserModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '500px' }}>
                        <button className="modal-close" onClick={() => setIsAddUserModalOpen(false)}>
                            <X size={24} />
                        </button>
                        <h2>Add Content Manager</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Name</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                                <input
                                    type="email"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
                                <input
                                    type="password"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <button
                                className="btn-action btn-primary"
                                style={{ marginTop: '1rem', padding: '1rem' }}
                                onClick={handleAddUser}
                            >
                                <Users size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Create Manager
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;
