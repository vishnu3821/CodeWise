import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Save, Plus, X, Trash2, ArrowUp, ArrowDown,
    Search, Filter, CheckCircle, AlertTriangle
} from 'lucide-react';
import './ContentManagerDashboard.css';

const ExamEditor = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();

    // Tabs: 'details', 'questions', 'review'
    const [activeTab, setActiveTab] = useState('details');
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        exam_code: '',
        language_id: '',
        duration_minutes: 60,
        pass_percentage: 50,
        type: 'coding', // coding, mcq, descriptive
        description: '',
        status: 'draft'
    });

    // Lists
    const [languages, setLanguages] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    // Picker State (Coding)
    const [availableQuestions, setAvailableQuestions] = useState([]);

    // Creation State (MCQ/Descriptive)
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        title: '',
        type: 'mcq', // mcq, descriptive
        options: ['', '', '', ''], // A, B, C, D
        correct_option: '', // 0, 1, 2, 3
        description: '', // Explanation/Model Answer
        marks: 10
    });

    useEffect(() => {
        fetchMetadata();
        if (isEditMode) {
            fetchExamDetails();
        }
    }, [id]);

    useEffect(() => {
        if (formData.type !== 'coding') {
            setFormData(prev => ({ ...prev, language_id: '' }));
        }
    }, [formData.type]);

    const fetchMetadata = async () => {
        try {
            const token = localStorage.getItem('token');
            const langRes = await axios.get('http://localhost:5001/api/content/languages', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLanguages(langRes.data);
        } catch (err) {
            console.error('Error fetching metadata:', err);
        }
    };

    const fetchExamDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5001/api/content/exams/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const exam = response.data;
            setFormData({
                title: exam.title,
                exam_code: exam.exam_code,
                language_id: exam.language_id || '',
                duration_minutes: exam.duration_minutes,
                pass_percentage: exam.pass_percentage,
                type: exam.type?.toLowerCase() || 'coding',
                description: exam.description || '',
                status: exam.status
            });
            setSelectedQuestions(exam.questions || []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching exam:', err);
            setMessage({ type: 'error', text: 'Failed to load exam details.' });
            setLoading(false);
        }
    };

    const handleSaveDetails = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const payload = { ...formData }; // type is already set

            if (isEditMode) {
                await axios.put(`http://localhost:5001/api/content/exams/${id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage({ type: 'success', text: 'Exam details updated.' });
                setActiveTab('questions'); // Auto-advance
            } else {
                const response = await axios.post('http://localhost:5001/api/content/exams', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                navigate(`/content-dashboard/exams/edit/${response.data.id}`);
            }
        } catch (err) {
            console.error('Save error:', err);
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save exam.' });
        } finally {
            setSaving(false);
        }
    };

    // --- Question Management ---

    const fetchQuestionsForPicker = async () => {
        if (formData.type !== 'coding' || !formData.language_id) return;
        try {
            const token = localStorage.getItem('token');
            const lang = languages.find(l => l.id == formData.language_id);
            if (!lang) return;

            const response = await axios.get('http://localhost:5001/api/content/questions', {
                params: { language: lang.slug, status: 'active' },
                headers: { Authorization: `Bearer ${token}` }
            });

            const selectedIds = new Set(selectedQuestions.map(q => q.question_id));
            setAvailableQuestions(response.data.filter(q => !selectedIds.has(q.id) && q.type !== 'mcq' && q.type !== 'descriptive'));
        } catch (err) {
            console.error('Error fetching questions:', err);
        }
    };

    useEffect(() => {
        if (activeTab === 'questions') {
            if (formData.type === 'coding') fetchQuestionsForPicker();
        }
    }, [activeTab, formData.language_id, selectedQuestions.length, formData.type]);

    const handleAddExistingQuestion = async (question) => {
        if (!isEditMode) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5001/api/content/exams/${id}/questions`, {
                question_id: question.id,
                marks: 10
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchExamDetails();
        } catch (err) {
            console.error('Add question error:', err);
        }
    };

    const handleCreateAndAddQuestion = async () => {
        // Validate
        if (!newQuestion.title) return alert("Question title is required");
        if (formData.type === 'mcq') {
            if (newQuestion.options.some(o => !o.trim())) return alert("All 4 options are required");
            if (newQuestion.correct_option === '') return alert("Select the correct option");
        }

        try {
            const token = localStorage.getItem('token');

            // 1. Create Question
            const qPayload = {
                title: newQuestion.title,
                type: formData.type, // mcq or descriptive
                description: newQuestion.description, // explanation or model answer
                explanation: formData.type === 'mcq' ? newQuestion.description : null,
                model_answer: formData.type === 'descriptive' ? newQuestion.description : null,
                options: formData.type === 'mcq' ? JSON.stringify(newQuestion.options) : null,
                correct_option: formData.type === 'mcq' ? newQuestion.correct_option : null,
                difficulty: 'Medium', // Default
                is_active: true,
                status: 'published' // Auto-publish for exams? Or 'draft'? Let's clear 'draft' confusion, say 'active'
            };

            const createRes = await axios.post('http://localhost:5001/api/content/questions', qPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 2. Link to Exam
            await axios.post(`http://localhost:5001/api/content/exams/${id}/questions`, {
                question_id: createRes.data.id,
                marks: newQuestion.marks
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowCreateModal(false);
            setNewQuestion({ title: '', type: formData.type, options: ['', '', '', ''], correct_option: '', description: '', marks: 10 });
            fetchExamDetails();
        } catch (err) {
            console.error("Error creating question:", err);
            alert("Failed to create question: " + (err.response?.data?.message || err.message));
        }
    };

    const handleRemoveQuestion = async (qId) => {
        if (!window.confirm('Remove from exam?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/content/exams/${id}/questions/${qId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchExamDetails();
        } catch (err) {
            console.error('Remove error:', err);
        }
    };

    const handleSubmitReview = async () => {
        if (!window.confirm('Submit this exam for review? It will be visible to Admins.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5001/api/content/exams/${id}/status`, { status: 'pending_review' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData(prev => ({ ...prev, status: 'pending_review' }));
            setActiveTab('review');
            setMessage({ type: 'success', text: 'Exam Submitted for Review!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Submission failed.' });
        }
    };

    if (loading) return <div className="loading-state">Loading...</div>;

    const totalMarks = selectedQuestions.reduce((acc, q) => acc + (q.marks || 0), 0);

    return (
        <div className="exam-editor-content">
            <header className="cm-header" style={{ position: 'sticky', top: 0, zIndex: 40, justifyContent: 'space-between' }}>
                <div className="cm-header-left">
                    <button onClick={() => navigate('/content-dashboard/exams')} className="cm-back-btn">
                        <ArrowLeft size={20} /> Back
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0F172A', marginLeft: '1rem' }}>{isEditMode ? 'Edit Exam' : 'Create New Exam'}</span>
                </div>
                {isEditMode && (
                    <div className="header-right">
                        <div className={`badge badge-${formData.status ? formData.status.toLowerCase() : 'draft'}`} style={{ textTransform: 'capitalize', padding: '0.4rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: '#F1F5F9' }}>
                            {formData.status?.replace('_', ' ')}
                        </div>
                    </div>
                )}
            </header>

            <div className="tab-nav" style={{ padding: '0 2rem', marginTop: '1rem', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '2rem' }}>
                <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'details' ? '2px solid #0F172A' : '2px solid transparent', cursor: 'pointer', fontWeight: 500, color: activeTab === 'details' ? '#0F172A' : '#64748B' }} onClick={() => setActiveTab('details')}>Details</button>
                <button
                    className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
                    style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'questions' ? '2px solid #0F172A' : '2px solid transparent', cursor: 'pointer', fontWeight: 500, color: activeTab === 'questions' ? '#0F172A' : '#64748B' }}
                    onClick={() => isEditMode ? setActiveTab('questions') : alert('Save details first')}
                    disabled={!isEditMode}
                >
                    Questions ({selectedQuestions.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`}
                    style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'review' ? '2px solid #0F172A' : '2px solid transparent', cursor: 'pointer', fontWeight: 500, color: activeTab === 'review' ? '#0F172A' : '#64748B' }}
                    onClick={() => isEditMode ? setActiveTab('review') : alert('Save details first')}
                    disabled={!isEditMode}
                >
                    Review
                </button>
            </div>

            <main className="dashboard-content" style={{ padding: '2rem' }}>
                {message && (
                    <div className={`message-banner ${message.type}`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                        {message.text}
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="form-card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label>Exam Type</label>
                                <select className="form-control" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="coding">Coding Exam</option>
                                    <option value="mcq">MCQ Exam</option>
                                    <option value="descriptive">Descriptive Exam</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Title</label>
                                <input className="form-control" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. C++ Basics" />
                            </div>
                            <div className="form-group">
                                <label>Exam Code</label>
                                <input className="form-control" value={formData.exam_code} onChange={(e) => setFormData({ ...formData, exam_code: e.target.value })} placeholder="e.g. EXAM-001" />
                            </div>
                            {formData.type === 'coding' && (
                                <div className="form-group">
                                    <label>Language</label>
                                    <select className="form-control" value={formData.language_id} onChange={(e) => setFormData({ ...formData, language_id: e.target.value })}>
                                        <option value="">Select Language</option>
                                        {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label>Duration (Minutes)</label>
                                <input className="form-control" type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Pass %</label>
                                <input className="form-control" type="number" value={formData.pass_percentage} onChange={(e) => setFormData({ ...formData, pass_percentage: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '1.5rem' }}>
                            <label>Description</label>
                            <textarea className="form-control" rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="cm-card-btn" onClick={handleSaveDetails} disabled={saving}>{saving ? 'Saving...' : 'Save & Continue'}</button>
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="questions-manager">
                        <div className="split-view">
                            <div className="panel selected-panel" style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3>Total Questions: {selectedQuestions.length}</h3>
                                    <span style={{ fontWeight: 600 }}>Total Marks: {totalMarks}</span>
                                </div>
                                <div className="questions-list">
                                    {selectedQuestions.map((q, idx) => (
                                        <div key={q.link_id} className="question-card-mini">
                                            <div className="q-info">
                                                <span className="q-idx">#{idx + 1}</span>
                                                <div className="q-title">{q.title}</div>
                                                <div className="q-meta">
                                                    <span className={`badge`}>{q.question_type || formData.type}</span>
                                                    <span>{q.marks} marks</span>
                                                </div>
                                            </div>
                                            <button className="cm-action-btn danger" onClick={() => handleRemoveQuestion(q.question_id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {formData.type === 'coding' ? (
                                <div className="panel picker-panel" style={{ flex: 1 }}>
                                    <h3>Select from Question Bank</h3>
                                    {!formData.language_id && <p className="error-text">Please select a language in Details.</p>}
                                    {availableQuestions.map(q => (
                                        <div key={q.id} className="question-item">
                                            <div className="q-main">
                                                <div className="q-title">{q.title}</div>
                                                <div className="q-sub">{q.difficulty}</div>
                                            </div>
                                            <button className="btn-add" onClick={() => handleAddExistingQuestion(q)}><Plus size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="panel create-panel" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '2rem' }}>
                                    <button className="cm-card-btn" onClick={() => setShowCreateModal(true)}>
                                        <Plus size={18} /> Add {formData.type === 'mcq' ? 'MCQ' : 'Descriptive'} Question
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'review' && (
                    <div className="form-card">
                        <h3>Review Exam</h3>
                        <div className="review-summary" style={{ margin: '1rem 0', padding: '1rem', background: '#F8FAFC', borderRadius: '8px' }}>
                            <p><strong>Type:</strong> {formData.type.toUpperCase()}</p>
                            <p><strong>Title:</strong> {formData.title}</p>
                            <p><strong>Questions:</strong> {selectedQuestions.length}</p>
                            <p><strong>Total Marks:</strong> {totalMarks}</p>
                            <p><strong>Duration:</strong> {formData.duration_minutes} mins</p>
                        </div>
                        {formData.status === 'draft' && (
                            <button className="btn-primary" onClick={handleSubmitReview} style={{ width: '100%' }}>
                                Submit for Admin Review
                            </button>
                        )}
                        {formData.status === 'pending_review' && (
                            <div className="info-banner" style={{ textAlign: 'center', padding: '1rem', background: '#EFF6FF', color: '#1E40AF', borderRadius: '8px' }}>
                                This exam is currently pending review. You cannot edit it.
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Create Question Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add {formData.type === 'mcq' ? 'MCQ' : 'Descriptive Question'}</h2>
                        <div className="form-group">
                            <label>Question Text</label>
                            <textarea rows={3} value={newQuestion.title} onChange={e => setNewQuestion({ ...newQuestion, title: e.target.value })} placeholder="Enter question..." />
                        </div>

                        {formData.type === 'mcq' && (
                            <div className="mcq-options">
                                {newQuestion.options.map((opt, i) => (
                                    <div key={i} className="form-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="radio"
                                            name="correct_opt"
                                            checked={newQuestion.correct_option === i}
                                            onChange={() => setNewQuestion({ ...newQuestion, correct_option: i })}
                                        />
                                        <input
                                            value={opt}
                                            onChange={e => {
                                                const newOpts = [...newQuestion.options];
                                                newOpts[i] = e.target.value;
                                                setNewQuestion({ ...newQuestion, options: newOpts });
                                            }}
                                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="form-group">
                            <label>{formData.type === 'mcq' ? 'Explanation (Hidden from Student)' : 'Model Answer (Hidden from Student)'}</label>
                            <textarea rows={3} value={newQuestion.description} onChange={e => setNewQuestion({ ...newQuestion, description: e.target.value })} />
                        </div>

                        <div className="form-group">
                            <label>Marks</label>
                            <input type="number" value={newQuestion.marks} onChange={e => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) })} />
                        </div>

                        <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleCreateAndAddQuestion}>Add to Exam</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamEditor;
