import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Plus, Search, Filter, Edit2, Trash2, Eye,
    Calendar, CheckCircle, AlertCircle, FileText, ArrowLeft
} from 'lucide-react';
import './ContentManagerDashboard.css'; // Reusing dashboard styles

const ExamList = () => {
    const [exams, setExams] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewExam, setViewExam] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterLanguage, setFilterLanguage] = useState('');
    const [filterType, setFilterType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchExams();
        fetchLanguages();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/content/exams`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExams(response.data);
            setLoading(false);
            setError(null);
        } catch (err) {
            console.error('Error fetching exams:', err);
            handleError(err);
            setLoading(false);
        }
    };

    const fetchLanguages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/content/languages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLanguages(response.data);
        } catch (err) {
            console.error('Error fetching languages:', err);
        }
    };

    const handleError = (err) => {
        if (err.response?.status === 401 || err.response?.data?.message === 'Token is not valid') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setTimeout(() => navigate('/content-login'), 1500);
            setError("Session expired. Redirecting...");
        } else {
            setError(err.response?.data?.message || err.message || 'Failed to load data.');
        }
    };

    const handleSubmitForReview = async (examId) => {
        if (!window.confirm('Are you sure you want to submit this exam for review? It will be visible to Admins.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/content/exams/${examId}/status`, {
                status: 'pending_review'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchExams();
        } catch (err) {
            alert('Failed to submit for review: ' + (err.response?.data?.message || err.message));
        }
    };

    const getStatusBadge = (status) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'PUBLISHED': return <span className="badge badge-published">Published</span>;
            case 'DRAFT': return <span className="badge badge-draft">Draft</span>;
            case 'PENDING_REVIEW': return <span className="badge badge-pending_review">Pending Review</span>;
            case 'ARCHIVED': return <span className="badge badge-archived">Archived</span>;
            case 'DISABLED': return <span className="badge badge-disabled">Disabled</span>;
            default: return <span className="badge badge-draft">{status}</span>;
        }
    };

    const filteredExams = exams.filter(exam => {
        const matchesStatus = filterStatus === 'ALL' || exam.status?.toUpperCase() === filterStatus;
        const matchesLanguage = !filterLanguage || exam.language_name === filterLanguage;
        const matchesType = !filterType || exam.type?.toLowerCase() === filterType;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
            exam.title?.toLowerCase().includes(searchLower) ||
            exam.exam_code?.toLowerCase().includes(searchLower);

        return matchesStatus && matchesLanguage && matchesSearch && matchesType;
    });

    return (
        <div className="manage-exams-content">
            <header className="cm-header" style={{ position: 'sticky', top: 0, zIndex: 40 }}>
                <div className="cm-header-left">
                    <button onClick={() => navigate('/content-dashboard')} className="cm-back-btn">
                        <ArrowLeft size={20} /> Back to Dashboard
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0F172A', marginLeft: '1rem' }}>Exam Management</span>
                </div>
            </header>

            <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
                    <div>
                        <h1>Exam Management</h1>
                        <p style={{ color: '#64748B' }}>Create, manage, and distribute exams.</p>
                    </div>
                </div>

                <div className="cm-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="cm-filters" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                placeholder="Search exams..."
                                className="form-control"
                                style={{ paddingLeft: '2.5rem', width: '220px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="form-control"
                            style={{ width: '130px' }}
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="coding">Coding</option>
                            <option value="mcq">MCQ</option>
                            <option value="descriptive">Descriptive</option>
                        </select>
                        <select
                            className="form-control"
                            style={{ width: '130px' }}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="DRAFT">Draft</option>
                            <option value="PENDING_REVIEW">Pending Review</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="ARCHIVED">Archived</option>
                            <option value="DISABLED">Disabled</option>
                        </select>
                        <select
                            className="form-control"
                            style={{ width: '150px' }}
                            value={filterLanguage}
                            onChange={(e) => setFilterLanguage(e.target.value)}
                        >
                            <option value="">All Languages</option>
                            {languages.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                        </select>
                    </div>
                    <div className="create-exam-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                        <button className="cm-card-btn" onClick={() => document.getElementById('create-dropdown').classList.toggle('show')}>
                            <Plus size={18} /> Create Exam
                        </button>
                        <div id="create-dropdown" className="dropdown-content" style={{ display: 'none', position: 'absolute', right: 0, top: '100%', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '180px', marginTop: '0.5rem' }}>
                            <Link to="/content-dashboard/exams/create" className="dropdown-item" style={{ display: 'block', padding: '0.75rem 1rem', color: '#475569', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>
                                Standard Exam
                            </Link>
                            <Link to="/content-dashboard/training-exam/new" className="dropdown-item" style={{ display: 'block', padding: '0.75rem 1rem', color: '#475569', textDecoration: 'none' }}>
                                Training Exam
                            </Link>
                        </div>
                        <style>{`
                            .dropdown-content.show { display: block !important; }
                            .dropdown-item:hover { background: #F8FAFC; color: #0F172A; }
                        `}</style>
                    </div>
                </div>

                {error && (
                    <div className="error-state" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <AlertCircle size={20} />
                        {error}
                        <button onClick={fetchExams} style={{ marginLeft: 'auto', background: 'white', border: '1px solid #FECACA', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', color: '#B91C1C' }}>Retry</button>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Loading exams...</div>
                ) : exams.length === 0 ? (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <FileText size={48} color="#CBD5E1" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: '#0F172A', marginBottom: '0.5rem' }}>No exams found</h3>
                        <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>Get started by creating your first exam.</p>
                        <Link to="/content-dashboard/exams/create" className="cm-card-btn" style={{ display: 'inline-flex', textDecoration: 'none' }}>Create Exam</Link>
                    </div>
                ) : (
                    <div className="cm-table-container" style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        <table className="cm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B', fontWeight: '600', fontSize: '0.85rem' }}>EXAM NAME</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B', fontWeight: '600', fontSize: '0.85rem' }}>TYPE</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B', fontWeight: '600', fontSize: '0.85rem' }}>LANGUAGE</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B', fontWeight: '600', fontSize: '0.85rem' }}>QUESTIONS</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B', fontWeight: '600', fontSize: '0.85rem' }}>DURATION</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B', fontWeight: '600', fontSize: '0.85rem' }}>STATUS</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B', fontWeight: '600', fontSize: '0.85rem' }}>LAST UPDATED</th>
                                    <th style={{ textAlign: 'right', padding: '1rem', color: '#64748B', fontWeight: '600', fontSize: '0.85rem' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExams.map(exam => (
                                    <tr key={exam.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600, color: '#0F172A' }}>{exam.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'monospace' }}>{exam.exam_code}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase',
                                                background: '#F1F5F9', color: '#475569'
                                            }}>
                                                {exam.type || 'N/A'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {exam.language_name ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#475569' }}>
                                                    {exam.language_name}
                                                </span>
                                            ) : <span style={{ color: '#94A3B8' }}>-</span>}
                                        </td>
                                        <td style={{ padding: '1rem', color: '#475569' }}>{exam.question_count}</td>
                                        <td style={{ padding: '1rem', color: '#475569' }}>{exam.duration_minutes}m</td>
                                        <td style={{ padding: '1rem' }}>{getStatusBadge(exam.status)}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748B' }}>
                                            {new Date(exam.updated_at || exam.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                {exam.status === 'draft' && (
                                                    <button
                                                        className="cm-action-btn primary"
                                                        onClick={() => handleSubmitForReview(exam.id)}
                                                        title="Submit for Review"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                )}
                                                <Link
                                                    to={exam.type && exam.type.toUpperCase().includes('TRAINING')
                                                        ? `/content-dashboard/training-exam/${exam.id}/edit`
                                                        : `/content-dashboard/exams/edit/${exam.id}`
                                                    }
                                                    className="cm-action-btn"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button
                                                    className="cm-action-btn"
                                                    onClick={() => setViewExam(exam)}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {
                viewExam && (
                    <div className="modal-overlay" onClick={() => setViewExam(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                            <button className="modal-close" onClick={() => setViewExam(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0F172A' }}>{viewExam.title}</h2>
                                    {getStatusBadge(viewExam.status)}
                                </div>
                                <div style={{ color: '#64748B', fontFamily: 'monospace', fontSize: '0.9rem' }}>Code: {viewExam.exam_code}</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <h4 style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Language</h4>
                                    <div style={{ color: '#0F172A', fontWeight: 500 }}>{viewExam.language_name || 'N/A'}</div>
                                </div>
                                <div>
                                    <h4 style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Duration</h4>
                                    <div style={{ color: '#0F172A', fontWeight: 500 }}>{viewExam.duration_minutes} minutes</div>
                                </div>
                                <div>
                                    <h4 style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Questions</h4>
                                    <div style={{ color: '#0F172A', fontWeight: 500 }}>{viewExam.question_count}</div>
                                </div>
                                <div>
                                    <h4 style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Marks</h4>
                                    <div style={{ color: '#0F172A', fontWeight: 500 }}>{viewExam.total_marks || 'N/A'}</div>
                                </div>
                                <div>
                                    <h4 style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Passing Marks</h4>
                                    <div style={{ color: '#0F172A', fontWeight: 500 }}>{viewExam.passing_marks || 'N/A'}</div>
                                </div>
                                <div>
                                    <h4 style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Created At</h4>
                                    <div style={{ color: '#0F172A', fontWeight: 500 }}>{new Date(viewExam.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {viewExam.description && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Description</h4>
                                    <p style={{ color: '#334155', lineHeight: '1.6', background: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
                                        {viewExam.description}
                                    </p>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button className="cm-btn-icon" onClick={() => setViewExam(null)} style={{ border: '1px solid #E2E8F0', padding: '0.5rem 1rem' }}>Close</button>
                                <Link to={`/content-dashboard/exams/edit/${viewExam.id}`} className="cm-btn-primary">
                                    <Edit2 size={16} /> Edit Exam
                                </Link>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ExamList;
