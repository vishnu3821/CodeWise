import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Building2, Code2, Users, History, Activity, AlertCircle, Eye, Trash2, EyeOff } from 'lucide-react';
import { useTransition } from '../context/TransitionContext';
import { toast } from '../utils/toast';

const AdminPlacementPrepMonitor = ({ companyId }) => {
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useTransition();

    const [activeTab, setActiveTab] = useState('overview'); // overview, activity

    // Overview states
    const [stats, setStats] = useState({ total_companies: 0, total_technical: 0, total_hr: 0, total_cms: 0 });
    const [companies, setCompanies] = useState([]);

    // Activity states
    const [globalActivities, setGlobalActivities] = useState([]);
    const [activityFilter, setActivityFilter] = useState('all');

    // Detail View states
    const [companyDetails, setCompanyDetails] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [showAnswerModal, setShowAnswerModal] = useState(null);
    const [questionFilter, setQuestionFilter] = useState('All');

    useEffect(() => {
        if (!companyId) {
            // We are in Overview Mode
            fetchOverviewData();
            if (activeTab === 'activity') {
                fetchGlobalActivity();
            }
        } else {
            // We are in Detail Mode
            fetchCompanyDetails();
        }
    }, [companyId, activeTab, activityFilter]);

    // Data Fetchers
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchOverviewData = async () => {
        try {
            startLoading();
            const [statsRes, companiesRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/admin/overview`, getAuthHeader()),
                axios.get(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/admin/companies`, getAuthHeader())
            ]);
            setStats(statsRes.data);
            setCompanies(companiesRes.data);
        } catch (error) {
            console.error('Failed to fetch admin overview:', error);
            toast.error('Failed to load placement matrix overview');
        } finally {
            stopLoading();
        }
    };

    const fetchGlobalActivity = async () => {
        try {
            startLoading();
            const response = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/admin/activity?filter=${activityFilter}`, getAuthHeader());
            setGlobalActivities(response.data);
        } catch (error) {
            console.error('Failed to fetch global activities:', error);
        } finally {
            stopLoading();
        }
    };

    const fetchCompanyDetails = async () => {
        try {
            startLoading();
            const [compRes, qsRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/companies/${companyId}`, getAuthHeader()), // Uses the existing public-ish route
                axios.get(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/admin/companies/${companyId}/questions`, getAuthHeader())
            ]);
            setCompanyDetails(compRes.data);
            setQuestions(qsRes.data);
        } catch (error) {
            console.error('Failed to fetch company details:', error);
            toast.error('Failed to load company details');
            navigate('/admin-dashboard/placement-prep-monitor'); // rollback
        } finally {
            stopLoading();
        }
    };

    // Actions
    const handleToggleQuestionStatus = async (questionId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this question?`)) return;
        try {
            startLoading();
            await axios.patch(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/admin/questions/${questionId}/status`,
                { is_active: !currentStatus },
                getAuthHeader()
            );
            toast.success(`Question ${currentStatus ? 'disabled' : 'enabled'} successfully`);
            fetchCompanyDetails(); // Refresh
        } catch (error) {
            console.error('Toggle failed:', error);
            toast.error('Failed to update question status');
        } finally {
            stopLoading();
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Are you absolutely sure you want to delete this question? This action cannot be undone.')) return;
        try {
            startLoading();
            await axios.delete(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/questions/${questionId}`, getAuthHeader());
            toast.success('Question deleted successfully');
            fetchCompanyDetails(); // Refresh
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete question');
        } finally {
            stopLoading();
        }
    };

    // Renderers
    const formatTime = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const uniqueTypes = [...new Set(questions.map(q => q.type || 'Unknown'))];
    const filteredQuestions = questionFilter === 'All'
        ? questions
        : questions.filter(q => (q.type || 'Unknown') === questionFilter);

    if (companyId) {
        return (
            <div className="w-full">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', cursor: 'pointer' }} onClick={() => navigate('/admin-dashboard/placement-prep-monitor')}>
                            Placement Prep Monitor / <span style={{ color: '#0f172a', fontWeight: '500' }}>{companyDetails?.name || 'Company'}</span>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}>{companyDetails?.name} - Interview Questions</h2>
                    </div>
                </div>

                <div className="stats-grid mb-8">
                    <div className="stat-card">
                        <span className="stat-value text-blue-600">{questions.filter(q => q.type === 'technical').length}</span>
                        <span className="stat-label">Technical Questions</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value text-green-600">{questions.filter(q => q.type === 'hr').length}</span>
                        <span className="stat-label">HR Questions</span>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>Questions List</h3>
                    <select
                        value={questionFilter}
                        onChange={(e) => setQuestionFilter(e.target.value)}
                        className="admin-filter-select"
                    >
                        <option value="All">All Types</option>
                        {uniqueTypes.map(type => (
                            <option key={type} value={type} style={{ textTransform: 'capitalize' }}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Difficulty</th>
                                <th>Author Info</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuestions.map(q => (
                                <tr key={q.id}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{q.question_title}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${q.type === 'technical' ? 'badge-primary bg-blue-100 text-blue-700' : 'badge-success bg-green-100 text-green-700'}`}>
                                            {q.type}
                                        </span>
                                    </td>
                                    <td className="capitalize">{q.difficulty}</td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>Created: <span className="font-medium">{q.created_by_name || 'System / Direct DB'}</span></div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Modified: {q.modified_by_name || 'N/A'} on {formatTime(q.updated_at)}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${q.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                            {q.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-action btn-primary" onClick={() => setShowAnswerModal(q)} title="View Answer">
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className={`btn-action ${q.is_active ? 'btn-danger' : 'btn-success'}`}
                                                onClick={() => handleToggleQuestionStatus(q.id, q.is_active)}
                                                title={q.is_active ? "Disable Question" : "Enable Question"}
                                            >
                                                {q.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            <button className="btn-action bg-red-600 text-white" onClick={() => handleDeleteQuestion(q.id)} title="Delete Forever">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredQuestions.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-500">No questions found for this criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Answer Modal */}
                {showAnswerModal && (
                    <div className="modal-overlay" onClick={() => setShowAnswerModal(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setShowAnswerModal(null)}>&times;</button>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }} className="font-bold text-slate-800">
                                {showAnswerModal.question_title}
                            </h2>
                            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Detailed Answer:</h4>
                                <div className="text-sm text-slate-600 whitespace-pre-wrap">
                                    {showAnswerModal.detailed_answer || 'No detailed answer provided.'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default Overview View
    return (
        <div className="w-full">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem' }}>
                Placement Preparation Overview
            </h2>

            {/* Top Navigation Tabs */}
            <div className="admin-tabs-container">
                <button
                    className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Companies Repository
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activity')}
                >
                    Content Manager Activity
                </button>
            </div>

            {activeTab === 'overview' && (
                <>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-value text-indigo-600">{stats.total_companies}</span>
                            <span className="stat-label flex items-center gap-1.5"><Building2 size={14} /> Total Companies</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value text-blue-600">{stats.total_technical}</span>
                            <span className="stat-label flex items-center gap-1.5"><Code2 size={14} /> Total Technical Qs</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value text-green-600">{stats.total_hr}</span>
                            <span className="stat-label flex items-center gap-1.5"><Users size={14} /> Total HR Qs</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value text-purple-600">{stats.total_cms}</span>
                            <span className="stat-label flex items-center gap-1.5"><History size={14} /> Contributors</span>
                        </div>
                    </div>

                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Company Name</th>
                                    <th>Technical Qs</th>
                                    <th>HR Qs</th>
                                    <th>Last Updated</th>
                                    <th>Last Edited By</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map(company => (
                                    <tr key={company.id}>
                                        <td>
                                            <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Building2 size={16} className="text-slate-400" />
                                                {company.name}
                                            </div>
                                        </td>
                                        <td><span className="font-semibold text-slate-700">{company.technical_count}</span></td>
                                        <td><span className="font-semibold text-slate-700">{company.hr_count}</span></td>
                                        <td>{formatTime(company.last_updated)}</td>
                                        <td>{company.last_edited_by || <span className="text-slate-400 text-sm">No activity</span>}</td>
                                        <td>
                                            <button
                                                className="btn-action btn-primary"
                                                onClick={() => navigate(`/admin-dashboard/placement-prep-monitor/${company.id}`)}
                                            >
                                                <Eye size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {companies.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-slate-500">No companies found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === 'activity' && (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={18} color="#2563eb" /> Global Content Manager Activity
                        </h3>
                        <select
                            value={activityFilter}
                            onChange={(e) => setActivityFilter(e.target.value)}
                            className="admin-filter-select"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">Past 7 Days</option>
                            <option value="month">Past 30 Days</option>
                        </select>
                    </div>

                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Content Manager</th>
                                    <th>Action</th>
                                    <th>Entity</th>
                                    <th>Company</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {globalActivities.map(activity => (
                                    <tr key={activity.id}>
                                        <td className="font-medium text-slate-700">{activity.cm_name}</td>
                                        <td>
                                            <span className={`badge ${activity.action_type === 'add' ? 'bg-green-100 text-green-700' :
                                                activity.action_type === 'edit' ? 'bg-blue-100 text-blue-700' :
                                                    activity.action_type === 'delete' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-700'
                                                }`}>
                                                {activity.action_type.toUpperCase()}
                                            </span>
                                            <span className="ml-2 text-sm text-slate-600">{activity.description}</span>
                                        </td>
                                        <td className="capitalize font-medium text-slate-700">{activity.entity_type}</td>
                                        <td>{activity.company_name}</td>
                                        <td className="text-sm text-slate-500 whitespace-nowrap">{formatTime(activity.created_at)}</td>
                                    </tr>
                                ))}
                                {globalActivities.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-slate-500">No activity logged in this period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPlacementPrepMonitor;
